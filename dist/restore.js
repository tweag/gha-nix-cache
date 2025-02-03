import {
  require_cache
} from "./index-3qkwfd22.js";
import {
  __toESM
} from "./index-p06xw57k.js";

// src/restore.js
var cache = __toESM(require_cache(), 1);
import * as process from "node:process";
var name = process.env.TARGET_FILE_NAME;
var _cacheKey = await cache.restoreCache([name], name);
