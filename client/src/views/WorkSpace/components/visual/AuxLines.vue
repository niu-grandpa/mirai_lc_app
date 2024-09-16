<template>
  <div v-show="showHorizontalLine" class="auxline x" :style="style1" />
  <div v-show="showVerticalLine" class="auxline y" :style="style2" />
</template>

<script setup lang="ts">
import { DRAG_RANGE } from '@/hooks/useDrag';
import { extractNumberFromString } from '@/share';
import { type ElementANode } from '@/share/abstractNode';
import { useCommonStore } from '@/stores/commonStore';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  anodes: ElementANode[];
}>();

const store = useCommonStore();

const verticalPosition = ref(0);
const horizontalPosition = ref(0);
const showVerticalLine = ref(false);
const showHorizontalLine = ref(false);

const style1 = computed(() => ({
  transform: `translateY(${horizontalPosition.value}px)`,
}));
const style2 = computed(() => ({
  transform: `translateX(${verticalPosition.value}px)`,
}));

const resetAlignment = () => {
  verticalPosition.value = 0;
  horizontalPosition.value = 0;
  showVerticalLine.value = false;
  showHorizontalLine.value = false;
};

const checkIfWithinThreshold = (current: number, target: number) => {
  return Math.abs(current - target) < alignmentThreshold;
};

/**预判阈值 */
const alignmentThreshold = DRAG_RANGE * 2;

/**
 * @function updateAlignment
 *
 * @name 水平方向计算相邻元素
 *
 * @description
 * 1.从左到右判断相邻节点
 *
 * 1.1.计算是否靠近左侧：
 * 用当前节点的右边界值挨个减去其他节点的左边界值，如果小于24表示即将接近某个节点的左侧，
 * 将垂直辅助线的的x坐标值赋值为相邻节点的左边界值。
 *
 * 1.2.计算是否靠近右侧：
 * 用当前节点的右边界值挨个减去其他节点的右边界值，如果小于24表示即将接近某个节点的右侧，
 * 将垂直辅助线的的x坐标值赋值为相邻节点的右边界值。
 *
 * 2.从右到左判断相邻节点
 *
 * 2.1.计算是否靠近右侧：
 * 用当前节点的左边界值挨个减去其他节点的右边界值，如果小于24表示即将接近某个节点的右侧，
 * 将垂直辅助线的的x坐标值赋值为相邻节点的右边界值。
 *
 * 2.2.计算是否靠近左侧：
 * 用当前节点的左边界值挨个减去其他节点的左边界值，如果小于24表示即将接近某个节点的左侧，
 * 将垂直辅助线的的x坐标值赋值为相邻节点的左边界值。
 *
 * @name 垂直方向计算相邻元素
 *
 * @description
 * 3.从上到下判断相邻节点
 *
 * 3.1.计算是否靠近顶部：
 * 用当前节点的下边界值挨个减去其他节点的上边界值，如果小于24表示即将接近某个节点的顶部，
 * 将水平辅助线的y坐标值赋值为相邻节点的上边界值。
 *
 * 3.2.计算是否靠近底部：
 * 用当前节点的下边界值挨个减去其他节点的下边界值，如果小于24表示即将接近某个节点的底部，
 * 将水平辅助线的y坐标值赋值为相邻节点的下边界值。
 *
 * 4.从下到上判断相邻节点
 *
 * 4.1.计算是否靠近底部：
 * 用当前节点的上边界值挨个减去其他节点的下边界值，如果小于24表示即将接近某个节点的下方，
 * 将水平辅助线的y坐标值赋值为相邻节点的下边界值。
 *
 * 4.2.计算是否靠近顶部：
 * 用当前节点的上边界值挨个减去其他节点的上边界值，如果小于24表示即将接近某个节点的顶部，
 * 将水平辅助线的y坐标值赋值为相邻节点的上边界值。
 *
 */
const updateAlignment = () => {
  const { x: curX, y: curY, el, width: curW, height: curH } = store.dragData;

  if (!el) {
    resetAlignment();
    return;
  }

  let foundAlignment = false;

  // 先计算当前元素的边界值
  const curRight = curX + curW;
  const curBottom = curY + curH;

  props.anodes.some(other => {
    if (el.id === other.key) return false;

    const {
      x: targetX,
      y: targetY,
      attrs: {
        style: { width: targetW, height: targetH },
      },
    } = other;

    // 计算目标元素的边界值
    const targetRight = targetX + extractNumberFromString(targetW);
    const targetBottom = targetY + extractNumberFromString(targetH);

    const topAlignMatch =
      checkIfWithinThreshold(curY, targetY) ||
      checkIfWithinThreshold(curBottom, targetY);
    if (
      topAlignMatch ||
      checkIfWithinThreshold(curY, targetBottom) ||
      checkIfWithinThreshold(curBottom, targetBottom)
    ) {
      horizontalPosition.value = topAlignMatch ? targetY : targetBottom;
      showHorizontalLine.value = true;
      foundAlignment = true;
    } else {
      showHorizontalLine.value = false;
    }

    // 垂直对齐
    const leftAlignMatch =
      checkIfWithinThreshold(curX, targetX) ||
      checkIfWithinThreshold(curRight, targetX);
    if (
      leftAlignMatch ||
      checkIfWithinThreshold(curX, targetRight) ||
      checkIfWithinThreshold(curRight, targetRight)
    ) {
      verticalPosition.value = leftAlignMatch ? targetX : targetRight;
      showVerticalLine.value = true;
      foundAlignment = true;
    } else {
      showVerticalLine.value = false;
    }

    return foundAlignment;
  });

  if (!foundAlignment) {
    resetAlignment();
  }
};

watch(() => store.dragData, updateAlignment, { deep: true });
</script>

<style scoped>
.auxline {
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(0, 0);
  border: dashed 1px #b4b4b4;
  &.x {
    width: 100%;
  }
  &.y {
    height: 100%;
  }
}
</style>
