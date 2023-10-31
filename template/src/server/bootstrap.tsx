import express from 'express';
import path from 'path';
import compression from 'compression';
import fs from 'fs';
import NodeCache from 'node-cache';
import { ChunkExtractor } from '@loadable/server';
import { ISiteModel } from './render';
import { IAppSettingsShell } from 'src/share/app-settings-shell';
import { merge } from 'lodash';

const port = 3200;
const server = express();
const siteCache = new NodeCache();

//**** Настройка ответов ****/
server.use(compression());
server.use(
  '/',
  express.static(path.join(__dirname, '../static/client'), {
    setHeaders: function (res) {
      res.set('X-Content-Type-Options', 'nosniff');
    },
  }),
);

//**** Подготовка layout-а страницы ****/
server.set('view engine', 'ejs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
server.engine('ejs', require('ejs').__express);
server.set('views', path.join(__dirname, 'views'));

//**** Грузим настройки ****/
const baseSettings = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'base-settings.json'), 'utf-8'),
);

const clientSettings = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'client-settings.json'), 'utf-8'),
);

const serverSettings = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'server-settings.json'), 'utf-8'),
);

const clientAppsettings = merge(baseSettings, clientSettings) as IAppSettingsShell;
const serverAppsettings = merge(baseSettings, serverSettings) as IAppSettingsShell;
//^^^^^^^^^^^^^^^^^^^^^^

const clientExtractor = new ChunkExtractor({
  publicPath: serverAppsettings.publicPath ?? '/',
  statsFile: path.join(__dirname, '../static/client/loadable-stats.json'),
});

const scripts = clientExtractor.getScriptTags();
const styles = clientExtractor.getStyleTags();

server.get('/settings.json', async (req, res) => {
  res.json(clientAppsettings);
});

if (serverAppsettings.activeSiteMap) {
  server.get('/sitemap.xml', async (req, res) => {
    const sitemapBuilder = (await import('./sitemap')).default;
    const pages = await sitemapBuilder(
      `${req.protocol}://${req.get('host')}`,
      req.url,
      serverAppsettings,
    );
    res.setHeader('content-type', 'text/xml');
    res.render('sitemap', { pages });
  });
}

//**** Очистка загруженных модулей ****/
// global.clearRoutes = () => {
//   server._router.stack = server._router.stack.filter((k: any) => !(k && k.route && k.route.path));
// };

//**** Возрат разметки ****/
server.get('*', async (req, res) => {
  // await revalidate().then(shouldReload => {
  //   if (shouldReload) {
  //     global.clearRoutes();
  //   }
  // });
  res.set('X-Content-Type-Options', 'nosniff');
  if (serverAppsettings.ssr?.active) {
    //Кеш страниц
    let body: ISiteModel | undefined = siteCache.get(req.url);
    if (body == undefined) {
      const bodyBuilder = (await import('./render')).default;
      body = await bodyBuilder(`${req.protocol}://${req.get('host')}`, req.url, serverAppsettings);
      siteCache.set(req.url, body, serverAppsettings.ssr?.ttl ?? 0);
    }
    res.render('client', {
      scripts,
      styles,
      component: body.html,
      componentsStyles: body.componentsStyles,
      helmet: body.helmet,
    });
  } else {
    res.render('client', {
      scripts,
      styles,
      component: '',
      componentsStyles: '',
      helmet: {},
    });
  }
});

server.listen(port, () => console.log(`Server running on port ${port}`));
