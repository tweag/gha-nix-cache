import {
  __toESM,
  require_core,
  require_io
} from "./index-p06xw57k.js";

// src/index.js
var core = __toESM(require_core(), 1);
var io = __toESM(require_io(), 1);
import * as child_process from "node:child_process";
import * as process from "node:process";
process.default.on("uncaughtException", (error2) => {
  console.error(error2 && error2.stack ? error2.stack : error2);
  core.error(error2.message);
  core.setFailed(error2.message);
});
core.info("Starting server...");
var workDir = `${process.env.RUNNER_TEMP}/gha-nix-cache`;
await io.mkdirP(workDir);
var server = child_process.fork(`${import.meta.dirname}/server.js`, [], {
  cwd: workDir,
  detached: true,
  stdio: ["ipc", "ignore", "inherit"]
});
core.info("Waiting for server to start...");
await new Promise((resolve, reject) => {
  server.on("exit", (code, _signal) => {
    reject(new Error(`Server process exited unexpectedly with code ${code}`));
  });
  server.on("message", (message) => {
    if (message === "started") {
      resolve();
    } else {
      server.kill();
      reject(new Error(`Server process sent unexpected message: ${message}`));
    }
  });
});
core.info("Server is listening.");
server.unref();
server.channel.unref();
