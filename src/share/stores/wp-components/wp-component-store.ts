import React from 'react';
import { IComponentInfo } from './models/component-info';
import { WPComponentProps } from './models/wp-component';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

export interface IWPComponentStore {
  getComponent(info: IComponentInfo): (props: WPComponentProps) => JSX.Element;
  getStaticPropsHandler(
    info: IComponentInfo,
    wpProps: { [key: string]: unknown },
    apolloClient?: ApolloClient<NormalizedCacheObject>,
  ): Promise<{ [key: string]: unknown }>;
}

export const WPComponentsStoreContext = React.createContext<IWPComponentStore | undefined>(
  undefined,
);

export const useWpcStore = (): IWPComponentStore => React.useContext(WPComponentsStoreContext)!;
