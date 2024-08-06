import { type ElementANode } from '@/types/abstractNode';
import interact from 'interactjs';
import { onBeforeUnmount, onMounted } from 'vue';

export interface UseDragTargetInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  el: HTMLElement | null;
}

export type UseDragAction = 'end' | 'move' | 'tap' | 'resize';

type Callback = (action: UseDragAction, info: UseDragTargetInfo) => void;

export const DRAG_RANGE = 15;

export function useDrag(data: ElementANode[], callback: Callback) {
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
        container: '.workspace-visual',
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
      onstart() {
        attrs.class['active'] = true;
      },
      onmove({ dx, dy, target }) {
        position.x += dx;
        position.y += dy;
        attrs.style.transform = `translate(${position.x}px, ${position.y}px)`;
        callback('move', {
          el: target,
          ...position,
          width: target.offsetWidth,
          height: target.offsetHeight,
        });
      },
      onend({ target }) {
        attrs['data-x'] = position.x;
        attrs['data-y'] = position.y;
        attrs.class['active'] = false;
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
    position: { x: number; y: number },
    attrs: Record<string, any>
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

        attrs.class['active'] = true;
        attrs.style.width = `${rect.width}px`;
        attrs.style.height = `${rect.height}px`;

        callback('resize', {
          el: target,
          ...position,
          width: target.offsetWidth,
          height: target.offsetHeight,
        });
      },
      onend() {
        attrs['data-x'] = position.x;
        attrs['data-y'] = position.y;
        attrs.class['active'] = false;
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

  const processElement = (node: ElementANode) => {
    const { x, y, key, attrs, children } = node;

    const elm = interact(`#${key}`);
    const position = { x, y };

    initAttrs(key, position, attrs);

    setupDraggable(elm, position, attrs);
    setupResizable(elm, position, attrs);
    setupTap(elm, position);

    if (children.length) {
      children.forEach(child => processElement(child));
    }
  };

  onMounted(() => {
    data.forEach(element => processElement(element));
  });

  onBeforeUnmount(() => {
    interact.stop();
  });
}
