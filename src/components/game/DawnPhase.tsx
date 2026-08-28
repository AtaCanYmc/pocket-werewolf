import React from 'react';
import { useGame } from '@/context/GameContext';
import { useTranslation } from '@/context/LanguageContext';
import { Sun, ShieldCheck, ArrowRight, MessageSquare } from 'lucide-react';
import { ROLES } from '@/config/roles';

export default function DawnPhase() {
  const { room, players, isHost, advanceToDay } = useGame();
  const { t } = useTranslation();

  if (!room) return null;

  const currentRound = room.round || 1;

  // Find night casualties for this round
  const deadTonight = players.filter(
    p => !p.is_alive && p.death_round === currentRound && (p.death_reason === 'night_kill' || p.death_reason === 'witch_poison')
  );

  return (
    <div className="max-w-2xl w-full mx-auto px-3 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-6 animate-fade-in text-center">
      {/* Dawn Header */}
      <div className="bg-gradient-to-b from-amber-500/10 via-surface to-surface border border-amber-500/30 dark:border-amber-900/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 animate-spin" />
          <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase">
            {t('dawn.dawnTag', { round: currentRound })}
          </span>
        </div>

        <h2 className="font-gothic text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100">
          {t('dawn.title')}
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          {t('dawn.subtitle')}
        </p>
      </div>

      {/* Casualties & Night Report */}
      {deadTonight.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-red-600 dark:text-red-400 font-bold">
            {t('dawn.casualtiesTitle')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {deadTonight.map((p) => {
              const roleDef = (p.role && ROLES[p.role]) ? ROLES[p.role] : ROLES.Villager;
              const localizedRoleName = t(`roles.${roleDef.id}.name`) || roleDef.name;

              return (
                <div
                  key={p.id}
                  className="bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800/60 rounded-2xl p-5 shadow-blood-glow flex items-center gap-4 text-left"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-red-400 dark:border-red-800 flex items-center justify-center text-3xl shadow-inner">
                    💀
                  </div>
                  <div>
                    <h4 className="font-gothic text-lg font-bold text-slate-900 dark:text-slate-100">{p.name}</h4>
                    <span className="text-xs text-red-600 dark:text-red-400 font-semibold block">
                      {p.death_reason === 'witch_poison' ? t('dawn.witchKillReason') : t('dawn.wolfKillReason')}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 block">
                      <span>{t('dawn.realRole')}</span>{' '}
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{localizedRoleName}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/50 rounded-2xl p-6 shadow-emerald-glow flex flex-col items-center justify-center space-y-2">
          <ShieldCheck className="w-12 h-12 text-emerald-500" />
          <h3 className="font-gothic font-bold text-xl text-emerald-900 dark:text-emerald-200">
            {t('dawn.noCasualtiesTitle')}
          </h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-300/80 max-w-sm">
            {t('dawn.noCasualtiesSubtitle')}
          </p>
        </div>
      )}

      {/* Advance to Day Discussion (Host only) */}
      {isHost ? (
        <div className="w-full max-w-md mx-auto pt-4">
          <button
            onClick={() => advanceToDay()}
            className="w-full py-3.5 px-6 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-gothic font-bold text-sm tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>{t('dawn.advanceDayBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-surface-light border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 animate-pulse flex items-center justify-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>{t('dawn.waitingHost')}</span>
        </div>
      )}
    </div>
  );
}
