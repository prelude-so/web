import * as esbuild from "esbuild";
import { parseBuildArgs } from "./build-utils.mjs";

const { mode } = parseBuildArgs();

const defaultOptions = {
  logLevel: "info",
  bundle: true,
  entryPoints: [
    { in: "src/index.ts", out: "index" },
    { in: "src/signals/index.ts", out: "signals" },
    { in: "src/session/index.ts", out: "session" },
  ],
  publicPath: ".",
  outdir: "dist",
  assetNames: "assets/[name]",
  chunkNames: "chunks/[name]-[hash]",
  format: "esm",
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

// Slim entrypoints
await esbuild.build({
  ...defaultOptions,
  entryPoints: ["src/worker/core-worker.ts"],
  entryNames: "core-worker",
  outdir: "dist/slim",
  packages: "external",
  alias: {
    "#core-worker-utils": "./src/worker/core-worker-utils.slim",
  },
  ...modeOptions[mode],
});
await esbuild.build({
  ...defaultOptions,
  outdir: "dist/slim",
  packages: "external",
  alias: {
    "#core-worker-utils": "./src/worker/core-worker-utils.slim",
  },
  ...modeOptions[mode],
});
// Inline entrypoints
await esbuild.build({
  ...defaultOptions,
  entryPoints: ["src/worker/core-worker.ts"],
  entryNames: "core-worker",
  outdir: "dist/inline",
  alias: {
    "#core-worker-utils": "./src/worker/core-worker-utils",
  },
  ...modeOptions[mode],
});
await esbuild.build({
  ...defaultOptions,
  outdir: "dist/inline",
  packages: "external",
  alias: {
    "#core-worker-utils": "./src/worker/core-worker-utils",
  },
  ...modeOptions[mode],
});
