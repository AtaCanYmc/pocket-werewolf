import { getSupabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

/**
 * Sends a real-time player chat message in the town square.
 */
export async function sendChatMessage(
  roomId: string,
  round: number,
  senderId: string,
  senderName: string,
  senderAvatar: string,
  message: string
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    logger.warn('Cannot send chat message: Supabase client is not configured');
    return;
  }

  const cleanMessage = message.trim().slice(0, 280);
  if (!cleanMessage) return;

  const { error } = await supabase.from('game_logs').insert([
    {
      room_id: roomId,
      round,
      message: cleanMessage,
      type: 'chat',
      sender_id: senderId,
      sender_name: senderName,
      sender_avatar: senderAvatar
    }
  ]);

  if (error) {
    logger.error('Failed to send chat message:', error);
    throw error;
  }
}
