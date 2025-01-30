const cache = await import('@actions/cache');
const process = await import('node:process');

const name = process.env.TARGET_FILE_NAME;
const _cacheKey = await cache.restoreCache([name], name);
