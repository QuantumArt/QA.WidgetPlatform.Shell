import React from 'react';
import { RouteObject, useRoutes } from 'react-router-dom';
import {
  SiteStructureStore,
  SiteStructureStoreContext,
  AppSettingsShellContext,
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
import {
  EventBusStoreContext,
  IEventBusStore,
  IGraphQLClient,
  WPGraphQLClientContext,
} from '@quantumart/qp8-widget-platform-bridge';
import { SplashScreen } from './components/splash-screen/splash-screen';
import { NormalizeStyles } from './styles/normalize.styles';
import { GlobalStyle } from './styles/global.styles';
import { IAppSettingsShell } from 'src/share/app-settings-shell';

interface IProps {
  appSettings: IAppSettingsShell;
  widgetsStore: IWPComponentStore;
  eventBusStore: IEventBusStore;
  wpStore: WidgetPlatformStore;
  siteStructureStore: SiteStructureStore;
  graphQLClient: IGraphQLClient;
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
          <EventBusStoreContext.Provider value={props.eventBusStore}>
            <SiteStructureStoreContext.Provider value={props.siteStructureStore}>
              <WPComponentsStoreContext.Provider value={props.widgetsStore}>
                <WPGraphQLClientContext.Provider value={props.graphQLClient}>
                  <NormalizeStyles />
                  <GlobalStyle />
                  <SplashScreen active={props.appSettings.activeSplashScreen ?? false}>
                    <SiteRoutes routes={props.siteStructureStore.routes} />
                  </SplashScreen>
                </WPGraphQLClientContext.Provider>
              </WPComponentsStoreContext.Provider>
            </SiteStructureStoreContext.Provider>
          </EventBusStoreContext.Provider>
        </WidgetPlatformStoreContext.Provider>
      </AppSettingsShellContext.Provider>
    );
  }
  return <Loader />;
};

export default App;
