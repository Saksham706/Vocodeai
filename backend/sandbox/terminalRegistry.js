const terminalMap = new Map();

export function registerTerminal(id, data) {
  const existing = terminalMap.get(id);
  const sockets = data.sockets || (existing?.sockets ? existing.sockets : new Set());
  terminalMap.set(id, {
    ...data,
    sockets,
  });
}

export function getTerminal(id) {
  return terminalMap.get(id);
}

export function removeTerminal(id) {
  const entry = terminalMap.get(id);
  if (entry) {
    if (entry.pty && typeof entry.pty.kill === "function") {
      try {
        entry.pty.kill();
      } catch {}
    }
    terminalMap.delete(id);
  }
}

export function getAllTerminals() {
  return terminalMap;
}

export function addTerminalSubscriber(id, ws) {
  const entry = terminalMap.get(id);
  if (entry) {
    if (!entry.sockets) entry.sockets = new Set();
    entry.sockets.add(ws);
  }
}

export function removeTerminalSubscriber(id, ws) {
  const entry = terminalMap.get(id);
  if (entry && entry.sockets) {
    entry.sockets.delete(ws);
  }
}

export function removeSubscriberFromAll(ws) {
  for (const entry of terminalMap.values()) {
    if (entry.sockets) {
      entry.sockets.delete(ws);
    }
  }
}
