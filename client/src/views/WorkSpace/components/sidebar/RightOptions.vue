<template>
  <section class="right">
    <div class="top">
      <div
        v-for="item in options.slice(0, -2)"
        :class="['icon-box', { active: item.active }]"
        :title="item.title"
        :key="item.key"
        @click="handleToogle(item.key)">
        <component :is="item.icon" />
      </div>
    </div>
    <div class="bottom">
      <div
        v-for="item in options.slice(-2)"
        :class="['icon-box', { active: item.active }]"
        :title="item.title"
        :key="item.key"
        @click="handleToogle(item.key)">
        <component :is="item.icon" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import sidebarConfig, { SIDEBAR_OPTIONS } from '@/config/sidebar';
import { ref } from 'vue';

const emits = defineEmits<{
  (e: 'toogle', key: SIDEBAR_OPTIONS): void;
}>();

const options = ref(sidebarConfig.options);

const handleToogle = (key: SIDEBAR_OPTIONS) => {
  options.value.forEach(item => {
    item.active = item.key === key;
  });
  emits('toogle', key);
};
</script>

<style scoped>
.right {
  width: 42px;
  height: 100vh;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  .top {
    width: 97%;
    flex: 1;
  }

  .bottom {
    width: 97%;
    height: 120px;
  }
}
</style>
