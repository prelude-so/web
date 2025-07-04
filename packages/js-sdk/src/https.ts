import { DEFAULT_FETCH_TIMEOUT_MS, DEFAULT_SILENT_RETRY_COUNT } from "./constants";
import { ForbiddenError, GenericError, UnauthorizedError } from "./errors";
import { APIResponse, ErrorResponse } from "./session/global";
import { buildUserAgent } from "./user-agent";

export interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  credentials?: "include" | "omit";
  body?: string;
  signal?: AbortSignal;
}

export const createAbortController: () => AbortController = () => new AbortController();

const dofetch = async (fetchUrl: string, fetchOptions: FetchOptions) => {
  const response = await fetch(fetchUrl, {
    ...fetchOptions,
    headers: {
      ...fetchOptions.headers,
      "User-Agent": await buildUserAgent(),
    },
    mode: "cors",
  });

  if (response.status === 204) {
    return {
      ok: response.ok,
      json: null,
    };
  }

  return {
    ok: response.ok,
    json: await response.json(),
  };
};

const fetchWithTimeout = async (
  fetchUrl: string,
  fetchOptions: FetchOptions,
  timeout: number = DEFAULT_FETCH_TIMEOUT_MS,
) => {
  const controller = createAbortController();
  fetchOptions.signal = controller.signal;

  let timeoutId: ReturnType<typeof setTimeout>;

  // The promise will resolve with one of these two promises (the fetch or the timeout), whichever completes first.
  return Promise.race([
    dofetch(fetchUrl, fetchOptions),

    new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error("Timeout when executing 'fetch'"));
      }, timeout);
    }),
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
};

export async function getJSON<T>(
  url: string,
  timeout: number | undefined,
  options: FetchOptions,
): Promise<T> {
  let fetchError: null | Error = null;
  let response: APIResponse<T> | ErrorResponse = { ok: false, json: { code: "" } };

  for (let i = 0; i < DEFAULT_SILENT_RETRY_COUNT; i++) {
    try {
      response = (await fetchWithTimeout(url, options, timeout)) as APIResponse<T> | ErrorResponse;
      fetchError = null;
      break;
    } catch (e) {
      // Fetch only fails in the case of a network issue, so should be
      // retried here. Failure status (4xx, 5xx, etc) return a resolved Promise
      // with the failure in the body.
      // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
      fetchError = e as null | Error;
    }
  }

  if (fetchError) {
    throw fetchError;
  }

  const { json, ok } = response;

  if (!ok) {
    const { code } = json;

    if (code === "unauthorized") {
      throw new UnauthorizedError("Unauthorized");
    }

    if (code === "forbidden") {
      throw new ForbiddenError("Forbidden");
    }

    throw new GenericError("Unknown error");
  }

  return json;
}
