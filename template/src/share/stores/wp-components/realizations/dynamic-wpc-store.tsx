import React from 'react';
import { enrichmentHash } from 'src/utilities/url-helpers';
import { IWPComponentStore } from '../wp-component-store';
import { IComponentInfo } from '../models/component-info';
import { IWPComponent, WPComponentProps } from '../models/wp-component';
import { Loader } from 'src/client/components/loader/loader';
import { NotFoundComponent } from 'src/client/components/not-found/not-found-component';
import { useAppSettingsShell } from '@quantumart/qp8-widget-platform-shell-core';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

export class DynamicWPComponentsStore implements IWPComponentStore {
  //Источники модулей
  private sourcesModules: { [key: string]: Promise<void> } = {};

  public getComponent = (info: IComponentInfo): ((props: WPComponentProps) => JSX.Element) => {
    const appSettings = useAppSettingsShell();
    var wpComponentPromise = this.getComponentForEnvironment(info);

    if (!!appSettings.ssr?.active) {
      const LazyConponent = React.lazy(wpComponentPromise);
      return (props: WPComponentProps) => (
        <React.Suspense fallback={<Loader />}>
          <LazyConponent {...props} />
        </React.Suspense>
      );
    }

    return (props: WPComponentProps) => {
      const [wpComponent, setWPComponent] = React.useState<IWPComponent>();

      const lazyload = async () => {
        setWPComponent(await wpComponentPromise());
      };

      React.useEffect(() => {
        lazyload();
      }, []);

      if (!!wpComponent) {
        return <wpComponent.default {...props} />;
      }

      return <Loader />;
    };
  };

  public allowedSubpageHandler = async (
    info: IComponentInfo,
    tailUrl: string,
  ): Promise<boolean> => {
    try {
      var wpComponent = await this.getComponentForEnvironment(info)();
      return !!wpComponent.allowedSubpage ? wpComponent.allowedSubpage(tailUrl) : false;
    } catch (ex) {
      console.error(ex);
      return false;
    }
  };

  public getStaticPropsHandler = async (
    info: IComponentInfo,
    wpProps: { [key: string]: unknown },
    apolloClient?: ApolloClient<NormalizedCacheObject>,
  ): Promise<{ [key: string]: unknown }> => {
    try {
      var wpComponent = await this.getComponentForEnvironment(info)();
      return !!wpComponent.getStaticProps
        ? await wpComponent.getStaticProps(wpProps, apolloClient)
        : wpProps;
    } catch (ex) {
      console.error(ex);
      return wpProps;
    }
  };

  private getComponentForEnvironment = (info: IComponentInfo) =>
    typeof window === 'undefined'
      ? () => this.getComponentInNode(info)
      : () => this.getComponentInBrowser(info);

  private getComponentInNode = async (info: IComponentInfo): Promise<IWPComponent> => {
    return {
      default: NotFoundComponent,
    };
  };

  private getComponentInBrowser = async (info: IComponentInfo): Promise<IWPComponent> => {
    if (!info.url) {
      return {
        default: NotFoundComponent,
      };
    }
    try {
      //Проверяем наличие источника в сторе, если нет то добавляем его в загрузки
      if (!this.sourcesModules[info.url]) {
        this.sourcesModules[info.url] = new Promise<void>((success, reject) => {
          const element = document.createElement('script');
          element.src = enrichmentHash(`${info.url}/client/remoteEntry.js`);
          element.type = 'text/javascript';
          element.async = true;
          element.onload = () => success();
          element.onerror = () => reject();
          document.head.appendChild(element);
        });
      }
      await this.sourcesModules[info.url];
    } catch (ex) {
      console.error(`Модуль "${info.moduleName}" не загружен!`, ex);
      return {
        default: NotFoundComponent,
      };
    }
    try {
      return await DynamicWPComponentsStore.loadDynamicOutputInBrowser(
        info.moduleName,
        info.componentAlias,
      );
    } catch (ex) {
      console.error(
        `Компонент "${info.componentAlias}" из модуля "${info.moduleName}" не загружен!`,
        ex,
      );
      return {
        default: NotFoundComponent,
      };
    }
  };

  private static async loadDynamicOutputInBrowser(
    scope: string,
    path: string,
  ): Promise<IWPComponent> {
    const container = window[scope];
    if (!container) {
      return {
        default: NotFoundComponent,
      };
    }
    // @ts-ignore
    await __webpack_init_sharing__('default');
    // @ts-ignore
    await container.init(__webpack_share_scopes__.default);
    const factory = await window[scope].get(`./${path}`);
    const externalModule = factory();
    return externalModule;
  }
}
