import Lock from "browser-tabs-lock";

export function SafeLock(key: string) {
  let lock: Lock;
  if ("default" in Lock) {
    // @ts-ignore
    lock = new Lock.default();
  } else {
    lock = new Lock();
  }

  window.addEventListener("pagehide", async () => {
    await lock.releaseLock(key);
  });

  const acquireLockAndRun = async <T>(cb: () => Promise<T>): Promise<T | undefined> => {
    if ("locks" in navigator && isSecureContext) {
      const controller = new AbortController();
      const lockTimeout = setTimeout(() => controller.abort(), 4999);
      // @ts-ignore
      return await navigator.locks
        .request(key, { signal: controller.signal }, async () => {
          clearTimeout(lockTimeout);
          return await cb();
        })
        .catch(() => {
          // browser-tabs-lock never seems to throw, so we are mirroring the behavior here
          return;
        });
    }

    if (await lock.acquireLock(key, 5000)) {
      try {
        return await cb();
      } finally {
        await lock.releaseLock(key);
      }
    }

    return;
  };

  return { acquireLockAndRun };
}
