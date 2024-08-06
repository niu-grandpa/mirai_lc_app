// @ts-nocheck
import {
  type ElementANode,
  type FileANode,
  type FolderANode,
  type TreeDataCommonType,
} from '@/types/abstractNode';
import { nanoid } from 'nanoid';

export const FolderKeySuffix = ';fld';

export class TreeManagerShare {
  private genId(prefix = '', suffix = '') {
    return `${prefix}${nanoid(8)}${suffix}`;
  }

  protected createFolderANode(name: string): FolderANode {
    return {
      name,
      children: [],
      isLeaf: false,
      isFolder: true,
      timestamp: Date.now(),
      key: this.genId('P', FolderKeySuffix),
    };
  }

  protected createFileANode(name: string): FileANode {
    return {
      name,
      style: '',
      script: '',
      anodes: [],
      isFile: true,
      isLeaf: true,
      key: this.genId('G'),
    };
  }

  protected createElementANode(
    tagName: string,
    x: number,
    y: number
  ): ElementANode {
    return {
      x,
      y,
      on: {},
      isLeaf: true,
      isComp: false,
      children: [],
      name: tagName,
      attrs: {
        class: new Set(),
        style: {
          position: 'absolute',
          transform: 'translate(0, 0)',
        },
      },
      textContent: '',
      props: {},
      directives: {},
      key: this.genId('Z'),
    };
  }

  /**
   * 递归查找并处理节点
   * @param nodes 当前节点数组
   * @param key 要查找的节点键
   * @param processFn 处理函数
   * @param parentNodes 父节点数组
   * @returns 是否成功处理节点
   */
  protected recursiveFindAndProcess<T = TreeDataCommonType>(
    nodes: T[],
    key: string,
    processFn: (node: T, parentNodes: T[]) => boolean,
    parentNodes: T[] = []
  ): boolean {
    const stack = nodes.map(node => ({ node, parentNodes: nodes }));

    while (stack.length) {
      const { node, parentNodes } = stack.pop();
      if (node.key === key) {
        return processFn(node, parentNodes);
      }

      if (node.children && node.children.length > 0) {
        stack.push(
          ...node.children.map(child => ({
            node: child,
            parentNodes: node.children,
          }))
        );
      }

      if (node.anodes && node.anodes.length > 0) {
        stack.push(
          ...node.anodes.map(anode => ({
            node: anode,
            parentNodes: node.anodes,
          }))
        );
      }
    }

    return false;
  }

  /**
   * 递归地对节点数组进行排序
   * @param nodes 当前节点数组
   */
  protected recursiveSortNodes(nodes: TreeDataCommonType[]) {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        this.recursiveSortNodes(node.children);
      }
      if (node.anodes && node.anodes.length > 0) {
        this.recursiveSortNodes(node.anodes);
      }
    });
  }

  /**
   * 根据 keys 数组查找所有对应的节点
   * @param keys 节点键数组
   * @returns 查找到的节点数组
   */
  protected findNodesByKeys<T = TreeDataCommonType>(
    nodes: T[],
    keys: string[]
  ): T[] {
    const foundNodes: T[] = [];
    const keySet = new Set(keys); // 使用 Set 提高查找效率

    const findAndCollectNodes = (nodes: T[]): boolean => {
      for (const node of nodes) {
        if (keySet.has(node.key)) {
          foundNodes.push(node);
          keySet.delete(node.key); // 从 Set 中移除已找到的 key
          if (keySet.size === 0) {
            return true; // 如果所有 key 都已找到，直接返回
          }
        }
        if (node.isFolder && findAndCollectNodes(node.children)) {
          return true;
        }
        if (node.isFile && findAndCollectNodes(node.anodes)) {
          return true;
        }
        if (
          !node.isFolder &&
          !node.isFile &&
          findAndCollectNodes(node.children)
        ) {
          return true;
        }
      }
      return false;
    };

    findAndCollectNodes(nodes);
    return foundNodes;
  }

  /**
   * 重设节点及其子节点的 key
   * @param nodes 要重设的节点数组
   */
  protected refreshNodeKeys(nodes: TreeDataCommonType[]) {
    nodes.forEach(node => {
      node.key = this.genId();
      if (node?.children) {
        this.refreshNodeKeys(node.children);
      } else if (node?.anodes) {
        this.refreshNodeKeys(node.anodes);
      }
    });
  }
}
