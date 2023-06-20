import React from 'react';
import { WidgetDetails, useAppSettingsShell } from '@qp8-widget-platform/shell-core';
import { ZoneStore } from 'src/client/stores/zone/zone-store';
import { useWpcStore } from 'src/share/stores/wp-components/wp-component-store';
import { AbstractItemContext, ZoneStoreContext } from '@qp8-widget-platform/bridge';
import { AbstractItemStore } from 'src/client/stores/abstract-item/abstract-item-store';
import { WPItemStore, WPItemStoreContext } from 'src/client/stores/wp-item/wp-item-store';

interface IProps {
  widgetDetails: WidgetDetails;
}

const WPWidget = ({ widgetDetails }: IProps): JSX.Element => {
  const appSetting = useAppSettingsShell();
  const [itemStore] = React.useState(() => new WPItemStore(widgetDetails.childWidgets ?? {}));
  const [abstractItemStore] = React.useState(() => new AbstractItemStore(widgetDetails));
  const [zoneStore] = React.useState(() => new ZoneStore(widgetDetails.id!));

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
          <WPComponent key={widgetDetails.id} {...widgetDetails.details} />
        </AbstractItemContext.Provider>
      </WPItemStoreContext.Provider>
    </ZoneStoreContext.Provider>
  );
};

export default WPWidget;
