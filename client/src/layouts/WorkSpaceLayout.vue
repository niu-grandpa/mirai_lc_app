<template>
  <a-layout>
    <a-layout>
      <a-layout-content>
        <slot name="content" />
      </a-layout-content>
    </a-layout>
    <a-layout-sider
      ref="siderRef"
      :data-x="dataX"
      :width="store.width"
      :style="{ padding: 0, position: 'relative', background: '#24292E' }">
      <div class="resize-bar" ref="resizeBarRef" />
      <slot name="sider" />
    </a-layout-sider>
  </a-layout>
</template>

<script setup lang="ts">
import { useSidebarStore } from '@/stores/sidebarStore';
import interact from 'interactjs';
import { onMounted, ref } from 'vue';

const store = useSidebarStore();

const dataX = ref(0);
const siderRef = ref();
const resizeBarRef = ref<HTMLElement>();

const handleSiderResize = () => {
  interact(siderRef.value!.$el).resizable({
    edges: {
      top: false,
      bottom: false,
      left: resizeBarRef.value!,
      right: false,
    },
    invert: 'reposition',
    cursorChecker: () => 'col-resize',
    onmove: event => {
      let x = dataX.value;
      x = ~~((x || 0) - event.deltaRect.left);
      dataX.value = x;
      store.setWidth(store.initWidth + x);
    },
    onend: () => {
      dataX.value = 0;
      store.updateInitWidth();
    },
  });
};

onMounted(handleSiderResize);
</script>

<style scoped>
.resize-bar {
  width: 5px;
  height: 100%;
  position: absolute;
  z-index: 1;
  transition: background 0.3s ease-in-out;
  touch-action: none;
  user-select: none;

  &:hover {
    background-color: #1e8fffb7;
  }
}
</style>
