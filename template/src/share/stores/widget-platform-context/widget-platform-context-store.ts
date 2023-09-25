import React from 'react';
import { WPComponentProps } from '../wp-components/models/wp-component';
import {
  WPApiStore,
  FieldInfo,
  SiteNode,
  WidgetDetails,
  IAppSettingsShell,
  getZones,
  getPage,
  getTailUrl,
} from '@quantumart/qp8-widget-platform-shell-core';
import { IWPComponentStore } from '../wp-components/wp-component-store';
import { IGraphQLClient } from '@quantumart/qp8-widget-platform-bridge';

export class WidgetPlatformStore {
  private componentProps?: undefined | { details: WPComponentProps };
  private allowedSubpage?: undefined | boolean;
  private zones?: Record<string, WidgetDetails[]>;
  public pageHierarchy: { [nodeId: number]: number[] } = {};

  constructor(
    private readonly wpApi: WPApiStore,
    private readonly structure: undefined | SiteNode,
    private readonly wpComponentStore: IWPComponentStore,
    private readonly appSetting: IAppSettingsShell,
    private readonly graphQLClient: IGraphQLClient,
  ) {
    if (!structure || Object.keys(structure).length === 0) {
      return;
    }

    //Создаем иерархию страниц
    const hierarchyIterator = (node: SiteNode, pageHierarchy: number[]) => {
      this.pageHierarchy[node.id!] = pageHierarchy;
      for (const child of node.children ?? []) {
        hierarchyIterator(child, [...pageHierarchy, child.id!]);
      }
    };
    hierarchyIterator(structure, [structure.id!]);
  }

  public preloadProps = async (href: string): Promise<void> => {
    const page = getPage(href, this.structure);

    if (!page) {
      // Мы не нашли в структуре нужную страницу
      // Выходим из загрузки
      return;
    }

    //Загружаем данные из WP по странице
    this.componentProps = {
      details: await this.getData(href, page),
    };

    const tailUrl = getTailUrl(
      page.id!,
      this.appSetting.publicPath,
      this.structure,
      this.pageHierarchy,
      href,
    );
    //Загружаем данные по доступности подстраниц
    this.allowedSubpage = await this.getAllowedSubpage(page, tailUrl);

    this.zones = await this.getZones(href, page.id!);
  };

  public getPreloadZones = (): undefined | Record<string, WidgetDetails[]> => {
    const result = this.zones;
    delete this.zones;
    return result;
  };

  public getZones = async (
    href: string,
    pageId: number,
  ): Promise<Record<string, WidgetDetails[]>> => {
    const zones = await getZones(href, pageId, this.wpApi, this.structure, this.pageHierarchy);
    //Подготавливаем данные для контролов
    await this.convertDetais(href, zones);
    return zones;
  };

  public getPreloadData = (): undefined | { details: WPComponentProps } => {
    const result = this.componentProps;
    delete this.componentProps;
    return result;
  };

  public getPreloadAllowedSubpage = (): undefined | boolean => {
    const result = this.allowedSubpage;
    delete this.allowedSubpage;
    return result;
  };

  public getData = async (href: string, node: SiteNode): Promise<WPComponentProps> => {
    const fcdm =
      this.appSetting.widgetsPlatform.forcedConfigurationOfDynamicModules?.[node.nodeType!];
    const nodwData = await this.wpApi.node(node.id!);
    return (await this.wpComponentStore.getStaticPropsHandler(
      {
        url: fcdm?.url ?? node.frontModuleUrl ?? '', //TODO получать с node
        moduleName: fcdm?.moduleName ?? node.frontModuleName ?? '', //TODO получать с node, ?? this.appSetting.widgetsPlatform
        componentAlias: node.nodeType!,
      },
      nodwData.details ?? {},
      {
        href,
        graphQLClient: this.graphQLClient,
      },
    )) as Record<string, FieldInfo>;
  };

  private convertDetais = async (
    href: string,
    zones: Record<string, WidgetDetails[]>,
  ): Promise<void> => {
    for (const zoneName in zones) {
      for (const widget of zones[zoneName]) {
        const fcdm =
          this.appSetting.widgetsPlatform.forcedConfigurationOfDynamicModules?.[widget.nodeType!];

        widget.details = (await this.wpComponentStore.getStaticPropsHandler(
          {
            url: fcdm?.url ?? widget.frontModuleUrl ?? '', //TODO получать с node
            moduleName: fcdm?.moduleName ?? widget.frontModuleName ?? '', //TODO получать с node, ?? this.appSetting.widgetsPlatform
            componentAlias: widget.nodeType!,
          },
          widget.details ?? {},
          {
            href,
            graphQLClient: this.graphQLClient,
          },
        )) as Record<string, FieldInfo>;

        if (!!widget.childWidgets) {
          await this.convertDetais(href, widget.childWidgets);
        }
      }
    }
  };

  public getAllowedSubpage = async (node: SiteNode, tailUrl: string): Promise<boolean> => {
    const fcdm =
      this.appSetting.widgetsPlatform.forcedConfigurationOfDynamicModules?.[node.nodeType!];
    const nodwData = await this.wpApi.node(node.id!);
    return await this.wpComponentStore.allowedSubpageHandler(
      {
        url: fcdm?.url ?? node.frontModuleUrl ?? '', //TODO получать с node
        moduleName: fcdm?.moduleName ?? node.frontModuleName ?? '', //TODO получать с node, ?? this.appSetting.widgetsPlatform
        componentAlias: node.nodeType!,
      },
      tailUrl,
      nodwData.details ?? {},
    );
  };
}

export const WidgetPlatformStoreContext = React.createContext<WidgetPlatformStore | undefined>(
  undefined,
);
export const useWidgetPlatformStore = (): WidgetPlatformStore =>
  React.useContext(WidgetPlatformStoreContext)!;
