<template>
  <a-card class="container" :bordered="false">
    <template #title>
      项目导出
      <a-tooltip>
        <template #title>为降低服务器压力，每次只能导出一个。</template>
        <InfoCircleOutlined />
      </a-tooltip>
    </template>
    <template #extra>
      <a-dropdown trigger="click">
        <template #overlay>
          <a-menu @click="onDownload">
            <a-menu-item :key="DOWNLOAD_FILE_TYPE.VUE">Vue</a-menu-item>
            <a-menu-item :key="DOWNLOAD_FILE_TYPE.JSON">Json</a-menu-item>
            <a-menu-item :key="DOWNLOAD_FILE_TYPE.HTML" disabled>
              Html
            </a-menu-item>
          </a-menu>
        </template>
        <a-button size="small">
          导出类型
          <DownOutlined />
        </a-button>
      </a-dropdown>
    </template>
    <a-checkbox-group class="list" :value="checked" @change="onCheckBoxChange">
      <a-checkbox
        class="item"
        v-for="item in options"
        :value="item.value"
        :key="item.value">
        <span style="padding-top: 3.5px; display: inline-block">
          <FolderOutlined /> {{ item.label }}
        </span>
      </a-checkbox>
    </a-checkbox-group>
  </a-card>
</template>

<script setup lang="ts">
import { DOWNLOAD_FILE_TYPE } from '@/share/enums';
import { useNodeManagerStore } from '@/stores/nodeManagerStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { message, type CheckboxOptionType } from 'ant-design-vue';
import { onBeforeMount, ref } from 'vue';

const workspaceStore = useWorkspaceStore();
const nodeManagerStore = useNodeManagerStore();

const checked = ref<string[]>([]);
const options = ref<CheckboxOptionType[]>([]);

onBeforeMount(() => {
  options.value = workspaceStore.workData.map(({ name, key }) => ({
    label: name,
    value: key,
  }));
});

const onCheckBoxChange = (value: string[]) => {
  const val = value.pop();
  checked.value = !val ? [] : [val];
};

const onDownload = (e: any) => {
  const [nodeKey] = checked.value;
  if (!nodeKey) {
    message.info('请选择选择要导出的项目');
    return;
  }
  nodeManagerStore.exportToFile(e.key, nodeKey, true);
};
</script>

<style scoped>
.container {
  background: transparent;

  .ant-card-body {
    padding: 24px 0 24px 24px;
  }

  .list {
    max-height: calc(100vh - 120px);
    display: flex;
    overflow-y: auto;
    .item {
      width: 100%;
      height: 30px;
      display: flex;
    }
  }
}
</style>
