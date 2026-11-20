/**
 * VocodeAI Prettier Code Formatter
 * Supports JavaScript, JSX, TypeScript, TSX, JSON, HTML, CSS, SCSS, Markdown, and YAML
 */
import prettier from "prettier/standalone";
import parserBabel from "prettier/plugins/babel";
import parserEstree from "prettier/plugins/estree";
import parserTypescript from "prettier/plugins/typescript";
import parserHtml from "prettier/plugins/html";
import parserPostcss from "prettier/plugins/postcss";
import parserMarkdown from "prettier/plugins/markdown";
import parserYaml from "prettier/plugins/yaml";

export async function formatCodeWithPrettier(code, filename = "") {
  if (!code || typeof code !== "string") return code;

  const ext = (filename.split(".").pop() || "").toLowerCase();

  let parser = null;
  let plugins = [parserEstree];

  if (["js", "jsx", "mjs", "cjs"].includes(ext)) {
    parser = "babel";
    plugins.push(parserBabel);
  } else if (["ts", "tsx"].includes(ext)) {
    parser = "typescript";
    plugins.push(parserTypescript, parserBabel);
  } else if (["json", "jsonc"].includes(ext)) {
    parser = "json";
    plugins.push(parserBabel);
  } else if (["css", "scss", "less"].includes(ext)) {
    parser = "css";
    plugins.push(parserPostcss);
  } else if (["html", "htm", "vue"].includes(ext)) {
    parser = "html";
    plugins.push(parserHtml);
  } else if (["md", "markdown"].includes(ext)) {
    parser = "markdown";
    plugins.push(parserMarkdown);
  } else if (["yaml", "yml"].includes(ext)) {
    parser = "yaml";
    plugins.push(parserYaml);
  } else {
    // If unknown extension, detect if it's JS/JSX
    if (
      code.includes("import ") ||
      code.includes("export ") ||
      code.includes("function") ||
      code.includes("const ") ||
      code.includes("<")
    ) {
      parser = "babel";
      plugins.push(parserBabel);
    }
  }

  if (!parser) return code;

  try {
    const formatted = await prettier.format(code, {
      parser,
      plugins,
      semi: true,
      singleQuote: false,
      tabWidth: 2,
      trailingComma: "es5",
      bracketSpacing: true,
      jsxSingleQuote: false,
    });
    return formatted;
  } catch (err) {
    console.warn("[Prettier] Formatting skipped due to syntax error:", err.message);
    return code; // Keep original code on syntax error
  }
}
