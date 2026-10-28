import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiCplusplus,
  SiHtml5,
  SiCss3,
  SiJson,
  SiReact,
} from "react-icons/si";

import { FaFileAlt, FaFolder, FaFolderOpen, FaJava } from "react-icons/fa";

export const getFileIcon = (name, type, open = false) => {
  if (type === "folder") {
    return open ? <FaFolderOpen /> : <FaFolder />;
  }

  const ext = name.split(".").pop();

  switch (ext) {
    case "py":
      return <SiPython color="#3776AB" />;
    case "js":
      return <SiJavascript color="#f7df1e" />;
    case "ts":
      return <SiTypescript color="#3178c6" />;
    case "jsx":
    case "tsx":
      return <SiReact color="#61dafb" />;
    case "java":
      return <FaJava color="#f89820" />; // ✅ FIXED
    case "cpp":
    case "cc":
    case "cxx":
      return <SiCplusplus color="#00599C" />;
    case "html":
      return <SiHtml5 color="#e34c26" />;
    case "css":
      return <SiCss3 color="#264de4" />;
    case "json":
      return <SiJson color="#f5f5f5" />;
    default:
      return <FaFileAlt />;
  }
};