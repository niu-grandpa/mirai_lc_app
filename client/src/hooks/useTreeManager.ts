import { createTreeManager } from '@/core';

export function useTreeManager() {
  const treeManagerFn = createTreeManager();
  return treeManagerFn();
}
