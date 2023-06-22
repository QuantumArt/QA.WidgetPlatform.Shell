import React from 'react';
import ReactDOMClient from 'react-dom/client';
import {
  AbstractItemContext,
  WPApolloClientProvider,
  WPRoutesStoreContext,
  ZoneStoreContext,
  useAbstractItem,
  useWPApolloClient,
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
import { renderToPipeableStream } from 'react-dom/server';
import { BrowserRouter } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';
import stream from 'stream';
import Zone from '../zone/zone';
import { HrefContext, useHref } from 'src/share/hooks/url-location';

interface IProps {
  html: string;
}

const patternZone = /\[\[zone=([\w\d]+)\]\]/g;

const DynamicZoneServer = (props: IProps): JSX.Element => {
  const [componentId] = React.useState(() => React.useId());
  const href = useHref();
  const appSettingsShell = useAppSettingsShell();
  const widgetPlatformStore = useWidgetPlatformStore();
  const wpcStore = useWpcStore();
  const siteStructureStore = useSiteStructureStore();
  const zoneStore = useZoneStore();
  const wpItemStore = useWPItemStore();
  const wpRoutesStore = useWPRoutesStore();
  const abstractItem = useAbstractItem();
  const apolloClient = useWPApolloClient();

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

        const pipeableStream = renderToPipeableStream(
          <StaticRouter location={href ?? ''}>
            <HrefContext.Provider value={href}>
              <AppSettingsShellContext.Provider value={appSettingsShell}>
                <WidgetPlatformStoreContext.Provider value={widgetPlatformStore}>
                  <SiteStructureStoreContext.Provider value={siteStructureStore}>
                    <WPComponentsStoreContext.Provider value={wpcStore}>
                      <ZoneStoreContext.Provider value={zoneStore}>
                        <WPItemStoreContext.Provider value={wpItemStore}>
                          <WPRoutesStoreContext.Provider value={wpRoutesStore}>
                            <AbstractItemContext.Provider value={abstractItem}>
                              <WPApolloClientProvider client={apolloClient}>
                                <Zone zoneName={zoneName} />
                              </WPApolloClientProvider>
                            </AbstractItemContext.Provider>
                          </WPRoutesStoreContext.Provider>
                        </WPItemStoreContext.Provider>
                      </ZoneStoreContext.Provider>
                    </WPComponentsStoreContext.Provider>
                  </SiteStructureStoreContext.Provider>
                </WidgetPlatformStoreContext.Provider>
              </AppSettingsShellContext.Provider>
            </HrefContext.Provider>
          </StaticRouter>,
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

    let resultHTML: string = '';
    let index = 0;
    for (const regExpMatch of props.html.matchAll(patternZone)) {
      resultHTML += props.html.slice(index, regExpMatch.index);
      index += regExpMatch.index! + regExpMatch[0].length;
      const zoneName = regExpMatch[1];
      resultHTML += `<div name="${componentId}" zone="${zoneName}">${await renderZone(
        zoneName,
      )}</div>`;
    }
    resultHTML += props.html.slice(index, props.html.length);
    return {
      default: () => <div dangerouslySetInnerHTML={{ __html: resultHTML }} />,
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
  const [componentId] = React.useState(() => React.useId());
  const appSettingsShell = useAppSettingsShell();
  const widgetPlatformStore = useWidgetPlatformStore();
  const wpcStore = useWpcStore();
  const siteStructureStore = useSiteStructureStore();
  const zoneStore = useZoneStore();
  const wpItemStore = useWPItemStore();
  const wpRoutesStore = useWPRoutesStore();
  const abstractItem = useAbstractItem();
  const apolloClient = useWPApolloClient();

  const resultHTML = props.html.replace(patternZone, `<div name="${componentId}" zone="$1"></div>`);
  React.useEffect(() => {
    for (const element of document.getElementsByName(componentId)) {
      ReactDOMClient.createRoot(element).render(
        <BrowserRouter basename="/">
          <AppSettingsShellContext.Provider value={appSettingsShell}>
            <WidgetPlatformStoreContext.Provider value={widgetPlatformStore}>
              <SiteStructureStoreContext.Provider value={siteStructureStore}>
                <WPComponentsStoreContext.Provider value={wpcStore}>
                  <ZoneStoreContext.Provider value={zoneStore}>
                    <WPItemStoreContext.Provider value={wpItemStore}>
                      <WPRoutesStoreContext.Provider value={wpRoutesStore}>
                        <AbstractItemContext.Provider value={abstractItem}>
                          <WPApolloClientProvider client={apolloClient}>
                            <Zone zoneName={element.getAttribute('zone')!} />
                          </WPApolloClientProvider>
                        </AbstractItemContext.Provider>
                      </WPRoutesStoreContext.Provider>
                    </WPItemStoreContext.Provider>
                  </ZoneStoreContext.Provider>
                </WPComponentsStoreContext.Provider>
              </SiteStructureStoreContext.Provider>
            </WidgetPlatformStoreContext.Provider>
          </AppSettingsShellContext.Provider>
        </BrowserRouter>,
      );
    }
  }, [resultHTML]);

  return <div dangerouslySetInnerHTML={{ __html: resultHTML }} />;
  //return <>{!!props.html && <InnerHTML html={resultHTML} />}</>;
};

const DynamicZone = (props: IProps): JSX.Element => {
  if (!!props.html.match(patternZone)) {
    return typeof window === 'undefined' ? (
      <DynamicZoneServer {...props} />
    ) : (
      <DynamicZoneClient {...props} />
    );
  }
  return <div dangerouslySetInnerHTML={{ __html: props.html }} />;
  //return <>{!!props.html && <InnerHTML html={props.html} />}</>;

  //   return typeof window === 'undefined' ? (
  //     <div dangerouslySetInnerHTML={{ __html: props.html }} />
  //   ) : (
  //     <>{!!props.html && <InnerHTML html={props.html} />}</>
  //   );
};

export default DynamicZone;
