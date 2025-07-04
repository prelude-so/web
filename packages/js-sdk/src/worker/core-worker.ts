import { initWasmModule } from "#core-worker-utils";
import { generate_payload, get_default_endpoint, get_dispatch_id, get_version } from "@prelude.so/core";
import type { MessageEventData } from "./types";

if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
  self.onmessage = async (e: MessageEvent<MessageEventData>) => {
    const { promiseId, type } = e.data;

    switch (type) {
      case "generate_payload":
        self.postMessage({
          type,
          promiseId,
          result: generate_payload(e.data.signals),
        });
        break;
      case "get_default_endpoint":
        self.postMessage({
          type,
          promiseId,
          result: get_default_endpoint(),
        });
        break;
      case "get_dispatch_id":
        self.postMessage({ type, promiseId, result: get_dispatch_id() });
        break;
      case "get_version":
        self.postMessage({ type, promiseId, result: get_version() });
        break;
      case "init":
        await initWasmModule();
        self.postMessage({ type, promiseId });
        break;
      default:
        throw Error("Worker: unkown message type");
    }
  };
}
