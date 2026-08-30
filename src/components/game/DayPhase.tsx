import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useTranslation } from '@/context/LanguageContext';
import TimerBar from '@/components/common/TimerBar';
import TownChat from '@/components/game/TownChat';
import { Users, Vote, Pause, Play, Shield, Skull } from 'lucide-react';
import { ROLES } from '@/config/roles';
import { haptics } from '@/utils/haptics';

/**
 * DayPhase Component
 * 
 * Manages the village discussion phase where players communicate, review living vs dead players,
 * and mark suspected werewolves before advancing to the town trial / voting phase.
 * 
 * Features:
 * - Live synchronized discussion countdown timer with host pause/resume controls.
 * - Interactive player roster with temporary local suspect toggling.
 * - Real-time Town Square Chat integration (`TownChat`).
 * - Graveyard list detailing eliminated villagers and their revealed roles.
 * - Host control bar to trigger the voting trial.
 */
export default function DayPhase() {
  const { room, players, me, isHost, advanceToVoting } = useGame();
  const { t } = useTranslation();
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [suspectId, setSuspectId] = useState<string | null>(null);

  if (!room || !me) return null;

  const currentRound = room.round || 1;
  const alivePlayers = players.filter(p => p.is_alive);
  const deadPlayers = players.filter(p => !p.is_alive);

  const dayDuration = room.settings?.dayDuration || 90;

  const handleAdvanceToVotingWithHaptics = () => {
    haptics.impact();
    advanceToVoting();
  };

  const handleToggleSuspect = (playerId: string) => {
    haptics.tap();
    setSuspectId(suspectId === playerId ? null : playerId);
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-3 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-5 animate-fade-in pb-16 md:pb-6">
      {/* Day Header (Flat Minimalist Style) */}
      <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-flat flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 text-center sm:text-left">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl flex-shrink-0">
            ☀️
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[11px] sm:text-xs font-mono font-semibold tracking-widest text-amber-400 uppercase">
                {t('day.dayTag', { round: currentRound })}
              </span>
            </div>
            <h2 className="font-gothic text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">{t('day.title')}</h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              {t('day.subtitle')}
            </p>
          </div>
        </div>

        {/* Live Synced Timer */}
        <div className="w-full sm:w-60 flex-shrink-0">
          <TimerBar
            initialSeconds={dayDuration}
            isPaused={isPaused}
            onTimeUp={() => {
              if (isHost) advanceToVoting();
            }}
          />
        </div>
      </div>

      {/* Host Timer Controls */}
      {isHost && (
        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-surface-light border border-surface-border text-xs">
          <span className="text-slate-400 font-medium">{t('day.hostTimerControls')}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                haptics.tap();
                setIsPaused(!isPaused);
              }}
              className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors active:scale-95"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? t('day.resume') : t('day.pause')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Discussion Layout: Players & Live Chat (Responsive Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Left Column: Living Players & Graveyard (6 Cols) */}
        <div className="lg:col-span-6 space-y-3 sm:space-y-4">
          {/* Living Players List */}
          <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-flat">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="font-gothic font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  {t('day.aliveTitle', { count: alivePlayers.length })}
                </h3>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-400">{t('day.aliveSubtitle')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {alivePlayers.map((p) => {
                const isMe = p.id === me.id;
                const isSuspect = suspectId === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => handleToggleSuspect(p.id)}
                    className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] ${
                      isSuspect
                        ? 'bg-rose-950/30 border-rose-500/60 shadow-flat-sm'
                        : isMe
                        ? 'bg-indigo-950/20 border-indigo-500/40 text-slate-100'
                        : 'bg-surface-light border-surface-border hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-lg flex-shrink-0">
                        {p.avatar || '👤'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {p.name}
                          </span>
                          {isMe && (
                            <span className="text-[10px] text-indigo-400 font-medium flex-shrink-0">
                              ({t('lobby.you')})
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <Shield className="w-2.5 h-2.5" />
                          <span>{t('day.aliveStatus')}</span>
                        </span>
                      </div>
                    </div>

                    {isSuspect && (
                      <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-500/30 flex-shrink-0 ml-1">
                        {t('day.suspectBadge')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graveyard */}
          <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-flat">
            <div className="flex items-center gap-2 mb-3">
              <Skull className="w-4 h-4 text-rose-400" />
              <h3 className="font-gothic font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                {t('day.graveyardTitle', { count: deadPlayers.length })}
              </h3>
            </div>

            {deadPlayers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {deadPlayers.map((p) => {
                  const roleDef = (p.role && ROLES[p.role]) ? ROLES[p.role] : ROLES.Villager;
                  const localizedRoleName = t(`roles.${roleDef.id}.name`) || roleDef.name;

                  return (
                    <div
                      key={p.id}
                      className="p-2 rounded-xl bg-surface-light border border-surface-border text-xs flex items-center justify-between opacity-75"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span>💀</span>
                        <span className="font-medium text-slate-300 line-through truncate">{p.name}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono ml-1 flex-shrink-0">
                        {localizedRoleName}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-1 text-center">
                {t('day.graveyardEmpty')}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Real-Time Town Square Chat (6 Cols) */}
        <div className="lg:col-span-6">
          <TownChat />
        </div>
      </div>

      {/* Advance to Voting (Host only) */}
      {isHost ? (
        <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-flat flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div>
            <h4 className="font-gothic font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">{t('day.finishDiscussionTitle')}</h4>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              {t('day.finishDiscussionSubtitle')}
            </p>
          </div>
          <button
            onClick={handleAdvanceToVotingWithHaptics}
            className="w-full sm:w-auto py-3 px-6 sm:px-8 rounded-xl bg-blood hover:bg-blood-hover text-white font-gothic font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-flat-sm flex items-center justify-center gap-2 active:scale-[0.98] flex-shrink-0"
          >
            <Vote className="w-4 h-4" />
            <span>{t('day.advanceVotingBtn')}</span>
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-surface-light border border-surface-border text-xs text-slate-400 text-center">
          {t('day.waitingHost')}
        </div>
      )}
    </div>
  );
}
