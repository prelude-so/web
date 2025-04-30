# @prelude.so/react-sdk

Prelude's web React SDK.
This package provides a Prelude's session context to any react app. More specifically, it provides session state, and methods to mutate the latter.

## Installation

```bash
npm install @prelude.so/react-sdk
```

## Entrypoints

The package contains several entrypoints (from the `package.json` file's `exports` field):

```JSON
".": {
  "default": "./dist/default/index.js",
  "types": "./dist/types/index.d.ts"
},
"./slim": {
  "default": "./dist/slim/index.js",
  "types": "./dist/types/index.d.ts"
}
```

## How to use

### Setup the React context provider

```tsx
// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { PrldSessionProvider } from '@prelude.so/react-sdk';
import App from './App';

const root = createRoot(document.getElementById('app'));

root.render(
  <PrldSessionProvider
    clientOptions={{
      appId: "<your-prelude-session-app-id>"
    }}
  >
    <App />
  </PrldSessionProvider>
);
```

### Use the context in your app

```tsx
// src/App.js
import React from 'react';
import { usePrldSession } from '@prelude.so/react-sdk';

function App() {
  const { isLoading, isAuthenticated, error, user, startOTPLogin, refresh, logout } = usePrldSession();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isAuthenticated) {
    return (
      <div>
        <pre style={pre}>{JSON.stringify(user.profile, undefined, 2)}</pre>
        <button
          type="button"
          style={button}
          onClick={async () => {
            try {
              await refresh();
            } catch (err) {
              console.error(err);
            }
          }}
        >
          Refresh
        </button>
        <button type="button" style={button} onClick={logout}>
          Logout
        </button>
      </div>
    );
  } else {
    return (
      <button
        onClick={async () => {
          await startOTPLogin({type: "phone", value: "<user-phone-number>" })
        }}
      >
        Log in
      </button>
    );
  }
}

export default App;
```

## Optimizing bundle size

This package depends on **wasm** code. In the default entrypoints, the **wasm** is inlined in the javascript file.
If you want to optimize your bundle size, then you should configure your bundler to copy the wasm file in your outputs.
Then you can use the **slim** version of the entrypoints instead of the default ones:

```javascript
import { PrldSessionProvider } from "@prelude.so/react-sdk/slim";
```
