import { WidgetZone } from '@qp8-widget-platform/bridge';
import React from 'react';

interface IProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Layout = (props: IProps): JSX.Element => (
  <>
    <WidgetZone name="SiteHeaderZone" />
    <main className="main">{props.children}</main>
    <WidgetZone name="SiteFooterZone" />
  </>
);
