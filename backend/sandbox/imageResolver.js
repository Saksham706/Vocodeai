export function getImageForWorkspace() {
  return process.env.DEV_DOCKER_IMAGE || "vocodeai/universal-dev:latest";
}
