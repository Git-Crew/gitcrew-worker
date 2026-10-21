import { spawn } from "node:child_process";

/** One throwaway container. The model key rides on stdin. The GitHub token never does. */
export function dockerArgs({ image, workspace, memoryDir }) {
  const args = ["run", "--rm", "-i", "-v", `${workspace}:/workspace`, "-w", "/workspace"];
  if (memoryDir) {
    args.push("-v", `${memoryDir}:/memory`, "-e", "HERMES_HOME=/memory");
  }
  args.push(image);
  return args;
}

export function runContainer({ image, workspace, memoryDir, job }) {
  const args = dockerArgs({ image, workspace, memoryDir });
  return new Promise((resolve, reject) => {
    const child = spawn("docker", args, { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0 && !stdout.trim()) reject(new Error(stderr.slice(-800) || `docker exited ${code}`));
      else resolve(stdout);
    });
    child.stdin.end(JSON.stringify(job));
  });
}
