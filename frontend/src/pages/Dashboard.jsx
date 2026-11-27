import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getWorkspaceNavTarget } from "../utils/workspaceUrl";
import {
  listWorkspaces,
  createWorkspace,
  deleteWorkspace,
  renameWorkspace,
  duplicateWorkspace,
  pinWorkspace,
  importWorkspace,
  exportWorkspaces,
  scanLocalFolder,
  getCommonFolders,
} from "../services/workspaceApi";
import {
  getRecycleBin,
  restoreRecycleBinItem,
  permanentlyDeleteRecycleBinItem,
  emptyRecycleBin,
} from "../services/fileApi";
import { Sparkles } from "lucide-react";
import DashboardBackground from "../components/DashboardBackground";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import WorkspaceCardGrid from "../components/dashboard/WorkspaceCardGrid";
import DashboardPlaceholderTab from "../components/dashboard/DashboardPlaceholderTab";
import TemplatesView from "../components/dashboard/TemplatesView";
import RecycleBinView from "../components/dashboard/RecycleBinView";
import RenameWorkspaceModal from "../components/dashboard/RenameWorkspaceModal";
import DeleteWorkspaceModal from "../components/dashboard/DeleteWorkspaceModal";
import {
  PermanentDeleteModal,
  EmptyRecycleBinModal,
} from "../components/dashboard/RecycleBinModals";
import ImportWorkspaceModal from "../components/dashboard/ImportWorkspaceModal";
import UploadConfirmModal from "../components/dashboard/UploadConfirmModal";
import ExportWorkspacesModal from "../components/dashboard/ExportWorkspacesModal";
import SettingsView from "../components/settings/SettingsView";
import AccountSettingsView from "../components/account/AccountSettingsView";
import "../styles/dashboard.css";
import "../styles/templates.css";

export default function Dashboard() {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();

  // Shared Theme State (Synced with localStorage & Landing/Auth pages)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("vocode_theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("vocode_theme", nextTheme);
  };

  // State Management
  const [workspaces, setWorkspaces] = useState([]);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const pending = sessionStorage.getItem("vocode_pending_dashboard_tab");
      if (pending) {
        sessionStorage.removeItem("vocode_pending_dashboard_tab");
        return pending;
      }
    } catch {}
    return "workspaces";
  });
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  // Workspace Context Actions State (Rename, Duplicate, Pin, Delete)
  const [renameModalWs, setRenameModalWs] = useState(null);
  const [renameInputVal, setRenameInputVal] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const renameInputRef = useRef(null);

  const [deleteModalWs, setDeleteModalWs] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [isCreatingTemplateWs, setIsCreatingTemplateWs] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  useEffect(() => {
    if (renameModalWs) {
      setTimeout(() => {
        renameInputRef.current?.focus();
        renameInputRef.current?.select();
      }, 50);
    }
  }, [renameModalWs]);

  // Recycle Bin state
  const [recycleItems, setRecycleItems] = useState([]);
  const [recycleLoading, setRecycleLoading] = useState(false);
  const [recycleActionLoading, setRecycleActionLoading] = useState(null);
  const [recycleMessage, setRecycleMessage] = useState(null);
  const [permDeleteModalItem, setPermDeleteModalItem] = useState(null);
  const [showEmptyBinModal, setShowEmptyBinModal] = useState(false);

  // Import Folder state
  const folderInputRef = useRef(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPendingFiles, setImportPendingFiles] = useState(null);
  const [importFolderName, setImportFolderName] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCenterUploadAlert, setShowCenterUploadAlert] = useState(false);
  const [localPathInput, setLocalPathInput] = useState("");
  const [isScanningLocal, setIsScanningLocal] = useState(false);
  const [commonFolders, setCommonFolders] = useState([]);

  // Export Workspaces state
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExportIds, setSelectedExportIds] = useState(new Set());
  const [exportFilter, setExportFilter] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const searchInputRef = useRef(null);
  const createInputRef = useRef(null);
  const createContainerRef = useRef(null);
  const createBtnRef = useRef(null);

  // Load Workspaces
  useEffect(() => {
    if (!accessToken) return;
    listWorkspaces(accessToken)
      .then((data) => {
        const wsList = Array.isArray(data) ? data : [];
        setWorkspaces(wsList);
        if (wsList.length > 0) {
          const first = wsList[0];
          localStorage.setItem("vocode_recent_workspace", first._id || first.id);
        }
      })
      .catch((err) => {
        if (err?.response?.status !== 401) {
          console.error("Failed to load workspaces:", err);
        }
        setWorkspaces([]);
      });

    getCommonFolders(accessToken)
      .then((data) => {
        if (data && Array.isArray(data.suggestions)) {
          setCommonFolders(data.suggestions);
        }
      })
      .catch(() => {});
  }, [accessToken]);

  // Load Recycle Bin
  const loadRecycleBin = async () => {
    if (!accessToken) return;
    try {
      setRecycleLoading(true);
      const items = await getRecycleBin(accessToken);
      setRecycleItems(Array.isArray(items) ? items : []);
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.error("Failed to load recycle bin:", err);
      }
      setRecycleItems([]);
    } finally {
      setRecycleLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadRecycleBin();
    }
  }, [accessToken]);

  // Voice Actions Handler from Voco
  useEffect(() => {
    const handleVoiceAction = (e) => {
      const { action, payload, match, feedback } = e.detail || {};
      const targetWs =
        workspaces.length > 0
          ? workspaces[0]._id || workspaces[0].id
          : localStorage.getItem("vocode_recent_workspace");

      if (action === "dashboard-tab" && payload?.tab) {
        setActiveTab(payload.tab);
      } else if (action === "open-workspace") {
        if (targetWs) {
          const wsObj = workspaces.find((w) => (w._id || w.id) === targetWs);
          const target = getWorkspaceNavTarget(targetWs, wsObj?.name);
          navigate(target.path, { state: target.state });
        }
      } else if (action === "create-workspace") {
        setShowCreateModal(true);
      } else if (
        [
          "open-folder",
          "open-file",
          "open-terminal",
          "run-code",
          "create-file",
          "create-folder",
        ].includes(action)
      ) {
        if (targetWs) {
          sessionStorage.setItem(
            "vocode_pending_voice_action",
            JSON.stringify({ action, type: action, payload, match, feedback })
          );
          const wsObj = workspaces.find((w) => (w._id || w.id) === targetWs);
          const target = getWorkspaceNavTarget(targetWs, wsObj?.name);
          navigate(target.path, { state: target.state });
        }
      }
    };
    window.addEventListener("vocode-voice-action", handleVoiceAction);
    return () => window.removeEventListener("vocode-voice-action", handleVoiceAction);
  }, [workspaces, navigate]);

  useEffect(() => {
    if (activeTab === "recycle-bin" && accessToken) {
      loadRecycleBin();
    }
  }, [activeTab, accessToken]);

  const handleRestoreItem = async (id, name) => {
    if (!accessToken) return;
    try {
      setRecycleActionLoading(id);
      await restoreRecycleBinItem(accessToken, id);
      setRecycleItems((prev) => prev.filter((item) => item._id !== id));

      // Reload workspaces so restored workspace/files appear immediately
      const updatedList = await listWorkspaces(accessToken);
      if (Array.isArray(updatedList)) {
        setWorkspaces(updatedList);
      }

      setRecycleMessage(`Restored "${name}" successfully`);
      showToast(`Restored "${name}" successfully`);
      setTimeout(() => setRecycleMessage(null), 3500);
    } catch (err) {
      console.error("Restore failed:", err);
      showToast("Failed to restore item: " + err.message, "error");
    } finally {
      setRecycleActionLoading(null);
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!accessToken || !permDeleteModalItem) return;
    const { id, name } = permDeleteModalItem;
    try {
      setRecycleActionLoading(id);
      await permanentlyDeleteRecycleBinItem(accessToken, id);
      setRecycleItems((prev) => prev.filter((item) => item._id !== id));
      setRecycleMessage(`Permanently deleted "${name}"`);
      showToast(`Permanently deleted "${name}"`);
      setTimeout(() => setRecycleMessage(null), 3500);
      setPermDeleteModalItem(null);
    } catch (err) {
      console.error("Permanent delete failed:", err);
      showToast("Failed to permanently delete: " + err.message, "error");
    } finally {
      setRecycleActionLoading(null);
    }
  };

  const handleConfirmEmptyRecycleBin = async () => {
    if (!accessToken || recycleItems.length === 0) return;
    const prevItems = [...recycleItems];
    try {
      // 1. Optimistically clear items and dismiss modal instantly (0ms lag)
      setRecycleItems([]);
      setShowEmptyBinModal(false);
      setRecycleMessage("Recycle bin emptied");
      showToast("Recycle bin emptied");
      setTimeout(() => setRecycleMessage(null), 3500);

      // 2. Perform backend purge
      await emptyRecycleBin(accessToken);
    } catch (err) {
      console.error("Empty recycle bin failed:", err);
      setRecycleItems(prevItems);
      showToast("Failed to empty recycle bin: " + err.message, "error");
    }
  };

  // Command + K keyboard shortcut handler for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sort workspaces: Pinned first, then by updatedAt / createdAt descending
  const sortedWorkspaces = [...workspaces].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  // Filter workspaces by search
  const filteredWorkspaces = sortedWorkspaces.filter((w) =>
    (w.name || "").toLowerCase().includes(search.toLowerCase())
  );

  // Close menus and creation box on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      setMenuOpenId(null);

      // Do not close profile popover if clicking inside the profile card or menu
      const isInsideProfile =
        e.target &&
        e.target.closest &&
        (e.target.closest(".sidebar-user-card") ||
          e.target.closest(".user-popover") ||
          e.target.closest(".sidebar-profile-container"));

      if (!isInsideProfile) {
        setProfileMenuOpen(false);
      }

      if (
        createContainerRef.current &&
        !createContainerRef.current.contains(e.target) &&
        createBtnRef.current &&
        !createBtnRef.current.contains(e.target)
      ) {
        setShowCreate(false);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  /* IMPORT WORKSPACE FROM LOCAL DESKTOP FOLDER */
  const BINARY_EXTENSIONS = new Set([
    "png", "jpg", "jpeg", "gif", "webp", "ico", "bmp", "svg",
    "docx", "doc", "xlsx", "xls", "pptx", "ppt", "pdf",
    "zip", "tar", "gz", "7z", "rar",
    "mp3", "wav", "mp4", "webm", "mov"
  ]);

  const isBinaryFilePath = (p) => {
    const ext = (p || "").split(".").pop()?.toLowerCase();
    return BINARY_EXTENSIONS.has(ext);
  };

  const readFilePayload = (file) => {
    return new Promise((resolve) => {
      const isBin = isBinaryFilePath(file.name || file.webkitRelativePath);
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result || "");
      reader.onerror = () => resolve("");
      if (isBin) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const triggerFolderBrowser = async () => {
    if (window.showDirectoryPicker) {
      try {
        const dirHandle = await window.showDirectoryPicker({ mode: "read" });
        showToast("Scanning selected folder...");
        const items = [];
        const fileEntries = [];
        const knownFolders = new Set();

        async function scanDirectoryHandle(handle, currentPath = "") {
          for await (const entry of handle.values()) {
            if (
              entry.name === "node_modules" ||
              entry.name === ".git" ||
              entry.name === ".vscode" ||
              entry.name === ".idea" ||
              entry.name === "dist" ||
              entry.name === "build" ||
              entry.name === ".DS_Store"
            ) continue;

            const relPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
            if (entry.kind === "directory") {
              if (!knownFolders.has(relPath)) {
                knownFolders.add(relPath);
                items.push({ path: relPath, type: "folder" });
              }
              await scanDirectoryHandle(entry, relPath);
            } else if (entry.kind === "file") {
              fileEntries.push({ entry, relPath });
            }
          }
        }

        await scanDirectoryHandle(dirHandle, "");

        // Read files in parallel batches
        const BATCH_SIZE = 25;
        for (let i = 0; i < fileEntries.length; i += BATCH_SIZE) {
          const batch = fileEntries.slice(i, i + BATCH_SIZE);
          const batchItems = await Promise.all(
            batch.map(async ({ entry, relPath }) => {
              try {
                const file = await entry.getFile();
                const content = await readFilePayload(file);
                return {
                  path: relPath,
                  type: "file",
                  content: content || "",
                };
              } catch (readErr) {
                console.warn("Read file error:", relPath, readErr);
                return null;
              }
            })
          );
          items.push(...batchItems.filter(Boolean));
        }

        if (items.length === 0) {
          showToast("No valid project files found in selected folder", "error");
          return;
        }

        setImportFolderName(dirHandle.name || "Imported Project");
        setImportPendingFiles(items);
        setShowImportModal(false);
        setShowCenterUploadAlert(true);
        return;
      } catch (pickerErr) {
        if (pickerErr.name === "AbortError") {
          return;
        }
        console.warn("showDirectoryPicker fallback:", pickerErr);
      }
    }

    if (folderInputRef.current) {
      folderInputRef.current.value = "";
      folderInputRef.current.click();
    }
  };

  const handleScanDirectPath = async (targetPath) => {
    const pathToScan = (targetPath || localPathInput || "").trim();
    if (!pathToScan) {
      showToast("Please enter a valid folder path (e.g. D:\\C++_DSA)", "error");
      return;
    }
    try {
      setIsScanningLocal(true);
      showToast(`Scanning "${pathToScan}"...`);
      const result = await scanLocalFolder(accessToken, pathToScan);
      if (result.canceled || !result.items || result.items.length === 0) {
        showToast("No valid project files found at " + pathToScan, "error");
        return;
      }
      setImportFolderName(result.folderName || "Imported Project");
      setImportPendingFiles(result.items);
      setShowImportModal(false);
      setShowCenterUploadAlert(true);
    } catch (err) {
      console.error("Scan path error:", err);
      showToast("Failed to read folder path: " + err.message, "error");
    } finally {
      setIsScanningLocal(false);
    }
  };

  const handleDropFolder = async (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    showToast("Scanning dropped folder...");

    const scannedItems = [];
    const pendingFileEntries = [];
    let detectedName = "";

    async function scanEntry(entry, currentPath = "") {
      if (
        entry.name === "node_modules" ||
        entry.name === ".git" ||
        entry.name === ".DS_Store" ||
        entry.name === ".vscode"
      ) {
        return;
      }

      if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const readAllEntries = async () => {
          let all = [];
          let batch;
          do {
            batch = await new Promise((res) =>
              dirReader.readEntries(res, () => res([]))
            );
            all = all.concat(batch);
          } while (batch && batch.length > 0);
          return all;
        };

        const children = await readAllEntries();
        for (const child of children) {
          const childPath = currentPath
            ? `${currentPath}/${child.name}`
            : child.name;
          if (child.isDirectory) {
            scannedItems.push({ path: childPath, type: "folder" });
            await scanEntry(child, childPath);
          } else if (child.isFile) {
            pendingFileEntries.push({ child, childPath });
          }
        }
      } else if (entry.isFile) {
        pendingFileEntries.push({ child: entry, childPath: entry.name });
      }
    }

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
        if (entry) {
          if (!detectedName && entry.isDirectory) {
            detectedName = entry.name;
          }
          await scanEntry(entry, "");
        }
      }

      // Read files in parallel batches of 25
      const BATCH_SIZE = 25;
      for (let i = 0; i < pendingFileEntries.length; i += BATCH_SIZE) {
        const batch = pendingFileEntries.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map(async ({ child, childPath }) => {
            try {
              const file = await new Promise((res) =>
                child.file(res, () => res(null))
              );
              if (file) {
                const text = await readFilePayload(file);
                return {
                  path: childPath,
                  type: "file",
                  content: text || "",
                };
              }
            } catch (err) {
              console.warn("Read dropped file error:", childPath, err);
            }
            return null;
          })
        );
        scannedItems.push(...batchResults.filter(Boolean));
      }

      if (scannedItems.length === 0) {
        showToast("No valid project files found in dropped folder", "error");
        return;
      }

      setImportFolderName(detectedName || "Imported Workspace");
      setImportPendingFiles(scannedItems);
      setShowImportModal(false);
      setShowCenterUploadAlert(true);
    } catch (dropErr) {
      console.error("Drop folder error:", dropErr);
      showToast("Failed to read dropped folder: " + dropErr.message, "error");
    }
  };

  const handleFolderSelected = async (e) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;

    // Filter out node_modules and .git folders
    const validFiles = fileList.filter((f) => {
      const rel = (f.webkitRelativePath || f.name).replace(/\\/g, "/");
      return (
        !rel.includes("/node_modules/") &&
        !rel.includes("/.git/") &&
        !rel.includes("/.vscode/")
      );
    });

    if (validFiles.length === 0) {
      showToast("No valid project files found in selected folder", "error");
      return;
    }

    const firstRel = validFiles[0].webkitRelativePath?.replace(/\\/g, "/") || "";
    const topFolder = firstRel.split("/")[0] || "Imported Project";
    const topPrefix = topFolder + "/";

    const folderItems = [];
    const fileEntries = [];
    const knownFolders = new Set();

    for (const file of validFiles) {
      let relPath = (file.webkitRelativePath || file.name).replace(/\\/g, "/");
      if (relPath.startsWith(topPrefix)) {
        relPath = relPath.slice(topPrefix.length);
      }
      if (!relPath) continue;

      // Register parent folder paths
      const parts = relPath.split("/").filter(Boolean);
      let curr = "";
      for (let i = 0; i < parts.length - 1; i++) {
        curr = curr ? `${curr}/${parts[i]}` : parts[i];
        if (!knownFolders.has(curr)) {
          knownFolders.add(curr);
          folderItems.push({ path: curr, type: "folder" });
        }
      }

      fileEntries.push({ file, relPath });
    }

    // Read files in parallel batches of 25
    const fileItems = [];
    const BATCH_SIZE = 25;
    for (let i = 0; i < fileEntries.length; i += BATCH_SIZE) {
      const batch = fileEntries.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async ({ file, relPath }) => {
          try {
            const content = await readFilePayload(file);
            return {
              path: relPath,
              content: content || "",
              type: "file",
            };
          } catch (readErr) {
            console.warn("Read file error:", relPath, readErr);
            return null;
          }
        })
      );
      fileItems.push(...batchResults.filter(Boolean));
    }

    const items = [...folderItems, ...fileItems];

    setImportFolderName(topFolder);
    setImportPendingFiles(items);
    setShowImportModal(false);
    setShowCenterUploadAlert(true);
  };

  const handleConfirmImport = async (e) => {
    if (e) e.preventDefault();
    if (!importPendingFiles || importPendingFiles.length === 0) return;

    try {
      setIsImporting(true);
      const finalName = (importFolderName || "Imported Workspace").trim();

      if (accessToken) {
        const newWs = await importWorkspace(accessToken, {
          name: finalName,
          files: importPendingFiles,
        });
        setWorkspaces((prev) => [newWs, ...prev]);
      } else {
        const newWs = {
          _id: `ws-${Date.now()}`,
          name: finalName,
          updatedAt: new Date().toISOString(),
          isPinned: false,
        };
        setWorkspaces((prev) => [newWs, ...prev]);
      }

      const fileCount = importPendingFiles.filter((i) => i.type === "file").length;
      const folderCount = importPendingFiles.filter((i) => i.type === "folder").length;
      showToast(`Imported "${finalName}" (${fileCount} files, ${folderCount} folders)`);
      setShowImportModal(false);
      setShowCenterUploadAlert(false);
      setImportPendingFiles(null);
      setImportFolderName("");
    } catch (err) {
      console.error("Import failed:", err);
      showToast("Failed to import workspace: " + err.message, "error");
    } finally {
      setIsImporting(false);
    }
  };

  /* EXPORT SINGLE WORKSPACE DIRECTLY */
  const handleExportSingleWorkspace = async (ws) => {
    try {
      showToast(`Exporting "${ws.name}"...`);
      const res = await exportWorkspaces(accessToken, [ws._id], ws.name);
      showToast(`Exported "${ws.name}" as ${res.filename}`);
    } catch (err) {
      console.error("Export error:", err);
      showToast("Export failed: " + err.message, "error");
    }
  };

  /* EXPORT WORKSPACES AS ZIP */
  const openExportModal = () => {
    setSelectedExportIds(new Set(workspaces.map((w) => w._id)));
    setExportFilter("");
    setShowExportModal(true);
  };

  const toggleSelectWorkspaceForExport = (id) => {
    setSelectedExportIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllExport = () => {
    if (selectedExportIds.size === workspaces.length) {
      setSelectedExportIds(new Set());
    } else {
      setSelectedExportIds(new Set(workspaces.map((w) => w._id)));
    }
  };

  const handleConfirmExport = async () => {
    if (selectedExportIds.size === 0) return;
    try {
      setIsExporting(true);
      const ids = Array.from(selectedExportIds);
      let defaultName = null;
      if (ids.length === 1) {
        const found = workspaces.find((w) => w._id === ids[0]);
        if (found) defaultName = found.name;
      }
      if (accessToken) {
        const res = await exportWorkspaces(accessToken, ids, defaultName);
        showToast(`Exported ${ids.length} workspace(s) as ZIP (${res.filename})`);
      } else {
        showToast("Export requires an active session", "error");
      }
      setShowExportModal(false);
    } catch (err) {
      console.error("Export failed:", err);
      showToast("Export failed: " + err.message, "error");
    } finally {
      setIsExporting(false);
    }
  };

  /* CREATE WORKSPACE */
  const handleCreateWorkspace = async () => {
    if (!newName.trim()) {
      createInputRef.current?.focus();
      return;
    }

    try {
      if (accessToken) {
        const ws = await createWorkspace(accessToken, newName.trim());
        setWorkspaces((prev) => [ws, ...prev]);
      } else {
        const newWs = {
          _id: `ws-${Date.now()}`,
          name: newName.trim(),
          updatedAt: new Date().toISOString(),
          isPinned: false,
        };
        setWorkspaces((prev) => [newWs, ...prev]);
      }
      showToast(`Created workspace "${newName.trim()}"`);
      setNewName("");
      setShowCreate(false);
    } catch (err) {
      console.error("Create workspace failed:", err);
      showToast("Failed to create workspace", "error");
    }
  };

  /* USE TEMPLATE TO CREATE WORKSPACE */
  const handleUseTemplate = async (templateId, customName) => {
    try {
      setIsCreatingTemplateWs(true);
      const name = customName?.trim() || "Starter Workspace";
      if (accessToken) {
        const ws = await createWorkspace(accessToken, name, templateId);
        setWorkspaces((prev) => [ws, ...prev]);
        showToast(`Created workspace from template "${ws.name}"`);
        const target = getWorkspaceNavTarget(ws);
        navigate(target.path, { state: target.state });
      } else {
        const newWs = {
          _id: `ws-${Date.now()}`,
          name,
          updatedAt: new Date().toISOString(),
          isPinned: false,
        };
        setWorkspaces((prev) => [newWs, ...prev]);
        showToast(`Created workspace "${name}"`);
        setActiveTab("workspaces");
      }
    } catch (err) {
      console.error("Failed to create template workspace:", err);
      showToast(err.message || "Failed to create workspace from template", "error");
    } finally {
      setIsCreatingTemplateWs(false);
    }
  };

  /* RENAME WORKSPACE */
  const openRenameModal = (ws) => {
    setRenameModalWs(ws);
    setRenameInputVal(ws.name || "");
    setIsRenaming(false);
  };

  const closeRenameModal = () => {
    setRenameModalWs(null);
    setRenameInputVal("");
    setIsRenaming(false);
  };

  const handleConfirmRename = async (e) => {
    if (e) e.preventDefault();
    if (!renameModalWs || !renameInputVal.trim()) return;

    const trimmed = renameInputVal.trim();
    if (trimmed === renameModalWs.name) {
      closeRenameModal();
      return;
    }

    try {
      setIsRenaming(true);
      if (
        accessToken &&
        !renameModalWs._id.startsWith("demo-") &&
        !renameModalWs._id.startsWith("ws-")
      ) {
        const updated = await renameWorkspace(accessToken, renameModalWs._id, trimmed);
        setWorkspaces((prev) =>
          prev.map((w) =>
            w._id === renameModalWs._id
              ? { ...w, ...updated, name: trimmed, updatedAt: new Date().toISOString() }
              : w
          )
        );
      } else {
        setWorkspaces((prev) =>
          prev.map((w) =>
            w._id === renameModalWs._id
              ? { ...w, name: trimmed, updatedAt: new Date().toISOString() }
              : w
          )
        );
      }
      showToast(`Renamed workspace to "${trimmed}"`);
      closeRenameModal();
    } catch (err) {
      console.error("Rename failed:", err);
      showToast("Failed to rename workspace: " + err.message, "error");
    } finally {
      setIsRenaming(false);
    }
  };

  /* DUPLICATE WORKSPACE */
  const handleDuplicate = async (ws) => {
    try {
      setDuplicatingId(ws._id);
      let copy;
      if (
        accessToken &&
        !ws._id.startsWith("demo-") &&
        !ws._id.startsWith("ws-")
      ) {
        copy = await duplicateWorkspace(accessToken, ws._id);
      } else {
        copy = {
          ...ws,
          _id: `ws-${Date.now()}`,
          name: `${ws.name} (copy)`,
          updatedAt: new Date().toISOString(),
          isPinned: false,
        };
      }
      setWorkspaces((prev) => [copy, ...prev]);
      showToast(`Duplicated "${ws.name}"`);
    } catch (err) {
      console.error("Duplicate failed:", err);
      showToast("Failed to duplicate workspace: " + err.message, "error");
    } finally {
      setDuplicatingId(null);
    }
  };

  /* PIN / UNPIN WORKSPACE */
  const handlePin = async (ws) => {
    const nextPinned = !ws.isPinned;
    try {
      if (
        accessToken &&
        !ws._id.startsWith("demo-") &&
        !ws._id.startsWith("ws-")
      ) {
        const updated = await pinWorkspace(accessToken, ws._id, nextPinned);
        setWorkspaces((prev) =>
          prev.map((w) =>
            w._id === ws._id ? { ...w, ...updated, isPinned: nextPinned } : w
          )
        );
      } else {
        setWorkspaces((prev) =>
          prev.map((w) =>
            w._id === ws._id ? { ...w, isPinned: nextPinned } : w
          )
        );
      }
      showToast(nextPinned ? `Pinned "${ws.name}" to top` : `Unpinned "${ws.name}"`);
    } catch (err) {
      console.error("Pin failed:", err);
      showToast("Failed to update pin status", "error");
    }
  };

  /* DELETE WORKSPACE */
  const openDeleteModal = (ws) => {
    setDeleteModalWs(ws);
    setIsDeleting(false);
  };

  const closeDeleteModal = () => {
    setDeleteModalWs(null);
    setIsDeleting(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalWs) return;

    try {
      setIsDeleting(true);
      const wsId = deleteModalWs._id;
      const wsName = deleteModalWs.name;

      if (
        accessToken &&
        !wsId.startsWith("demo-") &&
        !wsId.startsWith("ws-")
      ) {
        await deleteWorkspace(accessToken, wsId);
      }

      setWorkspaces((prev) => prev.filter((w) => w._id !== wsId));
      loadRecycleBin(); // Immediately update recycle bin list and sidebar badge
      showToast(`Moved "${wsName}" to Recycle Bin`);
      closeDeleteModal();
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("Failed to delete workspace: " + err.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = (id) => {
    const wsObj = workspaces.find((w) => (w._id || w.id) === id);
    const target = getWorkspaceNavTarget(id, wsObj?.name);
    navigate(target.path, { state: target.state });
  };

  return (
    <div className={`dashboard-layout ${theme}`}>
      {/* Unified Background System (Grid, Aurora Orbs & Glowing Curves) */}
      <DashboardBackground theme={theme} />

      {/* Sidebar Navigation */}
      <DashboardSidebar
        theme={theme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recycleCount={recycleItems.length}
        user={user}
        logout={logout}
        profileMenuOpen={profileMenuOpen}
        setProfileMenuOpen={setProfileMenuOpen}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        navigate={navigate}
      />

      {/* Main Content Area */}
      <main
        className={`dashboard-main ${
          activeTab === "settings"
            ? "settings-active-main"
            : activeTab === "account"
            ? "account-active-main"
            : ""
        }`}
      >
        {/* Top Toolbar */}
        {activeTab === "workspaces" && (
          <DashboardHeader
          search={search}
          setSearch={setSearch}
          searchInputRef={searchInputRef}
          theme={theme}
          toggleTheme={toggleTheme}
          folderInputRef={folderInputRef}
          handleFolderSelected={handleFolderSelected}
          onOpenImport={() => {
            setImportPendingFiles(null);
            setImportFolderName("");
            setShowImportModal(true);
          }}
          onOpenExport={openExportModal}
          workspacesCount={workspaces.length}
          createBtnRef={createBtnRef}
          setShowCreate={setShowCreate}
          createInputRef={createInputRef}
          />
        )}

        {/* WORKSPACES TAB VIEW */}
        {activeTab === "workspaces" && (
          <WorkspaceCardGrid
            filteredWorkspaces={filteredWorkspaces}
            handleCardClick={handleCardClick}
            menuOpenId={menuOpenId}
            setMenuOpenId={setMenuOpenId}
            openRenameModal={openRenameModal}
            handleDuplicate={handleDuplicate}
            duplicatingId={duplicatingId}
            handlePin={handlePin}
            handleExportSingleWorkspace={handleExportSingleWorkspace}
            openDeleteModal={openDeleteModal}
            search={search}
            showCreate={showCreate}
            setShowCreate={setShowCreate}
            createContainerRef={createContainerRef}
            createInputRef={createInputRef}
            newName={newName}
            setNewName={setNewName}
            handleCreateWorkspace={handleCreateWorkspace}
          />
        )}

        {/* ACCOUNT SETTINGS TAB VIEW */}
        {activeTab === "account" && (
          <AccountSettingsView
            onBack={() => setActiveTab("workspaces")}
            onSignOut={async () => {
              try {
                await logout();
              } catch (err) {
                console.warn("Sign out err:", err);
              } finally {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                navigate("/?auth=login", { replace: true });
              }
            }}
          />
        )}

        {/* SETTINGS TAB VIEW */}
        {activeTab === "settings" && (
          <SettingsView
            workspaceId={null}
            onBack={() => setActiveTab("workspaces")}
          />
        )}


        {activeTab === "templates" && (
          <TemplatesView
            onUseTemplate={handleUseTemplate}
            onBack={() => setActiveTab("workspaces")}
            isCreating={isCreatingTemplateWs}
          />
        )}

        {/* RECYCLE BIN TAB VIEW */}
        {activeTab === "recycle-bin" && (
          <RecycleBinView
            recycleItems={recycleItems}
            recycleLoading={recycleLoading}
            recycleActionLoading={recycleActionLoading}
            recycleMessage={recycleMessage}
            handleRestoreItem={handleRestoreItem}
            setPermDeleteModalItem={setPermDeleteModalItem}
            setShowEmptyBinModal={setShowEmptyBinModal}
            setActiveTab={setActiveTab}
          />
        )}

        {/* RENAME WORKSPACE MODAL */}
        <RenameWorkspaceModal
          renameModalWs={renameModalWs}
          closeRenameModal={closeRenameModal}
          handleConfirmRename={handleConfirmRename}
          renameInputRef={renameInputRef}
          renameInputVal={renameInputVal}
          setRenameInputVal={setRenameInputVal}
          isRenaming={isRenaming}
        />

        {/* DELETE WORKSPACE CONFIRMATION MODAL */}
        <DeleteWorkspaceModal
          deleteModalWs={deleteModalWs}
          closeDeleteModal={closeDeleteModal}
          handleConfirmDelete={handleConfirmDelete}
          isDeleting={isDeleting}
        />

        {/* RECYCLE BIN MODALS */}
        <PermanentDeleteModal
          permDeleteModalItem={permDeleteModalItem}
          setPermDeleteModalItem={setPermDeleteModalItem}
          handleConfirmPermanentDelete={handleConfirmPermanentDelete}
          recycleActionLoading={recycleActionLoading}
        />

        <EmptyRecycleBinModal
          showEmptyBinModal={showEmptyBinModal}
          setShowEmptyBinModal={setShowEmptyBinModal}
          handleConfirmEmptyRecycleBin={handleConfirmEmptyRecycleBin}
          recycleLoading={recycleLoading}
          itemCount={recycleItems.length}
        />

        {/* IMPORT WORKSPACE POP-UP MODAL */}
        <ImportWorkspaceModal
          showImportModal={showImportModal}
          setShowImportModal={setShowImportModal}
          isImporting={isImporting}
          importPendingFiles={importPendingFiles}
          setImportPendingFiles={setImportPendingFiles}
          importFolderName={importFolderName}
          setImportFolderName={setImportFolderName}
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
          handleDropFolder={handleDropFolder}
          triggerFolderBrowser={triggerFolderBrowser}
          localPathInput={localPathInput}
          setLocalPathInput={setLocalPathInput}
          handleScanDirectPath={handleScanDirectPath}
          isScanningLocal={isScanningLocal}
          commonFolders={commonFolders}
          handleConfirmImport={handleConfirmImport}
        />

        {/* CENTERED UPLOAD CONFIRMATION POP-UP MODAL */}
        <UploadConfirmModal
          showCenterUploadAlert={showCenterUploadAlert}
          setShowCenterUploadAlert={setShowCenterUploadAlert}
          importPendingFiles={importPendingFiles}
          importFolderName={importFolderName}
          setImportFolderName={setImportFolderName}
          isImporting={isImporting}
          handleConfirmImport={handleConfirmImport}
        />

        {/* EXPORT WORKSPACES AS ZIP MODAL */}
        <ExportWorkspacesModal
          showExportModal={showExportModal}
          setShowExportModal={setShowExportModal}
          isExporting={isExporting}
          exportFilter={exportFilter}
          setExportFilter={setExportFilter}
          toggleSelectAllExport={toggleSelectAllExport}
          selectedExportIds={selectedExportIds}
          workspaces={workspaces}
          toggleSelectWorkspaceForExport={toggleSelectWorkspaceForExport}
          handleConfirmExport={handleConfirmExport}
        />

        {/* DASHBOARD FLOATING TOAST FEEDBACK */}
        {toast && (
          <div className="dash-toast-banner">
            <Sparkles size={16} style={{ color: "var(--accent-primary)" }} />
            <span>{toast.message}</span>
          </div>
        )}
      </main>
    </div>
  );
}

