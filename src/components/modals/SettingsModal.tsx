import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useGame } from '@/context/GameContext';
import { X, Database, Key, Check, AlertCircle, RefreshCw, Globe, Sun, Moon, ExternalLink, FileCode, Volume2, VolumeX, Play } from 'lucide-react';
import { getSupabaseCredentials, saveSupabaseCredentials } from '@/lib/supabase';
import { sound } from '@/utils/audio';
import { haptics } from '@/utils/haptics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const currentCreds = getSupabaseCredentials();
  const { soundEnabled, toggleSound } = useGame();
  const { t, language, setLanguage, languages } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [url, setUrl] = useState<string>(currentCreds.url);
  const [key, setKey] = useState<string>(currentCreds.key);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(url.trim(), key.trim());
  };

  const githubSchemaUrl = 'https://github.com/AtaCanYmc/pocket-werewolf/blob/main/supabase/schema.sql';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Theme Selection */}
          <div className="bg-surface-light border border-slate-300 dark:border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
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

          {/* Sound & Web Audio Settings */}
          <div className="bg-surface-light border border-slate-300 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
                <span>Ses Efektleri & Web Audio API</span>
              </div>
              <button
                type="button"
                onClick={toggleSound}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  soundEnabled
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                }`}
              >
                {soundEnabled ? t('header.soundOn') : t('header.soundOff')}
              </button>
            </div>

            {/* Interactive Audio FX Preview Buttons */}
            {soundEnabled && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Sesleri Test Et:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      haptics.impact();
                      sound.playWolfHowl();
                    }}
                    className="p-1.5 rounded-lg bg-surface border border-surface-border hover:border-slate-500 text-[11px] text-slate-300 flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <Play className="w-3 h-3 text-rose-400" />
                    <span>🐺 Kurt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      sound.playNightFall();
                    }}
                    className="p-1.5 rounded-lg bg-surface border border-surface-border hover:border-slate-500 text-[11px] text-slate-300 flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <Play className="w-3 h-3 text-indigo-400" />
                    <span>🌙 Gece</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      sound.playMorningBell();
                    }}
                    className="p-1.5 rounded-lg bg-surface border border-surface-border hover:border-slate-500 text-[11px] text-slate-300 flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <Play className="w-3 h-3 text-amber-400" />
                    <span>☀️ Şafak</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.impact();
                      sound.playVictory();
                    }}
                    className="p-1.5 rounded-lg bg-surface border border-surface-border hover:border-slate-500 text-[11px] text-slate-300 flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <Play className="w-3 h-3 text-emerald-400" />
                    <span>🏆 Zafer</span>
                  </button>
                </div>
              </div>
            )}
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

          {/* Credentials Form (Always strictly masked password inputs) */}
          <form onSubmit={handleSave} className="space-y-4">
            {/* Supabase Project URL (Strictly Masked) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>{t('modals.projectUrl')}</span>
              </label>
              <input
                type="password"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                autoComplete="off"
                spellCheck="false"
                className="w-full py-2.5 px-3 rounded-xl bg-surface border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs font-mono focus:outline-none focus:border-blood"
              />
            </div>

            {/* Supabase Anon Key (Strictly Masked) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>{t('modals.anonKey')}</span>
              </label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                autoComplete="off"
                spellCheck="false"
                className="w-full py-2.5 px-3 rounded-xl bg-surface border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs font-mono focus:outline-none focus:border-blood"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blood hover:bg-blood-hover text-white font-gothic font-bold text-xs uppercase tracking-wider transition-all shadow-blood-glow flex items-center justify-center gap-2 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('modals.saveAndReload')}</span>
            </button>
          </form>

          {/* Database Schema Reference Link */}
          <div className="bg-surface-light border border-slate-300 dark:border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>{t('modals.sqlTitle')}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('modals.sqlSub')}
            </p>
            <div className="pt-1 flex flex-wrap gap-2">
              <a
                href={githubSchemaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blood hover:underline font-semibold"
              >
                <span>{t('modals.viewOnGithub')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-slate-400">•</span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:underline font-semibold"
              >
                <span>{t('modals.openDashboard')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-surface-border bg-surface-light flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            {t('modals.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
