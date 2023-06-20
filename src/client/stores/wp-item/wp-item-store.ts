import React from 'react';
import { WidgetDetails } from '@qp8-widget-platform/shell-core';

export class WPItemStore {
  constructor(public readonly zones: Record<string, WidgetDetails[]>) {}
}

export const WPItemStoreContext = React.createContext<WPItemStore | undefined>(undefined);
export const useWPItemStore = (): WPItemStore => React.useContext(WPItemStoreContext)!;
