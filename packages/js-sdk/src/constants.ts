export const DEFAULT_FETCH_TIMEOUT_MS = 2000;

export const DEFAULT_SESSION_DOMAIN = "session.prelude.dev";

export const SESSION_BASE_PATH = "/v1/session";

export const DEFAULT_SILENT_RETRY_COUNT = 3;

export const SESSION_APP_ID_HEADER_NAME = "X-App-Id";

export const REFRESH_SESSION_TOKEN_LOCK_KEY = "prld.locks.refreshSessionToken";

export const DEFAULT_NOW_PROVIDER = () => Date.now();
