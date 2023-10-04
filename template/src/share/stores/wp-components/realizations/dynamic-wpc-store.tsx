import React from 'react';
import { enrichmentHash } from 'src/utilities/url-helpers';
import { IWPComponentStore } from '../wp-component-store';
import { IComponentInfo, IStaticPropsEnvironment } from '../models/component-info';
import { IWPComponent, WPComponentProps } from '../models/wp-component';
import { Loader } from 'src/client/components/loader/loader';
import { NotFoundComponent } from 'src/client/components/not-found-component/not-found-component';
import { IAppSettingsShell } from 'src/share/app-settings-shell';
//import { injectScript, WebpackRemoteContainer } from '@module-federation/utilities';

//@ts-ignore fake import needed in order to tell webpack to include chunk loading runtime code
//import('fake');

export class DynamicWPComponentsStore implements IWPComponentStore {
  //Источники модулей
  //private sourcesNodeModulesCache: { [key: string]: Promise<WebpackRemoteContainer> } = {};
  private sourcesBrowserModulesCache: { [key: string]: Promise<void> } = {};

  private fileCache: Record<string, Record<string, Promise<IWPComponent>>> = {};
  private lazyComponentCache: Record<
    string,
    Record<string, React.LazyExoticComponent<(props: JSX.IntrinsicAttributes) => JSX.Element>>
  > = {};

  public getComponent = (info: IComponentInfo): ((props: WPComponentProps) => JSX.Element) => {
    //------- Load component -----
    if (!this.lazyComponentCache[info.moduleName]) {
      this.lazyComponentCache[info.moduleName] = {};
    }

    if (!this.lazyComponentCache[info.moduleName][info.componentAlias]) {
      this.lazyComponentCache[info.moduleName][info.componentAlias] = React.lazy(() =>
        this.getWPComponent(info),
      );
    }
    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^

    const LazyConponent = this.lazyComponentCache[info.moduleName][info.componentAlias];
    return (props: WPComponentProps) => (
      <React.Suspense fallback={<Loader />}>
        <LazyConponent {...props} />
      </React.Suspense>
    );
  };

  public allowedSubpageHandler = async (
    info: IComponentInfo,
    tailUrl: string,
    wpProps: { [key: string]: unknown },
  ): Promise<boolean> => {
    try {
      const wpComponent = await this.getWPComponent(info);
      return !!wpComponent.allowedSubpage ? wpComponent.allowedSubpage(tailUrl, wpProps) : false;
    } catch (ex) {
      console.error(ex);
      return false;
    }
  };

  public getStaticPropsHandler = async (
    info: IComponentInfo,
    wpProps: { [key: string]: unknown },
    staticPropsEnvironment: IStaticPropsEnvironment,
  ): Promise<{ [key: string]: unknown }> => {
    try {
      const wpComponent = await this.getWPComponent(info);
      return !!wpComponent.getStaticProps
        ? await wpComponent.getStaticProps(wpProps, staticPropsEnvironment)
        : wpProps;
    } catch (ex) {
      console.error(ex);
      return wpProps;
    }
  };

  //---------------------------------------------------------------------------------------------------------

  private getWPComponent = (info: IComponentInfo): Promise<IWPComponent> => {
    if (!this.fileCache[info.moduleName]) {
      this.fileCache[info.moduleName] = {};
    }

    if (!this.fileCache[info.moduleName][info.componentAlias]) {
      if (typeof window === 'undefined') {
        this.fileCache[info.moduleName][info.componentAlias] = this.getComponentInNode(info);
      } else {
        this.fileCache[info.moduleName][info.componentAlias] = this.getComponentInBrowser(info);
      }
    }

    return this.fileCache[info.moduleName][info.componentAlias];
  };

  private getComponentInNode = async (info: IComponentInfo): Promise<IWPComponent> => {
    return {
      default: NotFoundComponent,
    };

    // if (!info.url) {
    //   return {
    //     default: NotFoundComponent,
    //   };
    // }
    // let nodeModulesCache: WebpackRemoteContainer;
    // try {
    //   //Проверяем наличие источника в сторе, если нет то добавляем его в загрузки
    //   if (!this.sourcesNodeModulesCache[info.url]) {
    //     this.sourcesNodeModulesCache[info.url] = injectScript({
    //       global: info.moduleName,
    //       url: info.url,
    //     });
    //   }
    //   nodeModulesCache = await this.sourcesNodeModulesCache[info.url];
    // } catch (ex) {
    //   console.error(`Модуль "${info.moduleName}" не загружен!`, ex);
    //   return {
    //     default: NotFoundComponent,
    //   };
    // }
    // try {
    //   return await nodeModulesCache.get(`./${info.componentAlias}`)();
    // } catch (ex) {
    //   console.error(`Модуль "${info.moduleName}" не загружен!`, ex);
    //   return {
    //     default: NotFoundComponent,
    //   };
    // }
  };

  private getComponentInBrowser = async (info: IComponentInfo): Promise<IWPComponent> => {
    if (!info.url) {
      return {
        default: NotFoundComponent,
      };
    }
    try {
      //Проверяем наличие источника в сторе, если нет то добавляем его в загрузки
      if (!this.sourcesBrowserModulesCache[info.url]) {
        this.sourcesBrowserModulesCache[info.url] = new Promise<void>((success, reject) => {
          const element = document.createElement('script');
          element.src = enrichmentHash(`${info.url}/client/remoteEntry.js`);
          element.type = 'text/javascript';
          element.async = true;
          element.onload = () => success();
          element.onerror = () => reject();
          document.head.appendChild(element);
        });
      }
      await this.sourcesBrowserModulesCache[info.url];
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
