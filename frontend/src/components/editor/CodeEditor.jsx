import { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { LANGUAGE_META } from "../../config/languages";
import { DEFAULT_SETTINGS } from "../../config/defaultSettings";
import { getEffectiveSettings } from "../../utils/settingsStorage";
import {
  registerMonacoThemes,
  getActiveThemeExtension,
} from "../../utils/themeRegistry";
import { formatCodeWithPrettier } from "../../utils/prettierFormatter";
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

  // Handle editor commands dispatched from top navbar (Edit, Selection, Go)
  useEffect(() => {
    const handleEditorAction = (e) => {
      const action = e.detail?.action;
      const editor = editorRef.current;
      if (!editor) return;
      try {
        editor.focus();
        switch (action) {
          case "undo":
            editor.trigger("navbar", "undo");
            break;
          case "redo":
            editor.trigger("navbar", "redo");
            break;
          case "selectAll":
            editor.trigger("navbar", "editor.action.selectAll");
            break;
          case "expandSelection":
            editor.trigger("navbar", "editor.action.smartSelect.expand");
            break;
          case "shrinkSelection":
            editor.trigger("navbar", "editor.action.smartSelect.shrink");
            break;
          case "copyLineDown":
            editor.trigger("navbar", "editor.action.copyLinesDownAction");
            break;
          case "copyLineUp":
            editor.trigger("navbar", "editor.action.copyLinesUpAction");
            break;
          case "moveLineUp":
            editor.trigger("navbar", "editor.action.moveLinesUpAction");
            break;
          case "moveLineDown":
            editor.trigger("navbar", "editor.action.moveLinesDownAction");
            break;
          case "find":
            editor.trigger("navbar", "actions.find");
            break;
          case "replace":
            editor.trigger("navbar", "editor.action.startFindReplaceAction");
            break;
          case "gotoLine":
            editor.trigger("navbar", "editor.action.gotoLine");
            break;
          case "jumpToLine":
            if (e.detail?.line) {
              const line = parseInt(e.detail.line, 10);
              if (!isNaN(line)) {
                editor.setPosition({ lineNumber: line, column: 1 });
                editor.revealLineInCenter(line);
              }
            }
            break;
          case "format":
            (async () => {
              try {
                const currentVal = editor.getValue();
                const formatted = await formatCodeWithPrettier(
                  currentVal,
                  currentFileRef.current
                );
                if (formatted && formatted !== currentVal) {
                  const fullRange = editor.getModel().getFullModelRange();
                  editor.executeEdits("prettier", [
                    { range: fullRange, text: formatted },
                  ]);
                } else {
                  editor.trigger("navbar", "editor.action.formatDocument");
                }
              } catch {
                editor.trigger("navbar", "editor.action.formatDocument");
              }
            })();
            break;
          case "comment":
            editor.trigger("navbar", "editor.action.commentLine");
            break;
          case "cut":
            document.execCommand("cut");
            break;
          case "copy":
            document.execCommand("copy");
            break;
          case "paste":
            if (navigator.clipboard?.readText) {
              navigator.clipboard.readText().then((text) => {
                if (text) {
                  const selection = editor.getSelection();
                  editor.executeEdits("navbar", [{ range: selection, text, forceMoveMarkers: true }]);
                }
              }).catch(() => {});
            }
            break;
          default:
            break;
        }
      } catch (err) {
        console.warn("Editor action error:", action, err);
      }
    };

    window.addEventListener("vocode-editor-action", handleEditorAction);
    return () => window.removeEventListener("vocode-editor-action", handleEditorAction);
  }, []);

  // Live Monaco Editor options update
  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.updateOptions({
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
    });
  }, [editorSettings]);

  const [editorTheme, setEditorTheme] = useState(() => {
    const extTheme = getActiveThemeExtension();
    if (extTheme) return extTheme;
    return localStorage.getItem("vocode_theme") === "light" ? "light" : "vs-dark";
  });

  useEffect(() => {
    const updateTheme = () => {
      const extTheme = getActiveThemeExtension();
      if (extTheme) {
        setEditorTheme(extTheme);
        return;
      }
      const current =
        document.documentElement.getAttribute("data-theme") ||
        localStorage.getItem("vocode_theme");
      setEditorTheme(current === "light" ? "light" : "vs-dark");
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-theme-extension"],
    });

    const handleThemeExtChange = (e) => {
      if (e.detail?.themeId) {
        setEditorTheme(e.detail.themeId);
      } else {
        updateTheme();
      }
    };

    window.addEventListener("vocode-theme-extension-changed", handleThemeExtChange);
    window.addEventListener("storage", updateTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener("vocode-theme-extension-changed", handleThemeExtChange);
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
        beforeMount={(monaco) => {
          registerMonacoThemes(monaco);

          // Configure JSX and TypeScript compiler options for React / JSX syntax highlighting
          try {
            if (monaco?.languages?.typescript) {
              const compilerOptions = {
                target: monaco.languages.typescript.ScriptTarget.Latest,
                allowNonTextExtensions: true,
                allowJs: true,
                jsx: monaco.languages.typescript.JsxEmit.React,
                jsxFactory: "React.createElement",
                jsxFragmentFactory: "React.Fragment",
              };
              monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);
              monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);
            }
          } catch (e) {
            console.warn("Could not set Monaco compiler options:", e);
          }
        }}
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
          window.__vocode_active_editor = editor;

          if (monaco) {
            // Register Prettier Document Formatting Provider for all supported languages
            const supportedLanguages = [
              "javascript",
              "typescript",
              "json",
              "html",
              "css",
              "scss",
              "less",
              "markdown",
              "yaml",
            ];

            supportedLanguages.forEach((lang) => {
              try {
                monaco.languages.registerDocumentFormattingEditProvider(lang, {
                  async provideDocumentFormattingEdits(model) {
                    const text = model.getValue();
                    const formatted = await formatCodeWithPrettier(
                      text,
                      currentFileRef.current || `file.${lang}`
                    );
                    return [
                      {
                        range: model.getFullModelRange(),
                        text: formatted,
                      },
                    ];
                  },
                });
              } catch {}
            });

            // Add Prettier Format Action (Shift + Alt + F)
            editor.addAction({
              id: "vocode-prettier-format",
              label: "Format Document (Prettier)",
              keybindings: [
                monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
              ],
              contextMenuGroupId: "1_modification",
              contextMenuOrder: 1.1,
              run: async () => {
                const currentVal = editor.getValue();
                const formatted = await formatCodeWithPrettier(
                  currentVal,
                  currentFileRef.current
                );
                if (formatted && formatted !== currentVal) {
                  const fullRange = editor.getModel().getFullModelRange();
                  editor.executeEdits("prettier", [
                    { range: fullRange, text: formatted },
                  ]);
                }
              },
            });

            // Add "Live Preview" action to right-click context menu
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
