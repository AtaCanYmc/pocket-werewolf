import { useState } from 'react';
import { sound } from '@/utils/audio';
import { logger } from '@/utils/logger';
import {
  startGame as engineStartGame,
  advanceToNight as engineAdvanceToNight,
  submitNightAction as engineSubmitNightAction,
  resolveNightPhase as engineResolveNight,
  advanceToDay as engineAdvanceToDay,
  advanceToVoting as engineAdvanceToVoting,
  submitVote as engineSubmitVote,
  resolveVotingPhase as engineResolveVoting,
  sendChatMessage as engineSendChatMessage,
  resetToLobby as engineResetToLobby
} from '@/services/gameEngine';
import { Room, Player, NightAction, Vote, GameLog, NightActionType } from '@/types/game';

interface UsePhaseActionsProps {
  room: Room | null;
  players: Player[];
  me: Player | null;
  isHost: boolean;
  nightActions: NightAction[];
  votes: Vote[];
  setNightActions: React.Dispatch<React.SetStateAction<NightAction[]>>;
  setVotes: React.Dispatch<React.SetStateAction<Vote[]>>;
  setLogs: React.Dispatch<React.SetStateAction<GameLog[]>>;
  setError: (err: string | null) => void;
}

export function usePhaseActions({
  room,
  players,
  me,
  isHost,
  nightActions,
  votes,
  setNightActions,
  setVotes,
  setLogs,
  setError
}: UsePhaseActionsProps) {
  const [phaseLoading, setPhaseLoading] = useState<boolean>(false);

  const handleStartGame = async (): Promise<void> => {
    if (!isHost || !room) return;
    setPhaseLoading(true);
    try {
      sound.playWolfHowl();
      await engineStartGame(room.id, room.deck, players);
    } catch (err: any) {
      logger.error('Failed to start game:', err);
      setError(err.message || 'Failed to start game.');
    } finally {
      setPhaseLoading(false);
    }
  };

  const handleAdvanceToNight = async (): Promise<void> => {
    if (!room) return;
    try {
      await engineAdvanceToNight(room.id, room.round);
    } catch (err: any) {
      logger.error('Failed to advance to night:', err);
      setError(err.message || 'Failed to advance to night.');
    }
  };

  const handleNightAction = async (
    actionType: NightActionType,
    targetId: string | null,
    result: any = null
  ): Promise<void> => {
    if (!room || !me) return;
    sound.playClick();

    // Instant optimistic update
    setNightActions(prev => {
      const filtered = prev.filter(a => !(a.actor_id === me.id && a.round === room.round && a.action_type === actionType));
      return [...filtered, {
        id: 'opt_' + Date.now(),
        room_id: room.id,
        round: room.round,
        actor_id: me.id,
        action_type: actionType,
        target_id: targetId,
        result
      }];
    });

    try {
      await engineSubmitNightAction(room.id, room.round, me.id, actionType, targetId, result);
    } catch (err: any) {
      logger.error('Failed to submit night action:', err);
    }
  };

  const handleResolveNight = async (): Promise<void> => {
    if (!room || !isHost) return;
    setPhaseLoading(true);
    try {
      await engineResolveNight(room.id, room.round, players, nightActions);
    } catch (err: any) {
      logger.error('Failed to resolve night phase:', err);
      setError(err.message || 'Failed to resolve night phase.');
    } finally {
      setPhaseLoading(false);
    }
  };

  const handleAdvanceToDay = async (): Promise<void> => {
    if (!room) return;
    try {
      await engineAdvanceToDay(room.id, room.round);
    } catch (err: any) {
      logger.error('Failed to advance to day:', err);
      setError(err.message || 'Failed to advance to day.');
    }
  };

  const handleAdvanceToVoting = async (): Promise<void> => {
    if (!room) return;
    try {
      await engineAdvanceToVoting(room.id, room.round);
    } catch (err: any) {
      logger.error('Failed to advance to voting:', err);
      setError(err.message || 'Failed to advance to voting.');
    }
  };

  const handleVote = async (targetId: string | null, isRetract: boolean = false): Promise<void> => {
    if (!room || !me) return;
    sound.playClick();

    // Instant optimistic update
    if (isRetract) {
      setVotes(prev => prev.filter(v => !(v.voter_id === me.id && v.round === room.round)));
    } else {
      setVotes(prev => {
        const filtered = prev.filter(v => !(v.voter_id === me.id && v.round === room.round));
        return [...filtered, {
          id: 'opt_' + Date.now(),
          room_id: room.id,
          round: room.round,
          voter_id: me.id,
          target_id: targetId
        }];
      });
    }

    try {
      await engineSubmitVote(room.id, room.round, me.id, targetId, isRetract);
    } catch (err: any) {
      logger.error('Failed to submit vote:', err);
    }
  };

  const handleResolveVoting = async (): Promise<void> => {
    if (!room || !isHost) return;
    setPhaseLoading(true);
    try {
      await engineResolveVoting(room.id, room.round, players, votes);
    } catch (err: any) {
      logger.error('Failed to resolve voting phase:', err);
      setError(err.message || 'Failed to resolve voting phase.');
    } finally {
      setPhaseLoading(false);
    }
  };

  const handleSendChatMessage = async (message: string): Promise<void> => {
    if (!room || !me) return;
    sound.playClick();

    const clean = message.trim();
    if (!clean) return;

    // Instant optimistic update
    setLogs(prev => [
      ...prev,
      {
        id: 'opt_msg_' + Date.now(),
        room_id: room.id,
        round: room.round,
        message: clean,
        type: 'chat',
        sender_id: me.id,
        sender_name: me.name,
        sender_avatar: me.avatar
      }
    ]);

    try {
      await engineSendChatMessage(room.id, room.round, me.id, me.name, me.avatar, clean);
    } catch (err: any) {
      logger.error('Failed to send chat message:', err);
    }
  };

  const handleResetToLobby = async (): Promise<void> => {
    if (!room || !isHost) return;
    try {
      await engineResetToLobby(room.id);
    } catch (err: any) {
      logger.error('Failed to reset to lobby:', err);
      setError(err.message || 'Failed to reset to lobby.');
    }
  };

  return {
    phaseLoading,
    startGame: handleStartGame,
    advanceToNight: handleAdvanceToNight,
    submitNightAction: handleNightAction,
    resolveNight: handleResolveNight,
    advanceToDay: handleAdvanceToDay,
    advanceToVoting: handleAdvanceToVoting,
    submitVote: handleVote,
    resolveVoting: handleResolveVoting,
    sendChatMessage: handleSendChatMessage,
    resetToLobby: handleResetToLobby
  };
}
