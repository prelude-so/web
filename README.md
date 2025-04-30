# Prelude Web

This directory is the NPM workspace hosting Prelude's code intended for use in the browser.
All workspaces are located in the `packages/` directory.

## @prelude.so/prelude-core

This package contains proprietary core features compiled into Wasm.

## @prelude.so/js-sdk

This is a public NPM package located in `packages/js-sdk/`. It contains several entrypoints:
- **main**: includes all the following entrypoints
- **signals**: includes the `dispatchSignals` function
- **session**: includes the session client

## @prelude.so/react-sdk

This is a public NPM package located in `packages/react-sdk`. It depends on `@prelude.so/js-sdk`.
The React SDK that provides a Prelude's session context to any react app. More specifically, it provides session state, and methods to mutate the latter.

## @prelude.so/demo-server

This is a private NPM package for internal use only. It depends on `@prelude.so/js-sdk/signals` and our node sdk, `@prelude.so/sdk`.
It contains an **expressjs** server serving an example app that will dispatch signals to the Prelude platform and perform OTP operations.
This server will look for the `DEMO_SDK_KEY` and `DEMO_API_KEY` environment variables which needs to be set for the server to run. Once set just run `npm run dev-server` to start it and navigate to the default page (`localhost:3000` by default). In this initial version, this default page will load the signals SDK and report the signals to the backend on page load.

## How to build

:warning: Update the versions in the right `package.json` files before building.

- First `npm run build -w @prelude.so/js-sdk`
- Then install react SDK `npm install -w @prelude.so/react-sdk` since it depends on `@prelude.so/js-sdk` (not necessary needed since there is symbolic links in the npm workspace)
- Then `npm run build -w @prelude.so/react-sdk`

## How to publish

:warning: Update the versions in the right `package.json` files and build before publishing.