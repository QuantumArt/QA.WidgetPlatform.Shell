import { useAbstractItem } from '@quantumart/qp8-widget-platform-bridge';
import React from 'react';

const OnScreenPage = (): JSX.Element | null => {
  const abstractItem = useAbstractItem();
  React.useEffect(() => {
    window.currentPageId = abstractItem.id;
  }, [abstractItem.id]);
  return null;
};

export default OnScreenPage;
