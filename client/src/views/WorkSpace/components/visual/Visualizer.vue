<template>
  <section
    :class="VISUAL_CLASS_NAME"
    ref="containerRef"
    @click.stop="onContainerClick"
    @scroll="onContainerScroll">
    <canvas ref="canvasRef" />
    <HighlightBox v-show="isShow" />
    <AuxLines :children="nodes" />
    <NodeRenderer v-for="node in nodes" :key="node.key" :node="node" />
  </section>
</template>

<script setup lang="ts">
import { type FileConentNode } from '@/api/workData';
import { VISUAL_CLASS_NAME } from '@/share/enums';
import { DRAG_RANGE } from '@/share/workSpaceNodeUtils';
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

const timer = ref();
const isShow = ref(false);
const nodes = ref<FileConentNode[]>([]);
const containerRef = ref<HTMLElement>();
const canvasRef = ref<HTMLCanvasElement>();

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

const onContainerClick = ({ target }: MouseEvent) => {
  if (!Array.from((target as HTMLElement).classList).includes('draggable')) {
    isShow.value = false;
  } else {
    isShow.value = true;
  }
};

const onContainerScroll = () => {
  const { scrollWidth, scrollHeight } = containerRef.value!;
  createGrids(scrollWidth, scrollHeight);
};

const handleNodeDragging = () => {
  const { content } = [...workspaceStore.openedFiles][props.index];
  nodes.value = content;

  workspaceStore.onDragComponentNode(content, (action, info) => {
    const merge = Object.assign(commonStore.dragData ?? {}, {
      action,
      ...info,
    });
    const { x, y, el, width, height } = merge;
    const newVal: Partial<FileConentNode> = {
      x,
      y,
      attributes: {
        'data-x': x,
        'data-y': y,
        class: { active: action === 'move' },
        style: {
          width: `${width.toFixed(1)}px`,
          height: `${height.toFixed(1)}px`,
          transform: `translate(${x}px, ${y}px)`,
        },
      },
    };

    commonStore.setDragData(merge);
    workspaceStore.updateNode(el!.id, newVal, el!.dataset.rootKey);

    if (!isShow.value) isShow.value = action !== 'move';
    if (action === 'end') {
      isShow.value = false;
      commonStore._dragData.el = null;
    }
  });
};

nextTick(createGrids);

onMounted(() => {
  handleNodeDragging();
  window.addEventListener('resize', () => createGrids());
});

onBeforeUnmount(() => {
  clearTimeout(timer.value);
  window.removeEventListener('resize', () => createGrids());
});

watch(
  () => props.showHightlight,
  newVal => {
    isShow.value = newVal;
  }
);

watch(() => workspaceStore.openedFiles, handleNodeDragging, { deep: true });

watch(
  () => sidebarStore.width,
  () => {
    timer.value && clearTimeout(timer.value);
    timer.value = setTimeout(createGrids, 200);
  }
);
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
    color: #000;
    &.active {
      opacity: 0.7;
    }
  }
}
</style>
