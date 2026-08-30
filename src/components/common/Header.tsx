import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { Volume2, VolumeX, Settings, BookOpen, Share2, LogOut, Copy, Check, Sun, Moon } from 'lucide-react';
import { ROLES } from '@/config/roles';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onOpenShare?: () => void;
}

export default function Header({ onOpenSettings, onOpenGuide, onOpenShare }: HeaderProps) {
  const { room, soundEnabled, toggleSound, leaveRoom } = useGame();
  const { t, language, setLanguage, languages, currentLanguageMeta } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState<boolean>(false);
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close language menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyCode = () => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="w-full bg-surface/95 backdrop-blur-md border-b border-surface-border sticky top-0 z-40 px-3 sm:px-4 py-2 sm:py-2.5 transition-colors duration-300">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand & Room Code */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-surface border border-surface-border flex items-center justify-center overflow-hidden shadow-flat-sm flex-shrink-0">
            <img src={ROLES.Werewolf.image} alt="Pocket Werewolf" className="w-full h-full object-cover" />
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="font-gothic font-bold text-xs sm:text-base tracking-wider text-slate-900 dark:text-slate-100 truncate">
              {t('app.title')}
            </h1>

            {/* Desktop Room Code Badge */}
            {room?.code && (
              <div className="hidden sm:flex items-center gap-1.5 bg-surface-light border border-slate-300 dark:border-slate-700/60 rounded-xl px-2.5 py-1 shadow-inner flex-shrink-0">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{t('header.room')}</span>
                <span className="text-xs font-bold font-mono tracking-wider text-blood">{room.code}</span>
                <button
                  onClick={handleCopyCode}
                  title={t('header.copyCode')}
                  className="p-0.5 hover:text-slate-900 dark:hover:text-white text-slate-500 dark:text-slate-400 transition-colors rounded active:scale-90"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {onOpenShare && (
                  <button
                    onClick={onOpenShare}
                    title={t('header.share')}
                    className="p-0.5 hover:text-slate-900 dark:hover:text-white text-slate-500 dark:text-slate-400 transition-colors rounded active:scale-90"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Room Code Pill */}
        {room?.code && (
          <div className="flex sm:hidden items-center gap-1 bg-surface-light border border-slate-300 dark:border-slate-700/60 rounded-lg px-2 py-0.5 shadow-inner flex-shrink-0">
            <span className="text-xs font-bold font-mono tracking-wider text-blood">{room.code}</span>
            <button
              onClick={handleCopyCode}
              title={t('header.copyCode')}
              className="p-0.5 text-slate-500 dark:text-slate-400 active:scale-90"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        )}

        {/* Right: Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Theme Toggle (Desktop Only) */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? t('header.lightMode') : t('header.darkMode')}
            className="hidden sm:flex p-1.5 sm:p-2 rounded-xl bg-surface-light hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700/50 transition-all active:scale-95"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              title={t('header.language')}
              className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-surface-light hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700/50 text-xs font-semibold transition-all active:scale-95"
            >
              <span className="text-sm leading-none">{currentLanguageMeta.flag}</span>
              <span className="hidden sm:inline font-mono uppercase text-[11px]">{language}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-surface border border-slate-300 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden py-1 z-50 animate-fade-in backdrop-blur-md">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors ${
                      language === l.code
                        ? 'bg-blood/20 text-blood font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{l.flag}</span>
                      <span>{l.name}</span>
                    </span>
                    {language === l.code && <Check className="w-3.5 h-3.5 text-blood" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Guide (Desktop) */}
          <button
            onClick={onOpenGuide}
            title={t('header.guide')}
            className="hidden sm:flex p-1.5 sm:p-2 rounded-xl bg-surface-light hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700/50 transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? t('header.soundOn') : t('header.soundOff')}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all active:scale-95 ${
              soundEnabled
                ? 'bg-blood/20 border-blood/40 text-blood hover:bg-blood/30'
                : 'bg-surface-light border-slate-300 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Settings Modal */}
          <button
            onClick={onOpenSettings}
            title={t('header.settings')}
            className="p-1.5 sm:p-2 rounded-xl bg-surface-light hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700/50 transition-all active:scale-95"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Leave Room */}
          {room && (
            <button
              onClick={() => {
                if (window.confirm(t('header.leaveConfirm'))) {
                  leaveRoom();
                }
              }}
              title={t('header.leave')}
              className="p-1.5 sm:p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 transition-all active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
