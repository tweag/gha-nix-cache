import * as cache from '@actions/cache';
import * as process from 'node:process';

const name = process.env.TARGET_FILE_NAME;
const _cacheKey = await cache.restoreCache([name], name);
