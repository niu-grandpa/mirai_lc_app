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
import { WorkspaceSidebar, WorkspaceVisual } from '@/components';
import { WorkSpaceLayout } from '@/layouts';
</script>
