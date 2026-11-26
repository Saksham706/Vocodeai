const SLUG_MAP_KEY = "vocode_slug_map";

export function toWorkspaceSlug(name) {
  const slug = String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "editor";
}

export function isWorkspaceIdLike(value) {
  if (!value) return false;
  return /^[a-f0-9]{24}$/i.test(value) || /^ws-\d+$/i.test(value);
}

export function saveWorkspaceSlug(slug, id) {
  if (!slug || !id) return;
  try {
    localStorage.setItem("vocode_recent_workspace", id);
    const raw = localStorage.getItem(SLUG_MAP_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[slug] = id;
    localStorage.setItem(SLUG_MAP_KEY, JSON.stringify(map));
  } catch {}
}

export function getWorkspaceIdForSlug(slug) {
  if (!slug) return null;
  try {
    const raw = localStorage.getItem(SLUG_MAP_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[slug] || null;
  } catch {
    return null;
  }
}

export function getWorkspaceNavTarget(wsOrId, name) {
  const id =
    wsOrId && typeof wsOrId === "object"
      ? wsOrId._id || wsOrId.id
      : wsOrId;
  const wsName =
    wsOrId && typeof wsOrId === "object" ? wsOrId.name : name;
  const slug = toWorkspaceSlug(wsName);
  if (id) saveWorkspaceSlug(slug, id);
  return {
    path: `/workspace/${slug}`,
    state: id ? { workspaceId: id } : undefined,
  };
}
