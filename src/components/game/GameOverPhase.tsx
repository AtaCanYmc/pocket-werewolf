import React, { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useTranslation } from '@/context/LanguageContext';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Skull, Shield, Loader2 } from 'lucide-react';
import { ROLES } from '@/config/roles';
import { haptics } from '@/utils/haptics';

export default function GameOverPhase() {
  const { room, players, isHost, resetToLobby, loading } = useGame();
  const { t } = useTranslation();

  const winner = room?.winner;
  const isEvilWinner = winner === 'evil';

  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      haptics.impact();
    } catch {}
  }, []);

  const handleResetToLobbyWithHaptics = async () => {
    haptics.impact();
    await resetToLobby();
  };

  return (
    <div className="max-w-3xl w-full mx-auto px-3 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-5 animate-fade-in text-center pb-16 md:pb-6">
      {/* Victory Header (Sterile Flat Minimalist Style) */}
      <div
        className={`border rounded-2xl p-5 sm:p-7 shadow-flat space-y-2 ${
          isEvilWinner
            ? 'bg-rose-950/20 border-rose-500/40 text-slate-100'
            : 'bg-emerald-950/20 border-emerald-500/40 text-slate-100'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center overflow-hidden bg-surface border border-surface-border shadow-flat-sm">
          {isEvilWinner ? (
            <img src="/assets/roles/Werewolf.png" alt="Werewolves Won" className="w-full h-full object-cover" />
          ) : (
            <img src="/assets/roles/Villager1.png" alt="Villagers Won" className="w-full h-full object-cover" />
          )}
        </div>

        <span className="text-[11px] sm:text-xs font-mono font-semibold tracking-widest uppercase text-slate-400 block">
          {t('gameOver.endedTag')}
        </span>

        <h2 className="font-gothic text-2xl sm:text-4xl font-bold text-slate-100">
          {isEvilWinner ? t('gameOver.werewolvesWon') : t('gameOver.villagersWon')}
        </h2>

        <p className="text-[11px] sm:text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          {isEvilWinner
            ? t('gameOver.werewolvesWonSub')
            : t('gameOver.villagersWonSub')}
        </p>
      </div>

      {/* Complete Roster & Real Identities (Responsive Mobile Grid) */}
      <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-flat text-left space-y-3">
        <h3 className="font-gothic font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>{t('gameOver.allRolesTitle')}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {players.map((p) => {
            const roleDef = (p.role && ROLES[p.role]) ? ROLES[p.role] : ROLES.Villager;
            const isPlayerEvil = p.team === 'evil' || roleDef.team === 'evil';
            const localizedRoleName = t(`roles.${roleDef.id}.name`) || roleDef.name;

            return (
              <div
                key={p.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isPlayerEvil
                    ? 'bg-rose-950/15 border-rose-500/30'
                    : 'bg-emerald-950/15 border-emerald-500/30'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface border border-surface-border p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                    <span className="hidden text-lg">{roleDef.fallbackIcon}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-slate-100 block truncate">{p.name}</span>
                    <span
                      className={`text-[10px] font-medium flex items-center gap-1 truncate ${
                        isPlayerEvil ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isPlayerEvil ? <Skull className="w-3 h-3 flex-shrink-0" /> : <Shield className="w-3 h-3 flex-shrink-0" />}
                      <span className="truncate">{localizedRoleName}</span>
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md flex-shrink-0 ml-2 border ${
                    p.is_alive
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-950/40 text-rose-400 border-rose-500/30'
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
            onClick={handleResetToLobbyWithHaptics}
            disabled={loading}
            className="w-full max-w-md mx-auto py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-gothic font-bold text-sm tracking-wider uppercase transition-all shadow-flat-sm flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            <span>{loading ? t('gameOver.loading') : t('gameOver.rematchBtn')}</span>
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-surface-light border border-surface-border text-xs text-slate-400">
          {t('gameOver.waitingHost')}
        </div>
      )}
    </div>
  );
}
