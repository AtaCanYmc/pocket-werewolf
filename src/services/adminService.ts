import { getSupabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

/**
 * Checks if Supabase requires an admin password to create a room.
 */
export async function checkAdminPasswordRequired(): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { data, error } = await supabase.rpc('is_admin_password_required');
    if (error) {
      logger.warn('Failed to check if admin password is required:', error);
      return false;
    }
    return Boolean(data);
  } catch (err) {
    logger.warn('Error checking admin password requirement:', err);
    return false;
  }
}

/**
 * Verifies the provided admin password securely in Supabase PostgreSQL via RPC.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return true;

  try {
    const { data, error } = await supabase.rpc('verify_admin_password', {
      input_password: password
    });
    if (error) {
      logger.warn('Failed to verify admin password via RPC:', error);
      return false;
    }
    return Boolean(data);
  } catch (err) {
    logger.error('Error verifying admin password:', err);
    return false;
  }
}
