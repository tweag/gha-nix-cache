import {
  require_cache
} from "./index-3qkwfd22.js";
import {
  __toESM,
  require_io
} from "./index-p06xw57k.js";

// src/server.js
var cache = __toESM(require_cache(), 1);
var io = __toESM(require_io(), 1);
import * as child_process from "node:child_process";
import * as fs from "node:fs/promises";
import * as http from "node:http";
import * as process from "node:process";
process.default.on("uncaughtException", (error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
async function setup() {
  const logFile = await fs.open("stderr.log", "a");
  process.stdout.write = process.stderr.write = logFile.createWriteStream().write.bind(logFile);
  const binDir = "bin";
  await io.mkdirP(binDir);
  for (const binary of ["bash", "ln"]) {
    await fs.symlink(await io.which(binary), `${binDir}/${binary}`);
  }
  await fs.symlink(`${import.meta.dirname}/../tarshim.sh`, `${binDir}/tar`);
  process.env.PATH = binDir;
  await io.mkdirP("upload");
  delete process.env.GITHUB_WORKSPACE;
}
async function restore(name) {
  const child = child_process.fork(`${import.meta.dirname}/restore.js`, [], {
    env: { ...process.env, TARGET_FILE_NAME: name }
  });
  await new Promise((resolve, reject) => {
    child.on("close", (code, signal) => {
      if (code === 0) {
        resolve();
      } else if (signal) {
        reject(new Error(`Child process stopped because of signal ${signal}`));
      } else {
        reject(new Error(`Child process exited with code ${code}`));
      }
    });
  });
}
function getKey(url) {
  if (url.startsWith("/nar/")) {
    return url.slice(5);
  }
  return url.slice(1);
}
async function handle(request, response) {
  if (request.method !== "GET") {
    response.writeHead(400);
    response.end();
    return;
  }
  const key = getKey(request.url);
  try {
    await restore(key);
    const f = await fs.open(key);
    response.writeHead(200);
    await f.createReadStream().pipe(response);
  } catch (error) {
    if (error.code === "ENOENT") {
      response.writeHead(404);
      response.end();
      return;
    }
    response.writeHead(500);
    console.error(error && error.stack ? error.stack : error);
    response.end(error.message);
  }
}
function startServer() {
  const server = http.createServer(handle);
  server.listen(8080, () => {
    process.send("started");
  });
}
async function watchAndUpload() {
  const watcher = fs.watch("upload", { recursive: true });
  for await (const event of watcher) {
    console.log(event);
  }
}
async function main() {
  await setup();
  watchAndUpload();
  startServer();
}
await main();
