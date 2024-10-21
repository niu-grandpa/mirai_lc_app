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
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { message } from 'ant-design-vue';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { WorkspaceSidebar, WorkspaceVisual } from './components';

const store = useWorkspaceStore();

const timer = ref();

onMounted(async () => {
  const hide = message.loading('加载数据中..', 0);
  try {
    const data = await store.getData();

    store.updateWorkData(data);
    store.setSelectedFileNodeKeys();
    store.setExpandedFileNodeKeys();
    store.initOpenedFileNodeKeys();
    store.updateOpenedFileNodeByKeys('add', [...store.openedFileNodeKeys]);

    setTimeout(hide, 1000);
  } catch (e) {
    console.log(e);
    message.error('初始化数据错误');
    hide();
  }
});

watch(
  () => store.workData.length,
  len => {
    if (len && !timer.value) {
      console.log('自动同步已开启');
      timer.value = setInterval(() => {
        store.updateWorkData();
        console.log(`[${new Date().toLocaleString()}] 已保存当前数据`);
      }, config.autoSaveInterval);
    }
  }
);

const onBeforeunload = (e: BeforeUnloadEvent) => {
  e.preventDefault();
  e.returnValue = true;
  store.updateWorkData();
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
