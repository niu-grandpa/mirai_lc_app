// @ts-nocheck
import { deepClone } from '@/share';
import {
  type FolderANode,
  type TreeDataCommonType,
} from '@/share/abstractNode';
import { ANODE_ACTION_KEY } from '@/share/enums';
import { type AntTreeNodeDropEvent } from 'ant-design-vue/es/tree';
import deepmerge from 'deepmerge';
import { TreeManagerShare } from './share';

export interface CreateANodeOptions {
  name: string;
  isRoot: boolean;
  anchorKey: string | undefined;
  type: ANODE_ACTION_KEY;
}

export default class TreeManager extends TreeManagerShare {
  private temp: TreeDataCommonType[] = [];

  constructor() {
    super();
  }

  /**
   * 清空临时的树数据
   */
  freed() {
    this.temp = [];
  }

  /**
   * 设置树数据
   * @param treeData 树数据数组
   * @returns 当前实例
   */
  setData(treeData: TreeDataCommonType[]) {
    this.temp = treeData;
    return this;
  }

  /**
   * 获取树数据
   * @returns 树数据数组
   */
  getData() {
    return this.temp as FolderANode[];
  }

  /**
   * 对树节点进行排序
   * @returns 排序后的树数据
   */
  sortNodes() {
    this.recursiveSortNodes(this.getData());
    return this.getData();
  }

  /**
   * 查找一个节点
   * @param key
   * @returns
   */
  findNode(key: string): TreeDataCommonType {
    const node = this.findNodesByKeys(this.getData(), [key])[0];
    this.freed();
    return node;
  }

  async createAndInsertNode({
    type,
    name,
    isRoot,
    anchorKey,
  }: CreateANodeOptions) {
    if (isRoot && name === 'src') {
      throw Error('请使用其他文件名');
    }
    if (this.getData().some(item => item.name === name)) {
      throw Error('文件名已存在');
    }
    const newNode: TreeDataCommonType =
      type === ANODE_ACTION_KEY.CREATE_FOLDER ||
      type === ANODE_ACTION_KEY.CREATE_PROJECT
        ? await this.createFolderANode(name, isRoot)
        : type === ANODE_ACTION_KEY.CREATE_FILE
        ? await this.createFileANode(name)
        : await this.createElementANode(name);

    this.addOneNode(anchorKey, newNode);
  }

  /**
   * 更新指定节点的属性
   * @param key 节点键
   * @param value 要更新的属性对象
   */
  updateOneNode(key: string, value: Partial<TreeDataCommonType>) {
    this.recursiveFindAndProcess(this.temp, key, (node, parentNodes, index) => {
      if (node.name === 'src') {
        throw Error('不允许修改基本目录的名称');
      }
      // fix: 深度合并节点，直接修改 parentNodes 数组中的节点
      parentNodes[index] = deepmerge(node, value);
      return true;
    });
  }

  /**
   * 在指定节点下添加一个新节点
   * @param anchorKey 父节点键
   * @param newNode 新节点
   */
  addOneNode(anchorKey: string, newNode: TreeDataCommonType) {
    const data = this.getData();

    // 创建新的独立目录
    if (!anchorKey) {
      data.push(newNode);
    } else {
      this.recursiveFindAndProcess(data, anchorKey, parentNode => {
        if (parentNode.children.some(item => item.name === newNode.name)) {
          throw Error('文件名已存在');
        }
        if (parentNode.isFolder) {
          if (
            !newNode.isFolder &&
            newNode.name.toLowerCase() === 'app' &&
            parentNode.name === 'src'
          ) {
            throw Error('不允许在src目录下使用系统预留文件');
          }
          parentNode.children.push(newNode);
          return true;
        } else if (parentNode.isFile) {
          parentNode.anodes.push(newNode);
          return true;
        } else if (!parentNode.isFolder && !parentNode.isFile) {
          parentNode.children.push(newNode);
          return true;
        }
        return false;
      });
    }

    this.sortNodes();
    this.freed();
  }

  /**
   * 删除指定节点
   * @param key 要删除的节点键
   */
  removeOneNode(key: string) {
    this.recursiveFindAndProcess(this.getData(), key, (node, parentNodes) => {
      if (node.name === 'src') {
        throw Error('不允许删除基本目录');
      }
      const index = parentNodes.indexOf(node);
      if (index !== -1) {
        parentNodes.splice(index, 1);
        return true; // 找到并删除节点后，直接返回
      }
      return false;
    });
  }

  /**
   * 通过名字模糊匹配所有节点的key
   * @param data
   * @param name
   * @returns 返回匹配到的所有key
   */
  findKeysByName(name: string): string[] {
    const result: string[] = [];
    const stack: TreeDataCommonType[] = [...this.getData()]; // 初始化栈

    while (stack.length > 0) {
      const item = stack.pop();
      if (item.name.includes(name)) {
        result.push(item.key); // 匹配成功则添加 key
      }
      if (item.children) {
        stack.push(...item.children); // 将子节点压入栈中
      }
    }

    this.freed();
    return result;
  }

  /**
   * 拖拽节点
   * @param info
   * @returns
   */
  dragNode<T = AntTreeNodeDropEvent>(info: T): FolderANode[] {
    /**
     * 提取拖放的信息，包括拖动的key，放置的key，放置位置和目标节点是否是文件夹。
     */
    const extractDropInfo = (info: T) => {
      const dropKey = info.node.key;
      const dragKey = info.dragNode.key;
      const dropPos = info.node.pos!.split('-');
      const dropPosition =
        info.dropPosition - Number(dropPos[dropPos.length - 1]);
      const isFolder = info.node.isFolder;
      return { dropKey, dragKey, dropPosition, isFolder };
    };

    /**
     * 遍历树结构，找到指定key的节点并执行回调函数。
     */
    const loopThroughNodes = (
      data: rANode[],
      key: string | number,
      callback: (item: FolderANode, index: number, arr: FolderANode[]) => void
    ) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          loopThroughNodes(data[i].children, key, callback);
        }
      }
    };

    const data = this.getData();
    const { dropKey, dragKey, dropPosition, isFolder } = extractDropInfo(info);

    // 不允许拖入叶子节点内，否则会造成拖动的节点消失
    // info.dropToGap 为 false 表示拖入节点内
    if (!info.dropToGap && info.node.isLeaf) {
      return data;
    }

    let dragObj: FolderANode = null;
    loopThroughNodes(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap && isFolder) {
      loopThroughNodes(data, dropKey, item => {
        item.children = item.children || [];
        item.children.unshift(dragObj);
      });
    } else {
      let ar: FolderANode[] = [];
      let i: number | string = 0;
      loopThroughNodes(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
      });

      if (dropPosition === -1) {
        // Drop before the target node
        ar.splice(i, 0, dragObj);
      } else {
        // Drop after the target node
        ar.splice(i + 1, 0, dragObj);
      }
    }

    return data;
  }

  /**
   * 将 keys 对应的节点粘贴到 targetKey 对应的目标节点下
   * @param targetKey 目标节点键
   * @param keys 要粘贴的节点键数组
   */
  async pasteNode(
    targetKey: string,
    keys: string[],
    customNodes?: (target: any[]) => void
  ) {
    const nodesToPaste = deepClone(this.findNodesByKeys(this.getData(), keys));

    await this.refreshNodeKeys(nodesToPaste);

    customNodes(nodesToPaste);

    this.recursiveFindAndProcess(this.getData(), targetKey, node => {
      if (node.isFolder) {
        const existingNames = new Set(node.children.map(child => child.name));
        // 重命名操作
        const renamedNodes = nodesToPaste.map(r_node => {
          let newName = r_node.name;
          let count = 1;
          while (existingNames.has(newName)) {
            count++;
            const baseName = r_node.name.split('-')[0];
            newName = `${baseName}-副本(${count})`;
          }
          existingNames.add(newName);
          r_node.name = newName;
          return r_node;
        });
        node.children.push(...renamedNodes);
        this.sortNodes();
        return true;
        // 在文件树管理模块进行cv操作时不会发生下面的情况，已经从下拉选项阻断了
      } else if (node.isFile) {
        node.anodes.push(...nodesToPaste);
        return true;
      } else {
        node.children.push(...nodesToPaste);
        return true;
      }
    });

    return this;
  }
}
