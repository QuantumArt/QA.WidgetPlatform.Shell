import express from 'express';
import path from 'path';
import compression from 'compression';
import fs from 'fs';
import { ChunkExtractor } from '@loadable/server';
import { IAppSettingsShell } from '@quantumart/qp8-widget-platform-shell-core';
//import { revalidate } from '@module-federation/utilities';

const port = 3200;
const server = express();

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
    // //Кеш страниц, пока не делаем
    // let body: IBodyBuilderResult | undefined = siteCache.get(req.url);
    // if (body == undefined) {
    //   body = await bodyBuilder(req.url, appsettings);
    //   siteCache.set(req.url, body, appsettings.ttl || 5);
    // }
    const bodyBuilder = (await import('./render')).default;
    const body = await bodyBuilder(req.url, appsettings);
    res.render('client', {
      scripts,
      styles,
      component: body.html,
      helmet: body.helmet,
    });
  } else {
    res.render('client', {
      scripts,
      styles,
      component: '',
      helmet: {},
    });
  }
});

server.listen(port, () => console.log(`Server running on port ${port}`));
