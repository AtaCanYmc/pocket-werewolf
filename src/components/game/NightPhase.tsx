import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useTranslation } from '@/context/LanguageContext';
import { Moon, Skull, Eye, Heart, Sparkles, Check, Sun, Ban, Loader2 } from 'lucide-react';
import { ROLES } from '@/config/roles';
import DreamMathMinigame from '@/components/game/DreamMathMinigame';
import { checkNightActionsStatus } from '@/services/gameEngine';
import { haptics } from '@/utils/haptics';

interface SeerResult {
  targetId: string;
  targetName: string;
  isEvil: boolean;
  roleName: string;
}

/**
 * NightPhase Component
 * 
 * Orchestrates the secret night phase. Players with active night roles (Werewolf, Seer,
 * Doctor, Witch) perform their abilities or choose to pass/skip, while sleeping villagers
 * play an interactive dream math minigame to stay engaged.
 * 
 * Features:
 * - Role-specific interactive action panels (Werewolf hunt, Seer inspect, Doctor heal, Witch poison/save).
 * - Optional skip/pass action option for all active roles.
 * - Dream math minigame fallback for inactive roles and sleeping villagers.
 * - Real-time action status tracking for the room host.
 * - Host control to calculate casualties and transition the village to Dawn.
 */
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
    haptics.selection();
    submitNightAction('werewolf_kill', targetId);
  };

  // 2. Seer Inspection Action
  const handleSeerTarget = (targetId: string) => {
    const targetPlayer = players.find(p => p.id === targetId);
    if (!targetPlayer) return;

    haptics.selection();
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
    haptics.selection();
    submitNightAction('doctor_heal', targetId);
  };

  // 4. Witch Poison Action
  const handleWitchPoison = (targetId: string) => {
    haptics.selection();
    setWitchPoisonTarget(targetId);
    submitNightAction('witch_kill', targetId);
  };

  const handleResolveNightWithHaptics = async () => {
    haptics.impact();
    await resolveNight();
  };

  return (
    <div className="max-w-3xl w-full mx-auto px-3 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-5 animate-fade-in pb-16 md:pb-6">
      {/* Night Header (Flat Dark Minimalist Style) */}
      <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-6 shadow-flat text-center relative overflow-hidden">
        <div className="flex items-center justify-center gap-2 mb-1 sm:mb-1.5">
          <Moon className="w-4 h-4 text-indigo-400" />
          <span className="text-[11px] sm:text-xs font-mono font-semibold tracking-widest text-indigo-400 uppercase">
            {t('night.nightTag', { round: currentRound })}
          </span>
        </div>

        <h2 className="font-gothic text-xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          {t('night.title')}
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          {t('night.subtitle')}
        </p>

        {/* Player Role Badge */}
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-light border border-surface-border text-xs font-medium">
          <span className="text-base">{roleDef.fallbackIcon}</span>
          <span className="text-slate-300">
            <span>{t('night.yourRole')}</span>{' '}
            <strong className="text-slate-100 font-gothic">{localizedRoleName}</strong>
          </span>
        </div>
      </div>

      {/* Role Action Panel */}
      {!isAlive ? (
        // Dead Player View
        <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-6 text-center space-y-2">
          <Skull className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="font-gothic font-bold text-base sm:text-lg text-slate-200">{t('night.deadTitle')}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {t('night.deadSubtitle')}
          </p>
        </div>
      ) : me.role === 'Werewolf' ? (
        // 🐺 Werewolf View
        <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-flat space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div className="flex items-center gap-2">
              <Skull className="w-4 h-4 text-rose-400" />
              <h3 className="font-gothic font-bold text-slate-100 text-sm sm:text-base">{t('night.wolfTitle')}</h3>
            </div>
            <span className="text-xs text-rose-400 font-mono">{t('night.wolfTargetPrompt')}</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {t('night.wolfSubtitle')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {otherAlivePlayers.map((p) => {
              const isSelected = myAction?.target_id === p.id;
              const isTeammate = p.role === 'Werewolf';

              return (
                <button
                  key={p.id}
                  onClick={() => handleWerewolfTarget(p.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all active:scale-[0.98] ${
                    isSelected
                      ? 'bg-rose-950/30 text-rose-100 border-rose-500/60 shadow-flat-sm'
                      : 'bg-surface-light border-surface-border hover:border-slate-600 text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-lg flex-shrink-0">
                      {p.avatar || '👤'}
                    </div>
                    <div className="text-left min-w-0 truncate">
                      <span className="text-xs sm:text-sm font-semibold block truncate">{p.name}</span>
                      {isTeammate && (
                        <span className="text-[10px] text-rose-400 font-mono font-medium block truncate">{t('night.wolfTeammate')}</span>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-rose-400 flex-shrink-0 ml-2" />}
                </button>
              );
            })}

            {/* Werewolf Skip / Pass Card */}
            <button
              type="button"
              onClick={() => {
                haptics.tap();
                submitNightAction('werewolf_kill', null, { isPass: true });
              }}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all active:scale-[0.98] col-span-1 sm:col-span-2 ${
                myAction?.action_type === 'werewolf_kill' && myAction?.target_id === null
                  ? 'bg-amber-950/30 text-amber-100 border-amber-500/60 shadow-flat-sm'
                  : 'bg-surface-light border-surface-border hover:border-slate-600 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-surface border border-surface-border text-amber-400">
                  <Ban className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs sm:text-sm font-bold font-gothic block text-slate-100">{t('night.skipActionTitle')}</span>
                  <span className="text-[10px] text-slate-400">{t('night.skipActionSubtitle')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-medium px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-400 uppercase">
                  {t('night.skipBadge')}
                </span>
                {myAction?.action_type === 'werewolf_kill' && myAction?.target_id === null && <Check className="w-4 h-4 text-amber-400" />}
              </div>
            </button>
          </div>
        </div>
      ) : me.role === 'Seer' ? (
        // 🔮 Seer View
        <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-flat space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              <h3 className="font-gothic font-bold text-slate-100 text-sm sm:text-base">{t('night.seerTitle')}</h3>
            </div>
            <span className="text-xs text-indigo-400 font-mono">{t('night.seerTargetPrompt')}</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {t('night.seerSubtitle')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {otherAlivePlayers.map((p) => {
              const isSelected = myAction?.target_id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSeerTarget(p.id)}
                  disabled={Boolean(seerResult)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all active:scale-[0.98] ${
                    isSelected
                      ? 'bg-indigo-950/30 text-indigo-100 border-indigo-500/60 shadow-flat-sm'
                      : 'bg-surface-light border-surface-border hover:border-slate-600 text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-lg flex-shrink-0">
                      {p.avatar || '👤'}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold truncate block">{p.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-400 flex-shrink-0 ml-2" />}
                </button>
              );
            })}

            {/* Seer Skip / Pass Card */}
            <button
              type="button"
              onClick={() => {
                haptics.tap();
                setSeerResult({ targetId: '', targetName: t('night.passLabel'), isEvil: false, roleName: t('night.passSkipped') });
                submitNightAction('seer_inspect', null, { isPass: true });
              }}
              disabled={Boolean(seerResult)}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all active:scale-[0.98] col-span-1 sm:col-span-2 ${
                myAction?.action_type === 'seer_inspect' && myAction?.target_id === null
                  ? 'bg-amber-950/30 text-amber-100 border-amber-500/60 shadow-flat-sm'
                  : 'bg-surface-light border-surface-border hover:border-slate-600 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-surface border border-surface-border text-amber-400">
                  <Ban className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs sm:text-sm font-bold font-gothic block text-slate-100">{t('night.skipActionTitle')}</span>
                  <span className="text-[10px] text-slate-400">{t('night.skipActionSubtitle')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-medium px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-400 uppercase">
                  {t('night.skipBadge')}
                </span>
                {myAction?.action_type === 'seer_inspect' && myAction?.target_id === null && <Check className="w-4 h-4 text-amber-400" />}
              </div>
            </button>
          </div>

          {seerResult && (
            <div
              className={`p-3.5 rounded-xl border mt-3 flex items-center gap-3 animate-slide-up ${
                seerResult.isEvil
                  ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                  : 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
              }`}
            >
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-gothic font-bold text-xs sm:text-sm">
                  {seerResult.targetId ? (
                    <>
                      <span>{t('night.seerResultTitle')}</span>{' '}
                      <strong className="text-indigo-300">{seerResult.targetName}</strong>{' '}
                      <span>{t('night.seerResultIs')}</span>{' '}
                      <strong className="text-indigo-200">{seerResult.roleName}</strong>!
                    </>
                  ) : (
                    <span>{t('night.skipActionTitle')} ({t('night.passSkipped')})</span>
                  )}
                </p>
                <p className="text-[11px] opacity-75 mt-0.5">
                  {t('night.seerHint')}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : me.role === 'Doctor' ? (
        // 💉 Doctor View
        <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-flat space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-sky-400" />
              <h3 className="font-gothic font-bold text-slate-100 text-sm sm:text-base">{t('night.doctorTitle')}</h3>
            </div>
            <span className="text-xs text-sky-400 font-mono">{t('night.doctorTargetPrompt')}</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {t('night.doctorSubtitle')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {alivePlayers.map((p) => {
              const isSelected = myAction?.target_id === p.id;
              const isMe = p.id === me.id;

              return (
                <button
                  key={p.id}
                  onClick={() => handleDoctorTarget(p.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all active:scale-[0.98] ${
                    isSelected
                      ? 'bg-sky-950/30 text-sky-100 border-sky-500/60 shadow-flat-sm'
                      : 'bg-surface-light border-surface-border hover:border-slate-600 text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-lg flex-shrink-0">
                      {p.avatar || '👤'}
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <span className="text-xs sm:text-sm font-semibold truncate block">
                        {p.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] text-sky-400 font-medium flex-shrink-0">
                          ({t('lobby.you')})
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-sky-400 flex-shrink-0 ml-2" />}
                </button>
              );
            })}

            {/* Doctor Skip / Pass Card */}
            <button
              type="button"
              onClick={() => {
                haptics.tap();
                submitNightAction('doctor_heal', null, { isPass: true });
              }}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all active:scale-[0.98] col-span-1 sm:col-span-2 ${
                myAction?.action_type === 'doctor_heal' && myAction?.target_id === null
                  ? 'bg-amber-950/30 text-amber-100 border-amber-500/60 shadow-flat-sm'
                  : 'bg-surface-light border-surface-border hover:border-slate-600 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-surface border border-surface-border text-amber-400">
                  <Ban className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs sm:text-sm font-bold font-gothic block text-slate-100">{t('night.skipActionTitle')}</span>
                  <span className="text-[10px] text-slate-400">{t('night.skipActionSubtitle')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-medium px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-400 uppercase">
                  {t('night.skipBadge')}
                </span>
                {myAction?.action_type === 'doctor_heal' && myAction?.target_id === null && <Check className="w-4 h-4 text-amber-400" />}
              </div>
            </button>
          </div>
        </div>
      ) : me.role === 'Witch' ? (
        // 🧙‍♀️ Witch View
        <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-flat space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="font-gothic font-bold text-slate-100 text-sm sm:text-base">{t('night.witchTitle')}</h3>
            </div>
            <span className="text-xs text-purple-400 font-mono">{t('night.witchTargetPrompt')}</span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-purple-300 mb-2">{t('night.witchPoison')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {otherAlivePlayers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleWitchPoison(p.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all active:scale-[0.98] ${
                      witchPoisonTarget === p.id
                        ? 'bg-purple-950/30 border-purple-500/60 text-purple-200 shadow-flat-sm'
                        : 'bg-surface-light border-surface-border text-slate-300 hover:border-slate-600'
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
                    haptics.tap();
                    setWitchPoisonTarget(null);
                    submitNightAction('witch_kill', null, { isPass: true });
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all active:scale-[0.98] col-span-1 sm:col-span-2 ${
                    myAction?.action_type === 'witch_kill' && myAction?.target_id === null
                      ? 'bg-amber-950/30 text-amber-100 border-amber-500/60 shadow-flat-sm'
                      : 'bg-surface-light border-surface-border hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Ban className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold font-gothic text-slate-100">{t('night.skipActionTitle')}</span>
                  </div>
                  <span className="text-[9px] font-mono font-medium px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-400 uppercase">
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
          <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-flat flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-gothic font-bold text-slate-100 text-sm sm:text-base">{t('night.hostControlTitle')}</h4>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                  nightStatus.allCompleted
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                }`}>
                  {nightStatus.totalCompleted} / {nightStatus.totalRequired}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {nightStatus.allCompleted ? t('night.allActionsReady') : t('night.hostControlSubtitle')}
              </p>
            </div>
            <button
              onClick={handleResolveNightWithHaptics}
              disabled={!canAdvance}
              className={`w-full sm:w-auto py-3 px-5 sm:px-6 rounded-xl font-gothic font-bold text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 flex-shrink-0 ${
                canAdvance
                  ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-[0.98] cursor-pointer shadow-flat-sm'
                  : 'bg-surface-light border border-surface-border text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sun className="w-4 h-4 fill-current" />}
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
