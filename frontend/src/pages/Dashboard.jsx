import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
import { getFileIcon } from "../utils/getFileIcon";
import {
  LayoutDashboard,
  Layers3,
  SquareTerminal,
  Sparkles,
  Settings,
  Search,
  Plus,
  FolderClosed,
  MoreVertical,
  ChevronRight,
  Sun,
  Moon,
  Pencil,
  Copy,
  Star,
  Trash2,
  LogOut,
  Menu,
  X,
  RotateCcw,
  Check,
  Upload,
  Download,
  CheckSquare,
  Square,
  FolderArchive,
  FolderUp,
  FolderOpen,
  FileText,
} from "lucide-react";
import DashboardBackground from "../components/DashboardBackground";
import "../styles/dashboard.css";

/* Helper for relative timestamp formatting (e.g., "Updated 2 minutes ago") */
function formatRelativeTime(dateString) {
  if (!dateString) return "Updated 2 minutes ago";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Updated just now";
    if (diffMins === 1) return "Updated 1 minute ago";
    if (diffMins < 60) return `Updated ${diffMins} minutes ago`;
    if (diffHours === 1) return "Updated 1 hour ago";
    if (diffHours < 24) return `Updated ${diffHours} hours ago`;
    if (diffDays === 1) return "Updated yesterday";
    return `Updated ${diffDays} days ago`;
  } catch {
    return "Updated 2 minutes ago";
  }
}

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
  const [activeTab, setActiveTab] = useState("workspaces");
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
    listWorkspaces(accessToken).then((data) => {
      // If user has no workspaces from API, provide initial default workspace if empty
      if (Array.isArray(data) && data.length > 0) {
        setWorkspaces(data);
      } else {
        setWorkspaces([
          {
            _id: "demo-java",
            name: "Java",
            updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            isPinned: false,
          },
        ]);
      }
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
      console.error("Failed to load recycle bin:", err);
    } finally {
      setRecycleLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadRecycleBin();
    }
  }, [accessToken]);

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
    try {
      setRecycleLoading(true);
      await emptyRecycleBin(accessToken);
      setRecycleItems([]);
      setRecycleMessage("Recycle bin emptied");
      showToast("Recycle bin emptied");
      setTimeout(() => setRecycleMessage(null), 3500);
      setShowEmptyBinModal(false);
    } catch (err) {
      console.error("Empty recycle bin failed:", err);
      showToast("Failed to empty recycle bin: " + err.message, "error");
    } finally {
      setRecycleLoading(false);
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
      setProfileMenuOpen(false);

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
              const file = await entry.getFile();
              const content = await readFilePayload(file);
              items.push({
                path: relPath,
                type: "file",
                content: content || "",
              });
            }
          }
        }

        await scanDirectoryHandle(dirHandle, "");
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
            const file = await new Promise((res) =>
              child.file(res, () => res(null))
            );
            if (file) {
              const text = await readFilePayload(file);
              scannedItems.push({
                path: childPath,
                type: "file",
                content: text || "",
              });
            }
          }
        }
      } else if (entry.isFile) {
        const file = await new Promise((res) =>
          entry.file(res, () => res(null))
        );
        if (file) {
          const text = await readFilePayload(file);
          scannedItems.push({
            path: entry.name,
            type: "file",
            content: text || "",
          });
        }
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

    const items = [];
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
          items.push({ path: curr, type: "folder" });
        }
      }

      const content = await readFilePayload(file);
      items.push({
        path: relPath,
        content: content || "",
        type: "file",
      });
    }

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
    navigate(`/workspace/${id}`);
  };

  const userName =
    user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.name || "User";
  const userEmail = user?.email || "user@example.com";
  const userInitial = userName.charAt(0).toUpperCase() || "U";

  return (
    <div className={`dashboard-layout ${theme}`}>
      {/* Mobile Top Navbar with Hamburger */}
      <div className="mobile-dashboard-header">
        <div className="sidebar-brand" onClick={() => navigate("/")}>
          <img
            src={theme === "light" ? "/vcode-light.png" : "/vcode.png"}
            alt="Vocodeai"
            className="sidebar-logo-img"
          />
        </div>
        <button
          className="mobile-hamburger-btn"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label="Toggle Navigation"
        >
          {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* =========================================================
         LEFT SIDEBAR
         ========================================================= */}
      <aside className={`dashboard-sidebar ${mobileSidebarOpen ? "mobile-open" : ""}`}>
        {/* Brand Logo */}
        <div
          className="sidebar-brand"
          onClick={() => {
            setMobileSidebarOpen(false);
            navigate("/");
          }}
          title="Go to Vocodeai Home"
        >
          <img
            src={theme === "light" ? "/vcode-light.png" : "/vcode.png"}
            alt="Vocodeai Logo"
            className="sidebar-logo-img"
          />
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${activeTab === "workspaces" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("workspaces");
              setMobileSidebarOpen(false);
            }}
          >
            <LayoutDashboard className="nav-icon" />
            <span>Workspaces</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === "templates" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("templates");
              setMobileSidebarOpen(false);
            }}
          >
            <Layers3 className="nav-icon" />
            <span>Templates</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === "terminal" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("terminal");
              setMobileSidebarOpen(false);
            }}
          >
            <SquareTerminal className="nav-icon" />
            <span>Cloud Terminal</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === "assistant" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("assistant");
              setMobileSidebarOpen(false);
            }}
          >
            <Sparkles className="nav-icon" />
            <span>AI Assistant</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("settings");
              setMobileSidebarOpen(false);
            }}
          >
            <Settings className="nav-icon" />
            <span>Settings</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === "recycle-bin" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("recycle-bin");
              setMobileSidebarOpen(false);
            }}
          >
            <Trash2 className="nav-icon" />
            <span>Recycle Bin</span>
            {recycleItems.length > 0 && (
              <span className="sidebar-recycle-badge">{recycleItems.length}</span>
            )}
          </button>
        </nav>

        {/* User Profile Card (Bottom of Sidebar) */}
        <div
          className="sidebar-user-card"
          onClick={(e) => {
            e.stopPropagation();
            setProfileMenuOpen(!profileMenuOpen);
          }}
        >
          <div className="user-avatar">{userInitial}</div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-email">{userEmail}</span>
          </div>
          <ChevronRight className="user-chevron" />

          {/* Profile Popover Menu */}
          {profileMenuOpen && (
            <div className="user-popover" onClick={(e) => e.stopPropagation()}>
              <button
                className="popover-item"
                onClick={() => {
                  setProfileMenuOpen(false);
                  setActiveTab("settings");
                }}
              >
                <Settings size={15} />
                <span>Account Settings</span>
              </button>
              <button
                className="popover-item danger"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* =========================================================
         MAIN CONTENT AREA
         ========================================================= */}
      <main className="dashboard-main">
        {/* Decorative Background Curves & Glow */}
        <DashboardBackground theme={theme} />

        {/* Top Toolbar */}
        <header className="dashboard-topbar">
          {/* Search Workspace Field */}
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="search-input-field"
              placeholder="Search workspace..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="search-shortcut-badge">⌘ K</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            className="dash-theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-label="Toggle dark and light mode"
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* Hidden File Input for Folder Import */}
          <input
            ref={folderInputRef}
            type="file"
            webkitdirectory="true"
            directory="true"
            multiple
            style={{ display: "none" }}
            onChange={handleFolderSelected}
          />

          {/* Import Folder Button */}
          <button
            className="btn-dash-action-secondary"
            onClick={() => {
              setImportPendingFiles(null);
              setImportFolderName("");
              setShowImportModal(true);
            }}
            title="Import a folder from desktop as a new workspace"
          >
            <Upload size={17} />
            <span>Import</span>
          </button>

          {/* Export Workspaces Button */}
          <button
            className="btn-dash-action-secondary"
            onClick={openExportModal}
            title="Export workspace folders as ZIP"
            disabled={workspaces.length === 0}
          >
            <Download size={17} />
            <span>Export</span>
          </button>

          {/* Primary "+ Create Workspace" Button */}
          <button
            ref={createBtnRef}
            className="btn-create-workspace-primary"
            onClick={() => {
              setShowCreate((prev) => {
                const next = !prev;
                if (next) {
                  setTimeout(() => createInputRef.current?.focus(), 50);
                }
                return next;
              });
            }}
          >
            <Plus size={18} />
            <span>Create Workspace</span>
          </button>
        </header>

        {/* ================= WORKSPACES TAB VIEW ================= */}
        {activeTab === "workspaces" && (
          <section className="workspaces-container">
            {/* Header Row: Heading on the left, Creation Controls on the right without layout shift */}
            <div className="dashboard-header-row">
              <div className="dashboard-heading-section">
                <h1 className="dash-main-title">
                  Your <span className="dash-heading-accent">Workspaces</span>
                </h1>
                <p className="dash-main-subtitle">
                  Create, manage, and build with AI — all in one place.
                </p>
              </div>

              {showCreate && (
                <div className="workspace-create-inline-row" ref={createContainerRef}>
                  <input
                    ref={createInputRef}
                    type="text"
                    className="create-name-input"
                    placeholder="Workspace name"
                    value={newName}
                    autoFocus
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateWorkspace();
                      if (e.key === "Escape") setShowCreate(false);
                    }}
                  />
                  <button
                    className="btn-create-inline"
                    onClick={handleCreateWorkspace}
                  >
                    Create
                  </button>
                </div>
              )}
            </div>

            {/* Workspace Card Grid */}
            {filteredWorkspaces.length > 0 ? (
              <div className="workspaces-grid">
                {filteredWorkspaces.map((ws) => (
                  <div key={ws._id} className="workspace-card-item">
                    {/* Folder Icon Tile (72x72) */}
                    <div
                      className="workspace-folder-tile"
                      onClick={() => handleCardClick(ws._id)}
                      title={`Open ${ws.name}`}
                    >
                      <FolderClosed className="workspace-folder-svg" />
                    </div>

                    {/* Workspace Details */}
                    <div
                      className="workspace-info"
                      onClick={() => handleCardClick(ws._id)}
                    >
                      <div className="workspace-title-row">
                        <span className="workspace-name">{ws.name}</span>
                        {ws.isPinned && (
                          <span className="workspace-pinned-badge" title="Pinned to top">
                            <Star size={11} className="star-filled-icon" />
                            <span>Pinned</span>
                          </span>
                        )}
                      </div>
                      <span className="workspace-meta">
                        {formatRelativeTime(ws.updatedAt || ws.createdAt)}
                      </span>
                    </div>

                    {/* Three-Dot Overflow Trigger */}
                    <button
                      className="workspace-menu-trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === ws._id ? null : ws._id);
                      }}
                      title="Workspace options"
                      aria-label="Workspace options"
                    >
                      <MoreVertical size={19} />
                    </button>

                    {/* Overflow Context Dropdown */}
                    {menuOpenId === ws._id && (
                      <div
                        className="workspace-dropdown-menu"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <button
                          className="dropdown-action-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(null);
                            openRenameModal(ws);
                          }}
                        >
                          <Pencil size={14} />
                          <span>Rename</span>
                        </button>

                        <button
                          className="dropdown-action-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(null);
                            handleDuplicate(ws);
                          }}
                          disabled={duplicatingId === ws._id}
                        >
                          <Copy size={14} />
                          <span>
                            {duplicatingId === ws._id ? "Duplicating..." : "Duplicate"}
                          </span>
                        </button>

                        <button
                          className="dropdown-action-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(null);
                            handlePin(ws);
                          }}
                        >
                          <Star size={14} className={ws.isPinned ? "star-pinned-icon" : ""} />
                          <span>{ws.isPinned ? "Unpin" : "Pin"}</span>
                        </button>

                        <button
                          className="dropdown-action-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(null);
                            handleExportSingleWorkspace(ws);
                          }}
                        >
                          <Download size={14} />
                          <span>Export</span>
                        </button>

                        <button
                          className="dropdown-action-item danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(null);
                            openDeleteModal(ws);
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="workspaces-empty-state">
                <div className="empty-state-icon-tile">
                  <FolderClosed size={36} />
                </div>
                <h3 className="empty-state-title">
                  {search ? "No workspaces found" : "No workspaces yet"}
                </h3>
                <p className="empty-state-desc">
                  {search
                    ? `No workspaces matched "${search}". Try searching for another name.`
                    : "Create your first workspace to start building with Vocodeai."}
                </p>
                <button
                  className="btn-create-workspace-primary"
                  onClick={() => {
                    setShowCreate(true);
                    setTimeout(() => createInputRef.current?.focus(), 50);
                  }}
                >
                  <Plus size={18} />
                  <span>Create Workspace</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* ================= PLACEHOLDER TAB VIEWS ================= */}
        {activeTab === "templates" && (
          <div className="dashboard-placeholder-panel">
            <span className="placeholder-badge">Templates</span>
            <h2 className="placeholder-title">Pre-configured Project Starters</h2>
            <p className="placeholder-text">
              Quickly spin up full-stack Node.js, Python, React, and Go environments with optimized AI scaffolding and integrated runtime configurations.
            </p>
            <button
              className="btn-create-workspace-primary"
              onClick={() => setActiveTab("workspaces")}
            >
              Back to Workspaces
            </button>
          </div>
        )}

        {activeTab === "terminal" && (
          <div className="dashboard-placeholder-panel">
            <span className="placeholder-badge">Cloud Terminal</span>
            <h2 className="placeholder-title">Direct Cloud Execution Shell</h2>
            <p className="placeholder-text">
              Run scripts, execute Docker containers, install packages, and manage your cloud environment directly with native voice commands and integrated AI streaming.
            </p>
            <button
              className="btn-create-workspace-primary"
              onClick={() => setActiveTab("workspaces")}
            >
              Back to Workspaces
            </button>
          </div>
        )}

        {activeTab === "assistant" && (
          <div className="dashboard-placeholder-panel">
            <span className="placeholder-badge">AI Assistant</span>
            <h2 className="placeholder-title">Autonomous Pair Programmer</h2>
            <p className="placeholder-text">
              Collaborate in real time with our conversational code generation model. Refactor complex algorithms, fix runtime exceptions, and inspect ASTs hands-free.
            </p>
            <button
              className="btn-create-workspace-primary"
              onClick={() => setActiveTab("workspaces")}
            >
              Back to Workspaces
            </button>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="dashboard-placeholder-panel">
            <span className="placeholder-badge">Settings</span>
            <h2 className="placeholder-title">Workspace & Account Preferences</h2>
            <p className="placeholder-text">
              Manage your API keys, model hyperparameters, editor keybindings (Vim / VS Code), billing subscriptions, and custom cloud runner nodes.
            </p>
            <button
              className="btn-create-workspace-primary"
              onClick={() => setActiveTab("workspaces")}
            >
              Back to Workspaces
            </button>
          </div>
        )}

        {/* ================= RECYCLE BIN TAB VIEW ================= */}
        {activeTab === "recycle-bin" && (
          <section className="recycle-bin-container">
            <div className="recycle-bin-header">
              <div>
                <h1 className="dash-main-title">
                  Recycle <span className="dash-heading-accent">Bin</span>
                </h1>
                <p className="dash-main-subtitle">
                  Restore deleted files and folders back to your workspace or permanently remove them.
                </p>
              </div>

              {recycleItems.length > 0 && (
                <button
                  className="btn-empty-recycle"
                  onClick={() => setShowEmptyBinModal(true)}
                  disabled={recycleLoading}
                >
                  <Trash2 size={16} />
                  <span>Empty Recycle Bin</span>
                </button>
              )}
            </div>

            {recycleMessage && (
              <div className="recycle-toast-banner">
                <Check size={16} className="recycle-toast-icon" />
                <span>{recycleMessage}</span>
              </div>
            )}

            {recycleLoading ? (
              <div className="recycle-bin-loading">
                <div className="recycle-spinner" />
                <p>Loading deleted items...</p>
              </div>
            ) : recycleItems.length === 0 ? (
              <div className="recycle-empty-state">
                <div className="recycle-empty-icon-wrap">
                  <Trash2 size={42} />
                </div>
                <h3>Recycle Bin is Empty</h3>
                <p>
                  Files and folders you delete in the workspace explorer will appear here before being permanently removed.
                </p>
                <button
                  className="btn-create-workspace-primary"
                  onClick={() => setActiveTab("workspaces")}
                >
                  Back to Workspaces
                </button>
              </div>
            ) : (
              <div className="recycle-items-list">
                {recycleItems.map((item) => (
                  <div key={item._id} className="recycle-item-card">
                    <div className="recycle-item-icon-box">
                      {item.type === "workspace" ? (
                        <FolderClosed size={24} style={{ color: "#FF9B3D" }} />
                      ) : (
                        getFileIcon(item.name, item.type, false)
                      )}
                    </div>

                    <div className="recycle-item-details">
                      <div className="recycle-item-title-row">
                        <span className="recycle-item-name">{item.name}</span>
                        <span className={`recycle-item-type-badge ${item.type}`}>
                          {item.type === "workspace" ? "WORKSPACE" : item.type.toUpperCase()}
                        </span>
                        {item.items && item.items.length > 0 && item.type === "workspace" && (
                          <span className="recycle-item-ws-tag">
                            {item.items.length} {item.items.length === 1 ? "file" : "files"}
                          </span>
                        )}
                        {item.workspaceName && item.type !== "workspace" && (
                          <span className="recycle-item-ws-tag">
                            {item.workspaceName}
                          </span>
                        )}
                      </div>
                      <div className="recycle-item-meta">
                        <span className="recycle-item-path" title={item.originalPath}>
                          {item.type === "workspace" ? "Workspace folder: " : "Original path: "}
                          <code>{item.originalPath}</code>
                        </span>
                        <span className="recycle-item-dot">•</span>
                        <span className="recycle-item-time">
                          {formatRelativeTime(item.deletedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="recycle-item-actions">
                      <button
                        className="btn-recycle-restore"
                        onClick={() => handleRestoreItem(item._id, item.name)}
                        disabled={recycleActionLoading === item._id}
                        title="Restore to workspace"
                      >
                        <RotateCcw size={15} />
                        <span>
                          {recycleActionLoading === item._id ? "Restoring..." : "Restore"}
                        </span>
                      </button>

                      <button
                        className="btn-recycle-delete-perm"
                        onClick={() =>
                          setPermDeleteModalItem({ id: item._id, name: item.name, type: item.type })
                        }
                        disabled={recycleActionLoading === item._id}
                        title="Delete permanently"
                      >
                        <Trash2 size={15} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* =========================================================
           RENAME WORKSPACE MODAL
           ========================================================= */}
        {renameModalWs && (
          <div
            className="dash-modal-overlay"
            onClick={closeRenameModal}
            onKeyDown={(e) => e.key === "Escape" && closeRenameModal()}
          >
            <div
              className="dash-modal-card"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="dash-modal-header">
                <div className="dash-modal-title-wrap">
                  <div className="dash-modal-icon">
                    <Pencil size={17} />
                  </div>
                  <h3>Rename Workspace</h3>
                </div>
                <button
                  className="dash-modal-close-btn"
                  onClick={closeRenameModal}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmRename}>
                <div className="dash-modal-body">
                  <label className="dash-modal-label" htmlFor="dash-ws-rename-input">
                    Workspace Name
                  </label>
                  <input
                    id="dash-ws-rename-input"
                    ref={renameInputRef}
                    type="text"
                    className="dash-modal-input"
                    placeholder="Enter workspace name"
                    value={renameInputVal}
                    onChange={(e) => setRenameInputVal(e.target.value)}
                    disabled={isRenaming}
                    maxLength={60}
                    autoComplete="off"
                  />
                </div>

                <div className="dash-modal-footer">
                  <button
                    type="button"
                    className="dash-modal-btn-cancel"
                    onClick={closeRenameModal}
                    disabled={isRenaming}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="dash-modal-btn-primary"
                    disabled={isRenaming || !renameInputVal.trim()}
                  >
                    {isRenaming ? (
                      <>
                        <RotateCcw size={14} className="spin-icon" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================
           DELETE WORKSPACE CONFIRMATION MODAL
           ========================================================= */}
        {deleteModalWs && (
          <div
            className="dash-modal-overlay"
            onClick={closeDeleteModal}
            onKeyDown={(e) => e.key === "Escape" && closeDeleteModal()}
          >
            <div
              className="dash-modal-card"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="dash-modal-header">
                <div className="dash-modal-title-wrap">
                  <div className="dash-modal-icon danger">
                    <Trash2 size={17} />
                  </div>
                  <h3>Move to Recycle Bin</h3>
                </div>
                <button
                  className="dash-modal-close-btn"
                  onClick={closeDeleteModal}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="dash-modal-body">
                <p className="dash-modal-desc">
                  Are you sure you want to delete{" "}
                  <strong style={{ color: "var(--text-primary)" }}>
                    "{deleteModalWs.name}"
                  </strong>
                  ? It will be safely moved to the <strong>Recycle Bin</strong>, where you can restore it anytime or permanently remove it.
                </p>
              </div>

              <div className="dash-modal-footer">
                <button
                  type="button"
                  className="dash-modal-btn-cancel"
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="dash-modal-btn-danger"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <RotateCcw size={14} className="spin-icon" />
                      <span>Moving...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Move to Recycle Bin</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
           PERMANENT DELETE CONFIRMATION MODAL (RECYCLE BIN)
           ========================================================= */}
        {permDeleteModalItem && (
          <div
            className="dash-modal-overlay"
            onClick={() => setPermDeleteModalItem(null)}
            onKeyDown={(e) => e.key === "Escape" && setPermDeleteModalItem(null)}
          >
            <div
              className="dash-modal-card"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="dash-modal-header">
                <div className="dash-modal-title-wrap">
                  <div className="dash-modal-icon danger">
                    <Trash2 size={17} />
                  </div>
                  <h3>Permanently Delete {permDeleteModalItem.type === "workspace" ? "Workspace" : "Item"}</h3>
                </div>
                <button
                  className="dash-modal-close-btn"
                  onClick={() => setPermDeleteModalItem(null)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="dash-modal-body">
                <p className="dash-modal-desc">
                  Are you sure you want to permanently delete{" "}
                  <strong style={{ color: "var(--text-primary)" }}>
                    "{permDeleteModalItem.name}"
                  </strong>
                  ? This action is permanent and cannot be undone.
                </p>
              </div>

              <div className="dash-modal-footer">
                <button
                  type="button"
                  className="dash-modal-btn-cancel"
                  onClick={() => setPermDeleteModalItem(null)}
                  disabled={recycleActionLoading === permDeleteModalItem.id}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="dash-modal-btn-danger"
                  onClick={handleConfirmPermanentDelete}
                  disabled={recycleActionLoading === permDeleteModalItem.id}
                >
                  {recycleActionLoading === permDeleteModalItem.id ? (
                    <>
                      <RotateCcw size={14} className="spin-icon" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Delete Permanently</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
           EMPTY RECYCLE BIN CONFIRMATION MODAL
           ========================================================= */}
        {showEmptyBinModal && (
          <div
            className="dash-modal-overlay"
            onClick={() => setShowEmptyBinModal(false)}
            onKeyDown={(e) => e.key === "Escape" && setShowEmptyBinModal(false)}
          >
            <div
              className="dash-modal-card"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="dash-modal-header">
                <div className="dash-modal-title-wrap">
                  <div className="dash-modal-icon danger">
                    <Trash2 size={17} />
                  </div>
                  <h3>Empty Recycle Bin</h3>
                </div>
                <button
                  className="dash-modal-close-btn"
                  onClick={() => setShowEmptyBinModal(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="dash-modal-body">
                <p className="dash-modal-desc">
                  Are you sure you want to permanently delete all <strong>{recycleItems.length}</strong> items in the Recycle Bin? All deleted files and folders will be purged forever.
                </p>
              </div>

              <div className="dash-modal-footer">
                <button
                  type="button"
                  className="dash-modal-btn-cancel"
                  onClick={() => setShowEmptyBinModal(false)}
                  disabled={recycleLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="dash-modal-btn-danger"
                  onClick={handleConfirmEmptyRecycleBin}
                  disabled={recycleLoading}
                >
                  {recycleLoading ? (
                    <>
                      <RotateCcw size={14} className="spin-icon" />
                      <span>Emptying...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Empty Bin</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
           IMPORT WORKSPACE POP-UP MODAL
           ========================================================= */}
        {showImportModal && (
          <div
            className="dash-modal-overlay"
            onClick={() => !isImporting && setShowImportModal(false)}
            onKeyDown={(e) =>
              e.key === "Escape" && !isImporting && setShowImportModal(false)
            }
          >
            <div
              className="dash-modal-card dash-modal-import"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="dash-modal-header">
                <div className="dash-modal-title-wrap">
                  <div className="dash-modal-icon">
                    <Upload size={17} />
                  </div>
                  <h3>Import Workspace</h3>
                </div>
                <button
                  className="dash-modal-close-btn"
                  onClick={() => !isImporting && setShowImportModal(false)}
                  aria-label="Close"
                  disabled={isImporting}
                >
                  <X size={18} />
                </button>
              </div>

              {!importPendingFiles ? (
                /* Step 1: Drag & Drop Zone or Select Folder */
                <div className="dash-modal-body">
                  <div
                    className={`import-dropzone ${isDragOver ? "drag-active" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDropFolder}
                    onClick={triggerFolderBrowser}
                  >
                    <div className="import-dropzone-icon">
                      <FolderUp size={34} />
                    </div>
                    <div className="import-dropzone-title">
                      Drop your project folder here
                    </div>
                    <div className="import-dropzone-sub">
                      or click to browse a folder from your desktop
                    </div>
                    <button
                      type="button"
                      className="import-browse-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerFolderBrowser();
                      }}
                    >
                      <FolderOpen size={16} />
                      <span>Browse Folder</span>
                    </button>
                    <div className="import-dropzone-hint">
                      Preserves your full folder tree, empty directories, and code.
                    </div>
                  </div>

                  {/* Direct Path Input & Quick Folder Chips */}
                  <div className="import-direct-path-wrap">
                    <span className="import-path-label">Or enter folder path:</span>
                    <div className="import-path-input-row">
                      <input
                        type="text"
                        className="import-path-input"
                        placeholder="e.g. D:\C++_DSA or D:\output"
                        value={localPathInput}
                        onChange={(e) => setLocalPathInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleScanDirectPath()}
                        disabled={isScanningLocal}
                      />
                      <button
                        type="button"
                        className="import-path-scan-btn"
                        onClick={() => handleScanDirectPath()}
                        disabled={isScanningLocal || !localPathInput.trim()}
                      >
                        {isScanningLocal ? "Scanning..." : "Scan Folder"}
                      </button>
                    </div>

                    {commonFolders.length > 0 && (
                      <div className="import-chips-list">
                        <span className="import-chips-label">Quick select:</span>
                        {commonFolders.map((cf, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="import-folder-chip"
                            onClick={() => handleScanDirectPath(cf.path)}
                            disabled={isScanningLocal}
                            title={cf.path}
                          >
                            <FolderClosed size={12} />
                            <span>{cf.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Step 2: Preview & Confirm Import */
                <form onSubmit={handleConfirmImport}>
                  <div className="dash-modal-body">
                    <div className="import-preview-card-wrap">
                      <div className="import-preview-top">
                        <label
                          className="dash-modal-label"
                          htmlFor="import-ws-name"
                          style={{ margin: 0 }}
                        >
                          Workspace Name
                        </label>
                        <button
                          type="button"
                          className="import-change-btn"
                          onClick={() => {
                            setImportPendingFiles(null);
                            setImportFolderName("");
                          }}
                          disabled={isImporting}
                        >
                          Change Folder
                        </button>
                      </div>
                      <input
                        id="import-ws-name"
                        type="text"
                        className="dash-modal-input"
                        placeholder="Enter workspace name"
                        value={importFolderName}
                        onChange={(e) => setImportFolderName(e.target.value)}
                        disabled={isImporting}
                        required
                        autoFocus
                      />

                      <div className="import-preview-box">
                        <div className="import-preview-icon">
                          <FolderClosed size={24} />
                        </div>
                        <div className="import-preview-details">
                          <span className="import-preview-name">
                            {importFolderName || "Project Folder"}
                          </span>
                          <span className="import-preview-count">
                            {
                              importPendingFiles.filter((i) => i.type === "file")
                                .length
                            }{" "}
                            file(s) and{" "}
                            {
                              importPendingFiles.filter(
                                (i) => i.type === "folder"
                              ).length
                            }{" "}
                            folder(s) ready to import
                          </span>
                        </div>
                      </div>

                      {/* File Structure Preview (Folders first, then files) */}
                      <div className="import-tree-preview-box">
                        {[...importPendingFiles]
                          .sort((a, b) => {
                            if (a.type === "folder" && b.type !== "folder") return -1;
                            if (a.type !== "folder" && b.type === "folder") return 1;
                            return (a.path || "").localeCompare(
                              b.path || "",
                              undefined,
                              {
                                numeric: true,
                                sensitivity: "base",
                              }
                            );
                          })
                          .slice(0, 12)
                          .map((item, idx) => (
                            <div
                              key={idx}
                              className={`import-tree-row ${
                                item.type === "folder" ? "is-folder" : ""
                              }`}
                            >
                              {item.type === "folder" ? (
                                <FolderClosed size={12} color="#F59E0B" />
                              ) : (
                                <FileText size={12} color="#38BDF8" />
                              )}
                              <span>
                                {item.path}
                                {item.type === "folder" ? "/" : ""}
                              </span>
                            </div>
                          ))}
                        {importPendingFiles.length > 12 && (
                          <div className="import-tree-more">
                            ...and {importPendingFiles.length - 12} more items
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="dash-modal-footer">
                    <button
                      type="button"
                      className="dash-modal-btn-cancel"
                      onClick={() => setShowImportModal(false)}
                      disabled={isImporting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="dash-modal-btn-primary"
                      disabled={isImporting || !importFolderName.trim()}
                    >
                      {isImporting ? (
                        <>
                          <RotateCcw size={14} className="spin-icon" />
                          <span>Importing files...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          <span>Import Workspace</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* =========================================================
           CENTERED UPLOAD CONFIRMATION POP-UP MODAL
           ========================================================= */}
        {showCenterUploadAlert && importPendingFiles && (
          <div
            className="center-upload-dialog-overlay"
            onClick={() => !isImporting && setShowCenterUploadAlert(false)}
            onKeyDown={(e) =>
              e.key === "Escape" && !isImporting && setShowCenterUploadAlert(false)
            }
          >
            <div
              className="center-upload-dialog-card"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <h3 className="center-upload-title">
                Upload{" "}
                {importPendingFiles.filter((i) => i.type === "file").length === 1
                  ? "one file"
                  : `${importPendingFiles
                      .filter((i) => i.type === "file")
                      .length.toLocaleString()} files`}{" "}
                to this site?
              </h3>

              <p className="center-upload-message">
                This will upload all files from "{importFolderName}". Only do this if you trust the site.
              </p>

              <div className="center-upload-details">
                <div className="center-upload-input-group">
                  <label htmlFor="center-ws-name">Workspace Name</label>
                  <input
                    id="center-ws-name"
                    type="text"
                    className="center-upload-input"
                    value={importFolderName}
                    onChange={(e) => setImportFolderName(e.target.value)}
                    disabled={isImporting}
                    placeholder="Workspace name"
                  />
                </div>
                <div className="center-upload-stats">
                  <span>
                    📁{" "}
                    {
                      importPendingFiles.filter((i) => i.type === "folder")
                        .length
                    }{" "}
                    folders
                  </span>
                  <span className="dot-sep">•</span>
                  <span>
                    📄{" "}
                    {
                      importPendingFiles.filter((i) => i.type === "file")
                        .length
                    }{" "}
                    files
                  </span>
                </div>
              </div>

              <div className="center-upload-actions">
                <button
                  type="button"
                  className="center-upload-btn-upload"
                  onClick={handleConfirmImport}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <>
                      <RotateCcw
                        size={14}
                        className="spin-icon"
                        style={{ display: "inline-block", marginRight: "6px" }}
                      />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    "Upload"
                  )}
                </button>
                <button
                  type="button"
                  className="center-upload-btn-cancel"
                  onClick={() => setShowCenterUploadAlert(false)}
                  disabled={isImporting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
           EXPORT WORKSPACES AS ZIP MODAL
           ========================================================= */}
        {showExportModal && (
          <div
            className="dash-modal-overlay"
            onClick={() => !isExporting && setShowExportModal(false)}
            onKeyDown={(e) => e.key === "Escape" && !isExporting && setShowExportModal(false)}
          >
            <div
              className="export-modal-card"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="dash-modal-header">
                <div className="dash-modal-title-wrap">
                  <div className="dash-modal-icon">
                    <FolderArchive size={17} />
                  </div>
                  <h3>Export Workspaces to ZIP</h3>
                </div>
                <button
                  className="dash-modal-close-btn"
                  onClick={() => !isExporting && setShowExportModal(false)}
                  aria-label="Close"
                  disabled={isExporting}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="dash-modal-body">
                <p className="dash-modal-desc" style={{ marginBottom: "14px" }}>
                  Select the workspace folders you would like to package and export. A ZIP file will be generated and downloaded to your computer.
                </p>

                <div className="export-modal-controls">
                  <input
                    type="text"
                    className="export-search-input"
                    placeholder="Filter workspaces..."
                    value={exportFilter}
                    onChange={(e) => setExportFilter(e.target.value)}
                  />
                  <button
                    type="button"
                    className="export-select-all-btn"
                    onClick={toggleSelectAllExport}
                  >
                    {selectedExportIds.size === workspaces.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                <div className="export-workspaces-list">
                  {workspaces
                    .filter((w) =>
                      (w.name || "").toLowerCase().includes(exportFilter.toLowerCase())
                    )
                    .map((ws) => {
                      const isSelected = selectedExportIds.has(ws._id);
                      return (
                        <div
                          key={ws._id}
                          className={`export-workspace-row ${isSelected ? "selected" : ""}`}
                          onClick={() => toggleSelectWorkspaceForExport(ws._id)}
                        >
                          <input
                            type="checkbox"
                            className="export-checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="export-row-icon">
                            <FolderClosed size={16} />
                          </div>
                          <div className="export-row-info">
                            <div className="export-row-title-line">
                              <span className="export-row-name">{ws.name}</span>
                              {ws.isPinned && <span className="workspace-pinned-star">⭐</span>}
                            </div>
                            <span className="export-row-meta">
                              {formatRelativeTime(ws.updatedAt || ws.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="dash-modal-footer">
                <div className="export-footer-info" style={{ marginRight: "auto" }}>
                  {selectedExportIds.size} of {workspaces.length} selected
                </div>
                <button
                  type="button"
                  className="dash-modal-btn-cancel"
                  onClick={() => setShowExportModal(false)}
                  disabled={isExporting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="dash-modal-btn-primary"
                  onClick={handleConfirmExport}
                  disabled={isExporting || selectedExportIds.size === 0}
                >
                  {isExporting ? (
                    <>
                      <RotateCcw size={14} className="spin-icon" />
                      <span>Creating ZIP...</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      <span>Export as ZIP</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
           DASHBOARD FLOATING TOAST FEEDBACK
           ========================================================= */}
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
