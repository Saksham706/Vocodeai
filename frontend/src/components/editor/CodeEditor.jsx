import { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { LANGUAGE_META } from "../../config/languages";
import { Code2, Plus } from "lucide-react";
import "../../styles/editor.css";

export default function CodeEditor() {
  const { activeFile, fileContents, updateContent, setCreateRequest } = useWorkspace();
  const editorRef = useRef(null);

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

  if (!activeFile) {
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

  const content = fileContents[activeFile];
  if (content === undefined) {
    return (
      <div className="editor-empty-state">
        <div className="empty-content-box">
          <div className="editor-spinner" />
          <h3>Loading {activeFile}...</h3>
        </div>
      </div>
    );
  }

  const ext = activeFile.split(".").pop()?.toLowerCase();
  const meta = ext ? LANGUAGE_META[ext] || {} : {};

  return (
    <div className="ide-monaco-wrapper">
      <Editor
        theme={editorTheme}
        path={activeFile}
        defaultLanguage={meta.monaco || "plaintext"}
        language={meta.monaco || "plaintext"}
        value={fileContents[activeFile] ?? ""}
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
        onMount={(editor) => {
          editorRef.current = editor;
        }}
        onChange={(value) => {
          updateContent(activeFile, value ?? "");
        }}
      />
    </div>
  );
}
