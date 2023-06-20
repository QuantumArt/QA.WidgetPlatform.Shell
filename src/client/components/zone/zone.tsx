import React from 'react';
import WPWidget from './wp-widget';
import { useWPItemStore } from 'src/client/stores/wp-item/wp-item-store';

interface IProps {
  zoneName: string;
}

const Zone = (props: IProps): JSX.Element => {
  const wpItemStore = useWPItemStore();
  const widgets = wpItemStore.zones[props.zoneName] ?? [];
  return (
    <>
      {widgets.map(widget => (
        <WPWidget key={widget.id} widgetDetails={widget} />
      ))}
    </>
  );
};

export default Zone;
