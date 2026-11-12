'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, CircleAlert, LoaderCircle, PlugZap, Save, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { clearAuthSession } from '@/lib/sessionStorage';
import { clearSavedApiBaseUrl, getApiConfiguration, saveApiBaseUrl, testApiConnection } from '@/lib/apiConfig';

export default function ApiSettingsPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState('');
  const [configured, setConfigured] = useState<string | null>(null);
  const [source, setSource] = useState<'device' | 'build' | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await getApiConfiguration();
      setConfigured(config?.url ?? null);
      setSource(config?.source ?? null);
      setDraft(config?.url ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read the saved backend configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testApiConnection(draft);
    setTestResult(result);
    setTesting(false);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const normalized = await saveApiBaseUrl(draft);
      const changed = normalized !== configured;
      if (changed) {
        await clearAuthSession();
        window.dispatchEvent(new CustomEvent('edusense:api-config-changed'));
      }
      setConfigured(normalized);
      setSource('device');
      setDraft(normalized);
      setNotice(changed
        ? 'Backend URL saved. You were signed out because sessions belong to a specific backend.'
        : 'Backend URL saved on this device.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this backend URL.');
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await clearSavedApiBaseUrl();
      await clearAuthSession();
      const config = await getApiConfiguration();
      setConfigured(config?.url ?? null);
      setSource(config?.source ?? null);
      setDraft(config?.url ?? '');
      window.dispatchEvent(new CustomEvent('edusense:api-config-changed'));
      setTestResult(null);
      setNotice(config
        ? 'Device override removed. The app is now using the build-time backend setting.'
        : 'Backend configuration cleared. Add a verified HTTPS backend URL before signing in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not clear the backend override.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <section className="subtle-card rounded-2xl border border-slate-800 p-5 sm:p-8">
          <div className="mb-6 flex items-start gap-4">
            <div className="rounded-xl bg-indigo-500/15 p-3 text-indigo-300"><PlugZap className="h-6 w-6" /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Connection</p>
              <h1 className="mt-1 text-2xl font-bold text-white">Backend settings</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                EduSense Mobile connects only to the existing EduSense backend. It does not connect directly to the ML service or store academic records locally.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-400"><LoaderCircle className="h-4 w-4 animate-spin" /> Reading configuration…</div>
          ) : (
            <>
              <div className="mb-5 rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-200">Current configuration</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${configured ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
                    {configured ? (source === 'device' ? 'Saved on device' : 'Build setting') : 'Not configured'}
                  </span>
                </div>
                <p className="mt-2 break-all font-mono text-xs text-slate-400">{configured || 'No API URL is set.'}</p>
              </div>

              <label htmlFor="api-url" className="mb-2 block text-sm font-medium text-slate-200">Existing backend API URL</label>
              <input
                id="api-url"
                type="url"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={draft}
                onChange={(event) => { setDraft(event.target.value); setTestResult(null); setError(null); }}
                placeholder="https://your-existing-backend.example/api"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Use the existing backend base URL; “/api” is added if omitted. Production/native connections must use HTTPS. Do not enter a password, token, or secret here.
              </p>

              {error && <div role="alert" className="mt-4 flex gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
              {notice && <div role="status" className="mt-4 flex gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{notice}</div>}
              {testResult && <div role="status" className={`mt-4 flex gap-2 rounded-lg border p-3 text-sm ${testResult.ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}>
                {testResult.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />}{testResult.message}
              </div>}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button onClick={() => void testConnection()} disabled={testing || !draft.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                  {testing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />} Test connection
                </button>
                <button onClick={() => void save()} disabled={saving || !draft.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
                  {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save backend URL
                </button>
                <button onClick={() => void reset()} disabled={saving || (!configured && source !== 'device')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-400 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">
                  <Trash2 className="h-4 w-4" /> Reset override
                </button>
              </div>
            </>
          )}
        </section>

        <p className="mt-5 text-center text-xs text-slate-500">Connection does not validate credentials or change server data. <Link to="/login" className="text-indigo-300 hover:text-indigo-200">Sign in</Link></p>
      </div>
    </main>
  );
}
