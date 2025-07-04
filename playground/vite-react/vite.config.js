import { defineConfig } from "vite";

export default defineConfig({
  // If you're using a slim @prelude.so/js-sdk entrypoint, then you'll have to copy the `.wasm` core as a static asset in your bundle.
  assetsInclude: ["./node_modules/@prelude.so/**/*.wasm"],
  // Vite dev server config
  optimizeDeps: {
    // @prelude.so/js-sdk uses a web worker. Vite dev server does not handle optimization of web worker files.
    exclude: ["@prelude.so/js-sdk"],
    // As per Vite's docs, a commonJS sub dependency of a dependency should be optimized.
    include: ["@prelude.so/js-sdk > browser-tabs-lock"],
  },
  // Vitest config
  test: {
    // @prelude.so/js-sdk should only be used in browser like environments.
    environment: "jsdom",
    // If you're using a slim @prelude.so/js-sdk entrypoint, in vitest it's better to resolve the inline one to avoid any issue with the `.wasm` asset.
    // This example config is aliasing all 3 entrypoints, but you can keep only the ones you need.
    alias: {
      "@prelude.so/js-sdk/slim": "@prelude.so/js-sdk",
      "@prelude.so/js-sdk/session/slim": "@prelude.so/js-sdk/session",
      "@prelude.so/js-sdk/signals/slim": "@prelude.so/js-sdk/signals",
    },
  },
});
