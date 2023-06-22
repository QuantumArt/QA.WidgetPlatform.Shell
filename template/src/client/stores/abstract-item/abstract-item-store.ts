import { IAbstractItem } from '@quantumart/qp8-widget-platform-bridge';
import { SiteNode } from '@quantumart/qp8-widget-platform-shell-core';

export class AbstractItemStore implements IAbstractItem {
  public readonly id: number;
  public readonly alias: string;
  public readonly nodeType: string;
  public readonly children: AbstractItemStore[];
  constructor(node: SiteNode) {
    this.id = node.id!;
    this.alias = node.alias ?? '';
    this.nodeType = node.nodeType ?? '';
    this.children = (node.children ?? []).map(child => new AbstractItemStore(child));
  }
}
