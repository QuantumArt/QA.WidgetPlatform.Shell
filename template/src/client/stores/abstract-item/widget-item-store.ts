import { IAbstractItem } from '@quantumart/qp8-widget-platform-bridge';
import { WidgetDetails } from '@quantumart/qp8-widget-platform-shell-core';

export class WidgetItemStore implements IAbstractItem {
  public readonly id: number;
  public readonly alias: string;
  public readonly nodeType: string;
  public readonly children: IAbstractItem[];
  public readonly sortOrder: number;
  constructor(node: WidgetDetails) {
    this.id = node.id!;
    this.alias = node.alias ?? '';
    this.nodeType = node.nodeType ?? '';
    this.children = [];
    this.sortOrder = node.sortOrder ?? 100; //TODO На данный момент, возвращается sortOrder только для детальной виджитной платформы.
  }
}
