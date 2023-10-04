import { PageNode } from '@quantumart/qp8-widget-platform-shell-core';
import { WPRoutesStore } from 'src/client/stores/wp-routes/wp-routes-store';
import { IAppSettingsShell } from 'src/share/app-settings-shell';
import prepareServerApp from './prepare-server-app';

export interface SitemapPage {
  url: string;
}

async function sitemapBuilder(
  hostname: string,
  href: string,
  appSettings: IAppSettingsShell,
): Promise<SitemapPage[]> {
  const serverApp = await prepareServerApp(href, appSettings);

  const wpRoutesStore = new WPRoutesStore(
    appSettings,
    serverApp.wpStore,
    serverApp.siteStructureStore.structure,
    undefined,
    href ?? '',
  );

  const sitemap: PageNode[] = wpRoutesStore.getSiteMap();

  const sitemapList: SitemapPage[] = [];
  const getSitemap = (pages: PageNode[]) => {
    for (const page of pages) {
      sitemapList.push({
        url: `${hostname}${page.link}`,
      });
      getSitemap(page.children);
    }
  };
  getSitemap(sitemap);
  return sitemapList;
}

export default sitemapBuilder;
