<template>
  <section
    class="workspace-visual"
    ref="containerRef"
    @click.stop="onClick"
    @scroll="onScroll">
    <canvas ref="canvasRef" />
    <AuxLines />
    <HighlightBox v-show="isShowBox" />
    <NodeRenderer v-for="anode in props.data" :key="anode.key" :node="anode" />
  </section>
</template>

<script setup lang="ts">
import { useDrag } from '@/hooks';
import { DRAG_RANGE } from '@/hooks/useDrag';
import { type ElementANode } from '@/share/abstractNode';
import { useCommonStore } from '@/stores/commonStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import AuxLines from './AuxLines.vue';
import HighlightBox from './HighlightBox.vue';
import NodeRenderer from './NodeRenderer.vue';

const props = defineProps<{ data: ElementANode[] }>();

const commonStore = useCommonStore();
const workspaceStore = useWorkspaceStore();

const isShowBox = ref(false);
const containerRef = ref<HTMLElement>();
const canvasRef = ref<HTMLCanvasElement>();

useDrag(props.data, (action, info) => {
  commonStore.setDragData(
    Object.assign(commonStore.dragData, { action, ...info })
  );
  if (!isShowBox.value) {
    isShowBox.value = action !== 'move';
  }
  if (action === 'resize' || action === 'end') {
    const { x, y, el, width, height } = info;
    workspaceStore.updateOneNode(el!.id, {
      x,
      y,
      attrs: {
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${x}px, ${y}px)`,
        },
      },
    });
  }
});

const createGrids = (w = 0, h = 0) => {
  const canvasEl = canvasRef.value!;
  const ctx = canvasEl.getContext('2d')!;
  const { offsetWidth, offsetHeight } = containerRef.value!;

  const canvasW = w || offsetWidth;
  const canvasH = h || offsetHeight;

  canvasEl.width = canvasW;
  canvasEl.height = canvasH;
  ctx.setLineDash([1, 1]);

  for (let i = 0; i < ~~(canvasW / DRAG_RANGE); i++) {
    ctx.beginPath();
    ctx.moveTo(i * DRAG_RANGE, 0);
    ctx.lineTo(i * DRAG_RANGE, canvasH);
    ctx.strokeStyle = '#dcdee2';
    ctx.stroke();
  }

  for (let j = 0; j < ~~(canvasH / DRAG_RANGE); j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * DRAG_RANGE);
    ctx.lineTo(canvasW, j * DRAG_RANGE);
    ctx.strokeStyle = '#dcdee2';
    ctx.stroke();
  }
};

const onClick = ({ target }: MouseEvent) => {
  if (!Array.from((target as HTMLElement).classList).includes('draggable')) {
    isShowBox.value = false;
  } else {
    isShowBox.value = true;
  }
};

const onScroll = () => {
  const { scrollWidth, scrollHeight } = containerRef.value!;
  createGrids(scrollWidth, scrollHeight);
};

nextTick(() => {
  createGrids();
});
onMounted(() => {
  window.addEventListener('resize', () => createGrids());
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', () => createGrids());
});
</script>

<style scoped>
.workspace-visual {
  position: relative;
  height: calc(100vh - 64px);
  background-color: #ffffff;
  overflow: hidden;

  canvas {
    position: absolute;
    pointer-events: none;
  }

  .drop-active {
    border: dashed 2px rgb(255, 140, 0);
  }

  .draggable {
    position: absolute;
    user-select: none;
    touch-action: none;
    &.active {
      opacity: 0.7;
    }
  }
}
</style>
