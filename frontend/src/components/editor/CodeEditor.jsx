import Editor from "@monaco-editor/react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useRef } from "react";
import { LANGUAGE_META } from "../../config/languages";
import "../../styles/editor.css";

export default function CodeEditor() {
  const { activeFile, fileContents, updateContent } = useWorkspace();
  const editorRef = useRef(null);

  if (!activeFile) {
    return <div className="editor-empty">Open a file to start coding</div>;
  }

  const ext = activeFile.split(".").pop();

  const meta = ext ? LANGUAGE_META[ext] || {} : {};

  return (
    <div className="editor-area">
      <Editor
        key={activeFile}
        theme="vs-dark"
        language={meta.monaco || "plaintext"}
        value={fileContents[activeFile] || ""}
        height="100%"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
        onMount={(editor) => {
          editorRef.current = editor;
        }}
        onChange={(value) => {
          updateContent(activeFile, value || "");
        }}
      />
    </div>
  );
}