import { DEFAULT_NOW_PROVIDER } from "../../constants";
import { CacheKeyManifest } from "./key-manifest";

import { CacheEntry, ICache, CacheKey, CACHE_KEY_PREFIX, WrappedCacheEntry } from "./shared";

export class CacheManager {
  private nowProvider: () => number | Promise<number>;

  constructor(
    private cache: ICache,
    private keyManifest?: CacheKeyManifest,
    nowProvider?: () => number | Promise<number>,
  ) {
    this.nowProvider = nowProvider ?? DEFAULT_NOW_PROVIDER;
  }

  async get(cacheKey: CacheKey): Promise<CacheEntry | undefined> {
    let wrappedEntry = await this.cache.get<WrappedCacheEntry>(cacheKey.toKey());

    if (!wrappedEntry) {
      const keys = await this.getCacheKeys();

      if (!keys) return;

      const matchedKey = this.matchExistingCacheKey(cacheKey, keys);

      if (matchedKey) {
        wrappedEntry = await this.cache.get<WrappedCacheEntry>(matchedKey);
      }
    }

    // If we still don't have an entry, exit.
    if (!wrappedEntry) {
      return;
    }

    const now = await this.nowProvider();
    const nowSeconds = Math.floor(now / 1000);

    if (wrappedEntry.expiresAt < nowSeconds) {
      await this.cache.remove(cacheKey.toKey());
      await this.keyManifest?.remove(cacheKey.toKey());

      return;
    }

    return wrappedEntry.body;
  }

  async getWithoutExpirationCheck(cacheKey: CacheKey): Promise<CacheEntry | undefined> {
    let wrappedEntry = await this.cache.get<WrappedCacheEntry>(cacheKey.toKey());

    if (!wrappedEntry) {
      const keys = await this.getCacheKeys();

      if (!keys) return;

      const matchedKey = this.matchExistingCacheKey(cacheKey, keys);

      if (matchedKey) {
        wrappedEntry = await this.cache.get<WrappedCacheEntry>(matchedKey);
      }
    }

    // If we still don't have an entry, exit.
    if (!wrappedEntry) {
      return;
    }

    return wrappedEntry.body;
  }

  async set(entry: CacheEntry): Promise<void> {
    const cacheKey = new CacheKey({
      appId: entry.app_id,
    });

    const wrappedEntry = await this.wrapCacheEntry(entry);

    await this.cache.set(cacheKey.toKey(), wrappedEntry);
    await this.keyManifest?.add(cacheKey.toKey());
  }

  async invalidate(cacheKey: CacheKey): Promise<void> {
    let wrappedEntry = await this.cache.get<WrappedCacheEntry>(cacheKey.toKey());

    let matchedKey = cacheKey.toKey();
    if (!wrappedEntry) {
      const keys = await this.getCacheKeys();

      if (!keys) return;

      matchedKey = this.matchExistingCacheKey(cacheKey, keys);

      if (matchedKey) {
        wrappedEntry = await this.cache.get<WrappedCacheEntry>(matchedKey);
      }
    }

    // If we still don't have an entry, exit.
    if (!wrappedEntry) {
      return;
    }

    const now = await this.nowProvider();
    const nowSeconds = Math.floor(now / 1000);

    wrappedEntry = {
      body: wrappedEntry.body,
      expiresAt: nowSeconds - 1,
    };
    await this.cache.set(matchedKey, wrappedEntry);
    await this.keyManifest?.add(matchedKey);
  }

  async clear(appId?: string): Promise<void> {
    const keys = await this.getCacheKeys();

    if (!keys) return;

    await keys
      .filter((key) => (appId ? key.includes(appId) : true))
      .reduce(async (memo, key) => {
        await memo;
        await this.cache.remove(key);
      }, Promise.resolve());

    await this.keyManifest?.clear();
  }

  private async wrapCacheEntry(entry: CacheEntry): Promise<WrappedCacheEntry> {
    return {
      body: entry,
      expiresAt: entry.expires_at,
    };
  }

  private async getCacheKeys(): Promise<string[] | undefined> {
    if (this.keyManifest) {
      return (await this.keyManifest.get())?.keys;
    } else if (this.cache.allKeys) {
      return this.cache.allKeys();
    }
  }

  private matchExistingCacheKey(keyToMatch: CacheKey, allKeys: string[]) {
    return allKeys.filter((key) => {
      const cacheKey = CacheKey.fromKey(key);

      return cacheKey.prefix === CACHE_KEY_PREFIX && cacheKey.appId === keyToMatch.appId;
    })[0];
  }
}
