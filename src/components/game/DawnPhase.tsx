import React from 'react';
import { useGame } from '@/context/GameContext';
import { useTranslation } from '@/context/LanguageContext';
import { Sun, ShieldCheck, ArrowRight, MessageSquare } from 'lucide-react';
import { ROLES } from '@/config/roles';
import { haptics } from '@/utils/haptics';

export default function DawnPhase() {
  const { room, players, isHost, advanceToDay } = useGame();
  const { t } = useTranslation();

  if (!room) return null;

  const currentRound = room.round || 1;

  // Find night casualties for this round
  const deadTonight = players.filter(
    p => !p.is_alive && p.death_round === currentRound && (p.death_reason === 'night_kill' || p.death_reason === 'witch_poison')
  );

  const handleAdvanceToDayWithHaptics = () => {
    haptics.impact();
    advanceToDay();
  };

  return (
    <div className="max-w-2xl w-full mx-auto px-3 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-5 animate-fade-in text-center">
      {/* Dawn Header (Flat Dark Minimalist Style) */}
      <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-6 shadow-flat space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sun className="w-5 h-5 text-amber-400" />
          <span className="text-[11px] sm:text-xs font-mono font-semibold tracking-widest text-amber-400 uppercase">
            {t('dawn.dawnTag', { round: currentRound })}
          </span>
        </div>

        <h2 className="font-gothic text-xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          {t('dawn.title')}
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          {t('dawn.subtitle')}
        </p>
      </div>

      {/* Casualties & Night Report (Mobile Responsive Cards) */}
      {deadTonight.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold">
            {t('dawn.casualtiesTitle')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {deadTonight.map((p) => {
              const roleDef = (p.role && ROLES[p.role]) ? ROLES[p.role] : ROLES.Villager;
              const localizedRoleName = t(`roles.${roleDef.id}.name`) || roleDef.name;

              return (
                <div
                  key={p.id}
                  className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4 shadow-flat-sm flex items-center gap-3.5 text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-surface border border-rose-500/30 flex items-center justify-center text-2xl flex-shrink-0">
                    💀
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-gothic text-base font-bold text-slate-100 truncate">{p.name}</h4>
                    <span className="text-xs text-rose-400 font-medium block mt-0.5">
                      {p.death_reason === 'witch_poison' ? t('dawn.witchKillReason') : t('dawn.wolfKillReason')}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block truncate">
                      <span>{t('dawn.realRole')}</span>{' '}
                      <strong className="text-slate-200 font-medium">{localizedRoleName}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 shadow-flat-sm flex flex-col items-center justify-center space-y-1.5">
          <ShieldCheck className="w-10 h-10 text-emerald-400" />
          <h3 className="font-gothic font-bold text-lg text-emerald-200">
            {t('dawn.noCasualtiesTitle')}
          </h3>
          <p className="text-xs text-emerald-400/80 max-w-sm">
            {t('dawn.noCasualtiesSubtitle')}
          </p>
        </div>
      )}

      {/* Advance to Day Discussion (Host only) */}
      {isHost ? (
        <div className="w-full max-w-md mx-auto pt-2">
          <button
            onClick={handleAdvanceToDayWithHaptics}
            className="w-full py-3.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-gothic font-bold text-sm tracking-wider uppercase transition-all shadow-flat-sm flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>{t('dawn.advanceDayBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-surface-light border border-surface-border text-xs text-slate-400 flex items-center justify-center gap-2">
          <Sun className="w-4 h-4 text-amber-400" />
          <span>{t('dawn.waitingHost')}</span>
        </div>
      )}
    </div>
  );
}
