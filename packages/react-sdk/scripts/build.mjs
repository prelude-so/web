import * as esbuild from "esbuild";
import { parseBuildArgs } from "./build-utils.mjs";

const { mode } = parseBuildArgs();

const defaultOptions = {
  logLevel: "info",
  bundle: true,
  format: "esm",
  entryPoints: ["src/index.ts"],
  publicPath: ".",
  assetNames: "assets/[name]",
  chunkNames: "chunks/[name]-[hash]",
  entryNames: "[dir]/[name]",
  external: ["react", "react/jsx-runtime", "react-dom", "@prelude.so/js-sdk", "@prelude.so/js-sdk/slim"],
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

// Slim entrypoint
await esbuild.build({
  ...defaultOptions,
  outdir: "dist/slim",
  alias: {
    "@prelude.so/js-sdk": "@prelude.so/js-sdk/slim",
  },
  ...modeOptions[mode],
});
// Inline entrypoint
await esbuild.build({
  ...defaultOptions,
  outdir: "dist/inline",
  ...modeOptions[mode],
});
