import React from 'react';
import { IComponentInfo, IStaticPropsEnvironment } from '../models/component-info';
import { IWPComponent, WPComponentProps } from '../models/wp-component';
import { IWPComponentStore } from '../wp-component-store';
import { staticModules } from 'src/app-settings-shell/static-wpc-modules';
import { Loader } from 'src/client/components/loader/loader';
import { NotFoundComponent } from 'src/client/components/not-found-component/not-found-component';

export class StaticWPComponentsStore implements IWPComponentStore {
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

  private getWPComponent = (info: IComponentInfo): Promise<IWPComponent> => {
    if (!this.fileCache[info.moduleName]) {
      this.fileCache[info.moduleName] = {};
    }

    if (!this.fileCache[info.moduleName][info.componentAlias]) {
      this.fileCache[info.moduleName][info.componentAlias] = StaticWPComponentsStore.getPath(
        info.moduleName,
        info.componentAlias,
      )();
    }

    return this.fileCache[info.moduleName][info.componentAlias];
  };

  //---------------------------------------------------------------------------------------------------------

  private static getPath = (moduleName: string, componentAlias: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const component = (staticModules as any)[moduleName]?.[
      componentAlias
    ] as () => Promise<IWPComponent>;
    return (
      component ??
      (async () => ({
        default: NotFoundComponent,
      }))
    );
  };
}
