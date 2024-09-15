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

const alignmentThreshold = DRAG_RANGE * 2;

function checkIfWithinThreshold(current: number, target: number) {
  return Math.abs(current - target) < alignmentThreshold;
}

const updateAlignment = () => {
  const { x: curX, y: curY, el, width: curW, height: curH } = store.dragData;

  if (!el) {
    resetAlignment();
    return;
  }

  props.anodes.some(other => {
    if (el.id == other.key) return false;

    const {
      x: targetX,
      y: targetY,
      attrs: {
        style: { width: targetW, height: targetH },
      },
    } = other;
    const targetRectRight = targetX + extractNumberFromString(targetW);
    const targetRectBottom = targetY + extractNumberFromString(targetH);

    // 水平对齐
    if (
      checkIfWithinThreshold(curY, targetY) ||
      checkIfWithinThreshold(curY + curH, targetRectBottom)
    ) {
      horizontalPosition.value = targetY;
      showHorizontalLine.value = true;
    } else {
      showHorizontalLine.value = false;
    }

    // 垂直对齐
    if (
      checkIfWithinThreshold(curX, targetX) ||
      checkIfWithinThreshold(curX + curW, targetRectRight)
    ) {
      verticalPosition.value = targetX;
      showVerticalLine.value = true;
    } else {
      showVerticalLine.value = false;
    }

    return showVerticalLine.value || showHorizontalLine.value;
  });
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
