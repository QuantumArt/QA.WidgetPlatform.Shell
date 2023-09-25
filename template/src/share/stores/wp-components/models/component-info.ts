import { IGraphQLClient } from "@quantumart/qp8-widget-platform-bridge";

export interface IStaticPropsEnvironment {
  href: string;
  graphQLClient: IGraphQLClient;
}

export interface IComponentInfo {
  url?: string;
  moduleName: string;
  componentAlias: string;
}
