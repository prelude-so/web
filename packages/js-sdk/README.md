# @prelude.so/js-sdk

Prelude's web SDK.

## Installation

```bash
npm install @prelude.so/js-sdk
```

## Entrypoints

This package contains several entrypoints (from the `package.json` file's `exports` field):

```JSON
".": {
  "default": "./dist/default/main/index.js",
  "types": "./dist/types/index.d.ts"
},
"./slim": {
  "default": "./dist/slim/main/index.js",
  "types": "./dist/types/index.d.ts"
},
"./signals": {
  "default": "./dist/default/signals/index.js",
  "types": "./dist/types/signals/index.d.ts"
},
"./signals/slim": {
  "default": "./dist/slim/signals/index.js",
  "types": "./dist/types/signals/index.d.ts"
},
"./session": {
  "default": "./dist/default/session/index.js",
  "types": "./dist/types/session/index.d.ts"
},
"./session/slim": {
  "default": "./dist/slim/session/index.js",
  "types": "./dist/types/session/index.d.ts"
}
```

You can either import from the default `@prelude.so/js-sdk` entrypoint, or use the following:
- `@prelude.so/js-sdk/session`: the session SDK client. Useful to use Prelude's session core API to authenticate your apps.
- `@prelude.so/js-sdk/signals`: minimum library to dispatch browser signals to Prelude's platform while using our SDKs.

## How to use

### Session client initialization

```javascript
import { PrldSessionClient } from "@prelude.so/js-sdk/session";

const client = new PrldSessionClient({appId: <your-prelude-session-app-id>});
```

### Signals dispatch

```javascript
import { dispatchSignals } from "@prelude.so/js-sdk/signals";

await const dispatchId = dispatchSignals(<your-prelude-sdk-key>);
```

## Optimizing bundle size

This package contains **wasm** code. In the default entrypoints, the **wasm** is inlined in the javascript file.
If you want to optimize your bundle size, then you should configure your bundler to copy the wasm file in your outputs.
Then you can use the **slim** version of the entrypoints instead of the default ones:

```javascript
import { PrldSessionClient } from "@prelude.so/js-sdk/session/slim";

const client = new PrldSessionClient({appId: <your-prelude-session-app-id>});
```
