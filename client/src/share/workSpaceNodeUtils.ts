import {
  createNodeId,
  type FileConentNode,
  type FolderNode,
  type FolderOrFileNodeType,
  type WorkDataNodeType,
} from '@/api/workData';
import { type AntTreeNodeDropEvent } from 'ant-design-vue/es/tree';
import deepmerge from 'deepmerge';
import interact from 'interactjs';
import { deepClone } from '.';
import { VISUAL_CLASS_NAME } from './enums';

// Drag1 用于画布节点的拖拽
export interface Drag1Info {
  x: number;
  y: number;
  width: number;
  height: number;
  el: HTMLElement | null;
}
export type Drag1Action = 'end' | 'move' | 'tap' | 'resize';
export type Drag1Callback = (action: Drag1Action, info: Drag1Info) => void;

export const DRAG_RANGE = 12;

class NodeUtils {
  /**按节点名称进行正序排序 */
  sort(list: WorkDataNodeType[], deep = false) {
    list.sort((a, b) => a.name.localeCompare(b.name));
    if (deep) {
      list.forEach(node => {
        if (!node.isFile && node.children.length && node.isLeaf !== undefined) {
          this.sort(node.children);
        }
      });
    }
  }

  queryAllByKeys<T extends FolderNode>(list: T[], keys: string[]): T[] {
    const foundNodes: T[] = [];
    const keySet = new Set(keys); // 使用 Set 提高查找效率

    const findAndCollectNodes = (list: T[]): boolean => {
      if (!list) return false;
      for (const node of list) {
        if (keySet.has(node.key)) {
          foundNodes.push(node);
          keySet.delete(node.key); // 从 Set 中移除已找到的 key
          if (keySet.size === 0) {
            return true; // 如果所有 key 都已找到，直接返回
          }
        }

        if (
          // @ts-ignore
          findAndCollectNodes(node.children) ||
          // @ts-ignore
          findAndCollectNodes(node.content)
        ) {
          return true;
        }
      }
      return false;
    };

    findAndCollectNodes(list);
    return foundNodes;
  }

  getRootNode(list: FolderNode[], rootKey: string): FolderNode {
    let data = null;
    list.some(item => {
      if (item.rootKey === rootKey) {
        data = item;
        return true;
      }
    });
    if (!data) throw 'Not founded root node';
    return data;
  }

  updateOne(target: WorkDataNodeType | FolderOrFileNodeType, value: object) {
    if (!target) return;

    for (const key in value) {
      // @ts-ignore
      const v = value[key];
      if (Reflect.has(target, key)) {
        const b = Reflect.get(target, key);
        if (typeof b !== 'object') {
          Reflect.set(target, key, v);
        } else {
          Reflect.set(target, key, deepmerge(b, v));
        }
      } else {
        Reflect.set(target, key, v);
      }
    }
  }

  removeRoot(list: FolderNode[], root: FolderNode) {
    if (root.isRoot) {
      list.splice(list.indexOf(root), 1);
    }
  }

  removeOne(list: FolderNode[], key: string) {
    this.recursiveFindAndProcess(list, key, (node, parentNodes) => {
      const index = parentNodes.indexOf(node);
      if (index !== -1) {
        parentNodes.splice(index, 1);
        return true;
      }
      return false;
    });
  }

  private recursiveFindAndProcess<T extends FolderNode>(
    list: T[],
    key: string,
    processFn: (node: T, parentNodes: T[], index: number) => boolean
  ): boolean {
    const stack: any[] = list.map((node, index) => ({
      node,
      parentNodes: list,
      index,
    }));

    while (stack.length) {
      const { node, parentNodes, index } = stack.pop()!;
      if (node.key === key) {
        // 这里通过 processFn 直接修改 parentNodes 中的 node
        return processFn(node, parentNodes, index);
      }

      const ch = (node?.children || node?.content) as WorkDataNodeType[];
      if (ch) {
        stack.push(
          ...ch.map((child, childIndex: number) => ({
            node: child,
            parentNodes: ch,
            index: childIndex,
          }))
        );
      }
    }

    return false;
  }

  clone<T>(node: T): T {
    return deepClone(node);
  }

  async refreshKeys(nodes: WorkDataNodeType[]) {
    const fn = nodes.map(async node => {
      node.key = await createNodeId();
      if (node.children) {
        await this.refreshKeys(node.children);
      }
    });
    await Promise.all(fn);
  }

  renameDuplicate<T extends WorkDataNodeType>(list: T[], nodes: T[]) {
    const existingNames = new Set<string>();
    list.forEach(node => {
      existingNames.add(node.name);
    });

    nodes.forEach(n => {
      let count = 0;
      while (existingNames.has(n.name)) {
        count++;
        const arr = n.name.split(' ');
        const last = arr.pop();
        if (Number(last)) {
          count = Number(last) + 1;
          n.name = arr.join(' ') + ` ${count}`;
        } else if (last === 'copy') {
          n.name += ` ${count}`;
        } else {
          n.name += ' copy';
        }
      }
    });
  }

  /**
   * 用于画布节点的拖拽
   */
  onDrag1(list: FileConentNode[], callback: Drag1Callback) {
    if (!list) return;

    const setupDraggable = (
      elm: Interact.Interactable,
      position: { x: number; y: number }
    ) => {
      elm.draggable({
        cursorChecker(action, interactable, element, interacting) {
          return interacting ? 'grabbing' : 'grab';
        },
        autoScroll: {
          container: `.${VISUAL_CLASS_NAME}`,
          margin: 50,
          distance: 5,
          interval: 10,
          speed: 300,
        },
        modifiers: [
          interact.modifiers.snap({
            targets: [interact.snappers.grid({ x: DRAG_RANGE, y: DRAG_RANGE })],
            range: DRAG_RANGE,
            relativePoints: [{ x: 0, y: 0 }],
          }),
          interact.modifiers.restrictRect({
            restriction: undefined,
            endOnly: true,
          }),
        ],
        onmove({ dx, dy, target }) {
          position.x += ~~dx;
          position.y += ~~dy;
          callback('move', {
            el: target,
            ...position,
            width: target.offsetWidth,
            height: target.offsetHeight,
          });
        },
        onend({ target }) {
          callback('end', {
            el: target,
            ...position,
            width: target.offsetWidth,
            height: target.offsetHeight,
          });
        },
      });
    };

    const setupResizable = (
      elm: Interact.Interactable,
      position: { x: number; y: number }
    ) => {
      elm.resizable({
        autoScroll: true,
        invert: 'reposition',
        edges: { top: true, left: true, bottom: true, right: true },
        modifiers: [
          interact.modifiers.restrict({
            restriction: undefined,
            endOnly: true,
          }),
        ],
        onmove({ rect, target, deltaRect }) {
          const newX =
            (position.x || Math.floor(position.x) || 0) + deltaRect.left;
          const newY =
            (position.y || Math.floor(position.y) || 0) + deltaRect.top;

          position.x = newX;
          position.y = newY;

          callback('resize', {
            el: target,
            ...position,
            width: rect.width,
            height: rect.height,
          });
        },
      });
    };

    const setupTap = (
      elm: Interact.Interactable,
      position: { x: number; y: number }
    ) => {
      elm.on('tap', ({ target }) => {
        callback('tap', {
          el: target,
          ...position,
          width: target.offsetWidth,
          height: target.offsetHeight,
        });
      });
    };

    const initAttrs = (
      key: string,
      position: { x: number; y: number },
      attrs: Record<string, any>
    ) => {
      attrs.id = key;
      attrs['data-x'] = position.x;
      attrs['data-y'] = position.y;
      attrs.class.draggable = true;
      attrs.style.transform = `translate(${position.x}px, ${position.y}px)`;
    };

    const fn = (node: FileConentNode) => {
      const { x, y, key, attributes, children } = node;

      const elm = interact(`#${key}`);
      const position = { x: ~~x, y: ~~y };

      initAttrs(key, position, attributes);

      setupDraggable(elm, position);
      setupResizable(elm, position);
      setupTap(elm, position);

      if (children.length) {
        children.forEach(child => fn(child));
      }
    };

    list.forEach(fn);
  }

  /**
   * 用于侧边栏文件节点的拖拽
   */
  onDrag2<T extends FolderOrFileNodeType>(
    data: T[],
    info: AntTreeNodeDropEvent
  ) {
    const extractDropInfo = (info: AntTreeNodeDropEvent) => {
      const dropKey = info.node.key;
      const dragKey = info.dragNode.key;
      const dropPos = info.node.pos!.split('-');
      const dropPosition =
        info.dropPosition - Number(dropPos[dropPos.length - 1]);
      const isFolder = info.node.isFolder;
      return { dropKey, dragKey, dropPosition, isFolder };
    };

    const loopThroughNodes = (
      data: T[],
      key: string | number,
      callback: (item: T, index: number, arr: T[]) => void
    ) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          loopThroughNodes(data[i].children as T[], key, callback);
        }
      }
    };

    const { dropKey, dragKey, dropPosition, isFolder } = extractDropInfo(info);

    // 不允许拖入叶子节点内，否则会造成拖动的节点消失
    // info.dropToGap 为 false 表示拖入节点内
    if (!info.dropToGap && info.node.isLeaf) {
      return data;
    }

    // @ts-ignore
    let dragObj: T = null;
    loopThroughNodes(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap && isFolder) {
      loopThroughNodes(data, dropKey, item => {
        if (item.children) {
          item.children = item.children || [];
          item.children.unshift(dragObj as any);
        }
      });
    } else {
      let ar: T[] = [];
      let i = 0;
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
}

const workSpaceNodeUtils = new NodeUtils();
export default workSpaceNodeUtils;
