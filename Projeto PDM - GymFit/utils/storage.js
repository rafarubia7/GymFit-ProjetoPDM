// utils/storage.js
// API assíncrona de storage que funciona no Web (localStorage) e no Nativo (AsyncStorage)

let asyncStorageModule;
try {
  // Disponível no ambiente nativo (Expo/React Native)
  // No web bundler, o require falhará e cairemos no fallback
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  asyncStorageModule = require('@react-native-async-storage/async-storage');
} catch (_e) {
  asyncStorageModule = null;
}

const hasWindow = typeof window !== 'undefined';
const hasLocalStorage = hasWindow && typeof window.localStorage !== 'undefined';

export async function getItem(key) {
  if (hasLocalStorage) {
    try {
      const value = window.localStorage.getItem(key);
      return value;
    } catch (_e) {
      return null;
    }
  }
  if (asyncStorageModule?.default) {
    return await asyncStorageModule.default.getItem(key);
  }
  return null;
}

export async function setItem(key, value) {
  if (hasLocalStorage) {
    try {
      window.localStorage.setItem(key, value);
      return;
    } catch (_e) {
      return;
    }
  }
  if (asyncStorageModule?.default) {
    await asyncStorageModule.default.setItem(key, value);
  }
}

export async function removeItem(key) {
  if (hasLocalStorage) {
    try {
      window.localStorage.removeItem(key);
      return;
    } catch (_e) {
      return;
    }
  }
  if (asyncStorageModule?.default) {
    await asyncStorageModule.default.removeItem(key);
  }
}


