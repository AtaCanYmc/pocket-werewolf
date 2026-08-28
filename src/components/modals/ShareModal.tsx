import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { X, Copy, Check, Smartphone, Share2 } from 'lucide-react';
import { useGame } from '@/context/GameContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const { room } = useGame();
  const { t } = useTranslation();
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !room?.code) return null;

  const joinUrl = `${window.location.origin}?code=${room.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('modals.shareTitle'),
          text: `${t('app.title')} - ${t('lobby.roomCode')} ${room.code}`,
          url: joinUrl,
        });
      } catch (e) {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border bg-surface-light">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-500" />
            <h2 className="font-gothic font-bold text-lg text-slate-900 dark:text-slate-100">{t('modals.shareTitle')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          {/* Room Code */}
          <div>
            <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-mono">{t('header.room')}</span>
            <div className="text-4xl font-extrabold font-mono text-blood tracking-widest my-1 select-all bg-surface-light border border-slate-300 dark:border-slate-700 py-2 px-6 rounded-2xl shadow-inner">
              {room.code}
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs">
            {t('modals.shareSubtitle')}
          </p>

          {/* Action Buttons */}
          <div className="w-full space-y-2 pt-2">
            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold text-sm transition-all border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t('modals.copied') : t('modals.copyJoinLink')}</span>
            </button>

            {navigator.share && (
              <button
                onClick={handleNativeShare}
                className="w-full py-2.5 px-4 rounded-xl bg-blood hover:bg-blood-hover text-white font-semibold text-sm transition-all shadow-blood-glow flex items-center justify-center gap-2 active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>{t('modals.shareMobile')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-surface-border bg-surface-light flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            {t('modals.done')}
          </button>
        </div>
      </div>
    </div>
  );
}
