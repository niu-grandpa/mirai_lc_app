// @ts-nocheck
import { genANodeId } from '@/api/genId';
import {
  type ElementANode,
  type FileANode,
  type FolderANode,
  type TreeDataCommonType,
} from '@/share/abstractNode';

export const FolderKeySuffix = ';fld';

export class TreeManagerShare {
  protected async createFolderANode(
    name: string,
    isRoot = false
  ): Promise<FolderANode> {
    const children = !isRoot
      ? []
      : [await this.createFolderANode('src', false)];
    return {
      name,
      isRoot,
      children,
      isLeaf: false,
      isFolder: true,
      timestamp: Date.now(),
      key: await genANodeId(FolderKeySuffix),
    };
  }

  protected async createFileANode(name: string): Promise<FileANode> {
    return {
      name,
      anodes: [],
      isFile: true,
      isLeaf: true,
      key: await genANodeId(),
    };
  }

  protected async createElementANode(
    tagName: string,
    x: number,
    y: number
  ): Promise<ElementANode> {
    return {
      x,
      y,
      on: {},
      isLeaf: true,
      isComp: false,
      children: [],
      name: tagName,
      attrs: {
        class: {},
        style: {
          position: 'absolute',
          transform: `translate(${x}px, ${y}px)`,
        },
      },
      textContent: '',
      props: {},
      directives: {},
      key: await genANodeId(),
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
  protected recursiveFindAndProcess<T extends TreeDataCommonType>(
    nodes: T[],
    key: string,
    processFn: (node: T, parentNodes: T[], index: number) => boolean,
    parentNodes: T[] = []
  ): boolean {
    const stack = nodes.map((node, index) => ({
      node,
      parentNodes: nodes,
      index,
    }));

    while (stack.length) {
      const { node, parentNodes, index } = stack.pop();
      if (node.key === key) {
        // fix: 这里通过 processFn 直接修改 parentNodes 中的 node
        return processFn(node, parentNodes, index);
      }

      if (node.children && node.children.length > 0) {
        stack.push(
          ...node.children.map((child, childIndex) => ({
            node: child,
            parentNodes: node.children,
            index: childIndex,
          }))
        );
      }

      if (node.anodes && node.anodes.length > 0) {
        stack.push(
          ...node.anodes.map((anode, anodeIndex) => ({
            node: anode,
            parentNodes: node.anodes,
            index: anodeIndex,
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
  protected findNodesByKeys<T extends TreeDataCommonType>(
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
  protected async refreshNodeKeys(nodes: TreeDataCommonType[]) {
    const fn = nodes.map(async node => {
      node.key = await genANodeId();
      if (node?.children) {
        await this.refreshNodeKeys(node.children);
      } else if (node?.anodes) {
        await this.refreshNodeKeys(node.anodes);
      }
    });
    await Promise.all(fn);
  }
}
