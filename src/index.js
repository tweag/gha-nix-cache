const core = require('@actions/core');
const cache = require('@actions/cache');
const io = require('@actions/io');
const fs = require('node:fs/promises');
const child_process = require('node:child_process');

process.on('uncaughtException', function(error) {
  console.error((error && error.stack) ? error.stack : error);
  core.error(error.message);
  core.setFailed(error.message);
});

core.info("Starting server...");
const workDir = `${process.env.RUNNER_TEMP}/gha-nix-cache`;
await io.mkdirP(workDir);
const server = child_process.fork(`${import.meta.dirname}/server.js`, [], {
  cwd: workDir,
  detached: true,
  stdio: ['ipc', 'ignore', 'inherit'],
});

core.info("Waiting for server to start...");
await new Promise((resolve, reject) => {
  server.on('exit', (code, signal) => {
    reject(`Server process exited unexpectedly with code ${code}`);
  });
  server.on('message', (msg) => {
    if (msg == 'started') {
      resolve();
    } else {
      server.kill();
      reject(`Server process sent unexpected message: ${msg}`);
    }
  });
});
core.info("Server is listening.");
server.unref();
server.channel.unref();
