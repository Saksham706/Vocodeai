import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import * as fileApi from "../services/fileApi";
import { buildTree, isIgnoredArtifact } from "../utils/buildTree";
import { useAuth } from "../context/AuthContext";

const WorkspaceContext = createContext();
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const safeTerminalId = (id) =>
  "term_" + id.replace(/[^a-zA-Z0-9_-]/g, "_");

export function WorkspaceProvider({ userId, workspaceId, children }) {
  const { accessToken } = useAuth();

  /* ================= FILE STATE ================= */
  const [tree, setTree] = useState(null);
  const [openTabs, setOpenTabs] = useState(() => {
    try {
      const stored = localStorage.getItem(`vocode_tabs_${workspaceId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [activeFile, setActiveFile] = useState(() => {
    try {
      return localStorage.getItem(`vocode_active_${workspaceId}`) || null;
    } catch {
      return null;
    }
  });
  const [fileContents, setFileContents] = useState({});
  const [dirtyFiles, setDirtyFiles] = useState(new Set());
  const [previewUrl, setPreviewUrl] = useState(null);

  const [createRequest, setCreateRequest] = useState(null);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [currentProject, setCurrentProject] = useState(workspaceId);
  const [selectedTarget, setSelectedTarget] = useState({ path: "", type: "folder" });

  const isLoadedRef = useRef(false);

  // Synchronize open tabs and active file to localStorage only after load completes
  useEffect(() => {
    if (!workspaceId || !isLoadedRef.current) return;
    try {
      if (openTabs.length > 0) {
        localStorage.setItem(`vocode_tabs_${workspaceId}`, JSON.stringify(openTabs));
      } else {
        localStorage.removeItem(`vocode_tabs_${workspaceId}`);
      }
    } catch {}
  }, [openTabs, workspaceId]);

  useEffect(() => {
    if (!workspaceId || !isLoadedRef.current) return;
    try {
      if (activeFile) {
        localStorage.setItem(`vocode_active_${workspaceId}`, activeFile);
      } else {
        localStorage.removeItem(`vocode_active_${workspaceId}`);
      }
    } catch {}
  }, [activeFile, workspaceId]);

  // Proactively fetch content for activeFile whenever it becomes active and not yet cached
  useEffect(() => {
    if (!activeFile || !workspaceId || !accessToken) return;
    if (fileContentsRef.current[activeFile] !== undefined) return;

    let isMounted = true;
    fileApi
      .readFile(accessToken, workspaceId, activeFile)
      .then((content) => {
        if (!isMounted) return;
        setFileContents((prev) => ({
          ...prev,
          [activeFile]: content || "",
        }));
        fileContentsRef.current[activeFile] = content || "";
      })
      .catch((err) => {
        console.warn("Could not load active file content:", activeFile, err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [activeFile, workspaceId, accessToken]);

  /* ================= TERMINAL & DIAGNOSTICS ================= */
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminals, setTerminals] = useState([]);
  const [activeTerminal, setActiveTerminal] = useState(null);
  const [outputLogs, setOutputLogs] = useState([
    {
      id: 1,
      text: "[VocodeAI Build System] Ready and connected to sandbox.",
      type: "info",
      time: new Date().toLocaleTimeString(),
    },
    {
      id: 2,
      text: "Workspace runtime environment ready.",
      type: "success",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [problems, setProblems] = useState([]);

  const socketRef = useRef(null);
  const wsReadyRef = useRef(false);
  const pendingCreateRef = useRef(null);
  const pendingRunRef = useRef(null);
  const pendingTerminalIdsRef = useRef(new Set());
  const lastOpenTimeRef = useRef(0);

  /* Parse compiler errors and diagnostics from live terminal output */
  useEffect(() => {
    const handleOutput = (e) => {
      const data = e.detail?.data;
      if (!data || typeof data !== "string") return;

      const errMatch = data.match(
        /(?:([a-zA-Z0-9_\-\.\/]+\.[a-zA-Z0-9]+)):(\d+):(?:\d+:)?\s*(error|fatal error|warning)?:\s*(.+)/i
      );
      if (errMatch) {
        const [, file, line, severity, message] = errMatch;
        const cleanFile = file.replace(/^\/workspace\//, "");
        setProblems((prev) => {
          const exists = prev.some(
            (p) =>
              p.file === cleanFile &&
              p.line === Number(line) &&
              p.message === message.trim()
          );
          if (exists) return prev;
          return [
            ...prev,
            {
              id: Date.now() + Math.random(),
              file: cleanFile,
              line: Number(line),
              col: 1,
              severity: severity?.toLowerCase().includes("warn")
                ? "warning"
                : "error",
              message: message.trim(),
            },
          ];
        });
      }

      if (
        data.includes("undefined reference to `main'") ||
        data.includes("undefined reference to 'main'")
      ) {
        setProblems((prev) => {
          const exists = prev.some((p) =>
            p.message.includes("undefined reference to 'main'")
          );
          if (exists) return prev;
          return [
            ...prev,
            {
              id: Date.now(),
              file: activeFile || "workspace",
              line: 1,
              col: 1,
              severity: "error",
              message:
                "Linker error: undefined reference to 'main'. Ensure an entrypoint int main() is defined.",
            },
          ];
        });
      }
    };

    window.addEventListener("terminal-output", handleOutput);
    return () => window.removeEventListener("terminal-output", handleOutput);
  }, [activeFile]);

  /* ================= AUTOSAVE ================= */
  const SAVE_DELAY = 400; // Snappy 400ms debounce
  const saveTimersRef = useRef({});
  const fileContentsRef = useRef({});

  useEffect(() => {
    fileContentsRef.current = fileContents;
  }, [fileContents]);

  /* ================= WEBSOCKET ================= */
  useEffect(() => {
    if (!userId || !workspaceId || !accessToken) return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = backendUrl.replace(/^https?:\/\//, "");

    const ws = new WebSocket(
      `${protocol}://${host}?token=${accessToken}`
    );

    socketRef.current = ws;

    ws.onopen = () => {
      wsReadyRef.current = true;
      if (pendingCreateRef.current) {
        ws.send(JSON.stringify(pendingCreateRef.current));
        pendingCreateRef.current = null;
      }
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);

        if (msg.type === "output") {
          window.dispatchEvent(
            new CustomEvent("terminal-output", { detail: msg })
          );
        }

        if (msg.type === "buffer") {
          window.dispatchEvent(
            new CustomEvent("terminal-buffer", { detail: msg })
          );
        }

        if (msg.type === "created") {
          pendingTerminalIdsRef.current.delete(msg.terminalId);
          setTerminals((prev) => {
            if (prev.some((t) => t.id === msg.terminalId)) return prev;
            return [
              ...prev,
              {
                id: msg.terminalId,
                title: msg.title || msg.shell || "bash",
                shell: msg.shell || "bash",
                file: msg.file || null,
              },
            ];
          });

          if (msg.setAsActive !== false) {
            setActiveTerminal(msg.terminalId);
          }

          // Run pending command inside new terminal
          if (pendingRunRef.current) {
            const runCmd = pendingRunRef.current;
            pendingRunRef.current = null;
            setTimeout(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(
                  JSON.stringify({
                    type: "input",
                    terminalId: msg.terminalId,
                    data: runCmd,
                  })
                );
              }
            }, 200);
          }
        }

        if (msg.type === "closed") {
          pendingTerminalIdsRef.current.delete(msg.terminalId);
          setTerminals((prev) => {
            const remaining = prev.filter((t) => t.id !== msg.terminalId);
            if (remaining.length === 0) {
              setActiveTerminal(null);
              setShowTerminal(false);
            } else if (activeTerminal === msg.terminalId) {
              setActiveTerminal(remaining[remaining.length - 1].id);
            }
            return remaining;
          });
        }
      } catch (err) {
        console.error("WS Parse Error:", err);
      }
    };

    ws.onclose = () => {
      wsReadyRef.current = false;
    };

    return () => {
      ws.close();
    };
  }, [userId, workspaceId, accessToken]);

  const sendWS = (payload) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    }
  };

  /* ================= TERMINAL ACTIONS ================= */
  const createTerminal = (
    terminalId,
    shell = "bash",
    setAsActive = true,
    title = null,
    file = null
  ) => {
    if (!terminalId) return;
    if (pendingTerminalIdsRef.current.has(terminalId)) return;
    pendingTerminalIdsRef.current.add(terminalId);

    const validShell = typeof shell === "string" ? shell : "bash";
    const payload = {
      type: "create",
      terminalId,
      workspaceId,
      shell: validShell,
      setAsActive,
      title: title || validShell,
      file: file || null,
    };

    if (!wsReadyRef.current || socketRef.current?.readyState !== WebSocket.OPEN) {
      pendingCreateRef.current = payload;
      return;
    }

    sendWS(payload);
  };

  const openNewTerminal = (shell = "bash") => {
    const now = Date.now();
    // Guard against rapid duplicate triggers within 250ms
    if (now - lastOpenTimeRef.current < 250) {
      return null;
    }
    lastOpenTimeRef.current = now;

    setShowTerminal(true);
    const newId = `term_${now}`;
    createTerminal(newId, shell);
    return newId;
  };

  const killTerminal = (terminalId) => {
    if (!terminalId) return;
    sendWS({ type: "kill", terminalId });
    setTerminals((prev) => {
      const remaining = prev.filter((t) => t.id !== terminalId);
      if (remaining.length === 0) {
        setActiveTerminal(null);
        setShowTerminal(false);
      } else if (activeTerminal === terminalId) {
        setActiveTerminal(remaining[remaining.length - 1].id);
      }
      return remaining;
    });
  };

  /* ================= LOAD WORKSPACE ================= */
  const loadWorkspace = useCallback(async () => {
    if (!workspaceId || !accessToken) return;

    try {
      let nodes = await fileApi.loadTree(accessToken, workspaceId);
      if (!Array.isArray(nodes)) nodes = [];

      setTree(buildTree(nodes));

      const validFiles = (nodes || [])
        .filter((n) => n.type === "file" && !isIgnoredArtifact(n.path))
        .map((n) => n.path);
      const validSet = new Set(validFiles);

      // Restore previously saved tabs or fallback
      let currentTabs = [];
      try {
        const stored = localStorage.getItem(`vocode_tabs_${workspaceId}`);
        if (stored) currentTabs = JSON.parse(stored);
      } catch {}

      // Keep only valid tabs that exist
      let filteredTabs = Array.isArray(currentTabs)
        ? currentTabs.filter((p) => validSet.has(p))
        : [];

      // Restore active file from localStorage
      let currentActive = null;
      try {
        currentActive = localStorage.getItem(`vocode_active_${workspaceId}`);
      } catch {}

      if (!currentActive || !validSet.has(currentActive)) {
        currentActive = filteredTabs[0] || validFiles[0] || null;
      }

      // Ensure activeFile is always included in open tabs
      if (currentActive && !filteredTabs.includes(currentActive)) {
        filteredTabs = [currentActive, ...filteredTabs];
      }

      setOpenTabs(filteredTabs);
      setActiveFile(currentActive);
      isLoadedRef.current = true;

      try {
        if (filteredTabs.length > 0) {
          localStorage.setItem(`vocode_tabs_${workspaceId}`, JSON.stringify(filteredTabs));
        }
        if (currentActive) {
          localStorage.setItem(`vocode_active_${workspaceId}`, currentActive);
        }
      } catch {}

      // Immediately fetch and populate content for active file so Monaco is ready
      if (currentActive) {
        try {
          const content = await fileApi.readFile(
            accessToken,
            workspaceId,
            currentActive
          );
          setFileContents((prev) => ({
            ...prev,
            [currentActive]: content || "",
          }));
          fileContentsRef.current[currentActive] = content || "";
        } catch (readErr) {
          console.warn("Could not load initial active file content:", readErr.message);
        }
      }
    } catch (err) {
      console.error("Failed to load workspace", err);
      setTree({ name: workspaceId, type: "folder", children: [] });
    }
  }, [workspaceId, accessToken]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  /* ================= CREATE REQUEST ================= */
  useEffect(() => {
    if (!createRequest) return;

    const { type, parent, name } = createRequest;
    if (!name) return;

    (async () => {
      if (type === "file") await addFile(parent, name);
      else await addFolder(parent, name);
      setCreateRequest(null);
    })();
  }, [createRequest]);

  /* ================= FILE SYSTEM ================= */
  const addFile = async (parentPath, name) => {
    const path = parentPath ? `${parentPath}/${name}` : name;
    setFileContents((prev) => ({ ...prev, [path]: "" }));
    await fileApi.createFile(accessToken, workspaceId, path);
    await loadWorkspace();
    await openFile(path);
  };

  const addFolder = async (parentPath, name) => {
    const path = parentPath ? `${parentPath}/${name}` : name;
    await fileApi.createFolder(accessToken, workspaceId, path);
    await loadWorkspace();
  };

  const openFile = async (path) => {
    setOpenTabs((prev) => (prev.includes(path) ? prev : [...prev, path]));
    setActiveFile(path);

    if (fileContentsRef.current[path] !== undefined) return;

    const content = await fileApi.readFile(
      accessToken,
      workspaceId,
      path
    );

    setFileContents((prev) => ({
      ...prev,
      [path]: content || "",
    }));
    fileContentsRef.current[path] = content || "";
  };

  const updateContent = (path, content) => {
    setFileContents((prev) => ({
      ...prev,
      [path]: content,
    }));

    setDirtyFiles((prev) => {
      const s = new Set(prev);
      s.add(path);
      return s;
    });

    clearTimeout(saveTimersRef.current[path]);

    saveTimersRef.current[path] = setTimeout(async () => {
      try {
        await fileApi.saveFile(
          accessToken,
          workspaceId,
          path,
          content
        );

        setDirtyFiles((prev) => {
          const s = new Set(prev);
          s.delete(path);
          return s;
        });
      } catch (e) {
        console.error("Save failed", e);
      }
    }, SAVE_DELAY);
  };

  const applyFileChange = async (filePath, content) => {
    const cleanPath = (filePath || "").replace(/^[\\\/]+/, "");
    if (!cleanPath) return;

    setFileContents((prev) => ({
      ...prev,
      [cleanPath]: content || "",
    }));
    fileContentsRef.current[cleanPath] = content || "";

    setOpenTabs((prev) => (prev.includes(cleanPath) ? prev : [...prev, cleanPath]));
    setActiveFile(cleanPath);

    await loadWorkspace();
  };

  const closeTab = (path) => {
    setOpenTabs((prev) => prev.filter((t) => t !== path));

    setFileContents((prev) => {
      const copy = { ...prev };
      delete copy[path];
      return copy;
    });

    if (activeFile === path) {
      const remaining = openTabs.filter((t) => t !== path);
      const nextActive = remaining.length > 0 ? remaining[remaining.length - 1] : null;
      setActiveFile(nextActive);
      if (nextActive && fileContentsRef.current[nextActive] === undefined) {
        openFile(nextActive);
      }
    }
  };

  const renameNode = async (oldPath, newName) => {
    const newPath = oldPath
      .split("/")
      .slice(0, -1)
      .concat(newName)
      .join("/");

    try {
      await fileApi.renameNode(
        accessToken,
        workspaceId,
        oldPath,
        newPath
      );
    } catch (err) {
      console.error("Rename failed", err);
    }

    await loadWorkspace();
  };

  const deleteNode = async (path) => {
    await fileApi.deleteNode(accessToken, workspaceId, path);

    setOpenTabs((prev) => prev.filter((t) => !t.startsWith(path)));

    setFileContents((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        if (key.startsWith(path)) delete updated[key];
      });
      return updated;
    });

    setDirtyFiles((prev) => {
      const newSet = new Set(prev);
      [...newSet].forEach((file) => {
        if (file.startsWith(path)) newSet.delete(file);
      });
      return newSet;
    });

    setActiveFile((prev) =>
      prev && prev.startsWith(path) ? null : prev
    );

    await loadWorkspace();
  };

  /* ================= RUN FILE ================= */
  const runCode = async () => {
    if (!activeFile) return;

    setPreviewUrl(null);
    setShowTerminal(true);

    // Save immediately before running
    await fileApi.saveFile(
      accessToken,
      workspaceId,
      activeFile,
      fileContentsRef.current[activeFile] || ""
    );

    const file = `/workspace/${activeFile}`;

    let command = "";
    if (activeFile.endsWith(".py")) {
      command = `python3 "${file}"`;
    } else if (activeFile.endsWith(".js") || activeFile.endsWith(".mjs")) {
      command = `node "${file}"`;
    } else if (activeFile.endsWith(".cpp") || activeFile.endsWith(".cc")) {
      command = `g++ "${file}" -o /workspace/a.out && /workspace/a.out`;
    } else if (activeFile.endsWith(".c")) {
      command = `gcc "${file}" -o /workspace/a.out && /workspace/a.out`;
    } else if (activeFile.endsWith(".java")) {
      const dir = activeFile.split("/").slice(0, -1).join("/");
      const cls = activeFile.split("/").pop().replace(".java", "");
      command = dir
        ? `cd /workspace/${dir} && javac ${cls}.java && java ${cls}`
        : `javac /workspace/${cls}.java && java -cp /workspace ${cls}`;
    } else {
      command = `cat "${file}"`;
    }

    setOutputLogs((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: `[Run] Executing ${activeFile}: ${command}`,
        type: "info",
        time: new Date().toLocaleTimeString(),
      },
    ]);

    // Clear old errors for this file
    setProblems((prev) => prev.filter((p) => p.file !== activeFile));

    const baseName = activeFile.split("/").pop();

    // 1. Check if a terminal dedicated to this file already exists
    const existingFileTerm = terminals.find(
      (t) => t.file === activeFile || (t.title && t.title === baseName)
    );

    if (existingFileTerm) {
      setActiveTerminal(existingFileTerm.id);
      sendWS({ type: "input", terminalId: existingFileTerm.id, data: command + "\n" });
      return;
    }

    // 2. If no dedicated terminal exists for this file, create a new separate terminal
    const newId = `term_${Date.now()}`;
    pendingRunRef.current = command + "\n";
    createTerminal(newId, "bash", true, baseName, activeFile);
  };

  /* ================= RUN PROJECT ================= */
  const runProject = async () => {
    setShowTerminal(true);

    try {
      const res = await fetch(`${backendUrl}/api/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ workspaceId }),
      });

      const data = await res.json();

      if (data.command) {
        const terminalId = `project_${workspaceId}`;
        const cmdString = data.command + "\n";

        if (!terminals.find((t) => t.id === terminalId)) {
          pendingRunRef.current = cmdString;
          sendWS({
            type: "create",
            terminalId,
            workspaceId,
          });
        } else {
          setActiveTerminal(terminalId);
          sendWS({ type: "input", terminalId, data: cmdString });
        }
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error("Run project failed:", err);
    }
  };

  /* ================= PREVIEW ================= */
  const refreshPreview = async () => {
    if (!activeFile?.endsWith(".html")) return;

    await fileApi.saveFile(
      accessToken,
      workspaceId,
      activeFile,
      fileContentsRef.current[activeFile] || ""
    );

    const url = `${backendUrl}/preview/${userId}/${workspaceId}/${activeFile}`;
    setPreviewUrl(url);
  };

  useEffect(() => {
    if (!activeFile?.endsWith(".html")) {
      setPreviewUrl(null);
    }
  }, [activeFile]);

  /* ================= CONTEXT ================= */
  return (
    <WorkspaceContext.Provider
      value={{
        tree,
        openTabs,
        activeFile,
        fileContents,
        previewUrl,
        terminals,
        activeTerminal,
        setActiveTerminal,
        createTerminal,
        killTerminal,
        socketRef,
        addFile,
        addFolder,
        openFile,
        updateContent,
        renameNode,
        deleteNode,
        closeTab,
        runCode,
        runProject,
        dirtyFiles,
        createRequest,
        setCreateRequest,
        currentProject,
        setCurrentProject,
        openNewTerminal,
        showTerminal,
        setShowTerminal,
        currentWorkspace,
        setCurrentWorkspace,
        selectedTarget,
        setSelectedTarget,
        refreshPreview,
        applyFileChange,
        loadWorkspace,
        problems,
        setProblems,
        outputLogs,
        setOutputLogs,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
