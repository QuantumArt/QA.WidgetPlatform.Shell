import React from 'react';
import ReactDOMClient from 'react-dom/client';
import {
  AbstractItemContext,
  EventBusStoreContext,
  OnScreenArticleContext,
  WPGraphQLClientContext,
  WPRoutesStoreContext,
  ZoneStoreContext,
  useAbstractItem,
  useEventBusStore,
  useWPGraphQLClient,
  useWPRoutesStore,
  useZoneStore,
} from '@quantumart/qp8-widget-platform-bridge';
import {
  AppSettingsShellContext,
  useAppSettingsShell,
  SiteStructureStoreContext,
  useSiteStructureStore,
} from '@quantumart/qp8-widget-platform-shell-core';
import {
  WidgetPlatformStoreContext,
  useWidgetPlatformStore,
} from 'src/share/stores/widget-platform-context/widget-platform-context-store';
import {
  WPComponentsStoreContext,
  useWpcStore,
} from 'src/share/stores/wp-components/wp-component-store';
import { WPItemStoreContext, useWPItemStore } from 'src/client/stores/wp-item/wp-item-store';
import { BrowserRouter } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';
import stream from 'stream';
import Zone from '../zone/zone';
import { HrefContext, useHref } from 'src/share/hooks/url-location';
import { DivContents } from 'src/client/styles/global.styles';
import ArticleComponent from '../on-screen/article-component';
const reactDomServer = typeof window === 'undefined' ? require('react-dom/server') : {};

interface IProps {
  html: string;
}

const patternZone = /\[\[zone=([\w\d]+)\]\]/g;

const DynamicZoneServer = (props: IProps): JSX.Element => {
  const [componentId] = React.useState(React.useId());
  const href = useHref();
  const appSettingsShell = useAppSettingsShell();
  const widgetPlatformStore = useWidgetPlatformStore();
  const eventBusStore = useEventBusStore();
  const wpcStore = useWpcStore();
  const siteStructureStore = useSiteStructureStore();
  const zoneStore = useZoneStore();
  const wpItemStore = useWPItemStore();
  const wpRoutesStore = useWPRoutesStore();
  const abstractItem = useAbstractItem();
  const graphQLClient = useWPGraphQLClient();

  const getComponent = async (): Promise<{
    default: () => JSX.Element;
  }> => {
    const renderZone = (zoneName: string): Promise<string> =>
      new Promise<string>((resolve, reject) => {
        const buffer: Buffer[] = [];
        const echoStream = new stream.Writable();

        echoStream._write = (chunk, _, done) => {
          buffer.push(Buffer.from(chunk));
          done();
        };

        echoStream.addListener('finish', () => {
          resolve(Buffer.concat(buffer).toString('utf8'));
        });

        const pipeableStream = reactDomServer.renderToPipeableStream(
          <StaticRouter location={href ?? ''}>
            <HrefContext.Provider value={href}>
              <AppSettingsShellContext.Provider value={appSettingsShell}>
                <WidgetPlatformStoreContext.Provider value={widgetPlatformStore}>
                  <EventBusStoreContext.Provider value={eventBusStore}>
                    <SiteStructureStoreContext.Provider value={siteStructureStore}>
                      <WPComponentsStoreContext.Provider value={wpcStore}>
                        <ZoneStoreContext.Provider value={zoneStore}>
                          <WPItemStoreContext.Provider value={wpItemStore}>
                            <WPRoutesStoreContext.Provider value={wpRoutesStore}>
                              <AbstractItemContext.Provider value={abstractItem}>
                                <WPGraphQLClientContext.Provider value={graphQLClient}>
                                  <OnScreenArticleContext.Provider value={ArticleComponent}>
                                    <Zone zoneName={zoneName} />
                                  </OnScreenArticleContext.Provider>
                                </WPGraphQLClientContext.Provider>
                              </AbstractItemContext.Provider>
                            </WPRoutesStoreContext.Provider>
                          </WPItemStoreContext.Provider>
                        </ZoneStoreContext.Provider>
                      </WPComponentsStoreContext.Provider>
                    </SiteStructureStoreContext.Provider>
                  </EventBusStoreContext.Provider>
                </WidgetPlatformStoreContext.Provider>
              </AppSettingsShellContext.Provider>
            </HrefContext.Provider>
          </StaticRouter>,
          {
            //onShellReady() {},
            onAllReady() {
              pipeableStream.pipe(echoStream);
            },
            onError(x: any) {
              reject(x);
            },
          },
        );
      });

    let resultHTML: string = '';
    let index = 0;
    for (const regExpMatch of props.html.matchAll(patternZone)) {
      resultHTML += props.html.slice(index, regExpMatch.index);
      index += regExpMatch.index! + regExpMatch[0].length;
      const zoneName = regExpMatch[1];
      resultHTML += `<div name="${componentId}" style="display:contents" data-zone="${zoneName}">${await renderZone(
        zoneName,
      )}</div>`;
    }
    resultHTML += props.html.slice(index, props.html.length);
    return {
      default: () => <DivContents dangerouslySetInnerHTML={{ __html: resultHTML }} />,
    };
  };

  const LazyConponent = React.lazy(getComponent);

  return (
    <React.Suspense>
      <LazyConponent />
    </React.Suspense>
  );
};

const DynamicZoneClient = (props: IProps): JSX.Element => {
  const [componentId] = React.useState(React.useId());
  const appSettingsShell = useAppSettingsShell();
  const widgetPlatformStore = useWidgetPlatformStore();
  const eventBusStore = useEventBusStore();
  const wpcStore = useWpcStore();
  const siteStructureStore = useSiteStructureStore();
  const zoneStore = useZoneStore();
  const wpItemStore = useWPItemStore();
  const wpRoutesStore = useWPRoutesStore();
  const abstractItem = useAbstractItem();
  const graphQLClient = useWPGraphQLClient();

  const resultHTML = props.html.replace(
    patternZone,
    `<div name="${componentId}" style="display:contents" data-zone="$1"></div>`,
  );
  React.useEffect(() => {
    for (const element of document.getElementsByName(componentId)) {
      ReactDOMClient.createRoot(element).render(
        <BrowserRouter basename="/">
          <AppSettingsShellContext.Provider value={appSettingsShell}>
            <WidgetPlatformStoreContext.Provider value={widgetPlatformStore}>
              <EventBusStoreContext.Provider value={eventBusStore}>
                <SiteStructureStoreContext.Provider value={siteStructureStore}>
                  <WPComponentsStoreContext.Provider value={wpcStore}>
                    <ZoneStoreContext.Provider value={zoneStore}>
                      <WPItemStoreContext.Provider value={wpItemStore}>
                        <WPRoutesStoreContext.Provider value={wpRoutesStore}>
                          <AbstractItemContext.Provider value={abstractItem}>
                            <WPGraphQLClientContext.Provider value={graphQLClient}>
                              <OnScreenArticleContext.Provider value={ArticleComponent}>
                                <Zone zoneName={element.getAttribute('data-zone')!} />
                              </OnScreenArticleContext.Provider>
                            </WPGraphQLClientContext.Provider>
                          </AbstractItemContext.Provider>
                        </WPRoutesStoreContext.Provider>
                      </WPItemStoreContext.Provider>
                    </ZoneStoreContext.Provider>
                  </WPComponentsStoreContext.Provider>
                </SiteStructureStoreContext.Provider>
              </EventBusStoreContext.Provider>
            </WidgetPlatformStoreContext.Provider>
          </AppSettingsShellContext.Provider>
        </BrowserRouter>,
      );
    }
  }, [resultHTML]);

  return <DivContents dangerouslySetInnerHTML={{ __html: resultHTML }} />;
};

const DynamicZone = (props: IProps): JSX.Element => {
  if (!!props.html.match(patternZone)) {
    return typeof window === 'undefined' ? (
      <DynamicZoneServer {...props} />
    ) : (
      <DynamicZoneClient {...props} />
    );
  }
  return <DivContents dangerouslySetInnerHTML={{ __html: props.html }} />;
};

export default DynamicZone;
