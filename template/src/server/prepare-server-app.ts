import Page from 'src/client/components/page/page';
import EventBus from 'js-event-bus';
import NotFoundPage from 'src/client/components/not-found-page/not-found-page';
import { WPApiStore, SiteStructureStore } from '@quantumart/qp8-widget-platform-shell-core';
import { WidgetPlatformStore } from 'src/share/stores/widget-platform-context/widget-platform-context-store';
import { IWPComponentStore } from 'src/share/stores/wp-components/wp-component-store';
import { StaticWPComponentsStore } from 'src/share/stores/wp-components/realizations/static-wpc-store';
import { GraphQLClient } from 'src/share/stores/graphql-client/graphql-client';
import { IEventBusStore, IGraphQLClient } from '@quantumart/qp8-widget-platform-bridge';
import { DynamicWPComponentsStore } from 'src/share/stores/wp-components/realizations/dynamic-wpc-store';
import { IAppSettingsShell } from 'src/share/app-settings-shell';

interface IProps {
  appSettings: IAppSettingsShell;
  wpApiStore: WPApiStore;
  eventBusStore: IEventBusStore;
  wpStore: WidgetPlatformStore;
  siteStructureStore: SiteStructureStore;
  wpComponentStore: IWPComponentStore;
  graphQLClient: IGraphQLClient;
}

const prepareServerApp = async (href: string, appSettings: IAppSettingsShell): Promise<IProps> => {
  const wpApiStore = new WPApiStore(appSettings);

  const eventBusStore = new EventBus();

  //Грузить компоненты на сервере можно только в статике сейчас
  const wpComponentStore: IWPComponentStore = appSettings.useDynamicModules
    ? new DynamicWPComponentsStore()
    : new StaticWPComponentsStore();

  const siteStructureStore = new SiteStructureStore(wpApiStore, appSettings, Page, NotFoundPage);
  await siteStructureStore.init();

  const graphQLClient = new GraphQLClient(appSettings.widgetsPlatform?.graphql);

  const wpStore = new WidgetPlatformStore(
    wpApiStore,
    siteStructureStore.structure,
    wpComponentStore,
    appSettings,
    graphQLClient,
  );
  await wpStore.preloadProps(href);

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

export default prepareServerApp;
