export const CACHE_KEY_PREFIX = "__preludejs__";

export interface CacheKeyData {
  appId: string;
}

export class CacheKey {
  public appId: string;

  constructor(
    data: CacheKeyData,
    public prefix: string = CACHE_KEY_PREFIX,
  ) {
    this.appId = data.appId;
  }

  toKey(): string {
    return [this.prefix, this.appId].filter(Boolean).join("::");
  }

  static fromKey(key: string): CacheKey {
    const [prefix, appId] = key.split("::");

    return new CacheKey({ appId }, prefix);
  }
}

export interface CacheEntry {
  access_token: string;
  expires_at: number;
  app_id: string;
}

export interface WrappedCacheEntry {
  body: CacheEntry;
  expiresAt: number;
}

export interface KeyManifestEntry {
  keys: string[];
}

export type Cacheable = WrappedCacheEntry | KeyManifestEntry;

export type MaybePromise<T> = Promise<T> | T;

export interface ICache {
  set<T = Cacheable>(key: string, entry: T): MaybePromise<void>;
  get<T = Cacheable>(key: string): MaybePromise<T | undefined>;
  remove(key: string): MaybePromise<void>;
  allKeys?(): MaybePromise<string[]>;
}
