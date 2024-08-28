<template>
  <div
    v-show="lineVisibility.showTopY"
    class="auxline x top"
    :style="horizontalTop" />
  <div
    v-show="lineVisibility.showBottomY"
    class="auxline x bottom"
    :style="horizontalBottom" />
  <div
    v-show="lineVisibility.showLeftX"
    class="auxline y left"
    :style="verticalLeft" />
  <div
    v-show="lineVisibility.showRightX"
    class="auxline y right"
    :style="verticalRight" />
</template>

<script setup lang="ts">
import { DRAG_RANGE } from '@/hooks/useDrag';
import { useCommonStore } from '@/stores/commonStore';
import { computed, reactive, watch } from 'vue';

const LINE_THICKNESS = 2;

const store = useCommonStore();

const positions = reactive({
  topY: 0,
  bottomY: 0,
  leftX: 0,
  rightX: 0,
});

const lineVisibility = reactive({
  showTopY: false, // 显示x轴方向的上横线
  showBottomY: false, // x轴方向的下横线
  showLeftX: false, // y轴方向的左竖线
  showRightX: false, // y轴方向的右竖线
});

const horizontalTop = computed(() => ({
  transform: `translateY(${positions.topY}px)`,
}));
const horizontalBottom = computed(() => ({
  transform: `translateY(${positions.bottomY}px)`,
}));
const verticalLeft = computed(() => ({
  transform: `translateX(${positions.leftX}px)`,
}));
const verticalRight = computed(() => ({
  transform: `translateX(${positions.rightX}px)`,
}));

const showAuxiliaryLines = () => {
  const { x, y, width, height, el } = store.dragData;
  const newPositions = {
    topY: y - DRAG_RANGE,
    bottomY: y + height + DRAG_RANGE,
    leftX: x - width - DRAG_RANGE,
    rightX: x + width + DRAG_RANGE,
  };

  Object.entries(newPositions).forEach(([key, position]) => {
    const selector = `[data-${key.endsWith('Y') ? 'y' : 'x'}="${position}"]`;
    if (key === 'leftX') position += width + 2;
    toggleAuxiliaryLine(key, position, selector, el);
  });
};

const toggleAuxiliaryLine = (
  lineKey: string,
  position: number,
  selector: string,
  target: HTMLElement | null
) => {
  const elementNearPosition = document.querySelector(selector);
  const visibleKey = `show${
    lineKey.charAt(0).toUpperCase() + lineKey.slice(1)
  }`;

  if (elementNearPosition && !elementNearPosition.contains(target)) {
    // @ts-ignore
    positions[lineKey] = position - LINE_THICKNESS;
    // @ts-ignore
    lineVisibility[visibleKey] = true;
  } else {
    // @ts-ignore
    lineVisibility[visibleKey] = false;
  }
};

watch(
  () => store.dragData,
  ({ action }) => {
    if (action === 'move') {
      showAuxiliaryLines();
    } else if (action === 'end') {
      lineVisibility.showTopY = false;
      lineVisibility.showBottomY = false;
      lineVisibility.showLeftX = false;
      lineVisibility.showRightX = false;
    }
  },
  { deep: true }
);
</script>

<style scoped>
.auxline {
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(0, 0);
  border: dashed 1px orange;
  &.x {
    width: 100%;
  }
  &.y {
    height: 100%;
  }
}
</style>
