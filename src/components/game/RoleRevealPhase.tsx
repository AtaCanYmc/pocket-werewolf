import React from 'react';
import { useGame } from '@/context/GameContext';
import { useTranslation } from '@/context/LanguageContext';
import CardFlip from '@/components/common/CardFlip';
import { Moon, ArrowRight, Loader2 } from 'lucide-react';
import { haptics } from '@/utils/haptics';

export default function RoleRevealPhase() {
  const { me, isHost, advanceToNight, loading } = useGame();
  const { t } = useTranslation();

  const handleAdvanceToNightWithHaptics = () => {
    haptics.impact();
    advanceToNight();
  };

  return (
    <div className="w-full max-w-xl mx-auto px-3 sm:px-4 py-2 sm:py-5 flex flex-col items-center justify-center animate-fade-in text-center space-y-3 sm:space-y-4">
      <div className="space-y-1">
        <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold">
          {t('roleReveal.phaseTag')}
        </span>
        <h2 className="font-gothic text-xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          {t('roleReveal.title')}
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mx-auto">
          {t('roleReveal.subtitle')}
        </p>
      </div>

      {/* 3D Interactive Role Card Flip */}
      {me && (
        <CardFlip
          roleId={me.role}
          team={me.team}
          playerName={me.name}
        />
      )}

      {/* Host Advance Button */}
      {isHost ? (
        <div className="w-full max-w-sm mt-3">
          <button
            onClick={handleAdvanceToNightWithHaptics}
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-gothic font-bold text-sm tracking-wider uppercase transition-all shadow-flat-sm flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Moon className="w-4 h-4 fill-white" />}
            <span>{loading ? t('roleReveal.loading') : t('roleReveal.startNightBtn')}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
          <p className="text-[11px] text-slate-500 mt-2">
            {t('roleReveal.hostHint')}
          </p>
        </div>
      ) : (
        <div className="mt-3 p-3 rounded-xl bg-surface-light border border-surface-border text-xs text-slate-400 flex items-center gap-2">
          <Moon className="w-4 h-4 text-indigo-400" />
          <span>{t('roleReveal.waitingHost')}</span>
        </div>
      )}
    </div>
  );
}
