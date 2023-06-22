import React from 'react';
import { IComponentInfo } from '../models/component-info';
import { IWPComponent, WPComponentProps } from '../models/wp-component';
import { IWPComponentStore } from '../wp-component-store';
import { staticModules } from 'src/app-settings-shell/static-wpc-modules';
import { Loader } from 'src/client/components/loader/loader';
import { NotFoundComponent } from 'src/client/components/not-found/not-found-component';
import { useAppSettingsShell } from '@quantumart/qp8-widget-platform-shell-core';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

export class StaticWPComponentsStore implements IWPComponentStore {
  public getComponent = (info: IComponentInfo): ((props: WPComponentProps) => JSX.Element) => {
    const appSettings = useAppSettingsShell();
    const wpComponentPromise = StaticWPComponentsStore.getPath(
      info.moduleName,
      info.componentAlias,
    );

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

  public getStaticPropsHandler = async (
    info: IComponentInfo,
    wpProps: { [key: string]: unknown },
    apolloClient?: ApolloClient<NormalizedCacheObject>,
  ): Promise<{ [key: string]: unknown }> => {
    try {
      const wpComponent = (await StaticWPComponentsStore.getPath(
        info.moduleName,
        info.componentAlias,
      )()) as IWPComponent;
      return !!wpComponent.getStaticProps
        ? await wpComponent.getStaticProps(wpProps, apolloClient)
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
