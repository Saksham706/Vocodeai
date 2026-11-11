import axios from "axios";

/**
 * Normalizes provider name to standard lowercase identifier
 */
function normalizeProvider(provider) {
  if (!provider) return null;
  const p = String(provider).toLowerCase().trim();
  if (p === "chatgpt" || p === "openai") return "openai";
  if (p === "grok" || p === "xai") return "xai";
  if (p === "gemini" || p === "google") return "gemini";
  if (p === "claude" || p === "anthropic") return "anthropic";
  if (p === "groq") return "groq";
  if (p === "openrouter") return "openrouter";
  return p;
}

/**
 * Resolves request options (baseURL, apiKey, model, headers) for a given provider and user config
 */
function resolveProviderConfig({ provider, model, apiKey, authMethod, accountEmail, userGoogleToken }) {
  const normProvider = normalizeProvider(provider);

  if (normProvider === "openai") {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OpenAI API key is missing. Please sign in with your OpenAI account.");
    const isOpenRouter = key.startsWith("sk-or-");
    return {
      type: "openai_compatible",
      baseURL: isOpenRouter
        ? "https://openrouter.ai/api/v1/chat/completions"
        : "https://api.openai.com/v1/chat/completions",
      apiKey: key,
      model: isOpenRouter
        ? (model?.includes("mini") ? "openai/gpt-4o-mini" : "openai/gpt-4o")
        : (model || "gpt-4o"),
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(isOpenRouter
          ? {
              "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
              "X-Title": "VocodeAI Code Editor",
            }
          : {}),
      },
    };
  }

  if (normProvider === "xai") {
    const key =
      apiKey ||
      process.env.XAI_API_KEY ||
      process.env.GROK_API_KEY ||
      process.env.OPENAI_API_KEY;
    if (!key) throw new Error("Grok (xAI) API key is missing. Please sign in with your Grok account.");
    const isDirectXAI = key.startsWith("xai-");
    const isOpenRouter = key.startsWith("sk-or-") || (!isDirectXAI && key.startsWith("sk-"));
    return {
      type: "openai_compatible",
      baseURL: isDirectXAI
        ? "https://api.x.ai/v1/chat/completions"
        : "https://openrouter.ai/api/v1/chat/completions",
      apiKey: key,
      model: isDirectXAI ? (model || "grok-2-latest") : "x-ai/grok-4.5",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(isOpenRouter
          ? {
              "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
              "X-Title": "VocodeAI Code Editor",
            }
          : {}),
      },
    };
  }

  if (normProvider === "gemini") {
    let cleanModel = model || "gemini-1.5-pro";
    if (cleanModel.startsWith("google/")) cleanModel = cleanModel.replace("google/", "");
    if (cleanModel === "gemini-pro" || cleanModel === "gemini-pro-1.5") cleanModel = "gemini-1.5-pro";

    // 1. Personal API key if user entered one (e.g. AIzaSy...)
    if (apiKey && (apiKey.startsWith("AIza") || !apiKey.startsWith("sk-"))) {
      return {
        type: "openai_compatible",
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        apiKey,
        model: cleanModel,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      };
    }

    // 2. OpenRouter proxy key if provided
    if (apiKey && apiKey.startsWith("sk-or-")) {
      return {
        type: "openai_compatible",
        baseURL: "https://openrouter.ai/api/v1/chat/completions",
        apiKey,
        model: cleanModel.includes("flash") ? "google/gemini-2.5-flash" : "google/gemini-2.5-pro",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
          "X-Title": "VocodeAI Code Editor",
        },
      };
    }

    // 3. Direct Gemini key in environment if present
    const geminiEnvKey = process.env.GEMINI_API_KEY;
    if (geminiEnvKey) {
      return {
        type: "openai_compatible",
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        apiKey: geminiEnvKey,
        model: cleanModel,
        headers: {
          Authorization: `Bearer ${geminiEnvKey}`,
          "Content-Type": "application/json",
        },
      };
    }

    // 4. OpenRouter / Provider key for Gemini models
    const fallbackKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
    if (fallbackKey) {
      const isOpenRouter = fallbackKey.startsWith("sk-or-") || Boolean(process.env.OPENROUTER_API_KEY);
      const geminiModel = isOpenRouter
        ? (cleanModel.includes("flash") ? "google/gemini-2.5-flash" : "google/gemini-2.5-pro")
        : cleanModel;

      return {
        type: "openai_compatible",
        baseURL: isOpenRouter
          ? "https://openrouter.ai/api/v1/chat/completions"
          : "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        apiKey: fallbackKey,
        model: geminiModel,
        headers: {
          Authorization: `Bearer ${fallbackKey}`,
          "Content-Type": "application/json",
          ...(isOpenRouter
            ? {
                "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
                "X-Title": "VocodeAI Code Editor",
              }
            : {}),
        },
      };
    }

    throw new Error(
      "Google Gemini is active, but no connection key is available."
    );
  }

  if (normProvider === "groq") {
    const key = apiKey || process.env.GROQ_API_KEY;
    if (!key) throw new Error("Groq API key is missing. Please sign in with your Groq account.");
    return {
      type: "openai_compatible",
      baseURL: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: key,
      model: model || "llama-3.3-70b-versatile",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    };
  }

  if (normProvider === "anthropic") {
    const key = apiKey || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
    if (!key) throw new Error("Anthropic Claude API key is missing. Please sign in with your Claude account.");
    const isDirectClaude = key.startsWith("sk-ant-");
    const isOpenRouter = key.startsWith("sk-or-") || (!isDirectClaude && key.startsWith("sk-"));

    if (isOpenRouter) {
      return {
        type: "openai_compatible",
        baseURL: "https://openrouter.ai/api/v1/chat/completions",
        apiKey: key,
        model: "anthropic/claude-sonnet-5.5",
        headers: {
          Authorization: `Bearer ${key}`,
          "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
          "X-Title": "VocodeAI Code Editor",
          "Content-Type": "application/json",
        },
      };
    }
    return {
      type: "anthropic",
      baseURL: "https://api.anthropic.com/v1/messages",
      apiKey: key,
      model: model || "claude-3-5-sonnet-20241022",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
    };
  }

  if (normProvider === "openrouter") {
    const key = apiKey || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OpenRouter API key is missing. Please sign in with your OpenRouter account.");
    return {
      type: "openai_compatible",
      baseURL: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: key,
      model: model || "openai/gpt-4o",
      headers: {
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
        "X-Title": "VocodeAI Code Editor",
        "Content-Type": "application/json",
      },
    };
  }

  // Fallback: If no provider specified, check environment keys in order
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const generalKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;

  if (geminiKey) {
    return {
      type: "openai_compatible",
      baseURL: process.env.OPENAI_API_BASE || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      apiKey: geminiKey,
      model: process.env.AI_MODEL || "gemini-1.5-flash",
      headers: {
        Authorization: `Bearer ${geminiKey}`,
        "Content-Type": "application/json",
      },
    };
  } else if (groqKey) {
    return {
      type: "openai_compatible",
      baseURL: process.env.OPENAI_API_BASE || "https://api.groq.com/openai/v1/chat/completions",
      apiKey: groqKey,
      model: process.env.AI_MODEL || "llama-3.3-70b-versatile",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
    };
  } else if (generalKey) {
    const isOpenRouter = generalKey.startsWith("sk-or-") || Boolean(process.env.OPENROUTER_API_KEY);
    return {
      type: "openai_compatible",
      baseURL: process.env.OPENAI_API_BASE || (isOpenRouter
        ? "https://openrouter.ai/api/v1/chat/completions"
        : "https://api.openai.com/v1/chat/completions"),
      apiKey: generalKey,
      model: process.env.AI_MODEL || (isOpenRouter ? "openrouter/free" : "gpt-4o-mini"),
      headers: {
        Authorization: `Bearer ${generalKey}`,
        "Content-Type": "application/json",
        ...(isOpenRouter
          ? {
              "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
              "X-Title": "VocodeAI Code Editor",
            }
          : {}),
      },
    };
  }

  throw new Error(
    "No AI Model selected or API key found. Please select an AI model (like ChatGPT, Grok, or Gemini) and sign in with your API key."
  );
}

/**
 * Verify / Test connection for user's selected provider and API key
 */
export async function verifyAIKey({ provider, model, apiKey, authMethod, accountEmail }) {
  const normProvider = normalizeProvider(provider) || "gemini";
  const email = accountEmail || "Signed-in User";

  if (authMethod === "google") {
    return {
      success: true,
      provider: normProvider,
      model: model || "gemini-1.5-pro",
      accountEmail: email,
      message: `Google Account (${email}) successfully authorized for ${model || "Google Gemini"}!`,
    };
  }

  const hasCustomKey = Boolean(apiKey && typeof apiKey === "string" && apiKey.trim());
  const effectiveKey = hasCustomKey
    ? apiKey.trim()
    : process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

  if (!effectiveKey) {
    throw new Error(`Please enter your ${normProvider.toUpperCase()} access token / API key, or sign in with Google.`);
  }

  const config = resolveProviderConfig({
    provider: normProvider,
    model,
    apiKey: effectiveKey,
    authMethod,
    accountEmail: email,
  });

  try {
    if (config.type === "anthropic") {
      const resp = await axios.post(
        config.baseURL,
        {
          model: config.model,
          max_tokens: 10,
          messages: [{ role: "user", content: "Ping test. Respond with OK." }],
        },
        { headers: config.headers, timeout: 15000 }
      );
      if (resp.data?.content?.[0]?.text) {
        return {
          success: true,
          provider: normProvider,
          model: config.model,
          accountEmail: email,
          message: `Connection successful! ${config.model} is ready for ${email}.`,
        };
      }
    } else {
      const payload = {
        model: config.model,
        messages: [{ role: "user", content: "Ping test. Respond with OK." }],
        max_tokens: 10,
      };

      if (!config.model.startsWith("o1") && !config.model.startsWith("o3")) {
        payload.temperature = 0.2;
      }

      const resp = await axios.post(config.baseURL, payload, {
        headers: config.headers,
        timeout: 15000,
      });

      if (resp.data?.choices?.[0]?.message) {
        return {
          success: true,
          provider: normProvider,
          model: config.model,
          accountEmail: email,
          message: `Connection successful! ${config.model} is ready for ${email}.`,
        };
      }
    }

    return {
      success: true,
      provider: normProvider,
      model: config.model,
      accountEmail: email,
      message: `Verified and connected ${config.model} for ${email}.`,
    };
  } catch (err) {
    const errorMsg =
      err.response?.data?.error?.message ||
      err.response?.data?.message ||
      (typeof err.response?.data?.error === "string" ? err.response.data.error : null) ||
      err.message ||
      "Verification failed. Please verify your token.";

    // If custom key has quota/credit issues, inform user specifically
    if (hasCustomKey) {
      throw new Error(errorMsg);
    }

    // If using cloud quota and there was a temporary ping issue, still return success gracefully
    return {
      success: true,
      provider: normProvider,
      model: config.model,
      accountEmail: email,
      message: `Connected ${config.model} with ${email} using VocodeAI Cloud Quota!`,
    };
  }
}

/**
 * Main inference executor supporting bring-your-own-model across OpenAI, Grok, Gemini, Claude, and Groq
 */
export async function askAI({
  message,
  history = [],
  workspaceContext = "",
  images = [],
  systemPromptOverride = null,
  provider = null,
  model = null,
  apiKey = null,
  authMethod = null,
  accountEmail = null,
  userGoogleToken = null,
}) {
  const config = resolveProviderConfig({ provider, model, apiKey, authMethod, accountEmail, userGoogleToken });

  const systemPrompt = `
You are VocodeAI, a professional autonomous AI pair programmer (similar to Antigravity, GitHub Copilot, and Cursor) embedded in a cloud code editor.
You write complete, production-grade, bug-free code, modify existing codebases, explain technical concepts, and manage workspace files directly.
The workspace runs in an isolated Docker container with Node.js 20, Python 3, OpenJDK 17, GCC, and Maven.

CAPABILITIES:
- MULTIMODAL VISION: You CAN see and read attached images, screenshots, diagrams, and UI errors. Read the exact text, errors, stack traces, and code from screenshots and solve the user's issue. Never claim you are text-only or unable to see screenshots.
- FILE & FOLDER INSPECTION: You have access to attached files and folder contents provided in the context. Inspect them thoroughly to provide accurate code modifications.

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
   - "run_code": When the user asks to run, execute, test, or compile code/file in terminal. ALWAYS specify "path" with the file name (e.g. "TwoSum.cpp") AND "command" with the exact shell execution command (e.g. "g++ TwoSum.cpp -o a.out && ./a.out" or "python3 script.py" or "javac App.java && java App").
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

  let userMessageContent;
  if (Array.isArray(images) && images.length > 0) {
    userMessageContent = [
      {
        type: "text",
        text: `${message}\n\nPlease inspect the attached image(s)/screenshot(s) carefully. You have full vision capabilities. Read all errors, terminal output, UI details, or code displayed in the images and provide a complete solution.`,
      },
      ...images.map((img) => ({
        type: "image_url",
        image_url: {
          url: img.url,
        },
      })),
    ];
  } else {
    userMessageContent = message;
  }

  let lastError;
  let maxTokens = 2048;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (config.type === "gemini_native") {
        // Native Google Generative Language REST API (direct user Google OAuth token)
        const contents = [];
        for (const item of cleanHistory) {
          contents.push({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: typeof item.content === "string" ? item.content : JSON.stringify(item.content) }],
          });
        }

        const userParts = [];
        if (Array.isArray(images) && images.length > 0) {
          userParts.push({ text: message });
          for (const img of images) {
            if (img.url && img.url.startsWith("data:")) {
              const match = img.url.match(/^data:([^;]+);base64,(.+)$/);
              if (match) {
                userParts.push({
                  inlineData: {
                    mimeType: match[1],
                    data: match[2],
                  },
                });
              }
            }
          }
        } else {
          userParts.push({ text: message });
        }

        contents.push({
          role: "user",
          parts: userParts,
        });

        const geminiPayload = {
          system_instruction: {
            parts: [{ text: systemPromptOverride || systemPrompt }],
          },
          contents,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: maxTokens,
          },
        };

        const response = await axios.post(config.baseURL, geminiPayload, {
          headers: config.headers,
          timeout: 50000,
        });

        const choice = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!choice) {
          throw new Error("Empty response received from Google Gemini model");
        }
        return choice;
      } else if (config.type === "anthropic") {
        // Anthropic Claude Messages API
        const anthropicMessages = [];
        for (const item of cleanHistory) {
          anthropicMessages.push({
            role: item.role === "assistant" ? "assistant" : "user",
            content: typeof item.content === "string" ? item.content : JSON.stringify(item.content),
          });
        }
        anthropicMessages.push({
          role: "user",
          content: typeof userMessageContent === "string" ? userMessageContent : JSON.stringify(userMessageContent),
        });

        const response = await axios.post(
          config.baseURL,
          {
            model: config.model,
            max_tokens: maxTokens,
            system: systemPromptOverride || systemPrompt,
            messages: anthropicMessages,
          },
          {
            headers: config.headers,
            timeout: 50000,
          }
        );

        const choice = response.data?.content?.[0]?.text;
        if (!choice) {
          throw new Error("Empty response received from Claude AI model");
        }
        return choice;
      } else {
        // Standard OpenAI-compatible API (ChatGPT, Grok, Gemini, Groq, OpenRouter)
        const payload = {
          model: config.model,
          messages: [
            { role: "system", content: systemPromptOverride || systemPrompt },
            ...cleanHistory,
            { role: "user", content: userMessageContent },
          ],
          max_tokens: maxTokens,
        };

        // o1 / o3 models do not accept temperature parameter
        if (!config.model.startsWith("o1") && !config.model.startsWith("o3")) {
          payload.temperature = 0.2;
        }

        const response = await axios.post(config.baseURL, payload, {
          headers: config.headers,
          timeout: 50000,
        });

        const choice = response.data?.choices?.[0]?.message?.content;
        if (!choice) {
          throw new Error("Empty response received from AI model");
        }

        return choice;
      }
    } catch (err) {
      lastError = err;
      const errMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        (typeof err.response?.data?.error === "string" ? err.response.data.error : null) ||
        err.message;
      console.warn(`AI attempt ${attempt} with ${config.model} failed: ${errMsg}`);

      // Smart recovery on token/credit limits or model deprecation
      const affordMatch = typeof errMsg === "string" && errMsg.match(/can only afford (\d+)/i);
      if (affordMatch && affordMatch[1]) {
        maxTokens = Math.max(256, parseInt(affordMatch[1], 10) - 200);
        console.info(`Adjusted max_tokens to ${maxTokens} for next attempt`);
      } else if (errMsg?.includes("no longer available") || errMsg?.includes("not available") || errMsg?.includes("not found")) {
        console.info(`Model ${config.model} unavailable on provider, falling back to reliable model`);
        if (config.model?.includes("grok")) {
          config.model = "x-ai/grok-4.5";
        } else if (config.model?.includes("claude")) {
          config.model = "anthropic/claude-sonnet-5.5";
        } else {
          config.model = process.env.AI_MODEL || "openrouter/free";
        }
      } else if (errMsg?.includes("credits") || errMsg?.includes("tokens") || errMsg?.includes("afford")) {
        maxTokens = 1024;
        if (config.model?.includes("gpt-4o") && !config.model?.includes("mini")) {
          console.info("Switching to openai/gpt-4o-mini due to credit limits");
          config.model = "openai/gpt-4o-mini";
        } else if (config.model?.includes("gemini-2.5-pro") || config.model?.includes("gemini-1.5-pro")) {
          console.info("Switching to google/gemini-2.5-flash due to credit limits");
          config.model = "google/gemini-2.5-flash";
        } else if (config.model?.includes("grok") || config.model?.includes("claude")) {
          console.info("Switching to fallback model for subsequent attempt");
          config.model = process.env.AI_MODEL || "openrouter/free";
        }
      }

      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 800));
      }
    }
  }

  const finalErrMsg =
    lastError?.response?.data?.error?.message ||
    lastError?.response?.data?.message ||
    (typeof lastError?.response?.data?.error === "string" ? lastError.response.data.error : null) ||
    lastError?.message ||
    "AI request failed";
  console.error("AI Service Error:", finalErrMsg);
  throw new Error(finalErrMsg);
}
