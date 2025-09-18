export const DEFAULT_FETCH_TIMEOUT_MS = 10_000;

export const SESSION_BASE_PATH = "/v1/session";

export const DEFAULT_SILENT_RETRY_COUNT = 3;

export const REFRESH_SESSION_TOKEN_LOCK_KEY = "prld.locks.refreshSessionToken";
export const CORE_LOAD_LOCK_KEY = "prld.locks.coreLoadLockKey";

export const DEFAULT_NOW_PROVIDER: () => number = () => Date.now();
