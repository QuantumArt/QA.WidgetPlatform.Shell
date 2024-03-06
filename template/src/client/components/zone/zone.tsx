import React, { Fragment, useEffect } from 'react';
import WPWidget from './wp-widget';
import { useWPItemStore } from 'src/client/stores/wp-item/wp-item-store';
import OnScreenBlock from '../on-screen/on-screen-block';
import { getZoneInfo } from '@quantumart/qp8-widget-platform-shell-core';

interface IProps {
  zoneName: string;
}

const Zone = (props: IProps): JSX.Element => {
  const wpItemStore = useWPItemStore();
  const widgets = wpItemStore.zones[props.zoneName] ?? [];
  const zoneInfo = getZoneInfo(props.zoneName);

  return (
    <OnScreenBlock
      info={`zone`}
      data={{
        name: props.zoneName,
        isRecursive: zoneInfo.isRecursive,
        isGlobal: zoneInfo.isGlobal,
      }}
    >
      {widgets.map(widget => (
        <Fragment key={widget.id}>
          <OnScreenBlock
            info={`widget`}
            data={{
              id: widget.id,
              alias: widget.alias,
              title: widget.details?.title?.value,
              type: widget.nodeType,
              published: widget.published,
              order: widget.sortOrder,
            }}
          >
            <WPWidget widgetDetails={widget} />
          </OnScreenBlock>
        </Fragment>
      ))}
    </OnScreenBlock>
  );
};

export default Zone;
