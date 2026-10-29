const IGNORED_EXTENSIONS = [
  ".class",
  ".out",
  ".o",
  ".obj",
  ".exe",
  ".pyc",
  ".pyo",
  ".so",
  ".dll",
  ".dylib",
];

const IGNORED_FILENAMES = ["a.out", "a.exe", ".workspace.json", ".ds_store", "thumbs.db"];

export function isIgnoredArtifact(path) {
  if (!path) return true;
  const lower = path.toLowerCase();
  const filename = lower.split("/").pop();

  if (IGNORED_FILENAMES.includes(filename)) return true;
  if (IGNORED_EXTENSIONS.some((ext) => filename.endsWith(ext))) return true;

  return false;
}

export function buildTree(nodes) {
  const root = {
    name: "",
    type: "folder",
    children: [],
  };

  if (!Array.isArray(nodes)) {
    return root;
  }

  const map = { "": root };

  for (const node of nodes) {
    if (!node?.path || isIgnoredArtifact(node.path)) continue;
    const parts = node.path.split("/").filter(Boolean);
    let currentPath = "";

    parts.forEach((part, index) => {
      const parentPath = currentPath;
      currentPath = parentPath ? `${parentPath}/${part}` : part;

      if (!map[currentPath]) {
        map[currentPath] = {
          name: part,
          type: index === parts.length - 1 ? node.type : "folder",
          children: [],
        };

        if (map[parentPath]) {
          map[parentPath].children.push(map[currentPath]);
        }
      }
    });
  }

  return root;
}
