import { initWasmModule } from "#core-worker-utils";
import { generate_payload, get_default_endpoint, get_dispatch_id, get_version } from "@prelude.so/core";
import { CORE_LOAD_LOCK_KEY } from "./constants";
import { SafeLock } from "./lock";
import Signals from "./signals/signals";
import type { MessageEventData } from "./worker/types";

const workerTimeout = 1000;

type ResolvableValue = Uint8Array | string;

type Resolver = (value: ResolvableValue | PromiseLike<ResolvableValue>) => void;
type VoidResolver = () => void;

function generatePromiseId() {
  return Math.random().toString(16).slice(2);
}

class Core {
  private readonly loadLock = SafeLock(CORE_LOAD_LOCK_KEY);
  worker?: Worker;
  coreReady = false;
  resolvers: Map<string, Resolver | VoidResolver> = new Map<string, Resolver>();

  constructor() {
    const isBrowserLike = typeof window !== "undefined";

    if (!isBrowserLike) {
      throw new Error("@prelude.so/js-sdk must be used in a browser like environment");
    }

    try {
      const url: unknown = import.meta.url;
      if (url && typeof url === "string" && !url.startsWith("file://")) {
        this.worker = new Worker(new URL("./core-worker.js", import.meta.url), { type: "module" });
      } else {
        // Browser / bundler not compatible with module worker, e.g. webpack
        this.worker = new Worker(new URL("./core-worker.js", import.meta.url));
      }
    } catch {
      // Browser / bundler not compatible worker, falling back on main thread
    }

    if (this.worker) {
      this.worker.addEventListener("message", (e: MessageEvent<MessageEventData>) => {
        const promiseId = e.data.promiseId;
        const resolver = this.resolvers.get(promiseId);
        if (resolver) {
          const result = e.data.result;
          switch (e.data.type) {
            case "generate_payload":
              resolver(result as Uint8Array);
              break;
            case "get_default_endpoint":
              resolver(result as string);
              break;
            case "get_dispatch_id":
              resolver(result as string);
              break;
            case "get_version":
              resolver(result as string);
              break;
            case "init":
              this.coreReady = true;
              (resolver as VoidResolver)();
              break;
            default:
              throw Error("Unkown worker message type");
          }
          this.resolvers.delete(promiseId);
        }
      });
    }
  }

  _workerPromiseWithTimeout(promiseId: string): Promise<ResolvableValue> {
    const workerPromise = new Promise<ResolvableValue>((resolve) => {
      this.resolvers.set(promiseId, resolve);
    });

    let timeoutId: ReturnType<typeof setTimeout>;
    const workerPromiseWithTimeout = Promise.race([
      workerPromise,
      new Promise<ResolvableValue>((_, reject) => {
        timeoutId = setTimeout(() => {
          this.resolvers.delete(promiseId);
          reject(new Error("Timeout when awaiting worker"));
        }, workerTimeout);
      }),
    ]);
    workerPromiseWithTimeout.finally(() => {
      clearTimeout(timeoutId);
    });

    return workerPromiseWithTimeout;
  }

  async loadCore(): Promise<void> {
    const isBrowserLike = typeof window !== "undefined";

    if (!isBrowserLike) {
      this.coreReady = false;
      throw new Error("@prelude.so/js-sdk must be used in a browser like environment");
    }

    let compileError: null | Error = null;

    const promise = await this.loadLock.acquireLockAndRun(async () => {
      if (this.coreReady) {
        return;
      }

      if (this.worker) {
        const promiseId = generatePromiseId();
        const workerPromise = new Promise<void>((resolve) => {
          this.resolvers.set(promiseId, resolve);
        });

        let timeoutId: ReturnType<typeof setTimeout>;
        const workerPromiseWithTimeout = Promise.race([
          workerPromise,
          new Promise<void>((_, reject) => {
            timeoutId = setTimeout(() => {
              this.resolvers.delete(promiseId);
              this.coreReady = false;
              compileError = new Error("Timeout when awaiting worker");
              reject(compileError);
            }, workerTimeout);
          }),
        ]);
        workerPromiseWithTimeout.finally(() => {
          clearTimeout(timeoutId);
        });

        this.worker.postMessage({ type: "init", promiseId });

        return workerPromiseWithTimeout;
      }

      // Fallback if no worker available or worker fails
      try {
        await initWasmModule();
        this.coreReady = true;
      } catch (e) {
        this.coreReady = false;
        compileError = e as null | Error;
      }
    });

    if (compileError) {
      throw compileError;
    }

    return promise;
  }

  async generatePayload(signals: Signals): Promise<Uint8Array> {
    await this.loadCore();

    if (this.worker) {
      const promiseId = generatePromiseId();
      this.worker.postMessage({ type: "generate_payload", promiseId, signals });
      return (await this._workerPromiseWithTimeout(promiseId)) as Uint8Array;
    }

    return generate_payload(signals);
  }

  async getDefaultEndpoint(): Promise<string> {
    await this.loadCore();

    if (this.worker) {
      const promiseId = generatePromiseId();
      this.worker.postMessage({ type: "get_default_endpoint", promiseId });
      return (await this._workerPromiseWithTimeout(promiseId)) as string;
    }

    return get_default_endpoint();
  }

  async getDispatchId(): Promise<string> {
    await this.loadCore();

    if (this.worker) {
      const promiseId = generatePromiseId();
      this.worker.postMessage({ type: "get_dispatch_id", promiseId });
      return (await this._workerPromiseWithTimeout(promiseId)) as string;
    }

    return get_dispatch_id();
  }

  async getVersion(): Promise<string> {
    await this.loadCore();

    if (this.worker) {
      const promiseId = generatePromiseId();
      this.worker.postMessage({ type: "get_version", promiseId });
      return (await this._workerPromiseWithTimeout(promiseId)) as string;
    }

    return get_version();
  }
}

export const core: Core = new Core();
