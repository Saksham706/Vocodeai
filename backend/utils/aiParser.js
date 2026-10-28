export function parseAI(response) {
  try {
    const parsed = JSON.parse(response);

    // ✅ MULTI ACTION SUPPORT
    if (parsed.actions) return parsed;

    // fallback single → convert to array
    return { actions: [parsed] };

  } catch {
    return {
      actions: [
        {
          action: "chat",
          message: response,
        },
      ],
    };
  }
}