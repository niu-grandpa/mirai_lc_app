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
      <a-dropdown v-if="checked.length" trigger="click">
        <template #overlay>
          <a-menu @click="onDownload">
            <a-menu-item key="json">json</a-menu-item>
            <a-menu-item key="vue">vue</a-menu-item>
            <a-menu-item key="react" disabled>react</a-menu-item>
            <a-menu-item key="html" disabled>html</a-menu-item>
          </a-menu>
        </template>
        <a-button size="small">
          导出选项...
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
        <span style="padding-top: 3px; display: inline-block">
          <FolderOutlined /> {{ item.label }}
        </span>
      </a-checkbox>
    </a-checkbox-group>
  </a-card>
</template>

<script setup lang="ts">
import { type DataExportType } from '@/api/workData';
import { useCommonStore } from '@/stores/commonStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import {
  message,
  type CheckboxOptionType,
  type MenuProps,
} from 'ant-design-vue';
import { ref, watchEffect } from 'vue';

const commonStore = useCommonStore();
const workSpaceStore = useWorkspaceStore();

const checked = ref<string[]>([]);
const options = ref<CheckboxOptionType[]>([]);

watchEffect(() => {
  options.value = workSpaceStore.workData.map(({ name, key }) => ({
    label: name,
    value: key,
  }));
});

const onCheckBoxChange = (value: string[]) => {
  const val = value.pop();
  checked.value = !val ? [] : [val];
};

const onDownload: MenuProps['onClick'] = async ({ key }) => {
  const [nodeKey] = checked.value;
  if (!nodeKey) {
    message.info('请勾选要导出的项目');
    return;
  }
  try {
    commonStore.setLoading(true);
    await workSpaceStore.export(key as DataExportType, nodeKey);
  } finally {
    commonStore.setLoading(false);
  }
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
