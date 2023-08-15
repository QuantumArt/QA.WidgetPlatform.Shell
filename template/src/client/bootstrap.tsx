import React from 'react';
import App from './App';
import Page from './components/page/page';
import ReactDOMClient from 'react-dom/client';
import EventBus from 'js-event-bus';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { loadSettingsFromFile } from '../utilities/settings-loader';
import { WidgetPlatformStore } from 'src/share/stores/widget-platform-context/widget-platform-context-store';
import {
  WPApiStore,
  SiteStructureStore,
  IAppSettingsShell,
} from '@quantumart/qp8-widget-platform-shell-core';
import { DynamicWPComponentsStore } from 'src/share/stores/wp-components/realizations/dynamic-wpc-store';
import { StaticWPComponentsStore } from 'src/share/stores/wp-components/realizations/static-wpc-store';
import { IWPComponentStore } from 'src/share/stores/wp-components/wp-component-store';
import { NotFoundComponent } from './components/not-found/not-found-component';
import { IEventBusStore, IGraphQLClient } from '@quantumart/qp8-widget-platform-bridge';
import { GraphQLClient } from 'src/share/stores/graphql-client/graphql-client';

interface IProps {
  appSettings: IAppSettingsShell;
  wpApiStore: WPApiStore;
  eventBusStore: IEventBusStore;
  wpStore: WidgetPlatformStore;
  siteStructureStore: SiteStructureStore;
  wpComponentStore: IWPComponentStore;
  graphQLClient: IGraphQLClient;
}

const prepareClientApp = async (): Promise<IProps> => {
  const appSettings = await loadSettingsFromFile();
  const wpApiStore = new WPApiStore(appSettings);

  const eventBusStore = new EventBus();

  const wpComponentStore = appSettings.useDynamicModules
    ? new DynamicWPComponentsStore()
    : new StaticWPComponentsStore();

  const siteStructureStore = new SiteStructureStore(
    wpApiStore,
    appSettings,
    Page,
    NotFoundComponent,
  );
  await siteStructureStore.init();

  const graphQLClient = new GraphQLClient(appSettings.widgetsPlatform?.graphql);

  const wpStore = new WidgetPlatformStore(
    wpApiStore,
    siteStructureStore.structure,
    wpComponentStore,
    appSettings,
    graphQLClient,
  );
  await wpStore.preloadProps(location.href.substring(location.origin.length));

  return {
    appSettings,
    wpApiStore,
    eventBusStore,
    wpStore,
    siteStructureStore,
    wpComponentStore,
    graphQLClient,
  };
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
          eventBusStore={props.eventBusStore}
          widgetsStore={props.wpComponentStore}
          graphQLClient={props.graphQLClient}
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
