import { initWasmModule } from "#core-worker-utils";
import { generate_payload, get_default_endpoint, get_dispatch_id, get_version } from "@prelude.so/core";
import { CORE_LOAD_LOCK_KEY } from "./constants";
import { SafeLock } from "./lock";
import Signals from "./signals/signals";
import type { MessageEventData } from "./worker/types";

const workerTimeout = 10_000;

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
  rejectors: Map<string, (reason?: Error) => void> = new Map<string, (reason?: Error) => void>();

  constructor() {
    const isBrowserLike = typeof window !== "undefined";
    if (!isBrowserLike) {
      throw new Error("@prelude.so/js-sdk must be used in a browser-like environment");
    }

    try {
      const url: unknown = import.meta.url;
      if (url && typeof url === "string" && !url.startsWith("file://")) {
        this.worker = new Worker(new URL("./core-worker.js", import.meta.url), { type: "module" });
      } else {
        // Browser / bundler not compatible with module worker, e.g. webpack
        this.worker = new Worker(new URL("./core-worker.js", import.meta.url));
      }
      this.worker.onerror = (e: ErrorEvent | unknown) => {
        let err: Error | null = new Error("Unknown core worker error");

        if (e !== null && typeof e === "object" && "error" in e) {
          if (e.error instanceof Error) {
            err = e.error;
            console.error("@prelude.so/js-sdk core worker error:", e.error.message);
          } else {
            err.cause = e.error;
            console.error("@prelude.so/js-sdk core worker error:", e.error);
          }
        } else {
          // Unknown error, here we unset the worker to use fallback
          this.worker = undefined;
          console.error("@prelude.so/js-sdk core worker unknown error, using fallback");
        }
        for (const [promiseId, rejector] of this.rejectors) {
          rejector(err);
          this.rejectors.delete(promiseId);
          this.resolvers.delete(promiseId);
        }
      };
    } catch {
      // Browser / bundler not compatible worker, falling back on main thread
      console.error("@prelude.so/js-sdk core worker could not be instantiated, using fallback");
    }

    if (this.worker) {
      this.worker.addEventListener("message", (e: MessageEvent<MessageEventData>) => {
        const promiseId = e.data.promiseId;
        if (e.data.error) {
          const rejector = this.rejectors.get(promiseId);
          if (rejector) {
            switch (e.data.type) {
              case "generate_payload":
                rejector(new Error("Error while executing generate_payload in worker"));
                break;
              case "get_default_endpoint":
                rejector(new Error("Error while executing get_default_endpoint in worker"));
                break;
              case "get_dispatch_id":
                rejector(new Error("Error while executing get_dispatch_id in worker"));
                break;
              case "get_version":
                rejector(new Error("Error while executing get_version in worker"));
                break;
              case "init":
                this.coreReady = false;
                rejector(new Error("Error while executing init in worker"));
                break;
              default:
                this.rejectors.delete(promiseId);
                this.resolvers.delete(promiseId);
                throw Error("Unkown worker message type");
            }
            this.rejectors.delete(promiseId);
            this.resolvers.delete(promiseId);
          }
        } else {
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
                this.resolvers.delete(promiseId);
                this.rejectors.delete(promiseId);
                throw Error("Unkown worker message type");
            }
            this.resolvers.delete(promiseId);
            this.rejectors.delete(promiseId);
          }
        }
      });
    }
  }

  _workerPromiseWithTimeout(promiseId: string): Promise<ResolvableValue> {
    const workerPromise = new Promise<ResolvableValue>((resolve, reject) => {
      this.resolvers.set(promiseId, resolve);
      this.rejectors.set(promiseId, reject);
    });

    let timeoutId: ReturnType<typeof setTimeout>;
    const workerPromiseWithTimeout = Promise.race([
      workerPromise,
      new Promise<ResolvableValue>((_, reject) => {
        timeoutId = setTimeout(() => {
          this.resolvers.delete(promiseId);
          this.rejectors.delete(promiseId);
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
      throw new Error("@prelude.so/js-sdk must be used in a browser-like environment");
    }

    let compileError: null | Error = null;

    const promise = await this.loadLock.acquireLockAndRun(async () => {
      if (this.coreReady) {
        return;
      }

      if (this.worker) {
        const promiseId = generatePromiseId();
        const workerPromise = new Promise<void>((resolve, reject) => {
          this.resolvers.set(promiseId, resolve);
          this.rejectors.set(promiseId, reject);
        });

        let timeoutId: ReturnType<typeof setTimeout>;
        const workerPromiseWithTimeout = Promise.race([
          workerPromise,
          new Promise<void>((_, reject) => {
            timeoutId = setTimeout(() => {
              this.resolvers.delete(promiseId);
              this.rejectors.delete(promiseId);
              this.coreReady = false;
              compileError = new Error("Timeout when initiating core worker");
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
