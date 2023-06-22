import React from 'react';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { RouteObject, useRoutes } from 'react-router-dom';
import {
  SiteStructureStore,
  SiteStructureStoreContext,
  AppSettingsShellContext,
  IAppSettingsShell,
} from '@quantumart/qp8-widget-platform-shell-core';
import { Loader } from './components/loader/loader';
import {
  WidgetPlatformStore,
  WidgetPlatformStoreContext,
} from 'src/share/stores/widget-platform-context/widget-platform-context-store';
import {
  IWPComponentStore,
  WPComponentsStoreContext,
} from 'src/share/stores/wp-components/wp-component-store';
import { WPApolloClientProvider } from '@quantumart/qp8-widget-platform-bridge';
import './assets/style/style.scss';

interface IProps {
  appSettings: IAppSettingsShell;
  widgetsStore: IWPComponentStore;
  wpStore: WidgetPlatformStore;
  siteStructureStore: SiteStructureStore;
  apolloClient?: ApolloClient<NormalizedCacheObject>;
}

const SiteRoutes = (props: { routes: RouteObject[] }) => useRoutes(props.routes);

const App = (props: IProps) => {
  const [isInit, setIsInit] = React.useState(props.siteStructureStore.isInit);
  const lazyload = async (): Promise<void> => {
    await props.siteStructureStore.init();
    setIsInit(props.siteStructureStore.isInit);
  };

  React.useEffect(() => {
    if (!isInit) {
      lazyload();
    }
  }, []);

  if (isInit) {
    return (
      <AppSettingsShellContext.Provider value={props.appSettings}>
        <WidgetPlatformStoreContext.Provider value={props.wpStore}>
          <SiteStructureStoreContext.Provider value={props.siteStructureStore}>
            <WPComponentsStoreContext.Provider value={props.widgetsStore}>
              <WPApolloClientProvider client={props.apolloClient}>
                <SiteRoutes routes={props.siteStructureStore.routes} />
              </WPApolloClientProvider>
            </WPComponentsStoreContext.Provider>
          </SiteStructureStoreContext.Provider>
        </WidgetPlatformStoreContext.Provider>
      </AppSettingsShellContext.Provider>
    );
  }
  return <Loader />;
};

export default App;
