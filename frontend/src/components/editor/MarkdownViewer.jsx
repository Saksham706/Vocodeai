import React, { useState, useMemo } from "react";
import { marked } from "marked";
import Editor from "@monaco-editor/react";
import { Eye, Edit3, Columns2 } from "lucide-react";
import "../../styles/viewers.css";

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

export default function MarkdownViewer({
  content,
  fileName,
  onChange,
  editorTheme = "vs-dark",
}) {
  // Mode: 'split' | 'edit' | 'preview'
  const [mode, setMode] = useState("split");

  const renderedHtml = useMemo(() => {
    try {
      return marked.parse(content || "");
    } catch (err) {
      return `<p class="markdown-parse-err">Failed to render markdown: ${err.message}</p>`;
    }
  }, [content]);

  return (
    <div className="custom-viewer-container md-viewer-wrap">
      {/* Markdown Toolbar */}
      <div className="custom-viewer-toolbar">
        <div className="viewer-toolbar-left">
          <span className="viewer-toolbar-title">{fileName}</span>
          <span className="viewer-badge">Markdown</span>
        </div>

        <div className="viewer-toolbar-right">
          <div className="md-mode-switch">
            <button
              className={`md-mode-btn ${mode === "edit" ? "active" : ""}`}
              onClick={() => setMode("edit")}
              title="Edit Markdown Code"
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </button>
            <button
              className={`md-mode-btn ${mode === "split" ? "active" : ""}`}
              onClick={() => setMode("split")}
              title="Split View (Editor + Live Preview)"
            >
              <Columns2 size={13} />
              <span>Split</span>
            </button>
            <button
              className={`md-mode-btn ${mode === "preview" ? "active" : ""}`}
              onClick={() => setMode("preview")}
              title="Full Rendered Preview"
            >
              <Eye size={13} />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Preview Panes */}
      <div className={`md-body-container mode-${mode}`}>
        {/* Monaco Editor Pane */}
        {(mode === "edit" || mode === "split") && (
          <div className="md-editor-pane">
            <Editor
              theme={editorTheme}
              path={fileName}
              language="markdown"
              value={content ?? ""}
              height="100%"
              options={{
                fontSize: 14,
                fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                minimap: { enabled: false },
                automaticLayout: true,
                wordWrap: "on",
                lineNumbers: "on",
                renderLineHighlight: "all",
              }}
              onChange={(newVal) => onChange && onChange(newVal || "")}
            />
          </div>
        )}

        {/* Rendered HTML Pane */}
        {(mode === "preview" || mode === "split") && (
          <div className="md-preview-pane">
            <div
              className="markdown-rendered-body"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

