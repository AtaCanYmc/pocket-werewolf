/**
 * Pocket Werewolf - Strict Type & Error Narrowing Utilities
 */

export interface PostgrestErrorLike {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

/**
 * Type guard to check if an unknown error object is a Postgrest / Supabase error.
 */
export function isPostgrestError(err: unknown): err is PostgrestErrorLike {
  return (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as Record<string, unknown>).message === 'string'
  );
}

/**
 * Standardizes and extracts user-friendly error messages from unknown catch targets.
 */
export function formatErrorMessage(err: unknown): string {
  if (!err) return 'An unknown error occurred.';

  if (typeof err === 'string') {
    return normalizeNetworkError(err);
  }

  if (err instanceof Error) {
    return normalizeNetworkError(err.message);
  }

  if (isPostgrestError(err)) {
    return normalizeNetworkError(err.message);
  }

  return 'An unexpected error occurred.';
}

function normalizeNetworkError(msg: string): string {
  const lower = msg.toLowerCase();
  if (
    msg.includes('410') ||
    lower.includes('preflight') ||
    lower.includes('failed to fetch') ||
    lower.includes('load failed') ||
    lower.includes('access control checks')
  ) {
    return 'Supabase project is unreachable (HTTP 410 Gone / Network Error). Your project may be paused due to inactivity. Please unpause/restore it in the Supabase Dashboard or update your URL/Key in Settings.';
  }
  return msg;
}
