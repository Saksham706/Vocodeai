import Clogo from '../assets/clogo.png';
import CppLogo from '../assets/cpplogo.png';
import PythonLogo from '../assets/pythonlogo.png';
import JavaLogo from '../assets/javalogo.png';
import JsLogo from '../assets/jslogo.png';
import HTMLlogo from '../assets/htmllogo.png';
import CSSlogo from '../assets/csslogo.png';

export const LANGUAGE_META = {
  cpp: {
    label: "C++",
    icon: CppLogo,
    color: "#00599C",
    monaco: "cpp",
  },
  c: {
    label: "C",
    icon: Clogo,
    color: "#A8B9CC",
    monaco: "c",
  },
  py: {
    label: "Python",
    icon: PythonLogo,
    color: "#3776AB",
    monaco: "python",
  },
  java: {
    label: "Java",
    icon: JavaLogo,
    color: "#ED8B00",
    monaco: "java",
  },
  js: {
    label: "JavaScript",
    icon: JsLogo,
    color: "#F7DF1E",
    monaco: "javascript",
  },
  mjs: {
    label: "JavaScript Module",
    icon: JsLogo,
    color: "#F7DF1E",
    monaco: "javascript",
  },
  cjs: {
    label: "CommonJS",
    icon: JsLogo,
    color: "#F7DF1E",
    monaco: "javascript",
  },
  jsx: {
    label: "React JSX",
    icon: JsLogo,
    color: "#61DAFB",
    monaco: "javascript",
  },
  ts: {
    label: "TypeScript",
    icon: JsLogo,
    color: "#3178C6",
    monaco: "typescript",
  },
  tsx: {
    label: "React TSX",
    icon: JsLogo,
    color: "#3178C6",
    monaco: "typescript",
  },
  html: {
    label: "HTML",
    icon: HTMLlogo,
    color: "#E34F26",
    monaco: "html",
  },
  htm: {
    label: "HTML",
    icon: HTMLlogo,
    color: "#E34F26",
    monaco: "html",
  },
  css: {
    label: "CSS",
    icon: CSSlogo,
    color: "#1572B6",
    monaco: "css",
  },
  scss: {
    label: "SCSS",
    icon: CSSlogo,
    color: "#C6538C",
    monaco: "scss",
  },
  less: {
    label: "Less",
    icon: CSSlogo,
    color: "#1D365D",
    monaco: "less",
  },
  json: {
    label: "JSON",
    icon: JsLogo,
    color: "#CBCB41",
    monaco: "json",
  },
  jsonc: {
    label: "JSON with Comments",
    icon: JsLogo,
    color: "#CBCB41",
    monaco: "json",
  },
  sql: {
    label: "SQL",
    icon: null,
    color: "#E38C00",
    monaco: "sql",
  },
  sh: {
    label: "Shell Script",
    icon: null,
    color: "#89E051",
    monaco: "shell",
  },
  bash: {
    label: "Bash",
    icon: null,
    color: "#89E051",
    monaco: "shell",
  },
  zsh: {
    label: "Zsh",
    icon: null,
    color: "#89E051",
    monaco: "shell",
  },
  yaml: {
    label: "YAML",
    icon: null,
    color: "#CB171E",
    monaco: "yaml",
  },
  yml: {
    label: "YAML",
    icon: null,
    color: "#CB171E",
    monaco: "yaml",
  },
  xml: {
    label: "XML",
    icon: null,
    color: "#0060AC",
    monaco: "xml",
  },
  svg: {
    label: "SVG",
    icon: null,
    color: "#FF9900",
    monaco: "xml",
  },
  md: {
    label: "Markdown",
    icon: null,
    color: "#083FA1",
    monaco: "markdown",
  },
  markdown: {
    label: "Markdown",
    icon: null,
    color: "#083FA1",
    monaco: "markdown",
  },
  go: {
    label: "Go",
    icon: null,
    color: "#00ADD8",
    monaco: "go",
  },
  rs: {
    label: "Rust",
    icon: null,
    color: "#DEA584",
    monaco: "rust",
  },
  rust: {
    label: "Rust",
    icon: null,
    color: "#DEA584",
    monaco: "rust",
  },
  php: {
    label: "PHP",
    icon: null,
    color: "#4F5D95",
    monaco: "php",
  },
  cs: {
    label: "C#",
    icon: null,
    color: "#178600",
    monaco: "csharp",
  },
  dockerfile: {
    label: "Dockerfile",
    icon: null,
    color: "#384D54",
    monaco: "dockerfile",
  },
};

export function getMonacoLanguage(filename) {
  if (!filename) return "plaintext";
  const lower = filename.toLowerCase();
  const ext = lower.split(".").pop();
  return LANGUAGE_META[ext]?.monaco || "plaintext";
}
