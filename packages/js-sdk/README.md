# @prelude.so/js-sdk

Prelude's web SDK.

## Installation

```bash
npm install @prelude.so/js-sdk
```

This package contains several entrypoints (from the `package.json` file's `exports` field):

```JSON
".": {
  "types": "./dist/types/index.d.ts",
  "default": "./dist/inline/index.js"
},
"./slim": {
  "types": "./dist/types/index.d.ts",
  "default": "./dist/slim/index.js"
},
"./signals": {
  "types": "./dist/types/signals/index.d.ts",
  "default": "./dist/inline/signals.js"
},
"./signals/slim": {
  "types": "./dist/types/signals/index.d.ts",
  "default": "./dist/slim/signals.js"
},
"./session": {
  "types": "./dist/types/session/index.d.ts",
  "default": "./dist/inline/session.js"
},
"./session/slim": {
  "types": "./dist/types/session/index.d.ts",
  "default": "./dist/slim/session.js"
}
```

You can either import from the default `@prelude.so/js-sdk` entrypoint, or use the following:
- `@prelude.so/js-sdk/session`: the session SDK client. Useful to use Prelude's session core API to authenticate your apps.
- `@prelude.so/js-sdk/signals`: minimum library to dispatch browser signals to Prelude's platform while using our SDKs.

**This package contains **wasm** code**
In the default entrypoints, the **wasm** is inlined in the javascript file as a base64 data url.
If you want to optimize your bundle size, you can use the **slim** version of the entrypoints (check previous code block) instead of the inline ones.
This require further configuration, please refer to specific comments in the next section.

## Configuration

`@prelude.so/js-sdk` contains a web worker and `.wasm` code. This means if you are developping a bundled web app, you'll need some setup steps to make it work. This section explains those steps for different bundlers.

### Vite & Vitest

Here's an example config with comments to explain the configuration:

```javascript
{
  // If you're using a `/slim` entrypoint,
  // then you'll have to copy the `.wasm` core as a static asset in your bundle.
  assetsInclude: ["**/node_modules/@prelude.so/**/*.wasm"],
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
    // If you're using a slim @prelude.so/js-sdk entrypoint,
    // in vitest it's better to resolve the inline one to avoid any issue with the `.wasm` asset.
    // This example config is aliasing all 3 entrypoints, but you can keep only the ones you need.
    alias: {
      "@prelude.so/js-sdk/slim": "@prelude.so/js-sdk",
      "@prelude.so/js-sdk/session/slim": "@prelude.so/js-sdk/session",
      "@prelude.so/js-sdk/signals/slim": "@prelude.so/js-sdk/signals",
    },
  },
}
```

### esbuild

To include the web worker in your bundle, you can use [@chialab/esbuild-plugin-meta-url](npmjs.com/package/@chialab/esbuild-plugin-meta-url):

```javascript
import metaUrlPlugin from "@chialab/esbuild-plugin-meta-url";
import * as esbuild from "esbuild";

await esbuild.build({
  // your config
  loader: {
    // your loaders
    //
    // If you're using a `/slim` entrypoint,
    // then you'll have to copy the `.wasm` core as a static asset in your bundle.
    ".wasm": "file",
  },
  plugins: [
    // This will recognize the worker file in @prelude.so/js-sdk as an entrypoint and bundle it
    metaUrlPlugin(),
    // your plugins
  ],
  // your config
})
```

### webpack

Here's how to configure webpack to copy the `.wasm` asset in your bundle:

```javascript
module.exports = {
  // your config
  module: {
    rules: [
      // your rules
      // If you're using a `/slim` entrypoint, then you'll have to copy the `.wasm` core as a static asset in your bundle.
      {
        test: /\.wasm$/,
        include: [path.resolve(__dirname, "node_modules/@prelude.so/core")],
        type: "asset/resource",
      },
      //  your rules
    ],
  },
  // your config
}
```

## How to use

### Session client initialization

```javascript
import { PrldSessionClient } from "@prelude.so/js-sdk/session";

const client = new PrldSessionClient({
  appId: "<your-prelude-session-app-id>",
  sdkKey: "<your-sdk-key>" // To automatically dispatch device signals upon login
});
```

### Signals dispatch

> Note: if you're using the session client with your SDK key configured you don't need to call this.

```javascript
import { dispatchSignals } from "@prelude.so/js-sdk/signals";

await const dispatchId = dispatchSignals(<your-prelude-sdk-key>);
```
