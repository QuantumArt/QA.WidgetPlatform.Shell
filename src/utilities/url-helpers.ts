export const enrichmentHash = (path: string): string =>
  !path || path.indexOf('?') > -1 ? path : `${path}?salt=${new Date().valueOf()}`;
