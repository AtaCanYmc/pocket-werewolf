import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useTranslation } from '@/context/LanguageContext';
import { Vote, Check, Skull, Ban, MessageSquare } from 'lucide-react';
import TownChat from '@/components/game/TownChat';

export default function VotingPhase() {
  const { room, players, me, isHost, votes, submitVote, resolveVoting, loading } = useGame();
  const { t } = useTranslation();
  const [showChat, setShowChat] = useState<boolean>(false);

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

  const handleCastPlayerVote = (targetId: string) => {
    if (!isAlive) return;
    if (myVote?.target_id === targetId) {
      submitVote(null, true); // Retract vote completely
    } else {
      submitVote(targetId, false);
    }
  };

  const handleCastSkipVote = () => {
    if (!isAlive) return;
    if (isMyVoteSkip) {
      submitVote(null, true); // Retract skip vote completely
    } else {
      submitVote(null, false); // Cast explicit skip/blank vote
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 animate-fade-in">
      {/* Voting Header */}
      <div className="bg-gradient-to-b from-red-500/10 via-surface to-surface border border-red-500/30 dark:border-red-900/60 rounded-3xl p-6 shadow-2xl text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Vote className="w-6 h-6 text-red-500 animate-bounce" />
          <span className="text-xs font-mono font-bold tracking-widest text-red-600 dark:text-red-400 uppercase">
            {t('voting.votingTag')}
          </span>
        </div>

        <h2 className="font-gothic text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100">
          {t('voting.title')}
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          {t('voting.subtitle')}
        </p>

        <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-2">
          {t('voting.totalVotes')} <strong className="text-red-500 dark:text-red-400">{roundVotes.length}</strong> / {alivePlayers.length}
        </div>
      </div>

      {/* Special Blank / Skip Vote Option */}
      <div className="w-full">
        <button
          type="button"
          onClick={handleCastSkipVote}
          disabled={!isAlive}
          className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all select-none active:scale-[0.99] shadow-sm ${
            isMyVoteSkip
              ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-100 border-amber-500 shadow-md ring-2 ring-amber-500/50'
              : 'bg-surface-light border-slate-300 dark:border-slate-800 hover:border-amber-500/60 text-slate-800 dark:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`p-2.5 rounded-xl ${isMyVoteSkip ? 'bg-amber-500 text-white' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold font-gothic block">
                  {t('voting.skipVoteTitle')}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                  {t('voting.skipVoteBadge')}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                {isMyVoteSkip ? t('voting.yourSkipVote') : t('voting.skipVoteSubtitle')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {skipVoteCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold shadow-inner">
                {t('voting.votesBadge', { count: skipVoteCount })}
              </span>
            )}
            {isMyVoteSkip && <Check className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
          </div>
        </button>
      </div>

      {/* Voting Target Player Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {alivePlayers.map((p) => {
          const isSelected = myVote?.target_id === p.id;
          const voteCount = voteTally[p.id] || 0;
          const isMe = p.id === me.id;

          return (
            <button
              key={p.id}
              onClick={() => handleCastPlayerVote(p.id)}
              disabled={!isAlive}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all select-none active:scale-[0.99] ${
                isSelected
                  ? 'bg-red-950 text-white border-red-500 shadow-blood-glow ring-2 ring-red-500/50'
                  : 'bg-surface-light border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 text-slate-900 dark:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.avatar || '👤'}</span>
                <div>
                  <span className="text-sm font-semibold block">
                    {p.name} {isMe && `(${t('lobby.you')})`}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isSelected ? t('voting.yourVoteOn') : t('voting.tapToVote')}
                  </span>
                </div>
              </div>

              {/* Vote Count Badge */}
              <div className="flex items-center gap-2">
                {voteCount > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-mono font-bold shadow-inner">
                    {t('voting.votesBadge', { count: voteCount })}
                  </span>
                )}
                {isSelected && <Check className="w-5 h-5 text-red-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Host Resolve Voting Button */}
      {isHost ? (
        <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-gothic font-bold text-slate-900 dark:text-slate-100">{t('voting.hostTitle')}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t('voting.hostSubtitle')}
            </p>
          </div>
          <button
            onClick={resolveVoting}
            disabled={loading}
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-red-600 hover:bg-red-500 text-white font-gothic font-bold text-sm tracking-wider uppercase transition-all shadow-blood-glow flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Skull className="w-5 h-5" />
            <span>{loading ? t('voting.resolvingBtn') : t('voting.resolveVotingBtn')}</span>
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-surface-light border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 text-center animate-pulse">
          {t('voting.waitingHost')}
        </div>
      )}

      {/* Optional Village Discussion Chat in Voting Phase */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={() => setShowChat(!showChat)}
          className="w-full py-2.5 px-4 rounded-xl bg-surface-light border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99]"
        >
          <MessageSquare className="w-4 h-4 text-indigo-500" />
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
