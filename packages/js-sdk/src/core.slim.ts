import initWasm, {
  generate_payload,
  get_default_endpoint,
  get_dispatch_id,
  get_version,
} from "@prelude.so/core/slim";
// @ts-ignore
import wasm from "@prelude.so/core/index_bg.wasm";
import Signals from "./signals/signals";

export const generatePayload = async (signals: Signals) => {
  await initWasm(wasm);
  return generate_payload(signals);
};

export const getDefaultEndpoint = async () => {
  await initWasm(wasm);
  return get_default_endpoint();
};

export const getDispatchId = async () => {
  await initWasm(wasm);
  return get_dispatch_id();
};

export const getVersion = async () => {
  await initWasm(wasm);
  return get_version();
};
