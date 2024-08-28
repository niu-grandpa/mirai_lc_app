<template>
  <WorkSpaceLayout>
    <template #content>
      <WorkspaceVisual />
    </template>
    <template #sider>
      <WorkspaceSidebar />
    </template>
  </WorkSpaceLayout>
</template>

<script setup lang="ts">
import { WorkSpaceLayout } from '@/layouts';
import { WorkspaceSidebar, WorkspaceVisual } from './components';
</script>
