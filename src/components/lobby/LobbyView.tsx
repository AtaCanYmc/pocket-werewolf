import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useTranslation } from '@/context/LanguageContext';
import { Users, Crown, CheckCircle2, Circle, Play, Plus, Minus, Share2, Sparkles, UserMinus, Loader2 } from 'lucide-react';
import { ROLES, DEFAULT_PRESETS } from '@/config/roles';
import { RoleId } from '@/types/game';
import { haptics } from '@/utils/haptics';

interface LobbyViewProps {
  onOpenShare: () => void;
}

export default function LobbyView({ onOpenShare }: LobbyViewProps) {
  const { room, players, me, isHost, toggleReady, kickPlayer, updateDeck, startGame, loading, error } = useGame();
  const { t } = useTranslation();
  const [selectedPreset, setSelectedPreset] = useState<string>('classic_6');
  const [isTogglingReady, setIsTogglingReady] = useState<boolean>(false);

  if (!room) return null;

  const currentDeck = room.deck || [];
  const totalDeckRoles = currentDeck.reduce((sum, item) => sum + (item.count || 0), 0);
  const totalPlayers = players.length;
  const isDeckBalanced = totalDeckRoles === totalPlayers;

  // Increment / Decrement Role Count in Deck (Host only)
  const handleModifyRoleCount = (roleId: RoleId, delta: number) => {
    if (!isHost) return;
    haptics.tap();
    let newDeck = [...currentDeck];
    const existingIndex = newDeck.findIndex(d => d.role === roleId);

    if (existingIndex >= 0) {
      const newCount = (newDeck[existingIndex].count || 0) + delta;
      if (newCount <= 0) {
        newDeck.splice(existingIndex, 1);
      } else {
        newDeck[existingIndex] = { ...newDeck[existingIndex], count: newCount };
      }
    } else if (delta > 0) {
      newDeck.push({ role: roleId, count: 1 });
    }

    updateDeck(newDeck);
  };

  // Apply Role Preset (Host only)
  const handleApplyPreset = (presetId: string) => {
    if (!isHost) return;
    haptics.selection();
    const preset = DEFAULT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      updateDeck(preset.deck);
    }
  };

  const handleToggleReadyWithHaptics = async () => {
    haptics.selection();
    setIsTogglingReady(true);
    try {
      await toggleReady();
      haptics.success();
    } finally {
      setIsTogglingReady(false);
    }
  };

  const handleStartGameWithHaptics = async () => {
    haptics.impact();
    await startGame();
  };

  const handleKickPlayerWithHaptics = (playerId: string) => {
    haptics.tap();
    kickPlayer(playerId);
  };

  return (
    <div className="max-w-4xl w-full mx-auto px-3 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-5 animate-fade-in pb-24 md:pb-6">
      {/* Lobby Header (Flat Minimalist Style) */}
      <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-flat flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 text-center sm:text-left">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blood/10 border border-blood/20 flex items-center justify-center text-2xl flex-shrink-0">
            🏰
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="font-gothic text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">{t('lobby.title')}</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                {totalPlayers} {t('lobby.players')}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('lobby.subtitle')}
            </p>
          </div>
        </div>

        {/* Room Share & Invite */}
        <button
          onClick={() => {
            haptics.tap();
            onOpenShare();
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-surface-light hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-surface-border text-xs sm:text-sm font-medium transition-all shadow-flat-sm active:scale-95"
        >
          <Share2 className="w-4 h-4 text-blood" />
          <span>{t('lobby.roomCode')} <strong className="text-blood font-mono text-sm tracking-wider font-semibold">{room.code}</strong></span>
        </button>
      </div>

      {error && (
        <div className="p-3 sm:p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Grid: Players List & Role Deck */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
        {/* Left Column: Joined Players (7 Columns) */}
        <div className="md:col-span-7 space-y-3 sm:space-y-4">
          <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-flat">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <h3 className="font-gothic font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">{t('lobby.players')} ({totalPlayers})</h3>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {players.filter(p => p.is_ready).length}/{totalPlayers} {t('lobby.readyCount')}
              </span>
            </div>

            {/* Player Cards (Responsive Mobile-Optimized Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {players.map((p) => {
                const isMe = p.id === me?.id;
                return (
                  <div
                    key={p.id}
                    className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isMe
                        ? 'bg-indigo-950/20 border-indigo-500/40 text-slate-100'
                        : 'bg-surface-light border-surface-border'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-surface-border flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                        {p.avatar || '🐺'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {p.name}
                          </span>
                          {isMe && <span className="text-[10px] text-indigo-400 font-medium flex-shrink-0">({t('lobby.you')})</span>}
                          {p.is_host && (
                            <span title={t('lobby.host')} className="flex-shrink-0">
                              <Crown className="w-3.5 h-3.5 text-amber-400" />
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] sm:text-[11px] flex items-center gap-1 mt-0.5 ${p.is_ready ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                          {p.is_ready ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3 text-slate-600" />}
                          <span>{p.is_ready ? t('lobby.ready') : t('lobby.waiting')}</span>
                        </span>
                      </div>
                    </div>

                    {/* Kick Button (Host only) */}
                    {isHost && !p.is_host && (
                      <button
                        onClick={() => handleKickPlayerWithHaptics(p.id)}
                        title={t('lobby.kick')}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors flex-shrink-0"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Ready Toggle Button (Desktop & Inline) */}
            <div className="mt-4 pt-3 border-t border-surface-border hidden md:flex justify-center">
              <button
                onClick={handleToggleReadyWithHaptics}
                disabled={isTogglingReady}
                className={`w-full py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-flat-sm active:scale-[0.98] ${
                  me?.is_ready
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isTogglingReady ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : me?.is_ready ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
                <span>{me?.is_ready ? t('lobby.cancelReadyBtn') : t('lobby.readyBtn')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Role Deck & Host Controls (5 Columns) */}
        <div className="md:col-span-5 space-y-3 sm:space-y-4">
          <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-flat flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blood" />
                  <h3 className="font-gothic font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">{t('lobby.deckTitle')} ({totalDeckRoles})</h3>
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full border ${
                    isDeckBalanced
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-950/40 border-amber-500/30 text-amber-400'
                  }`}
                >
                  {isDeckBalanced
                    ? t('lobby.deckBalanced')
                    : t('lobby.deckMismatch', { players: totalPlayers, roles: totalDeckRoles })}
                </span>
              </div>

              {/* Quick Presets (Host only) */}
              {isHost && (
                <div className="mb-3">
                  <label className="block text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    {t('lobby.presetLabel')}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DEFAULT_PRESETS.map((pr) => (
                      <button
                        key={pr.id}
                        onClick={() => handleApplyPreset(pr.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-left truncate transition-all active:scale-95 ${
                          selectedPreset === pr.id
                            ? 'bg-blood/15 border border-blood/40 text-blood font-semibold'
                            : 'bg-surface-light border border-surface-border text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {pr.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Role Configuration List */}
              <div className="space-y-1.5 sm:space-y-2 max-h-60 sm:max-h-72 overflow-y-auto pr-1">
                {Object.values(ROLES).map((role) => {
                  const currentRoleInDeck = currentDeck.find(d => d.role === role.id);
                  const count = currentRoleInDeck?.count || 0;
                  const isEvil = role.team === 'evil';
                  const localizedName = t(`roles.${role.id}.name`) || role.name;

                  return (
                    <div
                      key={role.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-surface-light border border-surface-border"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{role.fallbackIcon}</span>
                        <div>
                          <span className="text-xs font-medium text-slate-900 dark:text-slate-100 block leading-tight">{localizedName}</span>
                          <span className={`text-[9px] sm:text-[10px] ${isEvil ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {isEvil ? t('lobby.evilTeam') : t('lobby.goodTeam')}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      {isHost ? (
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <button
                            onClick={() => handleModifyRoleCount(role.id, -1)}
                            disabled={count === 0}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface hover:bg-slate-800 disabled:opacity-20 text-slate-300 border border-surface-border flex items-center justify-center transition-all active:scale-90"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-5 text-center text-xs font-mono font-bold text-slate-900 dark:text-slate-100">{count}</span>
                          <button
                            onClick={() => handleModifyRoleCount(role.id, 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface hover:bg-slate-800 text-slate-300 border border-surface-border flex items-center justify-center transition-all active:scale-90"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-mono font-bold text-slate-300 px-2 py-0.5 bg-surface border border-surface-border rounded-md">
                          {count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Start Game Action (Desktop) */}
            {isHost ? (
              <div className="mt-4 pt-3 border-t border-surface-border hidden md:block">
                <button
                  onClick={handleStartGameWithHaptics}
                  disabled={!isDeckBalanced || totalPlayers < 3 || loading}
                  className="w-full py-3.5 rounded-xl bg-blood hover:bg-blood-hover disabled:opacity-30 text-white font-gothic font-bold text-sm tracking-wider uppercase transition-all shadow-flat-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{loading ? t('lobby.startingBtn') : t('lobby.startBtn')}</span>
                </button>
                {!isDeckBalanced && (
                  <p className="text-[11px] text-amber-400 text-center mt-2">
                    {t('lobby.deckError', { roles: totalDeckRoles, players: totalPlayers })}
                  </p>
                )}
                {totalPlayers < 3 && (
                  <p className="text-[11px] text-slate-500 text-center mt-2">
                    {t('lobby.minPlayersError')}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4 pt-3 border-t border-surface-border text-center hidden md:block">
                <p className="text-xs text-slate-500">
                  {t('lobby.waitingHost')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-md border-t border-surface-border z-30 md:hidden pb-safe">
        {isHost ? (
          <div>
            <button
              onClick={handleStartGameWithHaptics}
              disabled={!isDeckBalanced || totalPlayers < 3 || loading}
              className="w-full py-3.5 rounded-xl bg-blood hover:bg-blood-hover disabled:opacity-30 text-white font-gothic font-bold text-sm tracking-wider uppercase transition-all shadow-flat-sm flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{loading ? t('lobby.startingBtn') : t('lobby.startBtn')}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleToggleReadyWithHaptics}
            disabled={isTogglingReady}
            className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-flat-sm active:scale-[0.98] ${
              me?.is_ready
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isTogglingReady ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : me?.is_ready ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
            <span>{me?.is_ready ? t('lobby.cancelReadyBtn') : t('lobby.readyBtn')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
