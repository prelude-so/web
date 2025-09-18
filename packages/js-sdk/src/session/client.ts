import {
  DEFAULT_FETCH_TIMEOUT_MS,
  DEFAULT_NOW_PROVIDER,
  REFRESH_SESSION_TOKEN_LOCK_KEY,
  SESSION_BASE_PATH,
} from "../constants";
import { getJSON } from "../https";
import { SafeLock } from "../lock";
import { dispatchSignals } from "../signals/dispatch";
import { LocalStorageCache } from "./cache/cache-localstorage";
import { CacheManager } from "./cache/cache-manager";
import { CacheKeyManifest } from "./cache/key-manifest";
import { CacheKey } from "./cache/shared";
import {
  APIResponse,
  PrldProfile,
  PrldUser,
  RefreshTokenEndpointResponse,
  StartOTPLoginEndpointOptions,
} from "./global";
import { decode } from "./jwt";

export interface PrldSessionClientOptions {
  domain: string;
  sdkKey?: string;
  timeout?: number;
}

export class PrldSessionClient {
  private readonly baseURL: string;
  private readonly cacheManager: CacheManager;
  private readonly domain: string;
  // Refreshing spends the refresh token; using an expired / spent refresh token results in a logout.
  // We use a lock before refreshing the session to avoid concurrent calls from different tabs.
  private readonly refreshLock = SafeLock(REFRESH_SESSION_TOKEN_LOCK_KEY);
  private readonly sdkKey?: string;
  private readonly timeout: number;

  constructor(options: PrldSessionClientOptions) {
    this.domain = options.domain;
    this.sdkKey = options.sdkKey;
    this.baseURL = `https://${this.domain}${SESSION_BASE_PATH}`;
    this.timeout = options.timeout ?? DEFAULT_FETCH_TIMEOUT_MS;
    const cache = new LocalStorageCache();

    this.cacheManager = new CacheManager(
      cache,
      !cache.allKeys ? new CacheKeyManifest(cache, this.domain) : undefined,
      DEFAULT_NOW_PROVIDER,
    );
  }

  public async startOTPLogin(options: StartOTPLoginEndpointOptions) {
    const body: StartOTPLoginEndpointOptions & { dispatch_id?: string } = { ...options };
    if (this.sdkKey) {
      body.dispatch_id = await dispatchSignals(this.sdkKey);
    }

    const data = await getJSON<APIResponse<unknown>>(`${this.baseURL}/login/otp`, this.timeout, {
      body: JSON.stringify(body),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      credentials: "include",
    });
    return data;
  }

  public async checkOTP(code: string) {
    const data = await getJSON<APIResponse<unknown>>(`${this.baseURL}/login/otp/check`, this.timeout, {
      body: JSON.stringify({ code }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      credentials: "include",
    });
    return data;
  }

  public async retryOTP() {
    const data = await getJSON<APIResponse<unknown>>(`${this.baseURL}/login/otp/retry`, this.timeout, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      credentials: "include",
    });
    return data;
  }

  public async logout() {
    const data = await getJSON<APIResponse<unknown>>(`${this.baseURL}/revoke`, this.timeout, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      credentials: "include",
    });
    await this.cacheManager.clear(this.domain);
    return data;
  }

  public async getProfile(): Promise<PrldProfile | undefined> {
    const entry = await this.cacheManager.getWithoutExpirationCheck(
      new CacheKey({
        appId: this.domain,
      }),
    );

    if (entry) {
      const decodedToken = decode(entry.access_token);

      return decodedToken.claims.cc;
    }

    return;
  }

  public async refresh(): Promise<{ user: PrldUser }> {
    let refreshError: null | Error = null;

    // Check cache to avoid waiting for lock, e.g. in case of slow network
    const entry = await this.cacheManager.get(
      new CacheKey({
        appId: this.domain,
      }),
    );

    if (entry) {
      const decodedToken = decode(entry.access_token);

      return {
        user: {
          accessToken: entry.access_token,
          profile: decodedToken.claims.cc,
        },
      };
    }

    const data = await this.refreshLock.acquireLockAndRun<RefreshTokenEndpointResponse>(async () => {
      // Check cache again in case it's just been populated by a previous call
      const entry = await this.cacheManager.get(
        new CacheKey({
          appId: this.domain,
        }),
      );

      if (entry) {
        return {
          access_token: entry.access_token,
          expires_at: entry.expires_at,
        };
      }

      let data: RefreshTokenEndpointResponse;

      try {
        data = await getJSON<RefreshTokenEndpointResponse>(`${this.baseURL}/refresh`, this.timeout, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          credentials: "include",
        });
      } catch (e) {
        refreshError = e as null | Error;
        return {
          access_token: "",
          expires_at: 0,
        };
      }

      if (!data?.access_token) {
        return {
          access_token: "",
          expires_at: 0,
        };
      }

      await this.cacheManager.set({
        app_id: this.domain,
        access_token: data.access_token,
        expires_at: data.expires_at,
      });

      return data;
    });

    if (data === undefined) {
      // Lock was not acquired
      throw new Error("Timeout error");
    }

    if (refreshError) {
      throw refreshError;
    }

    if (!data.access_token) {
      throw new Error("No access token");
    }

    const decodedToken = decode(data.access_token);

    return {
      user: {
        accessToken: data.access_token,
        profile: decodedToken.claims.cc,
      },
    };
  }

  public async invalidateCache() {
    await this.cacheManager.invalidate(
      new CacheKey({
        appId: this.domain,
      }),
    );
  }
}
