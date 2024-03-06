export interface IWPMeta {
  title: string;
  description?: string;
  keywords?: string;
  tags: { [key: string]: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMeta(wpProps: any): IWPMeta {
  const result: IWPMeta = {
    title: wpProps?.title?.value ?? '',
    tags: {},
  };
  if (!wpProps) {
    return result;
  }

  result.description = wpProps.metadescription?.value;
  result.keywords = wpProps.keywords?.value;

  //TODO сделать разбор тегов

  return result;
}
