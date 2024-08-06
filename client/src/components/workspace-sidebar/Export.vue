<template>
  <a-card class="container" :bordered="false">
    <template #title>
      可导出的项目
      <a-tooltip>
        <template #title>为降低服务器压力，每次只能选择一个整项导出</template>
        <InfoCircleOutlined />
      </a-tooltip>
    </template>
    <template #extra>
      <a-dropdown>
        <template #overlay>
          <a-menu @click="({ key }) => (exportType = key)">
            <a-menu-item key="vue">Vue</a-menu-item>
            <a-menu-item key="json">JSON</a-menu-item>
            <a-menu-item key="html" disabled>HTML</a-menu-item>
          </a-menu>
        </template>
        <a-button v-show="checked.length" size="small">
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
        <span style="padding-top: 2px; display: inline-block">
          {{ item.label }}
        </span>
      </a-checkbox>
    </a-checkbox-group>
  </a-card>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { type CheckboxOptionType } from 'ant-design-vue';
import { onBeforeMount, ref } from 'vue';

const store = useWorkspaceStore();

const exportType = ref('');
const checked = ref<string[]>([]);
const options = ref<CheckboxOptionType[]>([]);

onBeforeMount(() => {
  options.value = store.treeData.map(({ name, key }) => ({
    label: name,
    value: key,
  }));
});

const onCheckBoxChange = (value: string[]) => {
  const val = value.pop();
  checked.value = !val ? [] : [val];
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
