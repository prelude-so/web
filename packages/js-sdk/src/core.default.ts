import initWasm, {
  generate_payload,
  get_default_endpoint,
  get_dispatch_id,
  get_version,
} from "@prelude.so/core";
import Signals from "./signals/signals";

export const generatePayload = async (signals: Signals) => {
  await initWasm();
  return generate_payload(signals);
};

export const getDefaultEndpoint = async () => {
  await initWasm();
  return get_default_endpoint();
};

export const getDispatchId = async () => {
  await initWasm();
  return get_dispatch_id();
};

export const getVersion = async () => {
  await initWasm();
  return get_version();
};
