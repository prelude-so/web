import { initWasmModule } from "#core-worker-utils";
import { generate_payload, get_default_endpoint, get_dispatch_id, get_version } from "@prelude.so/core";
import type { IMessageEventData, MessageEventData } from "./types";
import { normalizeError } from "../errors";

const handleError = (e: unknown, message: string, eventProps: IMessageEventData) => {
  const err = normalizeError(message, e);
  console.error(`@prelude.so/js-sdk ${message}:`, err.message);
  self.postMessage({
    ...eventProps,
    error: err,
  });
};

if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
  self.onmessage = async (e: MessageEvent<MessageEventData>) => {
    const { promiseId, type } = e.data;

    switch (type) {
      case "generate_payload":
        try {
          self.postMessage({
            type,
            promiseId,
            result: generate_payload(e.data.signals),
          });
        } catch (e) {
          handleError(e, "Core worker generate_payload", {
            type,
            promiseId,
          });
        }
        break;
      case "get_default_endpoint":
        try {
          self.postMessage({
            type,
            promiseId,
            result: get_default_endpoint(),
          });
        } catch (e) {
          handleError(e, "Core worker get_default_endpoint", {
            type,
            promiseId,
          });
        }
        break;
      case "get_dispatch_id":
        try {
          self.postMessage({ type, promiseId, result: get_dispatch_id() });
        } catch (e) {
          handleError(e, "Core worker get_dispatch_id", {
            type,
            promiseId,
          });
        }
        break;
      case "get_version":
        try {
          self.postMessage({ type, promiseId, result: get_version() });
        } catch (e) {
          handleError(e, "Core worker get_version", {
            type,
            promiseId,
          });
        }
        break;
      case "init":
        try {
          await initWasmModule();
          self.postMessage({ type, promiseId });
        } catch (e) {
          handleError(e, "Core worker init", {
            type,
            promiseId,
          });
        }
        break;
      default:
        throw Error("Worker: unkown message type");
    }
  };
}
