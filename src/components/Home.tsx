import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useTranslation } from '@/context/LanguageContext';
import { Play, Plus, ArrowRight, Shield, Sparkles, Smartphone, Users, Lock } from 'lucide-react';
import { AVATARS } from '@/utils/session';
import { checkAdminPasswordRequired } from '@/services/gameEngine';

interface HomeProps {
  onOpenSettings: () => void;
  onOpenGuide?: () => void;
}

export default function Home({ onOpenSettings }: HomeProps) {
  const { profile, updateProfile, createRoom, joinRoom, credentials, loading, error } = useGame();
  const { t } = useTranslation();
  const [name, setName] = useState<string>(profile.name);
  const [avatar, setAvatar] = useState<string>(profile.avatar);
  const [joinCode, setJoinCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [showAvatarPicker, setShowAvatarPicker] = useState<boolean>(false);

  // Dynamic Supabase / Env Admin Password Check
  const [requiresAdminPassword, setRequiresAdminPassword] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>(() => sessionStorage.getItem('PW_ADMIN_PASSWORD') || '');
  const [adminPasswordError, setAdminPasswordError] = useState<string | null>(null);

  // Check Supabase admin password requirement whenever credentials or view loads
  useEffect(() => {
    let isMounted = true;
    checkAdminPasswordRequired().then((required) => {
      if (isMounted) setRequiresAdminPassword(required);
    });
    return () => {
      isMounted = false;
    };
  }, [credentials]);

  // If URL contains `?code=ABCD`, auto-populate code and switch to join tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    if (codeParam) {
      setJoinCode(codeParam.toUpperCase());
      setActiveTab('join');
    }
  }, []);

  const handleSaveProfile = () => {
    updateProfile(name, avatar);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.isConfigured) {
      onOpenSettings();
      return;
    }

    if (requiresAdminPassword && !adminPasswordInput.trim()) {
      setAdminPasswordError(t('home.adminPasswordError'));
      return;
    }

    updateProfile(name, avatar);
    try {
      await createRoom(null, undefined, adminPasswordInput.trim());
      if (requiresAdminPassword) {
        sessionStorage.setItem('PW_ADMIN_PASSWORD', adminPasswordInput.trim());
      }
      setAdminPasswordError(null);
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('admin password')) {
        setAdminPasswordError(t('home.adminPasswordError'));
      }
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    if (!credentials.isConfigured) {
      onOpenSettings();
      return;
    }
    updateProfile(name, avatar);
    await joinRoom(joinCode);
  };

  return (
    <div className="max-w-xl w-full mx-auto px-4 py-4 sm:py-8 space-y-5 sm:space-y-7 animate-fade-in">
      {/* Hero Banner */}
      <div className="text-center space-y-2 sm:space-y-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blood/20 border-2 border-blood/50 mx-auto flex items-center justify-center text-3xl sm:text-4xl shadow-blood-glow transition-transform hover:scale-105">
          🐺
        </div>
        <h1 className="font-gothic text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-wider">
          {t('app.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          {t('app.subtitle')}
        </p>
      </div>

      {/* Supabase Missing Configuration Warning */}
      {!credentials.isConfigured && (
        <div
          onClick={onOpenSettings}
          className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/50 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between cursor-pointer hover:bg-amber-500/20 transition-all shadow-lg active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>{t('home.supabaseWarning')}</span>
          </div>
          <span className="font-bold underline text-[11px] flex-shrink-0">{t('home.setupBtn')}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-red-500/10 border border-red-500 text-red-600 dark:text-red-300 text-xs text-center">
          ⚠️ {error}
        </div>
      )}

      {/* Player Profile Card (Avatar & Name) */}
      <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 sm:space-y-4">
        <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold block">
          {t('home.profileTitle')}
        </span>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            title={t('home.changeAvatar')}
            aria-label={t('home.changeAvatar')}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 hover:border-blood flex items-center justify-center text-2xl sm:text-3xl shadow-inner transition-all flex-shrink-0 active:scale-95"
          >
            {avatar}
          </button>

          <div className="flex-1 min-w-0">
            <label className="block text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">{t('home.playerName')}</label>
            <input
              type="text"
              value={name}
              maxLength={20}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleSaveProfile}
              placeholder={t('home.enterName')}
              className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-surface-light border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:border-blood focus:ring-1 focus:ring-blood"
            />
          </div>
        </div>

        {/* Avatar Picker Drawer */}
        {showAvatarPicker && (
          <div className="p-2.5 sm:p-3 bg-surface-light rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-6 gap-1.5 sm:gap-2 animate-fade-in">
            {AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => {
                  setAvatar(av);
                  setShowAvatarPicker(false);
                  updateProfile(name, av);
                }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xl sm:text-2xl transition-all active:scale-90 ${
                  avatar === av ? 'bg-blood/30 border border-blood' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create / Join Tabs */}
      <div className="bg-surface border border-surface-border rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 bg-surface-light p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2.5 sm:py-3 rounded-xl text-xs font-bold font-gothic tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
              activeTab === 'create'
                ? 'bg-blood text-white shadow-blood-glow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{t('home.createTab')}</span>
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`py-2.5 sm:py-3 rounded-xl text-xs font-bold font-gothic tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
              activeTab === 'join'
                ? 'bg-indigo-600 text-white shadow-mystic-glow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{t('home.joinTab')}</span>
          </button>
        </div>

        {/* Form Container */}
        {activeTab === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-3 sm:space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-center px-2">
              {t('home.createSubtitle')}
            </p>

            {/* Admin Password Field (If Configured in Environment) */}
            {requiresAdminPassword && (
              <div className="space-y-1.5 text-left animate-slide-up">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('home.adminPasswordLabel')}</span>
                </label>
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    if (adminPasswordError) setAdminPasswordError(null);
                  }}
                  placeholder={t('home.adminPasswordPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-light border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blood focus:ring-1 focus:ring-blood font-mono"
                />
                {adminPasswordError && (
                  <p className="text-xs text-red-500 dark:text-red-400 font-medium">
                    ⚠️ {adminPasswordError}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 sm:py-4 rounded-2xl bg-blood hover:bg-blood-hover disabled:opacity-50 text-white font-gothic font-bold text-sm tracking-wider uppercase transition-all shadow-blood-glow flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{loading ? t('home.creatingBtn') : t('home.createBtn')}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 text-center">
                {t('home.joinSubtitle')}
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder={t('home.codePlaceholder')}
                maxLength={8}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck="false"
                className="w-full py-3 sm:py-3.5 px-4 text-center font-mono font-black text-xl sm:text-2xl tracking-widest uppercase rounded-2xl bg-surface-light border border-slate-300 dark:border-slate-700 text-blood focus:outline-none focus:border-indigo-500 shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !joinCode.trim()}
              className="w-full py-3.5 sm:py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-gothic font-bold text-sm tracking-wider uppercase transition-all shadow-mystic-glow flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>{loading ? t('home.joiningBtn') : t('home.joinBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Feature Badges */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
        <div className="p-2.5 sm:p-3.5 rounded-2xl bg-surface/50 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 mx-auto" />
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-800 dark:text-slate-200 block">{t('home.pwaCardTitle')}</span>
          <span className="text-[9px] sm:text-[10px] text-slate-500 hidden xs:inline">{t('home.pwaCardSub')}</span>
        </div>
        <div className="p-2.5 sm:p-3.5 rounded-2xl bg-surface/50 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blood mx-auto" />
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-800 dark:text-slate-200 block">{t('home.realtimeCardTitle')}</span>
          <span className="text-[9px] sm:text-[10px] text-slate-500 hidden xs:inline">{t('home.realtimeCardSub')}</span>
        </div>
        <div className="p-2.5 sm:p-3.5 rounded-2xl bg-surface/50 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mx-auto" />
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-800 dark:text-slate-200 block">{t('home.serverlessCardTitle')}</span>
          <span className="text-[9px] sm:text-[10px] text-slate-500 hidden xs:inline">{t('home.serverlessCardSub')}</span>
        </div>
      </div>
    </div>
  );
}
