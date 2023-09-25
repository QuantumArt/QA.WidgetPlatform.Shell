import { IAbstractItem } from '@quantumart/qp8-widget-platform-bridge';
import { SiteNode } from '@quantumart/qp8-widget-platform-shell-core';

export class PageItemStore implements IAbstractItem {
  public readonly id: number;
  public readonly alias: string;
  public readonly nodeType: string;
  public readonly children: IAbstractItem[];
  public readonly sortOrder: number;
  constructor(node: SiteNode) {
    this.id = node.id!;
    this.alias = node.alias ?? '';
    this.nodeType = node.nodeType ?? '';
    this.children = (node.children ?? []).map(child => new PageItemStore(child));
    this.sortOrder = 100; //TODO На данный момент, возвращается sortOrder только для детальной виджитной платформы.
  }
}