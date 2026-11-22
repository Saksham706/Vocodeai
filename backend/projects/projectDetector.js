import fs from "fs";
import path from "path";

/**
 * Recursively find a file matching relative candidate paths within a workspace
 */
function findFile(workspacePath, relativeCandidates) {
  for (const candidate of relativeCandidates) {
    const full = path.join(workspacePath, candidate);
    if (fs.existsSync(full)) {
      return full;
    }
  }
  return null;
}

/**
 * Scan a text file for port definitions using regex patterns
 */
function extractPortFromFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  try {
    const content = fs.readFileSync(filePath, "utf-8");

    // 1. server.port = 8080 (Spring Boot properties/yml)
    const springPropMatch = content.match(/server\.port\s*[:=]\s*(\d{2,5})/i);
    if (springPropMatch) return parseInt(springPropMatch[1], 10);

    const springYmlMatch = content.match(/server:\s*\n(?:\s+.*\n)*?\s+port:\s*(\d{2,5})/i);
    if (springYmlMatch) return parseInt(springYmlMatch[1], 10);

    // 2. PORT = 5000 (.env or JS)
    const envMatch = content.match(/(?:PORT|APP_PORT|SERVER_PORT)\s*[:=]\s*(\d{2,5})/i);
    if (envMatch) return parseInt(envMatch[1], 10);

    // 3. app.run(..., port=5000) or listen(5000) or uvicorn(port=8000)
    const codeMatch = content.match(/(?:listen\s*\(\s*|app\.run\s*\([^)]*port\s*=\s*|uvicorn\.run\s*\([^)]*port\s*=\s*|PORT\s*=\s*(?:process\.env\.PORT\s*\|\|\s*)?)(\d{2,5})/i);
    if (codeMatch) return parseInt(codeMatch[1], 10);

    // 4. --port 3000 or -p 3000
    const cliMatch = content.match(/(?:--port|-p|--web-port)\s*[= ]\s*(\d{2,5})/i);
    if (cliMatch) return parseInt(cliMatch[1], 10);
  } catch {}
  return null;
}

/**
 * Detect port across common files in a directory or workspace
 */
export function detectPortFromDir(dirPath, fallbackPort = null) {
  if (!dirPath || !fs.existsSync(dirPath)) return fallbackPort;

  const candidateFiles = [
    ".env",
    ".env.local",
    "src/main/resources/application.properties",
    "src/main/resources/application.yml",
    "application.properties",
    "application.yml",
    "server.js",
    "app.js",
    "index.js",
    "app.py",
    "main.py",
    "server.py",
    "package.json",
  ];

  for (const f of candidateFiles) {
    const fp = path.join(dirPath, f);
    const p = extractPortFromFile(fp);
    if (p && p >= 1024 && p <= 65535) return p;
  }

  return fallbackPort;
}

export function detectProject(workspacePath) {
  if (!fs.existsSync(workspacePath)) {
    return null;
  }

  const files = fs.readdirSync(workspacePath);

  /* ================= 1. SPRING BOOT (MAVEN / GRADLE) ================= */
  const pomFile = findFile(workspacePath, ["pom.xml", "backend/pom.xml", "server/pom.xml"]);
  const gradleFile = findFile(workspacePath, [
    "build.gradle",
    "build.gradle.kts",
    "backend/build.gradle",
    "server/build.gradle",
  ]);

  if (pomFile) {
    const pomContent = fs.readFileSync(pomFile, "utf-8");
    const isSpringBoot = pomContent.includes("spring-boot");
    const subDir = path.dirname(pomFile) !== workspacePath ? path.relative(workspacePath, path.dirname(pomFile)) : "";
    const prefix = subDir ? `cd "${subDir}" && ` : "";

    const detectedPort =
      detectPortFromDir(path.dirname(pomFile), null) ||
      detectPortFromDir(workspacePath, 8080);

    if (isSpringBoot) {
      const hasMvnw = fs.existsSync(path.join(path.dirname(pomFile), "mvnw")) || fs.existsSync(path.join(workspacePath, "mvnw"));
      const mvnCmd = hasMvnw ? "./mvnw" : "mvn";
      return {
        type: "spring-boot",
        command: `${prefix}${mvnCmd} spring-boot:run`,
        port: detectedPort,
        mode: "server",
      };
    }
  }

  if (gradleFile) {
    const gradleContent = fs.readFileSync(gradleFile, "utf-8");
    const isSpringBoot = gradleContent.includes("org.springframework.boot") || gradleContent.includes("spring-boot");
    const subDir = path.dirname(gradleFile) !== workspacePath ? path.relative(workspacePath, path.dirname(gradleFile)) : "";
    const prefix = subDir ? `cd "${subDir}" && ` : "";

    const detectedPort =
      detectPortFromDir(path.dirname(gradleFile), null) ||
      detectPortFromDir(workspacePath, 8080);

    if (isSpringBoot) {
      const hasGradlew = fs.existsSync(path.join(path.dirname(gradleFile), "gradlew")) || fs.existsSync(path.join(workspacePath, "gradlew"));
      const gradCmd = hasGradlew ? "./gradlew" : "gradle";
      return {
        type: "spring-boot",
        command: `${prefix}${gradCmd} bootRun`,
        port: detectedPort,
        mode: "server",
      };
    }
  }

  /* ================= 2. FLUTTER (WEB / CLI) ================= */
  if (files.includes("pubspec.yaml")) {
    try {
      const pubContent = fs.readFileSync(path.join(workspacePath, "pubspec.yaml"), "utf-8");
      if (pubContent.includes("flutter:") || pubContent.includes("sdk: flutter")) {
        const detectedPort = detectPortFromDir(workspacePath, 8080);
        return {
          type: "flutter",
          command: `flutter run -d web-server --web-port=${detectedPort} --web-hostname=0.0.0.0`,
          port: detectedPort,
          mode: "server",
        };
      }
    } catch (e) {
      console.warn("Failed to parse pubspec.yaml:", e.message);
    }
  }

  /* ================= 3. MEAN STACK (ANGULAR + EXPRESS) ================= */
  const hasAngularJson = files.includes("angular.json") || fs.existsSync(path.join(workspacePath, "client", "angular.json"));
  const hasClientAngular = fs.existsSync(path.join(workspacePath, "client", "package.json"));
  let isAngularClient = false;
  if (hasClientAngular) {
    try {
      const clientPkg = JSON.parse(fs.readFileSync(path.join(workspacePath, "client", "package.json"), "utf-8"));
      if (clientPkg.dependencies?.["@angular/core"] || clientPkg.devDependencies?.["@angular/cli"]) {
        isAngularClient = true;
      }
    } catch {}
  }

  const hasServerBackend = fs.existsSync(path.join(workspacePath, "server", "package.json")) || fs.existsSync(path.join(workspacePath, "backend", "package.json"));

  if ((hasAngularJson || isAngularClient) && hasServerBackend) {
    const srvDir = fs.existsSync(path.join(workspacePath, "server", "package.json")) ? "server" : "backend";
    const cltDir = hasClientAngular ? "client" : ".";
    const serverPort = detectPortFromDir(path.join(workspacePath, srvDir), 5000);
    return {
      type: "mean",
      command: `(cd ${srvDir} && ([ -d node_modules ] || npm install) && npm start) & (cd ${cltDir} && ([ -d node_modules ] || npm install) && npx ng serve --host 0.0.0.0 --port 4200)`,
      port: 4200,
      apiPort: serverPort,
      mode: "server",
    };
  }

  if (hasAngularJson) {
    return {
      type: "angular",
      command: "[ -d node_modules ] || npm install; npx ng serve --host 0.0.0.0 --port 4200",
      port: 4200,
      mode: "server",
    };
  }

  /* ================= 4. MERN STACK (MONOREPO / SUBFOLDERS) ================= */
  const hasClient = fs.existsSync(path.join(workspacePath, "client", "package.json")) || fs.existsSync(path.join(workspacePath, "frontend", "package.json"));
  const hasServer = fs.existsSync(path.join(workspacePath, "server", "package.json")) || fs.existsSync(path.join(workspacePath, "backend", "package.json"));

  if (hasClient && hasServer) {
    const cltDir = fs.existsSync(path.join(workspacePath, "client", "package.json")) ? "client" : "frontend";
    const srvDir = fs.existsSync(path.join(workspacePath, "server", "package.json")) ? "server" : "backend";
    const clientPort = detectPortFromDir(path.join(workspacePath, cltDir), 3000);
    const serverPort = detectPortFromDir(path.join(workspacePath, srvDir), 5000);

    return {
      type: "mern",
      command: `(cd ${srvDir} && ([ -d node_modules ] || npm install) && npm start) & (cd ${cltDir} && ([ -d node_modules ] || npm install) && (npm run dev -- --host 0.0.0.0 || npm start))`,
      port: clientPort,
      apiPort: serverPort,
      mode: "server",
    };
  }

  /* ================= 5. ROOT NODE / REACT / EXPRESS / NEXT ================= */
  if (files.includes("package.json")) {
    try {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(workspacePath, "package.json"), "utf-8")
      );

      // Check if Next.js
      if (pkg.dependencies?.next) {
        return {
          type: "nextjs",
          command: "[ -d node_modules ] || npm install; npx next dev -p 3000 --hostname 0.0.0.0",
          port: 3000,
          mode: "server",
        };
      }

      // Check if React Vite or general dev script
      if (pkg.scripts?.dev) {
        const detectedPort = detectPortFromDir(workspacePath, 5174);
        const hostFlag = pkg.scripts.dev.includes("--host") ? "" : " -- --host 0.0.0.0";
        return {
          type: pkg.dependencies?.react ? "react-vite" : "node-dev",
          command: `[ -d node_modules ] || npm install; npm run dev${hostFlag}`,
          port: detectedPort,
          mode: "server",
        };
      }

      if (pkg.dependencies?.react && pkg.scripts?.start) {
        const detectedPort = detectPortFromDir(workspacePath, 3000);
        return {
          type: "mern-client",
          command: "[ -d node_modules ] || npm install; npm start",
          port: detectedPort,
          mode: "server",
        };
      }

      if (pkg.dependencies?.express || pkg.scripts?.start) {
        const detectedPort = detectPortFromDir(workspacePath, 5000);
        return {
          type: "node-api",
          command: "[ -d node_modules ] || npm install; npm start",
          port: detectedPort,
          mode: "server",
        };
      }
    } catch (e) {
      console.warn("Failed to parse package.json during detection:", e.message);
    }
  }

  /* ================= 6. PYTHON (FLASK, FASTAPI, STREAMLIT, GRADIO, AI) ================= */
  const pyFiles = files.filter((f) => f.endsWith(".py"));
  if (pyFiles.length > 0) {
    const hasReqs = files.includes("requirements.txt");
    let reqsContent = "";
    if (hasReqs) {
      try {
        reqsContent = fs.readFileSync(path.join(workspacePath, "requirements.txt"), "utf-8").toLowerCase();
      } catch {}
    }

    // Inspect main python files for imports
    let pythonImports = "";
    for (const pf of pyFiles.slice(0, 5)) {
      try {
        pythonImports += fs.readFileSync(path.join(workspacePath, pf), "utf-8") + "\n";
      } catch {}
    }

    // 6a. Streamlit (AI / Data Apps)
    if (reqsContent.includes("streamlit") || pythonImports.includes("import streamlit")) {
      const entry = pyFiles.find((f) => ["app.py", "main.py", "dashboard.py"].includes(f)) || pyFiles[0];
      const pipPrefix = hasReqs ? "pip3 install -r requirements.txt && " : "";
      return {
        type: "streamlit",
        command: `${pipPrefix}streamlit run "${entry}" --server.port 8501 --server.address 0.0.0.0`,
        port: 8501,
        mode: "server",
      };
    }

    // 6b. Gradio (AI Demos)
    if (reqsContent.includes("gradio") || pythonImports.includes("import gradio")) {
      const entry = pyFiles.find((f) => ["app.py", "main.py"].includes(f)) || pyFiles[0];
      const pipPrefix = hasReqs ? "pip3 install -r requirements.txt && " : "";
      return {
        type: "gradio",
        command: `${pipPrefix}python3 "${entry}"`,
        port: 7860,
        mode: "server",
      };
    }

    // 6c. FastAPI / Uvicorn (AI APIs & Modern Python)
    if (reqsContent.includes("fastapi") || pythonImports.includes("from fastapi") || pythonImports.includes("FastAPI()")) {
      const entry = pyFiles.find((f) => ["main.py", "app.py", "server.py"].includes(f)) || pyFiles[0];
      const modName = entry.replace(".py", "");
      const detectedPort = detectPortFromDir(workspacePath, 8000);
      const pipPrefix = hasReqs ? "pip3 install -r requirements.txt && " : "";
      return {
        type: "fastapi",
        command: `${pipPrefix}uvicorn ${modName}:app --host 0.0.0.0 --port ${detectedPort} --reload`,
        port: detectedPort,
        mode: "server",
      };
    }

    // 6d. Flask (Python Web & REST APIs)
    if (reqsContent.includes("flask") || pythonImports.includes("from flask") || pythonImports.includes("import flask")) {
      const entry = pyFiles.find((f) => ["app.py", "main.py", "wsgi.py", "server.py", "run.py"].includes(f)) || pyFiles[0];
      const detectedPort = detectPortFromDir(workspacePath, 5000);
      const pipPrefix = hasReqs ? "pip3 install -r requirements.txt && " : "";
      return {
        type: "flask",
        command: `${pipPrefix}python3 "${entry}"`,
        port: detectedPort,
        mode: "server",
      };
    }

    // 6e. Django
    if (reqsContent.includes("django") || files.includes("manage.py")) {
      const detectedPort = detectPortFromDir(workspacePath, 8000);
      const pipPrefix = hasReqs ? "pip3 install -r requirements.txt && " : "";
      return {
        type: "django",
        command: `${pipPrefix}python3 manage.py runserver 0.0.0.0:${detectedPort}`,
        port: detectedPort,
        mode: "server",
      };
    }

    // 6f. General Python / AI Agent Script
    const entry =
      pyFiles.find((f) => ["main.py", "app.py", "agent.py", "server.py", "index.py"].includes(f)) ||
      pyFiles[0];

    const isAi = reqsContent.includes("openai") || reqsContent.includes("google-genai") || reqsContent.includes("langchain") || reqsContent.includes("torch") || reqsContent.includes("transformers");

    const pipPrefix = hasReqs ? "pip3 install -r requirements.txt && " : "";
    return {
      type: isAi ? "ai-python" : "python",
      command: `${pipPrefix}python3 "${entry}"`,
      mode: "single",
    };
  }

  /* ================= 7. C++ PROJECT ================= */
  if (files.some((f) => f.endsWith(".cpp"))) {
    return {
      type: "cpp",
      command: "g++ *.cpp -o app && ./app",
      mode: "single",
    };
  }

  /* ================= 8. C PROJECT ================= */
  if (files.some((f) => f.endsWith(".c"))) {
    return {
      type: "c",
      command: "gcc *.c -o app && ./app",
      mode: "single",
    };
  }

  /* ================= 9. JAVA PROJECT (STANDALONE) ================= */
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

  /* ================= 10. HTML / WEB PROJECT ================= */
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
