<template>
  <section class="right">
    <div class="top">
      <div
        v-for="item in rightOptions.slice(0, -2)"
        :class="['icon-box', { active: item.active }]"
        :title="item.title"
        :key="item.key"
        @click="handleToogle(item.key)">
        <component :is="item.icon" />
      </div>
    </div>
    <div class="bottom">
      <div
        v-for="item in rightOptions.slice(-2)"
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
import { ref } from 'vue';
import { PANEL_OPTIONS, RIGHT_OPTIONS } from './enum';

const emits = defineEmits<{
  (e: 'toogle', key: RIGHT_OPTIONS): void;
}>();

const rightOptions = ref(PANEL_OPTIONS);

const handleToogle = (key: RIGHT_OPTIONS) => {
  rightOptions.value.forEach(item => {
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
