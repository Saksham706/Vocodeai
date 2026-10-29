import axios from "axios";

export async function askAI({ message, history = [], workspaceContext = "" }) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const generalKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;

  let apiKey;
  let baseURL;
  let model;
  const headers = {
    "Content-Type": "application/json",
  };

  // 1. Google Gemini (100% Free at https://aistudio.google.com/apikey)
  if (geminiKey) {
    apiKey = geminiKey;
    baseURL =
      process.env.OPENAI_API_BASE ||
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    model = process.env.AI_MODEL || "gemini-1.5-flash";
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  // 2. Groq (100% Free at https://console.groq.com/keys)
  else if (groqKey) {
    apiKey = groqKey;
    baseURL =
      process.env.OPENAI_API_BASE ||
      "https://api.groq.com/openai/v1/chat/completions";
    model = process.env.AI_MODEL || "llama-3.3-70b-versatile";
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  // 3. OpenRouter / OpenAI
  else if (generalKey) {
    apiKey = generalKey;
    const isOpenRouter =
      apiKey.startsWith("sk-or-") || Boolean(process.env.OPENROUTER_API_KEY);

    baseURL =
      process.env.OPENAI_API_BASE ||
      (isOpenRouter
        ? "https://openrouter.ai/api/v1/chat/completions"
        : "https://api.openai.com/v1/chat/completions");

    model =
      process.env.AI_MODEL ||
      (isOpenRouter ? "openrouter/free" : "gpt-4o-mini");

    headers["Authorization"] = `Bearer ${apiKey}`;

    if (isOpenRouter) {
      headers["HTTP-Referer"] =
        process.env.FRONTEND_URL || "http://localhost:5173";
      headers["X-Title"] = "VocodeAI Code Editor";
    }
  } else {
    throw new Error(
      "No AI API key found. Please add a free GEMINI_API_KEY (from https://aistudio.google.com/apikey) or GROQ_API_KEY (from https://console.groq.com/keys) in backend/.env"
    );
  }

  const systemPrompt = `
You are VocodeAI, a professional autonomous AI pair programmer (similar to Antigravity, GitHub Copilot, and Cursor) embedded in a cloud code editor.
You write complete, production-grade, bug-free code, modify existing codebases, explain technical concepts, and manage workspace files directly.
The workspace runs in an isolated Docker container with Node.js 20, Python 3, OpenJDK 17, GCC, and Maven.

${workspaceContext ? `Current Workspace Files and Context:\n${workspaceContext}\n` : ""}

CRITICAL RULES:
1. SMART FILE NAMING:
   - ALWAYS name files specifically based on the user's prompt or algorithm.
   - Examples:
     * 'write 4sum in java' -> path: 'FourSum.java'
     * 'write 4sum in python' -> path: 'four_sum.py'
     * 'write 2sum' -> path: 'two_sum.py' or 'TwoSum.java'
     * 'binary search' -> path: 'binary_search.py' or 'BinarySearch.java'
     * 'calculator in react' -> path: 'Calculator.jsx'
   - NEVER use generic or random names (never create 'main.txt', 'test.py', or unnecessary placeholder files).
   - NEVER create extra unrequested files.

2. FULL CRUD FILE ACTIONS:
   - "create_file": Create a brand-new file with full implementation.
   - "write_file": Edit / update an existing file.
   - "delete_file": Delete an existing file if user asks to remove/delete it. Format: { "action": "delete_file", "path": "filename.ext" }
   - "run_code": Terminal command to compile or run the code (e.g. "python two_sum.py" or "javac FourSum.java && java FourSum").
   - "chat": High-level explanation of the code, algorithm logic, and complexity.

3. STRICT OUTPUT FORMAT:
   You MUST respond with STRICT, VALID JSON ONLY. No markdown wrapper outside the JSON.
   Format:
   {
     "actions": [
       {
         "action": "create_file" | "write_file" | "delete_file" | "run_code" | "chat",
         "path": "filename.ext",
         "content": "Full source code here",
         "command": "terminal command here",
         "message": "Chat message explanation here"
       }
     ]
   }
`;

  const cleanHistory = (history || [])
    .slice(-10)
    .filter((h) => h && h.role && h.content)
    .map((h) => ({
      role: h.role,
      content:
        typeof h.content === "string" ? h.content : JSON.stringify(h.content),
    }));

  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await axios.post(
        baseURL,
        {
          model,
          messages: [
            { role: "system", content: systemPrompt },
            ...cleanHistory,
            { role: "user", content: message },
          ],
          temperature: 0.2,
        },
        {
          headers,
          timeout: 45000,
        }
      );

      const choice = response.data?.choices?.[0]?.message?.content;
      if (!choice) {
        throw new Error("Empty response received from AI model");
      }

      return choice;
    } catch (err) {
      lastError = err;
      const errMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message;
      console.warn(`AI attempt ${attempt} failed: ${errMsg}`);
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  const finalErrMsg =
    lastError?.response?.data?.error?.message ||
    lastError?.response?.data?.message ||
    lastError?.message ||
    "AI request failed";
  console.error("AI Service Error:", finalErrMsg);
  throw new Error(finalErrMsg);
}
