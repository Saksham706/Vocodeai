import fs from "fs";
import path from "path";

export function detectProject(workspacePath) {
  if (!fs.existsSync(workspacePath)) {
    return null;
  }

  const files = fs.readdirSync(workspacePath);

  /* ================= SPRING BOOT / MAVEN ================= */
  if (files.includes("pom.xml")) {
    return {
      type: "spring-boot",
      command: "mvn spring-boot:run",
      port: 8080,
      mode: "server",
    };
  }

  /* ================= NODE / MERN / VITE ================= */
  if (files.includes("package.json")) {
    try {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(workspacePath, "package.json"), "utf-8")
      );

      if (pkg.scripts?.dev) {
        return {
          type: "node-dev",
          command: "[ -d node_modules ] || npm install; npm run dev",
          port: 3000,
          mode: "server",
        };
      }

      if (pkg.dependencies?.react && pkg.scripts?.start) {
        return {
          type: "mern-client",
          command: "[ -d node_modules ] || npm install; npm start",
          port: 3000,
          mode: "server",
        };
      }

      if (pkg.dependencies?.express || pkg.scripts?.start) {
        return {
          type: "node-api",
          command: "[ -d node_modules ] || npm install; npm start",
          port: 8000,
          mode: "server",
        };
      }
    } catch (e) {
      console.warn("Failed to parse package.json during detection:", e.message);
    }
  }

  /* ================= PYTHON ================= */
  const pyFiles = files.filter((f) => f.endsWith(".py"));
  if (pyFiles.length > 0) {
    const entry =
      pyFiles.find((f) => ["main.py", "app.py", "server.py", "index.py"].includes(f)) ||
      pyFiles[0];

    const hasReqs = files.includes("requirements.txt");
    const cmd = hasReqs
      ? `pip3 install -r requirements.txt && python3 "${entry}"`
      : `python3 "${entry}"`;

    return {
      type: "python",
      command: cmd,
      mode: "single",
    };
  }

  /* ================= C++ PROJECT ================= */
  if (files.some((f) => f.endsWith(".cpp"))) {
    return {
      type: "cpp",
      command: "g++ *.cpp -o app && ./app",
      mode: "single",
    };
  }

  /* ================= C PROJECT ================= */
  if (files.some((f) => f.endsWith(".c"))) {
    return {
      type: "c",
      command: "gcc *.c -o app && ./app",
      mode: "single",
    };
  }

  /* ================= JAVA PROJECT ================= */
  const javaFiles = files.filter((f) => f.endsWith(".java"));
  if (javaFiles.length > 0) {
    const mainClass =
      javaFiles.find((f) => f.toLowerCase() === "main.java")?.replace(".java", "") ||
      javaFiles[0].replace(".java", "");

    return {
      type: "java",
      command: `javac *.java && java ${mainClass}`,
      mode: "single",
    };
  }

  /* ================= HTML / WEB PROJECT ================= */
  if (files.includes("index.html")) {
    return {
      type: "html",
      command: "python3 -m http.server 3000",
      port: 3000,
      mode: "server",
    };
  }

  return null;
}
