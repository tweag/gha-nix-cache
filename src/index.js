import * as child_process from 'node:child_process';
import * as core from '@actions/core';
import * as io from '@actions/io';
import * as process from 'node:process';

process.default.on('uncaughtException', (error) => {
	console.error(error && error.stack ? error.stack : error);
	core.error(error.message);
	core.setFailed(error.message);
});

core.info('Starting server...');
const workDir = `${process.env.RUNNER_TEMP}/gha-nix-cache`;
await io.mkdirP(workDir);
const server = child_process.fork(`${import.meta.dirname}/server.js`, [], {
	cwd: workDir,
	detached: true,
	stdio: ['ipc', 'ignore', 'inherit'],
});

core.info('Waiting for server to start...');
await new Promise((resolve, reject) => {
	server.on('exit', (code, _signal) => {
		reject(new Error(`Server process exited unexpectedly with code ${code}`));
	});
	server.on('message', (message) => {
		if (message === 'started') {
			resolve();
		} else {
			server.kill();
			reject(new Error(`Server process sent unexpected message: ${message}`));
		}
	});
});
core.info('Server is listening.');
server.unref();
server.channel.unref();
