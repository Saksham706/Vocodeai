import { useWorkspace } from "../../context/WorkspaceContext";
import { LANGUAGE_META } from "../../config/languages";
import "../../styles/editor.css";

export default function RunBar() {
  const { runCode, runProject, activeFile, refreshPreview, dirtyFiles } =
    useWorkspace();

  const isProject = !activeFile;
  const isHTML = activeFile?.endsWith(".html");

  const ext = activeFile?.split(".").pop();
  const meta = ext ? LANGUAGE_META[ext] || {} : {};

  const handleRun = () => {
    if (isProject) runProject();
    else if (isHTML) refreshPreview();
    else runCode();
  };

  return (
    <div className="run-bar">
      <div className="run-bar-left">
        <span
          className="lang-badge"
          style={!isProject && meta.color ? { background: meta.color } : {}}
        >
          {isProject
            ? "PROJECT"
            : isHTML
              ? "HTML"
              : meta.label?.toUpperCase() || "TEXT"}
        </span>
      </div>

      <div className="run-bar-right">
        <button className="run-btn" onClick={handleRun}>
          {isProject ? "▶ Run Project" : isHTML ? "👁 Preview" : "▶ Run File"}
        </button>
      </div>
    </div>
  );
}
