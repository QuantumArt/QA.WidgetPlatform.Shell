import { HelmetServerState } from 'react-helmet-async';

export interface IHelmetString {
  title: string;
  base: string;
  bodyAttributes: string;
  htmlAttributes: string;
  link: string;
  meta: string;
  noscript: string;
  script: string;
  style: string;
}

export const convertHelmetToString = (helmet: HelmetServerState): IHelmetString => ({
  title: helmet.title.toString(),
  base: helmet.base.toString(),
  bodyAttributes: helmet.bodyAttributes.toString(),
  htmlAttributes: helmet.htmlAttributes.toString(),
  link: helmet.link.toString(),
  meta: helmet.meta.toString(),
  noscript: helmet.noscript.toString(),
  script: helmet.script.toString(),
  style: helmet.style.toString(),
});
