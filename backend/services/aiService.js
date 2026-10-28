import axios from "axios";

export async function askAI({ message, history }) {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are VocodeAI (advanced coding agent).

IMPORTANT:
Always return STRICT JSON.

You can return MULTIPLE actions.

Format:
{
  "actions": [
    {
      "action": "create_file",
      "path": "file.py",
      "content": "code"
    }
  ]
}

Rules:
- If user asks for multiple files → generate multiple actions
- If user says "DSA" → create files like:
  stack.py, queue.py, linked_list.py, tree.py, graph.py
- Always include valid code
- Never return empty content
- Keep code simple and correct
`
        },
        ...history,
        { role: "user", content: message },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  return response.data.choices[0].message.content;
}