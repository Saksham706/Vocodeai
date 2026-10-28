import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import * as fileApi from "../services/fileApi";
import { buildTree } from "../utils/buildTree";
import { useAuth } from "../context/AuthContext";

const WorkspaceContext = createContext();
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const safeTerminalId = (id) =>
  "term_" + id.replace(/[^a-zA-Z0-9_-]/g, "_");

export function WorkspaceProvider({ userId, workspaceId, children }) {
  const { accessToken } = useAuth();
  /* ================= FILE STATE ================= */

  const [tree, setTree] = useState(null);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [fileContents, setFileContents] = useState({});
  const [dirtyFiles, setDirtyFiles] = useState(new Set());
  const [previewUrl, setPreviewUrl] = useState(null);

  const [createRequest, setCreateRequest] = useState(null);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [currentProject, setCurrentProject] = useState(workspaceId);

  /* ================= TERMINAL ================= */

  const [showTerminal, setShowTerminal] = useState(false);
  const [terminals, setTerminals] = useState([]);
  const [activeTerminal, setActiveTerminal] = useState(null);

  const socketRef = useRef(null);
  const wsReadyRef = useRef(false);
  const pendingCreateRef = useRef(null);
  const pendingRunRef = useRef(null);
  const refreshTimeoutRef = useRef(null);

  /* ================= AUTOSAVE ================= */

  const SAVE_DELAY = 800;
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
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);

    if (msg.type === "output") {
      window.dispatchEvent(
        new CustomEvent("terminal-output", { detail: msg })
      );
    }

   if (msg.type === "created") {
  setTerminals((prev) =>
    prev.some((t) => t.id === msg.terminalId)
      ? prev
      : [...prev, { id: msg.terminalId }]
  );

  setActiveTerminal(msg.terminalId);

  // 🔥 RUN PENDING COMMAND
  if (pendingRunRef.current) {
    socketRef.current.send(
      JSON.stringify({
        type: "input",
        terminalId: msg.terminalId,
        data: pendingRunRef.current,
      })
    );

    pendingRunRef.current = null;
  }
}

    if (msg.type === "closed") {
      setTerminals((prev) =>
        prev.filter((t) => t.id !== msg.terminalId)
      );
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

  const createTerminal = (terminalId) => {
    const payload = {
      type: "create",
      terminalId,
      workspaceId,
    };

    if (!wsReadyRef.current) {
      pendingCreateRef.current = payload;
      return;
    }

    sendWS(payload);
  };

  const openNewTerminal = () => {
    setShowTerminal(true);
    createTerminal(`term_${Date.now()}`);
  };

  const killTerminal = (terminalId) => {
    sendWS({ type: "kill", terminalId });
    setTerminals((prev) => prev.filter((t) => t.id !== terminalId));
    if (activeTerminal === terminalId) setActiveTerminal(null);
  };

  /* ================= LOAD WORKSPACE ================= */

  const loadWorkspace = useCallback(async () => {
      if (!workspaceId || !accessToken) return;
  
      try {
        const nodes = await fileApi.loadTree(accessToken, workspaceId);
        setTree(buildTree(nodes));
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
     setOpenTabs((prev) =>
       prev.includes(path) ? prev : [...prev, path]
     );
 
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

const closeTab = (path) => {
  setOpenTabs((prev) => prev.filter((t) => t !== path));

  setFileContents((prev) => {
    const copy = { ...prev };
    delete copy[path];
    return copy;
  });

  if (activeFile === path) setActiveFile(null);
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

  // ✅ Remove from open tabs
  setOpenTabs((prev) => prev.filter((t) => !t.startsWith(path)));

  // ✅ Remove file contents
  setFileContents((prev) => {
    const updated = { ...prev };
    Object.keys(updated).forEach((key) => {
      if (key.startsWith(path)) delete updated[key];
    });
    return updated;
  });

  // ✅ Remove dirty flags
  setDirtyFiles((prev) => {
    const newSet = new Set(prev);
    [...newSet].forEach((file) => {
      if (file.startsWith(path)) newSet.delete(file);
    });
    return newSet;
  });

  // ✅ Reset active file if deleted
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
 
     await fileApi.saveFile(
       accessToken,
       workspaceId,
       activeFile,
       fileContentsRef.current[activeFile] || ""
     );
 
     const terminalId = safeTerminalId(activeFile);
     const file = `/workspace/${activeFile}`;
 
     let command = "";
 
     if (activeFile.endsWith(".py"))
       command = `python3 "${file}"`;
     else if (activeFile.endsWith(".js"))
       command = `node "${file}"`;
     else if (activeFile.endsWith(".cpp"))
       command = `g++ "${file}" -o /workspace/a.out && /workspace/a.out`;
     else if (activeFile.endsWith(".c"))
       command = `gcc "${file}" -o /workspace/a.out && /workspace/a.out`;
     else if (activeFile.endsWith(".java")) {
       const dir = activeFile.split("/").slice(0, -1).join("/");
       const cls = activeFile.split("/").pop().replace(".java", "");
       command = `cd /workspace/${dir} && javac ${cls}.java && java ${cls}`;
     } else return;
 
     if (!terminals.find((t) => t.id === terminalId)) {
       pendingRunRef.current = command + "\n";
       sendWS({
         type: "create",
         terminalId,
         workspaceId,
       });
       return;
     }
 
     setActiveTerminal(terminalId);
     sendWS({ type: "input", terminalId, data: command + "\n" });
   };

  /* ================= RUN PROJECT ================= */

const runProject = async () => {
  setShowTerminal(true);

  const res = await fetch(`${backendUrl}/api/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ workspaceId }),
  });

  const data = await res.json();

  if (data.jobId) {
    const terminalId = `project_${workspaceId}`;

    sendWS({
      type: "create",
      terminalId,
      workspaceId,
    });

    setActiveTerminal(terminalId);
  }
};


  /* ================= PREVIEW ================= */

  let previewWindow = null; // 👈 persists across calls

const refreshPreview = async () => {
  if (!activeFile?.endsWith(".html")) return;

  await fileApi.saveFile(
    accessToken,
    workspaceId,
    activeFile,
    fileContentsRef.current[activeFile] || ""
  );

  const url = `${backendUrl}/preview/${userId}/${workspaceId}/${activeFile}`;

  if (!previewWindow || previewWindow.closed) {
    previewWindow = window.open(url, "LIVE_PREVIEW");
  } else {
    previewWindow.focus();
  }
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
        refreshPreview,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
