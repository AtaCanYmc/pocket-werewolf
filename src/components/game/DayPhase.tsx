import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useTranslation } from '@/context/LanguageContext';
import TimerBar from '@/components/common/TimerBar';
import TownChat from '@/components/game/TownChat';
import { Users, Vote, Pause, Play, Shield, Skull, MessageSquare } from 'lucide-react';
import { ROLES } from '@/config/roles';

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

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 animate-fade-in">
      {/* Day Header */}
      <div className="bg-surface border border-surface-border rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-lg">
            ☀️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase">
                {t('day.dayTag', { round: currentRound })}
              </span>
            </div>
            <h2 className="font-gothic text-2xl font-black text-slate-900 dark:text-slate-100">{t('day.title')}</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {t('day.subtitle')}
            </p>
          </div>
        </div>

        {/* Live Synced Timer */}
        <div className="w-full md:w-64">
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
        <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-light border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-700 dark:text-slate-400 font-semibold">{t('day.hostTimerControls')}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors active:scale-95"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? t('day.resume') : t('day.pause')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Discussion Layout: Players & Live Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Living Players & Graveyard (7 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Living Players List */}
          <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <h3 className="font-gothic font-bold text-slate-900 dark:text-slate-100">
                  {t('day.aliveTitle', { count: alivePlayers.length })}
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">{t('day.aliveSubtitle')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {alivePlayers.map((p) => {
                const isMe = p.id === me.id;
                const isSuspect = suspectId === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSuspectId(isSuspect ? null : p.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
                      isSuspect
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-500 shadow-blood-glow'
                        : isMe
                        ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-500/40'
                        : 'bg-surface-light border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl flex-shrink-0">{p.avatar || '👤'}</span>
                      <div className="truncate">
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 block truncate">
                          {p.name} {isMe && `(${t('lobby.you')})`}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5" />
                          <span>{t('day.aliveStatus')}</span>
                        </span>
                      </div>
                    </div>

                    {isSuspect && (
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded border border-red-300 dark:border-red-800 flex-shrink-0">
                        {t('day.suspectBadge')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graveyard */}
          <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Skull className="w-4 h-4 text-red-500" />
              <h3 className="font-gothic font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                {t('day.graveyardTitle', { count: deadPlayers.length })}
              </h3>
            </div>

            {deadPlayers.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {deadPlayers.map((p) => {
                  const roleDef = (p.role && ROLES[p.role]) ? ROLES[p.role] : ROLES.Villager;
                  const localizedRoleName = t(`roles.${roleDef.id}.name`) || roleDef.name;

                  return (
                    <div
                      key={p.id}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between opacity-80"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span>💀</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 line-through truncate">{p.name}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono ml-1 flex-shrink-0">
                        {localizedRoleName}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-2 text-center">
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
        <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-gothic font-bold text-slate-900 dark:text-slate-100">{t('day.finishDiscussionTitle')}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t('day.finishDiscussionSubtitle')}
            </p>
          </div>
          <button
            onClick={() => advanceToVoting()}
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-red-600 hover:bg-red-500 text-white font-gothic font-bold text-sm tracking-wider uppercase transition-all shadow-blood-glow flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Vote className="w-5 h-5" />
            <span>{t('day.advanceVotingBtn')}</span>
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-surface-light border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 text-center animate-pulse">
          {t('day.waitingHost')}
        </div>
      )}
    </div>
  );
}
