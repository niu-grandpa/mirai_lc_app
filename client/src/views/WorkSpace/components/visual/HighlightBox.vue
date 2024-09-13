<template>
  <ul class="highlight-box" :style="style">
    <li class="dot top" />
    <li class="dot bottom" />
    <li class="dot left" />
    <li class="dot right" />
    <li class="dot top-right" />
    <li class="dot top-left" />
    <li class="dot bottom-right" />
    <li class="dot bottom-left" />
  </ul>
</template>

<script setup lang="ts">
import { useCommonStore } from '@/stores/commonStore';
import { computed } from 'vue';

const store = useCommonStore();

const style = computed(() => ({
  width: `${store.dragData.action !== 'move' && store.dragData.width}px`,
  height: `${store.dragData.action !== 'move' && store.dragData.height}px`,
  transform: `translate(${
    store.dragData.action !== 'move' && store.dragData.x
  }px, ${store.dragData.y}px)`,
}));
</script>

<style>
.highlight-box {
  position: absolute;
  border: 2px dashed orange;
  z-index: 1;
  list-style: none;
  pointer-events: none;

  .dot {
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: orange;
    transform: translate(-50%, -50%);

    &.top {
      top: 0;
      left: 50%;
    }

    &.bottom {
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 50%);
    }

    &.left {
      top: 50%;
      left: 0;
    }

    &.right {
      top: 50%;
      right: 0;
      transform: translate(50%, -50%);
    }

    &.top-right {
      top: 0;
      right: 0;
      transform: translate(50%, -50%);
    }

    &.top-left {
      top: 0;
      left: 0;
    }

    &.bottom-right {
      bottom: 0;
      right: 0;
      transform: translate(50%, 50%);
    }

    &.bottom-left {
      bottom: 0;
      left: 0;
      transform: translate(-50%, 50%);
    }
  }
}
</style>
