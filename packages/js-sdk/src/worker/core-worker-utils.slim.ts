import { init } from "@prelude.so/core";
// @ts-ignore
import wasm from "@prelude.so/core/core.wasm";

export const initWasmModule = async () => {
  const res = await fetch(wasm);
  const buffer = await res.arrayBuffer();
  await init({ module_or_path: buffer });
};
