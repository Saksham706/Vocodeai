import EditorTabs from "./EditorTabs";
import CodeEditor from "./CodeEditor";
import { X } from "lucide-react";

export default function WorkspaceEditorSection({
  activeFile,
  isSplitEditor,
  splitEditorFile,
  closeSplitEditor,
}) {
  return (
    <div className="ide-editor-section">
      <EditorTabs />

      <div className="ide-editor-view">
        {isSplitEditor && splitEditorFile ? (
          <div className="editor-split-view">
            <div className="editor-split-pane primary-pane">
              <div className="editor-pane-header">
                <span className="editor-pane-filename">
                  {activeFile.split("/").pop()}
                </span>
              </div>
              <div className="editor-pane-content">
                <CodeEditor file={activeFile} />
              </div>
            </div>

            <div className="editor-split-divider" />

            <div className="editor-split-pane secondary-pane">
              <div className="editor-pane-header">
                <span className="editor-pane-filename">
                  {splitEditorFile.split("/").pop()}
                </span>
                <button
                  type="button"
                  className="editor-pane-close"
                  onClick={closeSplitEditor}
                  title="Close Split Editor"
                  aria-label="Close Split Editor"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="editor-pane-content">
                <CodeEditor file={splitEditorFile} />
              </div>
            </div>
          </div>
        ) : (
          <CodeEditor />
        )}
      </div>
    </div>
  );
}

