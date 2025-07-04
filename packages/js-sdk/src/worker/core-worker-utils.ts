import { initSync } from "@prelude.so/core";
// @ts-ignore
import wasm from "@prelude.so/core/core.js";

export const initWasmModule = async () => {
  const res = await fetch(wasm);
  const buffer = await res.arrayBuffer();
  const wasmModule = await WebAssembly.compile(buffer);
  initSync({ module: wasmModule });
};
