import * as esbuild from "esbuild";
import { parseBuildArgs } from "./build-utils.mjs";

const { mode } = parseBuildArgs();

const defaultOptions = {
  logLevel: "info",
  bundle: true,
  format: "esm",
  publicPath: ".",
  outdir: "dist",
  assetNames: "assets/[name]",
  chunkNames: "chunks/[name]",
  entryNames: "[dir]/[name]",
};

const modeOptions = {
  dev: {
    minify: false,
    sourcemap: "external",
  },
  prod: {
    minify: true,
  },
};

// Bundle the package entry point
await esbuild.build({
  ...defaultOptions,
  entryPoints: ["src/index.ts"],
  ...modeOptions[mode],
});

// Generate base64 dataurl inlined version of the core `.wasm` asset
await esbuild.build({
  ...defaultOptions,
  minify: true,
  entryPoints: ["src/core/index_bg.wasm"],
  loader: {
    ".wasm": "dataurl",
  },
  entryNames: "core",
  ...modeOptions[mode],
});

// Copy the core `.wasm` asset
await esbuild.build({
  ...defaultOptions,
  bundle: false,
  entryPoints: ["src/core/index_bg.wasm"],
  minify: true,
  loader: {
    ".wasm": "copy",
  },
  entryNames: "core",
  ...modeOptions[mode],
});
