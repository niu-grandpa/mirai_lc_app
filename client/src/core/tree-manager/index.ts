import TreeManager from './handler';

export function createTreeManager() {
  let instance: TreeManager | null = null;
  return () => {
    if (!instance) {
      instance = new TreeManager();
    }
    return instance;
  };
}
