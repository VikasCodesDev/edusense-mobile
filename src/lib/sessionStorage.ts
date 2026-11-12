import { Capacitor } from '@capacitor/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

const volatileValues = new Map<string, string>();

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export async function readSessionValue(key: string): Promise<string | null> {
  if (isNative()) {
    const volatile = volatileValues.get(key);
    if (volatile !== undefined) return volatile;
    return SecureStorage.getItem(key);
  }

  return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
}

export async function writeSessionValue(
  key: string,
  value: string,
  persistAcrossRestarts: boolean,
): Promise<void> {
  if (isNative()) {
    if (persistAcrossRestarts) {
      volatileValues.delete(key);
      await SecureStorage.setItem(key, value);
    } else {
      // A non-remembered native session remains in process memory only. It is
      // never copied to WebView localStorage/sessionStorage.
      await SecureStorage.removeItem(key);
      volatileValues.set(key, value);
    }
    return;
  }

  const preferred = persistAcrossRestarts ? window.localStorage : window.sessionStorage;
  const other = persistAcrossRestarts ? window.sessionStorage : window.localStorage;
  other.removeItem(key);
  preferred.setItem(key, value);
}

export async function removeSessionValue(key: string): Promise<void> {
  volatileValues.delete(key);
  if (isNative()) {
    await SecureStorage.removeItem(key);
    return;
  }
  window.localStorage.removeItem(key);
  window.sessionStorage.removeItem(key);
}

export async function clearAuthSession(): Promise<void> {
  await Promise.all([
    removeSessionValue('edusense_token'),
    removeSessionValue('edusense_user'),
  ]);
}

export async function readAppSetting(key: string): Promise<string | null> {
  if (isNative()) return SecureStorage.getItem(key);
  return window.localStorage.getItem(key);
}

export async function writeAppSetting(key: string, value: string): Promise<void> {
  if (isNative()) {
    await SecureStorage.setItem(key, value);
    return;
  }
  window.localStorage.setItem(key, value);
}

export async function removeAppSetting(key: string): Promise<void> {
  if (isNative()) {
    await SecureStorage.removeItem(key);
    return;
  }
  window.localStorage.removeItem(key);
}
