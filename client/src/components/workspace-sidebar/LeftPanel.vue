<template>
  <section class="left">
    <div
      v-for="(comp, key) in COMPONENT_MAP"
      v-show="key === $props.activeKey"
      :key="key">
      <component :is="comp" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { COMPONENT_MAP, RIGHT_OPTIONS } from './enum';

defineProps<{
  activeKey: RIGHT_OPTIONS;
}>();
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
}
</style>
