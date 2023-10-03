import express from 'express';
import path from 'path';
import compression from 'compression';
import fs from 'fs';
import NodeCache from 'node-cache';
import { ChunkExtractor } from '@loadable/server';
import { ISiteModel } from './render';
import { IAppSettingsShell } from 'src/share/app-settings-shell';

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

//**** Настройки ****/
const appsettings = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'settings.json'), 'utf-8'),
) as IAppSettingsShell;

const clientExtractor = new ChunkExtractor({
  publicPath: appsettings.publicPath ?? '/',
  statsFile: path.join(__dirname, '../static/client/loadable-stats.json'),
});

const scripts = clientExtractor.getScriptTags();
const styles = clientExtractor.getStyleTags();

server.get('/settings.json', async (req, res) => {
  res.json(appsettings);
});

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
  if (appsettings.ssr?.active) {
    //Кеш страниц
    let body: ISiteModel | undefined = siteCache.get(req.url);
    if (body == undefined) {
      const bodyBuilder = (await import('./render')).default;
      body = await bodyBuilder(req.url, appsettings);
      siteCache.set(req.url, body, appsettings.ssr?.ttl ?? 0);
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
