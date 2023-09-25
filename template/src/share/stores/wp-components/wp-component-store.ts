import React from 'react';
import { IComponentInfo, IStaticPropsEnvironment } from './models/component-info';
import { WPComponentProps } from './models/wp-component';

export interface IWPComponentStore {
  getComponent(info: IComponentInfo): (props: WPComponentProps) => JSX.Element;
  allowedSubpageHandler(
    info: IComponentInfo,
    tailUrl: string,
    wpProps: { [key: string]: unknown },
  ): Promise<boolean>;
  getStaticPropsHandler(
    info: IComponentInfo,
    wpProps: { [key: string]: unknown },
    staticPropsEnvironment: IStaticPropsEnvironment,
  ): Promise<{ [key: string]: unknown }>;
}

export const WPComponentsStoreContext = React.createContext<IWPComponentStore | undefined>(
  undefined,
);

export const useWpcStore = (): IWPComponentStore => React.useContext(WPComponentsStoreContext)!;
