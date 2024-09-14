<template>
  <section
    :class="VISUAL_CLASS_NAME"
    ref="containerRef"
    @click.stop="onClick"
    @scroll="onScroll">
    <canvas ref="canvasRef" />
    <AuxLines />
    <HighlightBox v-show="isShowHightlight" />
    <NodeRenderer v-for="anode in anodeList" :key="anode.key" :node="anode" />
  </section>
</template>

<script setup lang="ts">
import { useDrag } from '@/hooks';
import { DRAG_RANGE } from '@/hooks/useDrag';
import { type ElementANode } from '@/share/abstractNode';
import { VISUAL_CLASS_NAME } from '@/share/enums';
import { useCommonStore } from '@/stores/commonStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import AuxLines from './AuxLines.vue';
import HighlightBox from './HighlightBox.vue';
import NodeRenderer from './NodeRenderer.vue';

const props = defineProps<{ index: number; showHightlight: boolean }>();

const commonStore = useCommonStore();
const workspaceStore = useWorkspaceStore();
const sidebarStore = useSidebarStore();

const anodeList = ref<ElementANode[]>([]);

const timer = ref();
const isShowHightlight = ref(false);
const containerRef = ref<HTMLElement>();
const canvasRef = ref<HTMLCanvasElement>();

watch(
  () => props.showHightlight,
  newVal => {
    isShowHightlight.value = newVal;
  }
);

const init = () => {
  const { anodes } = [...workspaceStore.openedFiles][props.index];
  anodeList.value = anodes;
  processElementsDrag(anodeList.value);
};

onMounted(init);
watch(() => workspaceStore.openedFiles, init, { deep: true });

const processElementsDrag = useDrag((action, info) => {
  const merge = Object.assign(commonStore.dragData, { action, ...info });
  commonStore.setDragData(merge);

  const { x, y, el, width, height } = merge;

  if (!isShowHightlight.value) {
    isShowHightlight.value = action !== 'move';
  }

  workspaceStore.updateNode(
    el!.id,
    {
      x,
      y,
      attrs: {
        'data-x': x,
        'data-y': y,
        class: { active: action === 'move' },
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${x}px, ${y}px)`,
        },
      },
    },
    false
  );
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
    isShowHightlight.value = false;
  } else {
    isShowHightlight.value = true;
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

watch(
  () => sidebarStore.width,
  () => {
    if (timer.value) clearTimeout(timer.value);
    timer.value = setTimeout(createGrids, 200);
  }
);

onBeforeUnmount(() => {
  clearTimeout(timer.value);
  window.removeEventListener('resize', () => createGrids());
});
</script>

<style scoped>
.workspace-visual {
  position: relative;
  height: calc(100vh - 48px);
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
