import React from 'react';
import { IComponentInfo } from 'src/share/stores/wp-components/models/component-info';
import {
  SiteNode,
  useSiteStructureStore,
  useAppSettingsShell,
} from '@quantumart/qp8-widget-platform-shell-core';
import { useWpcStore } from 'src/share/stores/wp-components/wp-component-store';
import { Layout } from '../layout/layout';
import { ZoneStore } from 'src/client/stores/zone/zone-store';
import {
  AbstractItemContext,
  WPRoutesStoreContext,
  ZoneStoreContext,
} from '@quantumart/qp8-widget-platform-bridge';
import { useWidgetPlatformStore } from 'src/share/stores/widget-platform-context/widget-platform-context-store';
import { Loader } from '../loader/loader';
import { AbstractItemStore } from 'src/client/stores/abstract-item/abstract-item-store';
import { WPItemStore, WPItemStoreContext } from 'src/client/stores/wp-item/wp-item-store';
import { WPComponentProps } from 'src/share/stores/wp-components/models/wp-component';
import { WPRoutesStore } from 'src/client/stores/wp-routes/wp-routes-store';
import { useHref } from 'src/share/hooks/url-location';
import { NotFoundComponent } from '../not-found/not-found-component';

interface IProps {
  node: SiteNode;
  componentInfo: IComponentInfo;
}

const Page = (props: IProps): JSX.Element => {
  const href = useHref();
  const appSettingsShell = useAppSettingsShell();
  const siteStructure = useSiteStructureStore();
  const wpStore = useWidgetPlatformStore();
  const [wpProps, setWPProps] = React.useState(
    () => wpStore.getPreloadData()?.details as WPComponentProps,
  );

  const [allowedSubpage, setAllowedSubpage] = React.useState(wpStore.getPreloadAllowedSubpage);

  const [itemStore, setItemStore] = React.useState(() => {
    var zones = wpStore.getPreloadZones();
    return zones == undefined ? undefined : new WPItemStore(zones ?? {});
  });
  const wpRoutesStore = React.useMemo(
    () =>
      new WPRoutesStore(appSettingsShell, wpStore, siteStructure.structure, props.node, href ?? ''),
    [appSettingsShell, wpStore, siteStructure.structure, props.node, href],
  );
  const abstractItemStore = React.useMemo(() => new AbstractItemStore(props.node), [props.node]);
  const zoneStore = React.useMemo(() => new ZoneStore(props.node.id!), [props.node.id!]);

  const tailUrl = wpRoutesStore.getTailUrl();

  const wpcStore = useWpcStore();
  const WPComponent = wpcStore.getComponent(props.componentInfo);

  const lazyload = async (): Promise<void> => {
    const allowedSubpage = await wpStore.getAllowedSubpage(props.node, tailUrl);
    setAllowedSubpage(allowedSubpage);
    setWPProps((await wpStore.getData(props.node)) as WPComponentProps);
    setItemStore(new WPItemStore((await wpStore.getZones(href ?? '', props.node.id!)) ?? {}));
  };
  React.useEffect(() => {
    if (!wpProps) {
      lazyload();
    }
  }, []);

  if (!allowedSubpage && wpRoutesStore.getTailUrl().length > 0) {
    return <NotFoundComponent />;
  }

  if (!!wpProps && !!itemStore) {
    return (
      <ZoneStoreContext.Provider value={zoneStore}>
        <WPItemStoreContext.Provider value={itemStore}>
          <WPRoutesStoreContext.Provider value={wpRoutesStore}>
            <AbstractItemContext.Provider value={abstractItemStore}>
              <Layout key={`${props.node.id}-${tailUrl}`}>
                <WPComponent key={`${props.node.id}-${tailUrl}`} {...wpProps} />
              </Layout>
            </AbstractItemContext.Provider>
          </WPRoutesStoreContext.Provider>
        </WPItemStoreContext.Provider>
      </ZoneStoreContext.Provider>
    );
  }
  return <Loader />;
};

export default Page;
