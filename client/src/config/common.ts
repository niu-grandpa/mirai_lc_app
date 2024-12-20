enum LOCAL_STORAGE_KEYS {
  USER_TOKEN = 'USER_TOKEN',
  WORK_DATA = 'WORK_DATA',
  OPENED_KEYS = 'OPENED_KEYS',
  SELECTED_KEYS = 'SELECTED_KEYS',
  EXPANED_KEYS = 'EXPANED_KEYS',
  NOTIFICATION = 'NOTIFICATION',
}

export default {
  theme: 'dark',
  loading: false,
  autoSaveInterval: 3 * 60 * 1000, // -> 3 minutes
  storageKeys: LOCAL_STORAGE_KEYS,
};
