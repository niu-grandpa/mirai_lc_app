<template>
  <WorkSpaceLayout>
    <template #content>
      <WorkspaceVisual />
    </template>
    <template #sider>
      <WorkspaceSidebar />
    </template>
  </WorkSpaceLayout>
</template>

<script setup lang="ts">
import config from '@/config/common';
import { WorkSpaceLayout } from '@/layouts';
import { useNodeManagerStore } from '@/stores/nodeManagerStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { message } from 'ant-design-vue';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { WorkspaceSidebar, WorkspaceVisual } from './components';

const workspaceStore = useWorkspaceStore();
const nodeManagerStore = useNodeManagerStore();

const timer = ref();

const initData = async () => {
  const hide = message.loading('同步数据中..', 0);
  try {
    await workspaceStore.initData();

    nodeManagerStore.updateSelectedKeys();
    nodeManagerStore.updateExpandedKeys();

    workspaceStore.initOpenedFileKeys();
    workspaceStore.updateOpenedFilesByKeys('add', [
      ...workspaceStore.openedFileKeys,
    ]);
  } finally {
    setTimeout(hide, 1000);
  }
};

const autoSyncData = () => {
  if (!timer.value) {
    timer.value = setInterval(
      workspaceStore.updateWorkData,
      config.autoSaveInterval
    );
  }
};

onMounted(initData);

watch(
  () => workspaceStore.workData.length,
  len => {
    if (len) {
      autoSyncData();
      console.log('自动同步已开启');
    }
  }
);

const onBeforeunload = (e: BeforeUnloadEvent) => {
  e.preventDefault();
  e.returnValue = true;
};

onMounted(() => {
  window.addEventListener('beforeunload', onBeforeunload);
});

onBeforeUnmount(() => {
  clearInterval(timer.value);
  timer.value = null;
  window.removeEventListener('beforeunload', onBeforeunload);
});
</script>
