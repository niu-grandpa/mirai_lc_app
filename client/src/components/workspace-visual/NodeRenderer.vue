<template>
  <component
    :is="node.name"
    v-on="node.on"
    :id="node.key"
    v-bind="{
      ...node.props,
      ...node.attrs,
    }">
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
import { type ElementANode } from '@/types/abstractNode';

const { node } = defineProps<{ node: ElementANode }>();
</script>
