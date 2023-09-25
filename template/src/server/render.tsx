import React from 'react';
import stream from 'stream';
import App from 'src/client/App';
import Page from 'src/client/components/page/page';
import EventBus from 'js-event-bus';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetData, HelmetProvider, HelmetServerState } from 'react-helmet-async';
import {
  WPApiStore,
  IAppSettingsShell,
  SiteStructureStore,
} from '@quantumart/qp8-widget-platform-shell-core';
import { IHelmetString, convertHelmetToString } from 'src/utilities/helmet-helpers';
import { WidgetPlatformStore } from 'src/share/stores/widget-platform-context/widget-platform-context-store';
import { IWPComponentStore } from 'src/share/stores/wp-components/wp-component-store';
import { StaticWPComponentsStore } from 'src/share/stores/wp-components/realizations/static-wpc-store';
import { HrefContext } from 'src/share/hooks/url-location';
import { IEventBusStore, IGraphQLClient } from '@quantumart/qp8-widget-platform-bridge';
import { GraphQLClient } from 'src/share/stores/graphql-client/graphql-client';
import NotFoundPage from 'src/client/components/not-found-page/not-found-page';

interface IProps {
  appSettings: IAppSettingsShell;
  wpApiStore: WPApiStore;
  eventBusStore: IEventBusStore;
  wpStore: WidgetPlatformStore;
  siteStructureStore: SiteStructureStore;
  wpComponentStore: IWPComponentStore;
  graphQLClient: IGraphQLClient;
}

const prepareServerApp = async (url: string, appSettings: IAppSettingsShell): Promise<IProps> => {
  const wpApiStore = new WPApiStore(appSettings);

  const eventBusStore = new EventBus();

  //Грузить компоненты на сервере можно только в статике сейчас
  const wpComponentStore: IWPComponentStore = new StaticWPComponentsStore();

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
  await wpStore.preloadProps(url);

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

export interface ISiteModel {
  html: string;
  helmet: IHelmetString;
}

async function bodyBuilder(url: string, appSettings: IAppSettingsShell): Promise<ISiteModel> {
  try {
    const props = await prepareServerApp(url, appSettings);
    const helmetContext: { helmet?: HelmetServerState } = {};
    const render = new Promise<string>((resolve, reject) => {
      const buffer: Buffer[] = [];
      const echoStream = new stream.Writable();

      echoStream._write = (chunk, _, done) => {
        buffer.push(Buffer.from(chunk));
        done();
      };

      echoStream.addListener('finish', () => {
        resolve(Buffer.concat(buffer).toString('utf8'));
      });

      const pipeableStream = renderToPipeableStream(
        <HelmetProvider context={helmetContext}>
          <HrefContext.Provider value={url}>
            <StaticRouter location={url}>
              <App
                appSettings={appSettings}
                siteStructureStore={props.siteStructureStore}
                eventBusStore={props.eventBusStore}
                wpStore={props.wpStore}
                widgetsStore={props.wpComponentStore}
                graphQLClient={props.graphQLClient}
              />
            </StaticRouter>
          </HrefContext.Provider>
        </HelmetProvider>,
        {
          //onShellReady() {},
          onAllReady() {
            pipeableStream.pipe(echoStream);
          },
          onError(x) {
            reject(x);
          },
        },
      );
    });

    const html = await render;
    const helmet = helmetContext?.helmet ?? new HelmetData({}).context.helmet;
    return {
      html,
      helmet: convertHelmetToString(helmet),
    };
  } catch (ex) {
    console.error(ex);
    const helmet = new HelmetData({}).context.helmet;
    return {
      html: '',
      helmet: convertHelmetToString(helmet),
    };
  }
}

export default bodyBuilder;
