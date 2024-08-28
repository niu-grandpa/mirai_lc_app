<template>
  <section class="wrapper">
    <LeftPanel :active-key="activeKey" />
    <RightOptions @toogle="k => (activeKey = k)" />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LeftPanel from './LeftPanel.vue';
import RightOptions from './RightOptions.vue';
import { RIGHT_OPTIONS } from './enum';

const activeKey = ref<RIGHT_OPTIONS>(RIGHT_OPTIONS.RESOURCE);
</script>

<style>
.wrapper {
  display: flex;

  .icon-box {
    margin-bottom: 28px;
    font-size: 24px;
    text-align: center;
    cursor: pointer;
    opacity: 0.6;
    color: #fff;
    &:hover {
      opacity: 1;
    }
    &.active {
      opacity: 1;
      border-right: 2px solid orange;
    }
  }
}
</style>
