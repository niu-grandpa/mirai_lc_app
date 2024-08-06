<template>
  <a-layout>
    <a-layout>
      <a-layout-content :style="styles">
        <slot name="content" />
      </a-layout-content>
    </a-layout>
    <a-layout-sider :width="370" :style="styles">
      <slot name="sider" />
    </a-layout-sider>
  </a-layout>
</template>

<script setup>
import { computed } from 'vue';
const styles = computed(() => ({ padding: '0', background: '#24292E' }));
</script>
