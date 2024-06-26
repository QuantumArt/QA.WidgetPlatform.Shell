import React from 'react';
import { useAppSettingsShell } from '@quantumart/qp8-widget-platform-shell-core';
import { ZoneStore } from 'src/client/stores/zone/zone-store';
import { useWpcStore } from 'src/share/stores/wp-components/wp-component-store';
import { AbstractItemContext, ZoneStoreContext } from '@quantumart/qp8-widget-platform-bridge';
import { WPItemStore, WPItemStoreContext } from 'src/client/stores/wp-item/wp-item-store';
import { WidgetItemStore } from 'src/client/stores/abstract-item/widget-item-store';
import { WPWidgetDetails } from 'src/types/wp-widget-details';

interface IProps {
  widgetDetails: WPWidgetDetails;
}

const WPWidget = ({ widgetDetails }: IProps): JSX.Element => {
  const appSetting = useAppSettingsShell();
  const itemStore = React.useMemo(
    () => new WPItemStore(widgetDetails.childWidgets ?? {}),
    [widgetDetails.childWidgets ?? {}],
  );
  const abstractItemStore = React.useMemo(
    () => new WidgetItemStore(widgetDetails),
    [widgetDetails],
  );
  const zoneStore = React.useMemo(
    () => new ZoneStore(widgetDetails.id!, widgetDetails.zone ?? undefined),
    [widgetDetails.id!],
  );

  const fcdm =
    appSetting.widgetsPlatform.forcedConfigurationOfDynamicModules?.[widgetDetails.nodeType!];

  const wpcStore = useWpcStore();
  const WPComponent = wpcStore.getComponent({
    url: fcdm?.url ?? widgetDetails.frontModuleUrl ?? '',
    moduleName: fcdm?.moduleName ?? widgetDetails.frontModuleName ?? '',
    componentAlias: widgetDetails.nodeType!,
  });

  return (
    <ZoneStoreContext.Provider value={zoneStore}>
      <WPItemStoreContext.Provider value={itemStore}>
        <AbstractItemContext.Provider value={abstractItemStore}>
          <WPComponent key={widgetDetails.id} {...widgetDetails.staticProps} />
        </AbstractItemContext.Provider>
      </WPItemStoreContext.Provider>
    </ZoneStoreContext.Provider>
  );
};

export default WPWidget;
