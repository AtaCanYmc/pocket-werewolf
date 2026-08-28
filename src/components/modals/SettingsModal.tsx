import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { X, Database, Key, Check, Copy, AlertCircle, RefreshCw, Globe, Sun, Moon, ExternalLink, Code2, ChevronDown, ChevronUp } from 'lucide-react';
import { getSupabaseCredentials, saveSupabaseCredentials } from '@/lib/supabase';
import { SUPABASE_SQL_SCHEMA } from '@/config/sqlSchema';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const currentCreds = getSupabaseCredentials();
  const { t, language, setLanguage, languages } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [url, setUrl] = useState<string>(currentCreds.url);
  const [key, setKey] = useState<string>(currentCreds.key);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [showSqlViewer, setShowSqlViewer] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(url.trim(), key.trim());
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-border bg-surface-light">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blood" />
            <h2 className="font-gothic font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">{t('modals.settingsTitle')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          {/* Theme Selection */}
          <div className="bg-surface-light border border-slate-300 dark:border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>{t('header.themeToggle')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                  theme === 'dark'
                    ? 'bg-blood/20 border-blood text-blood shadow-blood-glow'
                    : 'bg-surface border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>{t('header.darkMode')}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                  theme === 'light'
                    ? 'bg-blood/20 border-blood text-blood shadow-blood-glow'
                    : 'bg-surface border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>{t('header.lightMode')}</span>
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div className="bg-surface-light border border-slate-300 dark:border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>{t('modals.languageSelect')}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                    language === l.code
                      ? 'bg-blood/20 border-blood text-blood shadow-blood-glow'
                      : 'bg-surface border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">{l.flag}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Connection Status */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              currentCreds.isConfigured
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300'
            }`}
          >
            {currentCreds.isConfigured ? (
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500 dark:text-amber-400" />
            )}
            <div>
              <p className="font-semibold text-sm">
                {currentCreds.isConfigured ? t('modals.settingsConfigured') : t('modals.settingsMissing')}
              </p>
              <p className="text-xs opacity-90 mt-1 leading-relaxed">
                {currentCreds.isConfigured
                  ? t('modals.settingsConfiguredSub')
                  : t('modals.settingsMissingSub')}
              </p>
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>{t('modals.projectUrl')}</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-light border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blood focus:ring-1 focus:ring-blood transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>{t('modals.anonKey')}</span>
              </label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-light border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blood focus:ring-1 focus:ring-blood transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-blood hover:bg-blood-hover text-white font-semibold text-sm transition-all shadow-blood-glow flex items-center justify-center gap-2 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('modals.saveAndReload')}</span>
            </button>
          </form>

          {/* Database Setup & SQL Schema Downloader */}
          <div className="bg-surface-light border border-slate-300 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('modals.sqlTitle')}</span>
              </div>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>{t('modals.openDashboard')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('modals.sqlSub')}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopySql}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                  copiedSql
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-glow'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-mystic-glow'
                }`}
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? t('modals.sqlCopied') : t('modals.copyFullSql')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSqlViewer(!showSqlViewer)}
                className="py-2 px-3 rounded-xl bg-surface border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-medium flex items-center justify-center gap-1 transition-all"
              >
                <span>{showSqlViewer ? t('modals.hideSql') : t('modals.viewSql')}</span>
                {showSqlViewer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Collapsible SQL Viewer Drawer */}
            {showSqlViewer && (
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 animate-slide-up">
                <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-52 select-all border border-slate-800 leading-relaxed">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-surface-border bg-surface-light flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium transition-colors"
          >
            {t('modals.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
