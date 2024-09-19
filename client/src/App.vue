<template>
  <a-config-provider :theme="{ algorithm }">
    <a-spin
      :delay="200"
      tip="Loading..."
      size="large"
      :spinning="commonStore.loading">
      <router-view />
    </a-spin>
  </a-config-provider>
</template>

<script setup lang="ts">
import commonConfig from '@/config/common';
import { useCommonStore } from '@/stores/commonStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { theme } from 'ant-design-vue';
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue';
import { useNodeManagerStore } from './stores/nodeManagerStore';

const commonStore = useCommonStore();
const workspaceStore = useWorkspaceStore();
const nodeManagerStore = useNodeManagerStore();

const algorithm = computed(() =>
  commonStore.theme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm
);

onBeforeMount(() => {
  workspaceStore.getLocalWorkData();

  nodeManagerStore.updateSelectedKeys();
  nodeManagerStore.updateExpandedKeys();

  workspaceStore.initOpenedFileKeys();
  workspaceStore.updateOpenedFilesByKeys('add', [
    ...workspaceStore.openedFileKeys,
  ]);
});

const timer = ref();

onMounted(() => {
  if (!timer.value) {
    timer.value = setInterval(() => {
      workspaceStore.updateWorkData(workspaceStore.workData);
    }, commonConfig.autoSaveInterval);
  }

  window.addEventListener('beforeunload', e => {
    e.preventDefault();
    e.returnValue = true;
  });
});

onBeforeUnmount(() => {
  clearInterval(timer.value);
  timer.value = null;
});
</script>

<style>
/* 全局滚动条样式 */
/* 适用于 WebKit 浏览器和 Firefox */
/* 轨道样式 */
::-webkit-scrollbar {
  width: 12px; /* 滚动条宽度 */
  height: 12px; /* 水平滚动条高度 */
}

/* 滚动条轨道 */
::-webkit-scrollbar-track {
  background: transparent; /* 使轨道透明 */
  border-radius: 0; /* 若不需要圆角可以设置为0 */
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background: #888; /* 滑块颜色 */
  border-radius: 8px; /* 滑块圆角 */
  border: 3px solid transparent; /* 滑块边框透明 */
}

/* 滚动条滑块：hover */
::-webkit-scrollbar-thumb:hover {
  background: #555; /* 滑块悬停时的颜色 */
}

/* Firefox 滚动条样式 */
* {
  scrollbar-width: thin; /* "auto" 或 "thin" */
  scrollbar-color: #888 transparent; /* 滑块颜色 和 透明轨道 */
}
</style>
