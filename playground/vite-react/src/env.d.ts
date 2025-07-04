// src/env.d.ts
interface ImportMetaEnv {
  readonly VITE_PRELUDE_SDK_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
