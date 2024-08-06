<template>
  <a-config-provider
    :theme="{
      algorithm: theme.darkAlgorithm,
    }">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notificationStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { theme } from 'ant-design-vue';
import { onBeforeMount } from 'vue';
import { treeData } from './views/mockData';

const workspaceStore = useWorkspaceStore();
const notificationStore = useNotificationStore();

onBeforeMount(() => {
  workspaceStore.fetchTreeData(treeData);
  workspaceStore.updateSelectedKey();
  workspaceStore.updateExpandedKeys([]);
  workspaceStore.initOpenedKeys();
  workspaceStore.updateOpenedFileANodes('add', [...workspaceStore.openedKeys]);

  notificationStore.initData();
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
