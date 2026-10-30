import { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { LANGUAGE_META } from "../../config/languages";
import { Code2, Plus } from "lucide-react";
import "../../styles/editor.css";

export default function CodeEditor({ file }) {
  const { activeFile, fileContents, updateContent, setCreateRequest, refreshPreview } = useWorkspace();
  const editorRef = useRef(null);

  const currentFile = file || activeFile;
  const currentFileRef = useRef(currentFile);
  currentFileRef.current = currentFile;

  // Sync theme with data-theme on html or localStorage
  const [editorTheme, setEditorTheme] = useState(() => {
    return localStorage.getItem("vocode_theme") === "light" ? "light" : "vs-dark";
  });

  useEffect(() => {
    const updateTheme = () => {
      const current = document.documentElement.getAttribute("data-theme") || localStorage.getItem("vocode_theme");
      setEditorTheme(current === "light" ? "light" : "vs-dark");
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    window.addEventListener("storage", updateTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", updateTheme);
    };
  }, []);

  if (!currentFile) {
    return (
      <div className="editor-empty-state">
        <div className="empty-content-box">
          <Code2 size={40} className="empty-icon-glow" />
          <h3>No File Open</h3>
          <p>Select a file from the explorer on the left or create a new file to start coding</p>
          <button
            className="empty-create-btn"
            onClick={() => setCreateRequest({ type: "file", parent: "" })}
          >
            <Plus size={14} />
            <span>Create New File</span>
          </button>
        </div>
      </div>
    );
  }

  const content = fileContents[currentFile];
  if (content === undefined) {
    return (
      <div className="editor-empty-state">
        <div className="empty-content-box">
          <div className="editor-spinner" />
          <h3>Loading {currentFile}...</h3>
        </div>
      </div>
    );
  }

  const ext = currentFile.split(".").pop()?.toLowerCase();
  const meta = ext ? LANGUAGE_META[ext] || {} : {};

  return (
    <div className="ide-monaco-wrapper">
      <Editor
        theme={editorTheme}
        path={currentFile}
        defaultLanguage={meta.monaco || "plaintext"}
        language={meta.monaco || "plaintext"}
        value={fileContents[currentFile] ?? ""}
        height="100%"
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, 'Courier New', monospace",
          fontLigatures: true,
          minimap: { enabled: true, renderCharacters: false, scale: 1 },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          tabSize: 2,
          lineNumbersMinChars: 3,
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: "all",
        }}
        onMount={(editor, monaco) => {
          editorRef.current = editor;

          // Add "Live Preview" action to right-click context menu
          if (monaco) {
            editor.addAction({
              id: "vocode-live-preview",
              label: "Live Preview (Open in Browser)",
              keybindings: [
                monaco.KeyMod.Alt | monaco.KeyCode.KeyP, // Alt + P
              ],
              contextMenuGroupId: "navigation",
              contextMenuOrder: 1.2,
              run: () => {
                const target = currentFileRef.current;
                if (target) {
                  refreshPreview(true, target);
                }
              },
            });
          }
        }}
        onChange={(value) => {
          updateContent(currentFile, value ?? "");
        }}
      />
    </div>
  );
}
