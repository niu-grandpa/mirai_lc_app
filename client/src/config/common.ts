enum LOCAL_STORAGE_KEYS {
  USER_TOKEN = 'USER_TOKEN',
  FILE_DATA = 'FILE_DATA',
  OPENED_KEYS = 'OPENED_KEYS',
  SELECTED_KEYS = 'SELECTED_KEYS',
  EXPANED_KEYS = 'EXPANED_KEYS',
  NOTIFICATION = 'NOTIFICATION',
}

export default {
  theme: 'dark',
  loading: false,
  autoSaveInterval: 4000,
  storageKeys: LOCAL_STORAGE_KEYS,
};
