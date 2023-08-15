import React from 'react';
import Zone from 'src/client/components/zone/zone';
import DynamicZone from 'src/client/components/dynamic-zone/dynamic-zone';
import { IZoneStore } from '@quantumart/qp8-widget-platform-bridge';

export class ZoneStore implements IZoneStore {
  constructor(private readonly nodeId: number, public readonly currentZoneName?: string) {}
  public getZoneComponent = (zoneName: string): JSX.Element => (
    <Zone key={`${this.nodeId}-${zoneName}`} zoneName={zoneName} />
  );
  public DynamicZone = (prop: { html: string }): JSX.Element => <DynamicZone html={prop.html} />;
}
