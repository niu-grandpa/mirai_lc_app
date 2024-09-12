import { type ElementANode } from '@/share/abstractNode';
import { VISUAL_CLASS_NAME } from '@/share/enums';
import interact from 'interactjs';
import { onBeforeUnmount } from 'vue';

export interface UseDragTargetInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  el: HTMLElement | null;
}

export type UseDragAction = 'end' | 'move' | 'tap' | 'resize';

type Callback = (action: UseDragAction, info: UseDragTargetInfo) => void;

export const DRAG_RANGE = 10;

export function useDrag(callback: Callback) {
  const setupDraggable = (
    elm: Interact.Interactable,
    position: { x: number; y: number },
    attrs: Record<string, any>
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
    attrs.class['draggable'] = true;
    attrs.style.transform = `translate(${position.x}px, ${position.y}px)`;
  };

  const processElement = (data: ElementANode[]) => {
    const fn = (node: ElementANode) => {
      const { x, y, key, attrs, children } = node;

      const elm = interact(`#${key}`);
      const position = { x: ~~x, y: ~~y };

      initAttrs(key, position, attrs);

      setupDraggable(elm, position, attrs);
      setupResizable(elm, position);
      setupTap(elm, position);

      if (children.length) {
        children.forEach(child => fn(child));
      }
    };
    data.forEach(fn);
  };

  onBeforeUnmount(interact.stop);

  return processElement;
}
