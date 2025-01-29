const core = require('@actions/core');
const cache = require('@actions/cache');
const io = require('@actions/io');
const fs = require('node:fs/promises');
const child_process = require('node:child_process');
const http = require('node:http');

process.on('uncaughtException', function(error) {
  console.error((error && error.stack) ? error.stack : error);
  process.exit(1);
});

async function setup() {
  const logFile = (await fs.open(`stderr.log`, 'a')).createWriteStream();
  process.stdout.write = process.stderr.write = logFile.write.bind(logFile);

  const binDir = `bin`;
  await io.mkdirP(binDir);
  for (const bin of ["bash", "ln"]) {
    await fs.symlink(await io.which(bin), `${binDir}/${bin}`)
  }
  await fs.symlink(`${import.meta.dirname}/../tarshim.sh`, `${binDir}/tar`)
  process.env.PATH = binDir;

  await io.mkdirP(`upload`);
  // Force cache to restore to cwd
  delete process.env["GITHUB_WORKSPACE"];
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

function getKey(url) {
  if (url.startsWith(`/nar/`)) {
    return url.slice(5);
  }
  return url.slice(1);
}

async function handle(req, res) {
  if (req.method != 'GET') {
    res.writeHead(400);
    res.end();
    return;
  }
  const key = getKey(req.url);
  try {
    await restore(key);
    const f = await fs.open(key);
    res.writeHead(200);
    await f.createReadStream().pipe(res);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(500);
    console.error((error && error.stack) ? error.stack : error);
    res.end(error.message);
  }
}

function startServer() {
  const server = http.createServer(handle);
  server.listen(8080, () => {
    process.send('started');
  });
}

async function watchAndUpload() {
  const wathcer = fs.watch(`upload`, {recursive: true});
  for await (event of watcher) {
    console.log(event);
  }
}

await setup();
watchAndUpload();
startServer();
