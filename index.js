const core = require('@actions/core');
const cache = require('@actions/cache');
const io = require('@actions/io');
const fs = require('node:fs/promises');
const child_process = require('node:child_process');

async function setup() {
  const oldPath = process.env.PATH;
  const newPath = process.env.RUNNER_TEMP + '/tmpbin';
  await io.mkdirP(newPath);
  for (const bin of ["bash", "ln"]) {
    await fs.symlink(await io.which(bin), `${newPath}/${bin}`)
  }
  await fs.symlink(`${import.meta.dirname}/../tarshim.sh`, `${newPath}/tar`)
  process.env.PATH = newPath;
  delete process.env["GITHUB_WORKSPACE"];
  process.chdir(process.env.RUNNER_TEMP);
}

async function save(name) {
  const cacheId = await cache.saveCache([name], name);
}

async function restore(name) {
  const child = child_process.fork(`${import.meta.dirname}/restore.js`, [], {
    env: {...process.env, TARGET_FILE_NAME: name},
  });
  await new Promise((resolve, reject) => {
    child.on('close', (code, signal) => {
      if (code == 0) {
        resolve();
      } else if (signal) {
        reject(`Child process stopped because of signal ${signal}`);
      } else {
        reject(`Child process exited with code ${code}`);
      }
    });
  });
}

try {
  await setup();
  await save("testfile");
  await fs.unlink("testfile");
  await restore("testfile");
} catch (error) {
  core.setFailed(error.message);
}
