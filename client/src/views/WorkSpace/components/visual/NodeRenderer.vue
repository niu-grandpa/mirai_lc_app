<template>
  <component
    :is="node.tagName"
    v-on="node.eventBinding"
    :id="node.key"
    :data-root-key="node.rootKey"
    v-bind="node.attributes">
    <span>{{ node.textContent }}</span>
    <template v-if="node.children.length">
      <NodeRenderer
        v-for="child in node.children"
        :key="child.key"
        :node="child" />
    </template>
  </component>
</template>

<script setup lang="ts">
import { type FileConentNode } from '@/api/workData';

const { node } = defineProps<{ node: FileConentNode }>();
</script>
