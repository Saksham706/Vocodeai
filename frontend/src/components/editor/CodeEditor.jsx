import { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { LANGUAGE_META } from "../../config/languages";
import { DEFAULT_SETTINGS } from "../../config/defaultSettings";
import { getEffectiveSettings } from "../../utils/settingsStorage";
import { Code2, Plus } from "lucide-react";
import ImageViewer from "./ImageViewer";
import MarkdownViewer from "./MarkdownViewer";
import DocxViewer from "./DocxViewer";
import ExcelViewer from "./ExcelViewer";
import PdfViewer from "./PdfViewer";
import "../../styles/editor.css";

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "ico", "bmp", "svg"]);
const MARKDOWN_EXTENSIONS = new Set(["md", "markdown"]);
const DOCX_EXTENSIONS = new Set(["docx", "doc"]);
const EXCEL_EXTENSIONS = new Set(["xlsx", "xls", "csv", "tsv"]);
const PDF_EXTENSIONS = new Set(["pdf"]);

export default function CodeEditor({ file }) {
  const { activeFile, fileContents, updateContent, setCreateRequest, refreshPreview } = useWorkspace();
  const editorRef = useRef(null);

  const currentFile = file || activeFile;
  const currentFileRef = useRef(currentFile);
  currentFileRef.current = currentFile;

  // Sync theme with data-theme on html or localStorage
  const [editorSettings, setEditorSettings] = useState(() => {
    return getEffectiveSettings()?.editor || DEFAULT_SETTINGS.editor;
  });

  useEffect(() => {
    const handleSettingsChange = (e) => {
      const eff = e.detail?.settings?.editor || getEffectiveSettings()?.editor;
      if (eff) setEditorSettings(eff);
    };
    window.addEventListener("vocode-settings-changed", handleSettingsChange);
    return () => window.removeEventListener("vocode-settings-changed", handleSettingsChange);
  }, []);

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
  const fileName = currentFile.split("/").pop();

  // 1. IMAGE VIEWER
  if (IMAGE_EXTENSIONS.has(ext)) {
    return <ImageViewer src={content} fileName={fileName} />;
  }

  // 2. MARKDOWN VIEWER (Edit + Live Preview + Split View)
  if (MARKDOWN_EXTENSIONS.has(ext)) {
    return (
      <MarkdownViewer
        content={content}
        fileName={fileName}
        editorTheme={editorTheme}
        onChange={(val) => updateContent(currentFile, val)}
      />
    );
  }

  // 3. WORD DOCUMENT VIEWER (.docx, .doc)
  if (DOCX_EXTENSIONS.has(ext)) {
    return <DocxViewer content={content} fileName={fileName} />;
  }

  // 4. EXCEL SPREADSHEET VIEWER (.xlsx, .xls, .csv, .tsv)
  if (EXCEL_EXTENSIONS.has(ext)) {
    return <ExcelViewer content={content} fileName={fileName} />;
  }

  // 5. PDF VIEWER (.pdf)
  if (PDF_EXTENSIONS.has(ext)) {
    return <PdfViewer content={content} fileName={fileName} />;
  }

  // 6. DEFAULT MONACO CODE & TEXT EDITOR
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
          fontSize: editorSettings.fontSize || 14,
          fontFamily: editorSettings.fontFamily || "'Fira Code', 'JetBrains Mono', Consolas, monospace",
          lineHeight: editorSettings.lineHeight || 22,
          fontLigatures: editorSettings.fontLigatures ?? true,
          tabSize: editorSettings.tabSize || 2,
          insertSpaces: editorSettings.insertSpaces ?? true,
          wordWrap: editorSettings.wordWrap || "on",
          minimap: {
            enabled: editorSettings.minimap?.enabled ?? true,
            renderCharacters: false,
            scale: editorSettings.minimap?.scale || 1,
          },
          lineNumbers: editorSettings.lineNumbers || "on",
          cursorStyle: editorSettings.cursorStyle || "line",
          cursorBlinking: editorSettings.cursorBlinking || "smooth",
          autoClosingBrackets: editorSettings.autoClosingBrackets ? "always" : "never",
          autoClosingQuotes: editorSettings.autoClosingQuotes ? "always" : "never",
          bracketPairColorization: { enabled: editorSettings.bracketPairColorization ?? true },
          renderWhitespace: editorSettings.renderWhitespace || "selection",
          smoothScrolling: editorSettings.smoothScrolling ?? true,
          scrollBeyondLastLine: editorSettings.scrollBeyondLastLine ?? false,
          automaticLayout: true,
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
