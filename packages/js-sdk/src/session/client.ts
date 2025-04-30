import {
  DEFAULT_FETCH_TIMEOUT_MS,
  DEFAULT_NOW_PROVIDER,
  DEFAULT_SESSION_DOMAIN,
  REFRESH_SESSION_TOKEN_LOCK_KEY,
  SESSION_APP_ID_HEADER_NAME,
  SESSION_BASE_PATH,
} from "../constants";
import { getJSON } from "../https";
import { LocalStorageCache } from "./cache/cache-localstorage";
import { CacheManager } from "./cache/cache-manager";
import { CacheKeyManifest } from "./cache/key-manifest";
import { CacheKey } from "./cache/shared";
import { APIResponse, PrldUser, RefreshTokenEndpointResponse, StartOTPLoginEndpointOptions } from "./global";
import { decode } from "./jwt";
import { SafeLock } from "./lock";

export interface PrldSessionClientOptions {
  appId: string;
  domain?: string;
  timeout?: number;
}

export class PrldSessionClient {
  private readonly appId: string;
  private readonly baseURL: string;
  private readonly cacheManager: CacheManager;
  private readonly domain: string;
  // Refreshing spends the refresh token; using an expired / spent refresh token results in a logout.
  // We use a lock before refreshing the session to avoid concurrent calls from different tabs.
  private readonly refreshLock = SafeLock(REFRESH_SESSION_TOKEN_LOCK_KEY);
  private readonly timeout: number;

  constructor(options: PrldSessionClientOptions) {
    this.appId = options.appId;
    this.domain = options.domain || `${this.appId}.${DEFAULT_SESSION_DOMAIN}`;
    this.baseURL = `https://${this.domain}${SESSION_BASE_PATH}`;
    this.timeout = options.timeout ?? DEFAULT_FETCH_TIMEOUT_MS;
    const cache = new LocalStorageCache();

    this.cacheManager = new CacheManager(
      cache,
      !cache.allKeys ? new CacheKeyManifest(cache, this.appId) : undefined,
      DEFAULT_NOW_PROVIDER,
    );
  }

  public async startOTPLogin(options: StartOTPLoginEndpointOptions) {
    const data = await getJSON<APIResponse<unknown>>(`${this.baseURL}/login/otp`, this.timeout, {
      body: JSON.stringify(options),
      method: "POST",
      headers: {
        [SESSION_APP_ID_HEADER_NAME]: this.appId,
        "Content-Type": "application/json",
        Accept: "application/json",
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
        [SESSION_APP_ID_HEADER_NAME]: this.appId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
    });
    return data;
  }

  public async retryOTP() {
    const data = await getJSON<APIResponse<unknown>>(`${this.baseURL}/login/otp/retry`, this.timeout, {
      method: "POST",
      headers: {
        [SESSION_APP_ID_HEADER_NAME]: this.appId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
    });
    return data;
  }

  public async logout() {
    const data = await getJSON<APIResponse<unknown>>(`${this.baseURL}/revoke`, this.timeout, {
      method: "POST",
      headers: {
        [SESSION_APP_ID_HEADER_NAME]: this.appId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
    });
    await this.cacheManager.clear(this.appId);
    return data;
  }

  public async getUser(): Promise<PrldUser> {
    const entry = await this.cacheManager.get(
      new CacheKey({
        appId: this.appId,
      }),
    );

    if (entry?.access_token) {
      const decodedToken = decode(entry.access_token);

      return {
        accessToken: entry.access_token,
        profile: decodedToken.claims.cc,
      };
    }

    const { user } = await this.refresh();
    return user;
  }

  public async refresh(): Promise<{ user: PrldUser }> {
    let refreshError: null | Error = null;

    const data = await this.refreshLock.acquireLockAndRun<RefreshTokenEndpointResponse>(async () => {
      const entry = await this.cacheManager.get(
        new CacheKey({
          appId: this.appId,
        }),
      );

      if (entry?.access_token && entry.expires_at) {
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
            [SESSION_APP_ID_HEADER_NAME]: this.appId,
            "Content-Type": "application/json",
            Accept: "application/json",
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
        app_id: this.appId,
        access_token: data.access_token,
        expires_at: data.expires_at,
      });

      return data;
    });

    if (refreshError) {
      throw refreshError;
    }

    if (!data?.access_token) {
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
}
