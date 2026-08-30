import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { X, Smartphone, Download, MoreVertical, Monitor, CheckCircle2, Zap } from 'lucide-react';
import { haptics } from '@/utils/haptics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PwaGuideModal({ isOpen, onClose }: PwaGuideModalProps) {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    haptics.impact();
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallSuccess(true);
        setDeferredPrompt(null);
      }
    } catch {}
  };

  const handleClose = () => {
    haptics.tap();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-surface-border bg-surface-light flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blood/15 border border-blood/30 flex items-center justify-center text-blood flex-shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-gothic font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                {t('pwa.title')}
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label={t('modals.close')}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-surface-light border border-transparent hover:border-surface-border transition-colors active:scale-90 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          {/* App Card & Instant Install Button */}
          <div className="p-4 rounded-2xl bg-surface-light border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-flat-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-surface border border-surface-border overflow-hidden flex-shrink-0 shadow-flat-sm">
                <img src="/icons/icon-192.png" alt="Pocket Werewolf" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h3 className="font-gothic font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">Pocket Werewolf</h3>
                <p className="text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{t('pwa.benefitTag')}</span>
                </p>
              </div>
            </div>

            {deferredPrompt && !installSuccess && (
              <button
                onClick={handleInstallClick}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-blood hover:bg-blood-hover text-white font-gothic font-bold text-xs uppercase tracking-wider transition-all shadow-flat-sm flex items-center justify-center gap-2 active:scale-95 flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('pwa.installNowBtn')}</span>
              </button>
            )}

            {(isInstalled || installSuccess) && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('pwa.installedBadge')}</span>
              </span>
            )}
          </div>

          {/* iOS Safari Installation Steps */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-surface border border-surface-border space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <h4 className="font-gothic font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{t('pwa.iosTitle')}</h4>
            </div>

            <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-surface-light border border-surface-border flex items-center justify-center font-mono font-bold text-[10px] text-slate-400 flex-shrink-0 mt-0.5">1</span>
                <span>{t('pwa.iosStep1')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-surface-light border border-surface-border flex items-center justify-center font-mono font-bold text-[10px] text-slate-400 flex-shrink-0 mt-0.5">2</span>
                <span>{t('pwa.iosStep2')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-surface-light border border-surface-border flex items-center justify-center font-mono font-bold text-[10px] text-slate-400 flex-shrink-0 mt-0.5">3</span>
                <span>{t('pwa.iosStep3')}</span>
              </li>
            </ol>
          </div>

          {/* Android Chrome Installation Steps */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-surface border border-surface-border space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                <MoreVertical className="w-4 h-4" />
              </div>
              <h4 className="font-gothic font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{t('pwa.androidTitle')}</h4>
            </div>

            <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-surface-light border border-surface-border flex items-center justify-center font-mono font-bold text-[10px] text-slate-400 flex-shrink-0 mt-0.5">1</span>
                <span>{t('pwa.androidStep1')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-surface-light border border-surface-border flex items-center justify-center font-mono font-bold text-[10px] text-slate-400 flex-shrink-0 mt-0.5">2</span>
                <span>{t('pwa.androidStep2')}</span>
              </li>
            </ol>
          </div>

          {/* Desktop Installation */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-surface border border-surface-border space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-950/40 border border-sky-500/30 text-sky-400">
                <Monitor className="w-4 h-4" />
              </div>
              <h4 className="font-gothic font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{t('pwa.desktopTitle')}</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('pwa.desktopStep1')}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-surface-border bg-surface-light flex items-center justify-between gap-2 flex-shrink-0">
          <span className="text-[11px] text-slate-400 line-clamp-1">
            {t('pwa.footerHint')}
          </span>
          <button
            onClick={handleClose}
            className="px-4 py-1.5 rounded-xl bg-surface border border-surface-border hover:border-slate-500 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors active:scale-95 flex-shrink-0"
          >
            {t('modals.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
