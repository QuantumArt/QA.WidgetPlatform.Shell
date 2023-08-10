/***************/
// declare Window and Global object
/***************/

declare namespace NodeJS {
  interface ProcessEnv {
    readonly wpPlatform: {
      readonly standalone: boolean;
      readonly publicPath: string;
    };
  }
}

declare namespace globalThis {
  var clearRoutes: () => void;
}

declare interface Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
