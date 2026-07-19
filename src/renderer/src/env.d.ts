/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __GIT_REVISION__: string;
declare const __GIT_BRANCH__: string;

declare module "*.ogg" {
  const src: string;
  export default src;
}

declare module "*.wav" {
  const src: string;
  export default src;
}
