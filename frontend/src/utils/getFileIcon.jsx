import React from "react";
import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiCss3,
  SiReact,
} from "react-icons/si";
import { FaFolder, FaFolderOpen, FaJava, FaGitAlt } from "react-icons/fa";
import { FileCode, FileText, File } from "lucide-react";

export const getFileIcon = (name, type, open = false) => {
  if (type === "folder") {
    return open ? (
      <FaFolderOpen style={{ color: "#F59E0B", fontSize: "16px" }} />
    ) : (
      <FaFolder style={{ color: "#F59E0B", fontSize: "16px" }} />
    );
  }

  const lowerName = (name || "").toLowerCase();

  // Special exact filename matches
  if (lowerName === ".gitignore") {
    return (
      <div
        style={{
          width: "17px",
          height: "17px",
          backgroundColor: "#F05032",
          borderRadius: "3px",
          transform: "rotate(45deg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        title="Git ignore"
      >
        <FaGitAlt style={{ color: "#ffffff", fontSize: "10px", transform: "rotate(-45deg)" }} />
      </div>
    );
  }

  if (lowerName === "package-lock.json") {
    return (
      <div
        style={{
          width: "16px",
          height: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#10B981",
          fontWeight: 800,
          fontSize: "13px",
          lineHeight: "1",
        }}
        title="Package Lock"
      >
        ⬡
      </div>
    );
  }

  if (lowerName === "package.json") {
    return (
      <span
        style={{
          color: "#E53E3E",
          fontWeight: 800,
          fontSize: "13px",
          fontFamily: "monospace",
          letterSpacing: "-1px",
          display: "inline-block",
        }}
        title="Package configuration"
      >
        &#123;&#125;
      </span>
    );
  }

  if (lowerName === "readme.md" || lowerName.endsWith(".md")) {
    return (
      <div
        style={{
          width: "16px",
          height: "16px",
          backgroundColor: "#E53E3E",
          borderRadius: "3px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontWeight: 900,
          fontSize: "10px",
          fontFamily: "sans-serif",
          flexShrink: 0,
        }}
        title="Markdown"
      >
        M
      </div>
    );
  }

  const ext = lowerName.split(".").pop();

  switch (ext) {
    case "cpp":
    case "cc":
    case "cxx":
    case "h":
    case "hpp":
      return (
        <span
          className="lang-badge-icon cpp"
          style={{
            background: "rgba(2, 132, 199, 0.22)",
            color: "#38BDF8",
            fontWeight: 800,
            fontSize: "9.5px",
            padding: "1px 5px",
            borderRadius: "4px",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            letterSpacing: "0.4px",
            display: "inline-flex",
            alignItems: "center",
            height: "15px",
            lineHeight: 1,
            marginRight: "6px",
          }}
          title="C++ Source"
        >
          C++
        </span>
      );

    case "c":
      return (
        <span
          className="lang-badge-icon c"
          style={{
            background: "rgba(100, 116, 139, 0.22)",
            color: "#94A3B8",
            fontWeight: 800,
            fontSize: "9.5px",
            padding: "1px 5px",
            borderRadius: "4px",
            border: "1px solid rgba(148, 163, 184, 0.4)",
            display: "inline-flex",
            alignItems: "center",
            height: "15px",
            lineHeight: 1,
            marginRight: "6px",
          }}
          title="C Source"
        >
          C
        </span>
      );

    case "html":
    case "htm":
      return (
        <div
          style={{
            width: "16px",
            height: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#E44D26",
            borderRadius: "2px",
            color: "#ffffff",
            fontWeight: 900,
            fontSize: "10px",
            fontFamily: "sans-serif",
            clipPath: "polygon(0 0, 100% 0, 85% 100%, 50% 100%, 15% 100%)",
            flexShrink: 0,
          }}
          title="HTML5"
        >
          5
        </div>
      );

    case "py":
      return <SiPython style={{ color: "#38BDF8", fontSize: "15px" }} title="Python" />;

    case "js":
      return (
        <div
          style={{
            width: "16px",
            height: "16px",
            backgroundColor: "#F7DF1E",
            color: "#000000",
            borderRadius: "2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "9px",
            fontFamily: "sans-serif",
            flexShrink: 0,
          }}
          title="JavaScript"
        >
          JS
        </div>
      );

    case "ts":
      return (
        <div
          style={{
            width: "16px",
            height: "16px",
            backgroundColor: "#3178C6",
            color: "#ffffff",
            borderRadius: "2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "9px",
            fontFamily: "sans-serif",
            flexShrink: 0,
          }}
          title="TypeScript"
        >
          TS
        </div>
      );

    case "jsx":
    case "tsx":
      return <SiReact style={{ color: "#61DAFB", fontSize: "15px" }} title="React" />;

    case "java":
      return <FaJava style={{ color: "#ED8B00", fontSize: "15px" }} title="Java" />;

    case "css":
    case "scss":
      return <SiCss3 style={{ color: "#264DE4", fontSize: "15px" }} title="CSS" />;

    case "json":
      return (
        <span
          style={{
            color: "#F59E0B",
            fontWeight: 800,
            fontSize: "12px",
            fontFamily: "monospace",
          }}
          title="JSON"
        >
          &#123;&#125;
        </span>
      );

    default:
      return <FileText size={15} style={{ color: "var(--explorer-text-muted)" }} />;
  }
};
