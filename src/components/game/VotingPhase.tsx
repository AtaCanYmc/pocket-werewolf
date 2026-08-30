import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useTranslation } from '@/context/LanguageContext';
import { Vote, Check, Skull, Ban, MessageSquare, Loader2 } from 'lucide-react';
import TownChat from '@/components/game/TownChat';
import { haptics } from '@/utils/haptics';

export default function VotingPhase() {
  const { room, players, me, isHost, votes, submitVote, resolveVoting, loading } = useGame();
  const { t } = useTranslation();
  const [showChat, setShowChat] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!room || !me) return null;

  const currentRound = room.round || 1;
  const isAlive = me.is_alive;
  const alivePlayers = players.filter(p => p.is_alive);

  // Calculate votes for current round
  const roundVotes = votes.filter(v => v.round === currentRound);
  const myVote = roundVotes.find(v => v.voter_id === me.id);

  // Vote tally table
  const voteTally: Record<string, number> = {};
  let skipVoteCount = 0;

  roundVotes.forEach(v => {
    if (v.target_id === null) {
      skipVoteCount++;
    } else {
      voteTally[v.target_id] = (voteTally[v.target_id] || 0) + 1;
    }
  });

  const isMyVoteSkip = Boolean(myVote && myVote.target_id === null);

  const handleCastPlayerVote = async (targetId: string) => {
    if (!isAlive || isSubmitting) return;
    setIsSubmitting(true);
    if (myVote?.target_id === targetId) {
      haptics.tap();
      await submitVote(null, true); // Retract vote completely
    } else {
      haptics.selection();
      await submitVote(targetId, false);
    }
    setIsSubmitting(false);
  };

  const handleCastSkipVote = async () => {
    if (!isAlive || isSubmitting) return;
    setIsSubmitting(true);
    if (isMyVoteSkip) {
      haptics.tap();
      await submitVote(null, true); // Retract skip vote completely
    } else {
      haptics.selection();
      await submitVote(null, false); // Cast explicit skip/blank vote
    }
    setIsSubmitting(false);
  };

  const handleResolveVotingWithHaptics = async () => {
    haptics.impact();
    await resolveVoting();
  };

  return (
    <div className="max-w-3xl w-full mx-auto px-3 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-5 animate-fade-in pb-16 md:pb-6">
      {/* Voting Header (Sterile Dark Flat UI) */}
      <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-6 shadow-flat text-center space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Vote className="w-5 h-5 text-rose-500" />
          <span className="text-[11px] sm:text-xs font-mono font-semibold tracking-widest text-rose-400 uppercase">
            {t('voting.votingTag')}
          </span>
        </div>

        <h2 className="font-gothic text-xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          {t('voting.title')}
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          {t('voting.subtitle')}
        </p>

        <div className="text-[11px] sm:text-xs font-mono text-slate-400 mt-1 sm:mt-2">
          <span>{t('voting.totalVotes')}</span>{' '}
          <strong className="text-rose-400 font-bold">{roundVotes.length}</strong>
          {' / '}
          <span>{alivePlayers.length}</span>
        </div>
      </div>

      {/* Special Blank / Skip Vote Option */}
      <div className="w-full">
        <button
          type="button"
          onClick={handleCastSkipVote}
          disabled={!isAlive || isSubmitting}
          className={`w-full p-3.5 sm:p-4 rounded-xl border text-left flex items-center justify-between transition-all select-none active:scale-[0.98] ${
            isMyVoteSkip
              ? 'bg-amber-950/30 text-amber-200 border-amber-500/60 shadow-flat-sm'
              : 'bg-surface-light border-surface-border hover:border-slate-600 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className={`p-2 rounded-lg ${isMyVoteSkip ? 'bg-amber-500/20 text-amber-300' : 'bg-surface text-amber-400 border border-surface-border'}`}>
              <Ban className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold font-gothic block text-slate-100">
                  {t('voting.skipVoteTitle')}
                </span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-400 font-medium">
                  {t('voting.skipVoteBadge')}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                {t('voting.skipVoteSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {skipVoteCount > 0 && (
              <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-950/50 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
                {t('voting.votesBadge', { count: skipVoteCount })}
              </span>
            )}
            {isMyVoteSkip && <Check className="w-4 h-4 text-amber-400" />}
          </div>
        </button>
      </div>

      {/* Living Players Voting Cards Grid (Mobile Responsive 1-col on mobile, 2-col on tablet+) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {alivePlayers.map((p) => {
          const isSelected = myVote?.target_id === p.id;
          const voteCount = voteTally[p.id] || 0;
          const isMe = p.id === me.id;

          return (
            <button
              key={p.id}
              onClick={() => handleCastPlayerVote(p.id)}
              disabled={!isAlive || isSubmitting}
              className={`p-3 sm:p-3.5 rounded-xl border text-left flex items-center justify-between transition-all select-none active:scale-[0.98] ${
                isSelected
                  ? 'bg-rose-950/30 text-rose-100 border-rose-500/60 shadow-flat-sm'
                  : 'bg-surface-light border-surface-border hover:border-slate-600 text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                  {p.avatar || '👤'}
                </div>
                <div className="min-w-0 truncate">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-xs sm:text-sm font-semibold truncate block">
                      {p.name}
                    </span>
                    {isMe && (
                      <span className="text-[10px] text-indigo-400 font-medium flex-shrink-0">
                        ({t('lobby.you')})
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">
                    {isSelected ? t('voting.yourVoteOn') : t('voting.tapToVote')}
                  </span>
                </div>
              </div>

              {/* Vote Count Badge */}
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                {voteCount > 0 && (
                  <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs font-mono font-semibold">
                    {t('voting.votesBadge', { count: voteCount })}
                  </span>
                )}
                {isSelected && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Host Resolve Voting Button */}
      {isHost ? (() => {
        const livingVotedCount = roundVotes.length;
        const totalLivingCount = alivePlayers.length;
        const allVoted = livingVotedCount >= totalLivingCount && totalLivingCount > 0;
        const canExecute = allVoted && !loading;

        return (
          <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-flat flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-gothic font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">{t('voting.hostTitle')}</h4>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                  allVoted
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                }`}>
                  {livingVotedCount} / {totalLivingCount}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                {allVoted ? t('voting.allVotedSubtitle') : t('voting.waitingVotesSubtitle')}
              </p>
            </div>
            <button
              onClick={handleResolveVotingWithHaptics}
              disabled={!canExecute}
              className={`w-full sm:w-auto py-3 px-5 sm:px-6 rounded-xl font-gothic font-bold text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 flex-shrink-0 ${
                canExecute
                  ? 'bg-blood hover:bg-blood-hover text-white active:scale-[0.98] cursor-pointer shadow-flat-sm'
                  : 'bg-surface-light border border-surface-border text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Skull className="w-4 h-4" />}
              <span>
                {loading
                  ? t('voting.resolvingBtn')
                  : canExecute
                  ? t('voting.resolveVotingBtn')
                  : t('voting.resolveVotingBtnDisabled', {
                      count: livingVotedCount,
                      total: totalLivingCount,
                    })}
              </span>
            </button>
          </div>
        );
      })() : (
        <div className="p-3 rounded-xl bg-surface-light border border-surface-border text-xs text-slate-400 text-center">
          {t('voting.waitingHost')}
        </div>
      )}

      {/* Optional Village Discussion Chat in Voting Phase */}
      <div className="space-y-3 pt-1">
        <button
          type="button"
          onClick={() => {
            haptics.tap();
            setShowChat(!showChat);
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-surface-light border border-surface-border hover:border-indigo-400/50 text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-all shadow-flat-sm active:scale-[0.98]"
        >
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span>{showChat ? t('voting.toggleChatHide') : t('voting.toggleChatShow')}</span>
        </button>

        {showChat && (
          <div className="animate-slide-up">
            <TownChat />
          </div>
        )}
      </div>
    </div>
  );
}
