<template>
  <section class="left" v-show="store.visible">
    <template v-for="(comp, key) in COMPONENT_MAP" :key="key">
      <div v-show="key === $props.activeKey">
        <component :is="comp" />
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { SIDEBAR_OPTIONS } from '@/config/sidebar';
import { useSidebarStore } from '@/stores/sidebarStore';
import CompPanel from './Component/Index.vue';
import DirectoryTree from './DirectoryTree.vue';
import Export from './Export.vue';
import StyleAdjustment from './StyleAdjustment/Index.vue';

defineProps<{
  activeKey: SIDEBAR_OPTIONS;
}>();

const store = useSidebarStore();

const COMPONENT_MAP = {
  [SIDEBAR_OPTIONS.RESOURCE]: DirectoryTree,
  [SIDEBAR_OPTIONS.COMPONENT]: CompPanel,
  [SIDEBAR_OPTIONS.STYLE]: StyleAdjustment,
  [SIDEBAR_OPTIONS.EXPORT]: Export,
};
</script>

<style scoped>
.left {
  position: relative;
  flex: 1;
  padding: 8px;
  border-left: 1px solid #000;
  border-right: 1px solid #000;
  color: #fff;
  background-color: #1f2428;
  overflow-x: auto;
}
</style>
