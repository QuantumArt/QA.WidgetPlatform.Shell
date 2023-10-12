import { BreadcrumbItem, IWPRoutesStore, PageNode } from '@quantumart/qp8-widget-platform-bridge';
import {
  SiteNode,
  IAppSettingsShell,
  getBreadcrumbs,
  getSiteMap,
  getTailUrl,
} from '@quantumart/qp8-widget-platform-shell-core';
import { WidgetPlatformStore } from 'src/share/stores/widget-platform-context/widget-platform-context-store';

export class WPRoutesStore implements IWPRoutesStore {
  readonly homeTitle = 'Главная';
  constructor(
    private readonly appSetting: IAppSettingsShell,
    private readonly widgetPlatformStore: WidgetPlatformStore,
    private readonly structure: undefined | SiteNode,
    private readonly node: undefined | SiteNode,
    private readonly href: string,
  ) {}

  getBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs = getBreadcrumbs(
      this.node!.id!,
      this.homeTitle,
      this.appSetting.baseURL,
      this.structure,
      this.widgetPlatformStore.pageHierarchy,
    );
    return breadcrumbs as BreadcrumbItem[];
  };

  getSiteMap = (maxDeepOrigin?: number): PageNode[] => {
    const siteMap = getSiteMap(
      maxDeepOrigin,
      this.homeTitle,
      this.appSetting.baseURL,
      this.structure,
    );
    return siteMap;
  };

  getTailUrl = (): string => {
    const tailUrl = getTailUrl(
      this.node!.id!,
      this.appSetting.baseURL,
      this.structure,
      this.widgetPlatformStore.pageHierarchy,
      this.href,
    );
    return tailUrl;
  };
}
