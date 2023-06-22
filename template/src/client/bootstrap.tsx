import React from 'react';
import App from './App';
import Page from './components/page/page';
import ReactDOMClient from 'react-dom/client';
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { loadSettingsFromFile } from '../utilities/settings-loader';
import { WidgetPlatformStore } from 'src/share/stores/widget-platform-context/widget-platform-context-store';
import { WPApiStore, SiteStructureStore, IAppSettingsShell } from '@quantumart/qp8-widget-platform-shell-core';
import { DynamicWPComponentsStore } from 'src/share/stores/wp-components/realizations/dynamic-wpc-store';
import { StaticWPComponentsStore } from 'src/share/stores/wp-components/realizations/static-wpc-store';
import { IWPComponentStore } from 'src/share/stores/wp-components/wp-component-store';

interface IProps {
  appSettings: IAppSettingsShell;
  wpApiStore: WPApiStore;
  wpStore: WidgetPlatformStore;
  siteStructureStore: SiteStructureStore;
  wpComponentStore: IWPComponentStore;
  apolloClient?: ApolloClient<NormalizedCacheObject>;
}

const prepareClientApp = async (): Promise<IProps> => {
  const appSettings = await loadSettingsFromFile();
  const wpApiStore = new WPApiStore(appSettings);

  const wpComponentStore = appSettings.useDynamicModules
    ? new DynamicWPComponentsStore()
    : new StaticWPComponentsStore();

  const siteStructureStore = new SiteStructureStore(wpApiStore, appSettings, Page);
  await siteStructureStore.init();

  let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;
  if (!!appSettings.widgetsPlatform?.graphql) {
    const headers: Record<string, string> = {};
    if (!!appSettings.widgetsPlatform.graphql.apiKey) {
      headers.apiKey = appSettings.widgetsPlatform.graphql.apiKey;
    }

    apolloClient = new ApolloClient<NormalizedCacheObject>({
      uri: appSettings.widgetsPlatform.graphql.apiUrl,
      headers: headers,
      cache: new InMemoryCache(),
    });
  }

  const wpStore = new WidgetPlatformStore(
    wpApiStore,
    siteStructureStore.structure,
    wpComponentStore,
    appSettings,
    apolloClient,
  );
  await wpStore.preloadProps(location.pathname);

  return { appSettings, wpApiStore, wpStore, siteStructureStore, wpComponentStore, apolloClient };
};

prepareClientApp().then(props => {
  const root = document.getElementById('root')!;
  const component = (
    <HelmetProvider>
      <BrowserRouter basename="/">
        <App
          appSettings={props.appSettings}
          siteStructureStore={props.siteStructureStore}
          wpStore={props.wpStore}
          widgetsStore={props.wpComponentStore}
          apolloClient={props.apolloClient}
        />
      </BrowserRouter>
    </HelmetProvider>
  );
  if (props.appSettings.ssr?.active) {
    ReactDOMClient.hydrateRoot(root, component);
  } else {
    ReactDOMClient.createRoot(root).render(component);
  }
});
