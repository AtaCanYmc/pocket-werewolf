import React, { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useTranslation } from '@/context/LanguageContext';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Skull, Shield } from 'lucide-react';
import { ROLES } from '@/config/roles';

export default function GameOverPhase() {
  const { room, players, isHost, resetToLobby, loading } = useGame();
  const { t } = useTranslation();

  const winner = room?.winner;
  const isEvilWinner = winner === 'evil';

  useEffect(() => {
    // Fire victory confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }, []);

  return (
    <div className="max-w-3xl w-full mx-auto px-3 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-6 animate-fade-in text-center">
      {/* Victory Header */}
      <div
        className={`border rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl space-y-2 sm:space-y-3 ${
          isEvilWinner
            ? 'bg-gradient-to-b from-red-500/10 dark:from-red-950/80 via-surface to-surface border-red-400 dark:border-red-800 shadow-blood-glow'
            : 'bg-gradient-to-b from-emerald-500/10 dark:from-emerald-950/80 via-surface to-surface border-emerald-400 dark:border-emerald-800 shadow-emerald-glow'
        }`}
      >
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl sm:text-4xl shadow-lg bg-surface-light border border-slate-300 dark:border-slate-700">
          {isEvilWinner ? '🐺' : '🏆'}
        </div>

        <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
          {t('gameOver.endedTag')}
        </span>

        <h2 className="font-gothic text-2xl sm:text-5xl font-black text-slate-900 dark:text-slate-100">
          {isEvilWinner ? t('gameOver.werewolvesWon') : t('gameOver.villagersWon')}
        </h2>

        <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          {isEvilWinner
            ? t('gameOver.werewolvesWonSub')
            : t('gameOver.villagersWonSub')}
        </p>
      </div>

      {/* Complete Roster & Real Identities */}
      <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-6 shadow-xl text-left space-y-3 sm:space-y-4">
        <h3 className="font-gothic font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>{t('gameOver.allRolesTitle')}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {players.map((p) => {
            const roleDef = (p.role && ROLES[p.role]) ? ROLES[p.role] : ROLES.Villager;
            const isPlayerEvil = p.team === 'evil' || roleDef.team === 'evil';
            const localizedRoleName = t(`roles.${roleDef.id}.name`) || roleDef.name;

            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isPlayerEvil
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                    : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-1 flex items-center justify-center overflow-hidden">
                    <img
                      src={roleDef.image}
                      alt={localizedRoleName}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.display = 'none';
                        if (target.nextSibling) {
                          (target.nextSibling as HTMLElement).style.display = 'block';
                        }
                      }}
                    />
                    <span className="hidden text-xl">{roleDef.fallbackIcon}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">{p.name}</span>
                    <span
                      className={`text-[11px] font-medium flex items-center gap-1 ${
                        isPlayerEvil ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isPlayerEvil ? <Skull className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      <span>{localizedRoleName}</span>
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                    p.is_alive
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800'
                  }`}
                >
                  {p.is_alive ? t('gameOver.aliveBadge') : t('gameOver.deadBadge')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Host Reset to Lobby Button */}
      {isHost ? (
        <div className="pt-2">
          <button
            onClick={resetToLobby}
            disabled={loading}
            className="w-full max-w-md mx-auto py-4 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-gothic font-bold text-sm tracking-wider uppercase transition-all shadow-mystic-glow flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{loading ? t('gameOver.loading') : t('gameOver.rematchBtn')}</span>
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-surface-light border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          {t('gameOver.waitingHost')}
        </div>
      )}
    </div>
  );
}
