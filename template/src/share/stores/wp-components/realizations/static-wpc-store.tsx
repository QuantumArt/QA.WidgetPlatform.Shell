import React from 'react';
import { IComponentInfo } from '../models/component-info';
import { IWPComponent, WPComponentProps } from '../models/wp-component';
import { IWPComponentStore } from '../wp-component-store';
import { staticModules } from 'src/app-settings-shell/static-wpc-modules';
import { Loader } from 'src/client/components/loader/loader';
import { NotFoundComponent } from 'src/client/components/not-found/not-found-component';
import { useAppSettingsShell } from '@quantumart/qp8-widget-platform-shell-core';
import { IGraphQLClient } from '@quantumart/qp8-widget-platform-bridge';

export class StaticWPComponentsStore implements IWPComponentStore {
  private lazyComponentCash: Record<
    string,
    Record<string, React.LazyExoticComponent<(props: JSX.IntrinsicAttributes) => JSX.Element>>
  > = {};

  public getComponent = (info: IComponentInfo): ((props: WPComponentProps) => JSX.Element) => {
    const appSettings = useAppSettingsShell();

    if (!!appSettings.ssr?.active) {
      if (!this.lazyComponentCash[info.moduleName]) {
        this.lazyComponentCash[info.moduleName] = {};
      }

      if (!this.lazyComponentCash[info.moduleName][info.componentAlias]) {
        this.lazyComponentCash[info.moduleName][info.componentAlias] = React.lazy(
          StaticWPComponentsStore.getPath(info.moduleName, info.componentAlias),
        );
      }

      const LazyConponent = this.lazyComponentCash[info.moduleName][info.componentAlias];
      return (props: WPComponentProps) => (
        <React.Suspense fallback={<Loader />}>
          <LazyConponent {...props} />
        </React.Suspense>
      );
    }

    const wpComponentPromise = StaticWPComponentsStore.getPath(
      info.moduleName,
      info.componentAlias,
    );

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
      const wpComponent = (await StaticWPComponentsStore.getPath(
        info.moduleName,
        info.componentAlias,
      )()) as IWPComponent;
      return !!wpComponent.allowedSubpage ? wpComponent.allowedSubpage(tailUrl) : false;
    } catch (ex) {
      console.error(ex);
      return false;
    }
  };

  public getStaticPropsHandler = async (
    info: IComponentInfo,
    wpProps: { [key: string]: unknown },
    href: string,
    graphQLClient: IGraphQLClient,
  ): Promise<{ [key: string]: unknown }> => {
    try {
      const wpComponent = (await StaticWPComponentsStore.getPath(
        info.moduleName,
        info.componentAlias,
      )()) as IWPComponent;
      return !!wpComponent.getStaticProps
        ? await wpComponent.getStaticProps(wpProps, {
            href,
            graphQLClient,
          })
        : wpProps;
    } catch (ex) {
      console.error(ex);
      return wpProps;
    }
  };

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
