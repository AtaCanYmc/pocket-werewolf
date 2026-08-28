import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useTranslation } from '@/context/LanguageContext';
import { Moon, Skull, Eye, Heart, Sparkles, Check, Sun, Ban } from 'lucide-react';
import { ROLES } from '@/config/roles';
import DreamMathMinigame from '@/components/game/DreamMathMinigame';
import { checkNightActionsStatus } from '@/services/gameEngine';

interface SeerResult {
  targetId: string;
  targetName: string;
  isEvil: boolean;
  roleName: string;
}

export default function NightPhase() {
  const { room, players, me, isHost, nightActions, submitNightAction, resolveNight, loading } = useGame();
  const { t } = useTranslation();
  const [seerResult, setSeerResult] = useState<SeerResult | null>(null);
  const [witchPoisonTarget, setWitchPoisonTarget] = useState<string | null>(null);

  if (!room || !me) return null;

  const currentRound = room.round || 1;
  const isAlive = me.is_alive;
  const roleDef = (me.role && ROLES[me.role]) ? ROLES[me.role] : ROLES.Villager;
  const localizedRoleName = t(`roles.${roleDef.id}.name`) || roleDef.name;

  // Active player's action for this night round
  const myAction = nightActions.find(
    a => a.actor_id === me.id && a.round === currentRound
  );

  // Living players
  const alivePlayers = players.filter(p => p.is_alive);
  const otherAlivePlayers = alivePlayers.filter(p => p.id !== me.id);

  // 1. Werewolf Attack Action
  const handleWerewolfTarget = (targetId: string) => {
    submitNightAction('werewolf_kill', targetId);
  };

  // 2. Seer Inspection Action
  const handleSeerTarget = (targetId: string) => {
    const targetPlayer = players.find(p => p.id === targetId);
    if (!targetPlayer) return;

    const isEvil = targetPlayer.team === 'evil' || targetPlayer.role === 'Werewolf';
    const evilName = t('roleReveal.evilBadge');
    const goodName = t('roleReveal.goodBadge');

    const resultObj: SeerResult = {
      targetId,
      targetName: targetPlayer.name,
      isEvil,
      roleName: isEvil ? evilName : goodName
    };

    setSeerResult(resultObj);
    submitNightAction('seer_inspect', targetId, resultObj);
  };

  // 3. Doctor Protection Action
  const handleDoctorTarget = (targetId: string) => {
    submitNightAction('doctor_heal', targetId);
  };

  // 4. Witch Poison Action
  const handleWitchPoison = (targetId: string) => {
    setWitchPoisonTarget(targetId);
    submitNightAction('witch_kill', targetId);
  };

  return (
    <div className="max-w-3xl w-full mx-auto px-3 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-6 animate-fade-in">
      {/* Night Header */}
      <div className="bg-gradient-to-b from-indigo-950/20 via-surface to-surface border border-indigo-900/30 dark:border-indigo-950/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10 pointer-events-none text-7xl sm:text-9xl">
          🌙
        </div>

        <div className="flex items-center justify-center gap-2 mb-1.5 sm:mb-2">
          <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
          <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
            {t('night.nightTag', { round: currentRound })}
          </span>
        </div>

        <h2 className="font-gothic text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 mb-1.5 sm:mb-2">
          {t('night.title')}
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          {t('night.subtitle')}
        </p>

        {/* Player Role Badge */}
        <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-xs font-semibold shadow-sm">
          <span className="text-base">{roleDef.fallbackIcon}</span>
          <span className="text-slate-700 dark:text-slate-300">
            <span>{t('night.yourRole')}</span>{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-gothic">{localizedRoleName}</strong>
          </span>
        </div>
      </div>

      {/* Role Action Panel */}
      {!isAlive ? (
        // Dead Player View
        <div className="bg-surface border border-red-500/30 dark:border-red-950/50 rounded-2xl p-4 sm:p-6 text-center space-y-2">
          <Skull className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 mx-auto" />
          <h3 className="font-gothic font-bold text-base sm:text-lg text-slate-900 dark:text-slate-200">{t('night.deadTitle')}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            {t('night.deadSubtitle')}
          </p>
        </div>
      ) : me.role === 'Werewolf' ? (
        // 🐺 Werewolf View
        <div className="bg-surface border border-red-500/30 dark:border-red-900/40 rounded-2xl p-4 sm:p-6 shadow-blood-glow space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Skull className="w-5 h-5 text-red-500 dark:text-red-400" />
              <h3 className="font-gothic font-bold text-slate-900 dark:text-slate-100">{t('night.wolfTitle')}</h3>
            </div>
            <span className="text-xs text-red-500 dark:text-red-400 font-mono">{t('night.wolfTargetPrompt')}</span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {t('night.wolfSubtitle')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherAlivePlayers.map((p) => {
              const isSelected = myAction?.target_id === p.id;
              const isTeammate = p.role === 'Werewolf';

              return (
                <button
                  key={p.id}
                  onClick={() => handleWerewolfTarget(p.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-red-950 text-white border-red-500 shadow-blood-glow'
                      : 'bg-surface-light border-slate-200 dark:border-slate-800 hover:border-red-500/50 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{p.avatar || '👤'}</span>
                    <div className="text-left">
                      <span className="text-sm font-semibold block">{p.name}</span>
                      {isTeammate && (
                        <span className="text-[10px] text-red-500 dark:text-red-400 font-mono font-bold">{t('night.wolfTeammate')}</span>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-red-400" />}
                </button>
              );
            })}

            {/* Werewolf Skip / Pass Card */}
            <button
              type="button"
              onClick={() => submitNightAction('werewolf_kill', null, { isPass: true })}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all active:scale-95 col-span-1 sm:col-span-2 ${
                myAction?.action_type === 'werewolf_kill' && myAction?.target_id === null
                  ? 'bg-amber-950 text-white border-amber-500 shadow-md ring-2 ring-amber-500/50'
                  : 'bg-surface-light border-slate-200 dark:border-slate-800 hover:border-amber-500/50 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500 font-bold">
                  <Ban className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold font-gothic block">{t('night.skipActionTitle')}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('night.skipActionSubtitle')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 uppercase">
                  {t('night.skipBadge')}
                </span>
                {myAction?.action_type === 'werewolf_kill' && myAction?.target_id === null && <Check className="w-4 h-4 text-amber-400" />}
              </div>
            </button>
          </div>
        </div>
      ) : me.role === 'Seer' ? (
        // 🔮 Seer View
        <div className="bg-surface border border-indigo-500/30 dark:border-indigo-900/40 rounded-2xl p-4 sm:p-6 shadow-mystic-glow space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              <h3 className="font-gothic font-bold text-slate-900 dark:text-slate-100">{t('night.seerTitle')}</h3>
            </div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">{t('night.seerTargetPrompt')}</span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {t('night.seerSubtitle')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherAlivePlayers.map((p) => {
              const isSelected = myAction?.target_id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSeerTarget(p.id)}
                  disabled={Boolean(seerResult)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-indigo-950 text-white border-indigo-500 shadow-mystic-glow'
                      : 'bg-surface-light border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{p.avatar || '👤'}</span>
                    <span className="text-sm font-semibold">{p.name}</span>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-indigo-400" />}
                </button>
              );
            })}

            {/* Seer Skip / Pass Card */}
            <button
              type="button"
              onClick={() => {
                setSeerResult({ targetId: '', targetName: t('night.passLabel'), isEvil: false, roleName: t('night.passSkipped') });
                submitNightAction('seer_inspect', null, { isPass: true });
              }}
              disabled={Boolean(seerResult)}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all active:scale-95 col-span-1 sm:col-span-2 ${
                myAction?.action_type === 'seer_inspect' && myAction?.target_id === null
                  ? 'bg-amber-950 text-white border-amber-500 shadow-md ring-2 ring-amber-500/50'
                  : 'bg-surface-light border-slate-200 dark:border-slate-800 hover:border-amber-500/50 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500 font-bold">
                  <Ban className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold font-gothic block">{t('night.skipActionTitle')}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('night.skipActionSubtitle')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 uppercase">
                  {t('night.skipBadge')}
                </span>
                {myAction?.action_type === 'seer_inspect' && myAction?.target_id === null && <Check className="w-4 h-4 text-amber-400" />}
              </div>
            </button>
          </div>

          {seerResult && (
            <div
              className={`p-4 rounded-xl border mt-4 flex items-center gap-3 animate-slide-up ${
                seerResult.isEvil
                  ? 'bg-red-950/40 border-red-500 text-red-300 shadow-blood-glow'
                  : 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-emerald-glow'
              }`}
            >
              <Sparkles className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="font-gothic font-bold text-sm">
                  {seerResult.targetId ? (
                    <>
                      <span>{t('night.seerResultTitle')}</span>{' '}
                      <strong className="text-indigo-300 font-bold">{seerResult.targetName}</strong>{' '}
                      <span>{t('night.seerResultIs')}</span>{' '}
                      <strong className="text-indigo-200 font-bold">{seerResult.roleName}</strong>!
                    </>
                  ) : (
                    <span>{t('night.skipActionTitle')} ({t('night.passSkipped')})</span>
                  )}
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  {t('night.seerHint')}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : me.role === 'Doctor' ? (
        // 💉 Doctor View
        <div className="bg-surface border border-cyan-500/30 dark:border-cyan-900/40 rounded-2xl p-4 sm:p-6 shadow-mystic-glow space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
              <h3 className="font-gothic font-bold text-slate-900 dark:text-slate-100">{t('night.doctorTitle')}</h3>
            </div>
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-mono">{t('night.doctorTargetPrompt')}</span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {t('night.doctorSubtitle')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {alivePlayers.map((p) => {
              const isSelected = myAction?.target_id === p.id;
              const isMe = p.id === me.id;

              return (
                <button
                  key={p.id}
                  onClick={() => handleDoctorTarget(p.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-cyan-950 text-white border-cyan-500 shadow-mystic-glow'
                      : 'bg-surface-light border-slate-200 dark:border-slate-800 hover:border-cyan-500 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl flex-shrink-0">{p.avatar || '👤'}</span>
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <span className="text-sm font-semibold truncate block">
                        {p.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] text-cyan-400 font-medium flex-shrink-0">
                          ({t('lobby.you')})
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 ml-2" />}
                </button>
              );
            })}

            {/* Doctor Skip / Pass Card */}
            <button
              type="button"
              onClick={() => submitNightAction('doctor_heal', null, { isPass: true })}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all active:scale-95 col-span-1 sm:col-span-2 ${
                myAction?.action_type === 'doctor_heal' && myAction?.target_id === null
                  ? 'bg-amber-950 text-white border-amber-500 shadow-md ring-2 ring-amber-500/50'
                  : 'bg-surface-light border-slate-200 dark:border-slate-800 hover:border-amber-500/50 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500 font-bold">
                  <Ban className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold font-gothic block">{t('night.skipActionTitle')}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('night.skipActionSubtitle')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 uppercase">
                  {t('night.skipBadge')}
                </span>
                {myAction?.action_type === 'doctor_heal' && myAction?.target_id === null && <Check className="w-4 h-4 text-amber-400" />}
              </div>
            </button>
          </div>
        </div>
      ) : me.role === 'Witch' ? (
        // 🧙‍♀️ Witch View
        <div className="bg-surface border border-purple-500/30 dark:border-purple-900/40 rounded-2xl p-4 sm:p-6 shadow-mystic-glow space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              <h3 className="font-gothic font-bold text-slate-900 dark:text-slate-100">{t('night.witchTitle')}</h3>
            </div>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-mono">{t('night.witchTargetPrompt')}</span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-300 mb-2">{t('night.witchPoison')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {otherAlivePlayers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleWitchPoison(p.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all active:scale-95 ${
                      witchPoisonTarget === p.id
                        ? 'bg-purple-950 border-purple-500 text-white'
                        : 'bg-surface-light border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-500'
                    }`}
                  >
                    <span>{p.avatar} {p.name}</span>
                    {witchPoisonTarget === p.id && <Check className="w-4 h-4 text-purple-400" />}
                  </button>
                ))}

                {/* Witch Skip / Pass Card */}
                <button
                  type="button"
                  onClick={() => {
                    setWitchPoisonTarget(null);
                    submitNightAction('witch_kill', null, { isPass: true });
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all active:scale-95 col-span-1 sm:col-span-2 ${
                    myAction?.action_type === 'witch_kill' && myAction?.target_id === null
                      ? 'bg-amber-950 text-white border-amber-500 shadow-md ring-2 ring-amber-500/50'
                      : 'bg-surface-light border-slate-200 dark:border-slate-800 hover:border-amber-500/50 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Ban className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold font-gothic">{t('night.skipActionTitle')}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 uppercase">
                    {t('night.skipBadge')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // 😴 Dream Math Minigame for Sleeping Villagers & Inactive Roles
        <DreamMathMinigame />
      )}

      {/* Host Controls for Resolving Night */}
      {isHost && (() => {
        const nightStatus = checkNightActionsStatus(players, nightActions, currentRound);
        const canAdvance = nightStatus.allCompleted && !loading;

        return (
          <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-gothic font-bold text-slate-900 dark:text-slate-200">{t('night.hostControlTitle')}</h4>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  nightStatus.allCompleted
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                }`}>
                  {nightStatus.totalCompleted} / {nightStatus.totalRequired}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {nightStatus.allCompleted ? t('night.allActionsReady') : t('night.hostControlSubtitle')}
              </p>
            </div>
            <button
              onClick={resolveNight}
              disabled={!canAdvance}
              className={`w-full sm:w-auto py-3 px-6 rounded-xl font-gothic font-bold text-sm tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 ${
                canAdvance
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/30 active:scale-[0.99] cursor-pointer'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed opacity-75'
              }`}
            >
              <Sun className="w-4 h-4 fill-current" />
              <span>
                {loading
                  ? t('night.resolvingBtn')
                  : canAdvance
                  ? t('night.advanceDawnBtn')
                  : t('night.advanceDawnBtnDisabled', {
                      completed: nightStatus.totalCompleted,
                      total: nightStatus.totalRequired,
                    })}
              </span>
            </button>
          </div>
        );
      })()}
    </div>
  );
}
