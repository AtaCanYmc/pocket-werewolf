import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useTranslation } from '@/context/LanguageContext';
import { Play, Plus, ArrowRight, Shield, Sparkles, Smartphone, Users, Lock, Loader2, BookOpen, Download } from 'lucide-react';
import { AVATARS } from '@/utils/session';
import { checkAdminPasswordRequired } from '@/services/gameEngine';
import { haptics } from '@/utils/haptics';
import { ROLES } from '@/config/roles';

interface HomeProps {
  onOpenSettings: () => void;
  onOpenGuide?: () => void;
  onOpenPwaGuide?: () => void;
}

export default function Home({ onOpenSettings, onOpenGuide, onOpenPwaGuide }: HomeProps) {
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
    haptics.tap();
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
      haptics.success();
    } catch (err: unknown) {
      if (err instanceof Error && err.message.toLowerCase().includes('admin password')) {
        setAdminPasswordError(t('home.adminPasswordError'));
      }
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    haptics.tap();
    if (!credentials.isConfigured) {
      onOpenSettings();
      return;
    }
    updateProfile(name, avatar);
    await joinRoom(joinCode);
    haptics.success();
  };

  return (
    <div className="max-w-xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in pb-12">
      {/* Hero Banner (Sterile Flat Minimalist) */}
      <div className="text-center space-y-1.5 sm:space-y-2">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-surface border border-surface-border mx-auto flex items-center justify-center overflow-hidden shadow-flat-sm">
          <img src={ROLES.Werewolf.image} alt="Pocket Werewolf" className="w-full h-full object-cover" />
        </div>
        <h1 className="font-gothic text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-wider">
          {t('app.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
          {t('app.subtitle')}
        </p>
      </div>

      {/* Supabase Missing Configuration Warning */}
      {!credentials.isConfigured && (
        <div
          onClick={() => {
            haptics.tap();
            onOpenSettings();
          }}
          className="p-3 sm:p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between cursor-pointer hover:bg-amber-950/30 transition-all shadow-flat-sm active:scale-[0.99]"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{t('home.supabaseWarning')}</span>
          </div>
          <span className="font-semibold underline text-[11px] flex-shrink-0">{t('home.setupBtn')}</span>
        </div>
      )}

      {error && (
        <div
          onClick={() => {
            haptics.tap();
            onOpenSettings();
          }}
          className="p-3 sm:p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs text-center flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-rose-950/30 transition-all shadow-flat-sm active:scale-[0.99]"
        >
          <div className="flex items-center gap-1.5 font-medium">
            <span>⚠️ {error}</span>
          </div>
          <span className="text-[11px] text-rose-400 font-semibold underline">
            {t('home.setupBtn')}
          </span>
        </div>
      )}

      {/* Player Profile Card (Avatar & Name) */}
      <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-flat space-y-3">
        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-slate-400 font-medium block">
          {t('home.profileTitle')}
        </span>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => {
              haptics.tap();
              setShowAvatarPicker(!showAvatarPicker);
            }}
            title={t('home.changeAvatar')}
            aria-label={t('home.changeAvatar')}
            className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-surface-light border border-surface-border hover:border-slate-500 flex items-center justify-center text-2xl shadow-flat-sm transition-all flex-shrink-0 active:scale-95"
          >
            {avatar}
          </button>

          <div className="flex-1 min-w-0">
            <label className="block text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('home.playerName')}</label>
            <input
              type="text"
              value={name}
              maxLength={20}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleSaveProfile}
              placeholder={t('home.enterName')}
              className="w-full px-3 py-2 rounded-xl bg-surface-light border border-surface-border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-semibold focus:outline-none focus:border-slate-500"
            />
          </div>
        </div>

        {/* Avatar Picker Drawer */}
        {showAvatarPicker && (
          <div className="p-2.5 bg-surface-light rounded-xl border border-surface-border grid grid-cols-6 gap-1.5 animate-fade-in">
            {AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => {
                  haptics.tap();
                  setAvatar(av);
                  setShowAvatarPicker(false);
                  updateProfile(name, av);
                }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all active:scale-90 ${
                  avatar === av ? 'bg-blood/20 border border-blood/50' : 'hover:bg-slate-800'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create / Join Tabs */}
      <div className="bg-surface border border-surface-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-flat space-y-4">
        <div className="grid grid-cols-2 gap-1.5 bg-surface-light p-1 rounded-xl border border-surface-border">
          <button
            onClick={() => {
              haptics.tap();
              setActiveTab('create');
            }}
            className={`py-2.5 rounded-lg text-xs font-semibold font-gothic tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
              activeTab === 'create'
                ? 'bg-blood text-white shadow-flat-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('home.createTab')}</span>
          </button>
          <button
            onClick={() => {
              haptics.tap();
              setActiveTab('join');
            }}
            className={`py-2.5 rounded-lg text-xs font-semibold font-gothic tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
              activeTab === 'join'
                ? 'bg-indigo-600 text-white shadow-flat-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('home.joinTab')}</span>
          </button>
        </div>

        {/* Form Container */}
        {activeTab === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed text-center px-2">
              {t('home.createSubtitle')}
            </p>

            {/* Admin Password Field */}
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
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-light border border-surface-border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-slate-500 font-mono"
                />
                {adminPasswordError && (
                  <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">
                    ⚠️ {adminPasswordError}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blood hover:bg-blood-hover disabled:opacity-40 text-white font-gothic font-bold text-sm tracking-wider uppercase transition-all shadow-flat-sm flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{loading ? t('home.creatingBtn') : t('home.createBtn')}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 text-center">
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
                className="w-full py-3 px-4 text-center font-mono font-black text-xl sm:text-2xl tracking-widest uppercase rounded-xl bg-surface-light border border-surface-border text-blood placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !joinCode.trim()}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-gothic font-bold text-sm tracking-wider uppercase transition-all shadow-flat-sm flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{loading ? t('home.joiningBtn') : t('home.joinBtn')}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}
      </div>

      {/* Role & Rules Guide Card (Easy access on Mobile and Desktop) */}
      {onOpenGuide && (
        <button
          type="button"
          onClick={() => {
            haptics.tap();
            onOpenGuide();
          }}
          className="w-full p-3.5 sm:p-4 rounded-2xl bg-surface border border-surface-border hover:border-slate-600 flex items-center justify-between text-left shadow-flat-sm transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-gothic font-bold text-slate-900 dark:text-slate-100 truncate">
                  {t('header.guide')}
                </h3>
                <span className="text-[9px] sm:text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-indigo-950/40 text-indigo-400 border border-indigo-500/30 flex-shrink-0">
                  {t('modals.guideTitle')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {t('modals.guideObjective')}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
        </button>
      )}

      {/* PWA Install & Download Guide Card */}
      {onOpenPwaGuide && (
        <button
          type="button"
          onClick={() => {
            haptics.tap();
            onOpenPwaGuide();
          }}
          className="w-full p-3.5 sm:p-4 rounded-2xl bg-surface border border-surface-border hover:border-slate-600 flex items-center justify-between text-left shadow-flat-sm transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blood/15 border border-blood/30 flex items-center justify-center text-blood group-hover:scale-105 transition-transform flex-shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-gothic font-bold text-slate-900 dark:text-slate-100 truncate">
                  {t('pwa.title')}
                </h3>
                <span className="text-[9px] sm:text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-blood/20 text-blood border border-blood/30 flex-shrink-0">
                  {t('app.pwaBadge')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {t('pwa.benefitTag')}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
        </button>
      )}

      {/* Feature Badges */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 text-center">
        <div className="p-2.5 sm:p-3 rounded-xl bg-surface border border-surface-border space-y-1 shadow-flat-sm">
          <Smartphone className="w-4 h-4 text-indigo-400 mx-auto" />
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-200 block">{t('home.pwaCardTitle')}</span>
          <span className="text-[9px] text-slate-400 hidden xs:inline">{t('home.pwaCardSub')}</span>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-surface border border-surface-border space-y-1 shadow-flat-sm">
          <Sparkles className="w-4 h-4 text-rose-400 mx-auto" />
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-200 block">{t('home.realtimeCardTitle')}</span>
          <span className="text-[9px] text-slate-400 hidden xs:inline">{t('home.realtimeCardSub')}</span>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-surface border border-surface-border space-y-1 shadow-flat-sm">
          <Shield className="w-4 h-4 text-emerald-400 mx-auto" />
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-200 block">{t('home.serverlessCardTitle')}</span>
          <span className="text-[9px] text-slate-400 hidden xs:inline">{t('home.serverlessCardSub')}</span>
        </div>
      </div>
    </div>
  );
}
