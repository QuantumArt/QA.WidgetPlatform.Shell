import React from 'react';
import _ from 'lodash';
import { WPComponentProps } from '../wp-components/models/wp-component';
import {
  WPApiStore,
  FieldInfo,
  SiteNode,
  WidgetDetails,
  IAppSettingsShell,
  getZones,
  getPage,
} from '@quantumart/qp8-widget-platform-shell-core';
import { IWPComponentStore } from '../wp-components/wp-component-store';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

export class WidgetPlatformStore {
  private componentProps?: undefined | { details: WPComponentProps };
  private zones?: Record<string, WidgetDetails[]>;
  public pageHierarchy: { [nodeId: number]: number[] } = {};

  constructor(
    private readonly wpApi: WPApiStore,
    private readonly structure: undefined | SiteNode,
    private readonly wpComponentStore: IWPComponentStore,
    private readonly appSetting: IAppSettingsShell,
    private readonly apolloClient?: ApolloClient<NormalizedCacheObject>,
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

  public preloadProps = async (url: string): Promise<void> => {
    const page = getPage(url, this.structure);

    if (!page) {
      // Мы не нашли в структуре нужную страницу
      // Выходим из загрузки
      return;
    }

    //Загружаем данные из WP по странице
    this.componentProps = {
      details: await this.getData(page),
    };
    this.zones = await this.getZones(url, page.id!);
  };

  public getPreloadZones = (): undefined | Record<string, WidgetDetails[]> => {
    const result = this.zones;
    delete this.zones;
    return result;
  };

  public getZones = async (
    url: string,
    pageId: number,
  ): Promise<Record<string, WidgetDetails[]>> => {
    const zones = await getZones(url, pageId, this.wpApi, this.structure, this.pageHierarchy);
    //Подготавливаем данные для контролов
    await this.convertDetais(zones);
    return zones;
  };

  public getPreloadData = (): undefined | { details: WPComponentProps } => {
    const result = this.componentProps;
    delete this.componentProps;
    return result;
  };

  public getData = async (node: SiteNode): Promise<WPComponentProps> => {
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
      this.apolloClient,
    )) as Record<string, FieldInfo>;
  };

  private convertDetais = async (zones: Record<string, WidgetDetails[]>): Promise<void> => {
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
          this.apolloClient,
        )) as Record<string, FieldInfo>;
      }
    }
  };
}

export const WidgetPlatformStoreContext = React.createContext<WidgetPlatformStore | undefined>(
  undefined,
);
export const useWidgetPlatformStore = (): WidgetPlatformStore =>
  React.useContext(WidgetPlatformStoreContext)!;
