import React from 'react';
import { IComponentInfo } from './models/component-info';
import { WPComponentProps } from './models/wp-component';
import { IGraphQLClient } from '@quantumart/qp8-widget-platform-bridge';

export interface IWPComponentStore {
  getComponent(info: IComponentInfo): (props: WPComponentProps) => JSX.Element;
  allowedSubpageHandler(info: IComponentInfo, tailUrl: string): Promise<boolean>;
  getStaticPropsHandler(
    info: IComponentInfo,
    wpProps: { [key: string]: unknown },
    href: string,
    graphQLClient: IGraphQLClient,
  ): Promise<{ [key: string]: unknown }>;
}

export const WPComponentsStoreContext = React.createContext<IWPComponentStore | undefined>(
  undefined,
);

export const useWpcStore = (): IWPComponentStore => React.useContext(WPComponentsStoreContext)!;
