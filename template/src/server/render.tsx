import React from 'react';
import stream from 'stream';
import App from 'src/client/App';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetData, HelmetProvider, HelmetServerState } from 'react-helmet-async';
import { IHelmetString, convertHelmetToString } from 'src/utilities/helmet-helpers';
import { HrefContext } from 'src/share/hooks/url-location';
import { ServerStyleSheet } from 'styled-components';
import { IAppSettingsShell } from 'src/share/app-settings-shell';
import prepareServerApp from './prepare-server-app';

export interface ISiteModel {
  html: string;
  componentsStyles: string;
  helmet: IHelmetString;
}

async function bodyBuilder(
  hostname: string,
  href: string,
  appSettings: IAppSettingsShell,
): Promise<ISiteModel> {
  try {
    const props = await prepareServerApp(href, appSettings);
    const sheet = new ServerStyleSheet();
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
        sheet.collectStyles(
          <HelmetProvider context={helmetContext}>
            <HrefContext.Provider value={href}>
              <StaticRouter location={href}>
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
        ),
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
      componentsStyles: sheet.getStyleTags(),
      helmet: convertHelmetToString(helmet),
    };
  } catch (ex) {
    console.error(ex);
    const helmet = new HelmetData({}).context.helmet;
    return {
      html: '',
      componentsStyles: '',
      helmet: convertHelmetToString(helmet),
    };
  }
}

export default bodyBuilder;
