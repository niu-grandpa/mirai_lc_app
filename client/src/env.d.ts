/// <reference types="@rsbuild/core/types" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  // biome-ignore lint/complexity/noBannedTypes: reason
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  readonly PUBLIC_ENV: string;
  readonly PUBLIC_PROXY: string;
  readonly PUBLIC_API_PREFIX: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
