import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { readAppSetting, removeAppSetting, writeAppSetting } from '@/lib/sessionStorage';

const API_SETTING_KEY = 'edusense_api_url';
const buildApiBase = import.meta.env.VITE_EDUSENSE_API_URL?.trim()
  || 'https://edusense-backend-1h2q.onrender.com/api';
let cachedApiBase: string | null | undefined;
let cacheInitialized = false;

export class ApiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiConfigurationError';
  }
}

export function normalizeApiBase(input: string): string {
  const raw = input.trim();
  if (!raw) throw new ApiConfigurationError('Enter the HTTPS address of the existing EduSense backend.');

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ApiConfigurationError('Enter a full URL, for example https://api.example.org/api.');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new ApiConfigurationError('The backend URL must use HTTP or HTTPS.');
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new ApiConfigurationError('The backend URL must not contain credentials, query parameters, or a fragment.');
  }

  const hostname = url.hostname.toLowerCase();
  const localHost = ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(hostname);
  const native = Capacitor.isNativePlatform();
  if ((native || !import.meta.env.DEV) && url.protocol !== 'https:') {
    throw new ApiConfigurationError('EduSense mobile releases require HTTPS. HTTP is not allowed.');
  }
  if ((native || !import.meta.env.DEV) && localHost) {
    throw new ApiConfigurationError('A release app cannot use localhost. Enter the reachable HTTPS backend URL.');
  }

  let path = url.pathname.replace(/\/+$/, '');
  if (!/(^|\/)api$/i.test(path)) path = `${path}/api`;
  return `${url.origin}${path}`;
}

export async function getApiBaseUrl(): Promise<string | null> {
  if (cacheInitialized) return cachedApiBase ?? null;

  const saved = await readAppSetting(API_SETTING_KEY);
  const candidate = saved?.trim() || buildApiBase;
  cachedApiBase = candidate ? normalizeApiBase(candidate) : null;
  cacheInitialized = true;
  return cachedApiBase;
}

export async function getApiConfiguration(): Promise<{ url: string; source: 'device' | 'build' } | null> {
  const saved = await readAppSetting(API_SETTING_KEY);
  if (saved?.trim()) return { url: normalizeApiBase(saved), source: 'device' };
  if (buildApiBase) return { url: normalizeApiBase(buildApiBase), source: 'build' };
  return null;
}

export async function saveApiBaseUrl(input: string): Promise<string> {
  const normalized = normalizeApiBase(input);
  await writeAppSetting(API_SETTING_KEY, normalized);
  cachedApiBase = normalized;
  cacheInitialized = true;
  return normalized;
}

export async function clearSavedApiBaseUrl(): Promise<void> {
  await removeAppSetting(API_SETTING_KEY);
  cachedApiBase = buildApiBase ? normalizeApiBase(buildApiBase) : null;
  cacheInitialized = true;
}

export async function testApiConnection(input: string): Promise<{ ok: boolean; message: string }> {
  let base: string;
  try {
    base = normalizeApiBase(input);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Invalid backend URL.' };
  }

  try {
    const response = await axios.get(`${base}/health`, {
      timeout: 10000,
      headers: { Accept: 'application/json' },
    });
    if (response.data?.status === 'healthy' && response.data?.service === 'EduSense Backend API') {
      return { ok: true, message: 'Connected to the EduSense backend health endpoint.' };
    }
    return { ok: false, message: 'The server responded, but it did not identify itself as the EduSense Backend API.' };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return { ok: false, message: `The backend health check returned HTTP ${error.response.status}. Verify the URL ends in /api and that /api/health is reachable.` };
      }
      return { ok: false, message: 'Could not reach the backend. Check the HTTPS URL, network access, and server CORS configuration.' };
    }
    return { ok: false, message: 'Could not complete the backend health check.' };
  }
}
