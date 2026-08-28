-- ==============================================================================
-- POCKET WEREWOLF - SUPABASE POSTGRESQL SCHEMA
-- BaaS (Backend as a Service) & Realtime Channels Configuration
-- ==============================================================================

-- 1. Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(8) UNIQUE NOT NULL,
    host_session_id TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'lobby', -- 'lobby', 'role_reveal', 'night', 'dawn', 'day', 'voting', 'ended'
    round INT NOT NULL DEFAULT 1,
    phase_timer_seconds INT DEFAULT 60,
    phase_end_time TIMESTAMPTZ,
    is_timer_paused BOOLEAN DEFAULT FALSE,
    timer_remaining_ms INT DEFAULT 0,
    deck JSONB DEFAULT '[]'::jsonb,
    settings JSONB DEFAULT '{
        "revealRoleOnDeath": true,
        "nightDuration": 45,
        "dayDuration": 90,
        "votingDuration": 45,
        "allowSelfProtect": true,
        "anonymousVoting": false
    }'::jsonb,
    winner VARCHAR(32) DEFAULT NULL, -- 'good' (Villagers), 'evil' (Werewolves), 'draw'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Players Table
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    name VARCHAR(50) NOT NULL,
    avatar TEXT DEFAULT '🐺',
    is_host BOOLEAN DEFAULT FALSE,
    is_ready BOOLEAN DEFAULT FALSE,
    is_alive BOOLEAN DEFAULT TRUE,
    is_revealed BOOLEAN DEFAULT FALSE,
    role VARCHAR(50) DEFAULT NULL, -- 'Werewolf', 'Villager', 'Seer', 'Doctor', 'Witch', 'Hunter', 'Sorceress', 'BlindMinion', 'KnowingMinion', 'DreamWolf'
    team VARCHAR(20) DEFAULT NULL, -- 'good', 'evil'
    death_reason TEXT DEFAULT NULL, -- 'night_kill', 'lynched', 'witch_poison', 'hunter_shot'
    death_round INT DEFAULT NULL,
    witch_used_save BOOLEAN DEFAULT FALSE,
    witch_used_kill BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Night Actions Table
CREATE TABLE IF NOT EXISTS public.night_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    round INT NOT NULL,
    actor_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'werewolf_kill', 'seer_inspect', 'doctor_heal', 'witch_heal', 'witch_kill', 'sorceress_inspect'
    target_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
    result JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Votes Table
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    round INT NOT NULL,
    voter_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    target_id UUID REFERENCES public.players(id) ON DELETE CASCADE, -- NULL indicates a Blank / Skip (Pas) vote
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_voter_per_round UNIQUE (room_id, round, voter_id)
);

-- 5. Game Logs & Town Chat Table (Narrative Events & Player Discussion)
CREATE TABLE IF NOT EXISTS public.game_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    round INT NOT NULL DEFAULT 1,
    message TEXT NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'info', -- 'info', 'night_result', 'lynch', 'warning', 'chat'
    sender_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
    sender_name VARCHAR(50) DEFAULT NULL,
    sender_avatar VARCHAR(10) DEFAULT NULL,
    target_role VARCHAR(50) DEFAULT NULL, -- Null is visible to all; 'Werewolf' visible only to wolves
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- Indexes (For Optimized Query Performance)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms(code);
CREATE INDEX IF NOT EXISTS idx_players_room_id ON public.players(room_id);
CREATE INDEX IF NOT EXISTS idx_players_session_id ON public.players(session_id);
CREATE INDEX IF NOT EXISTS idx_night_actions_room_round ON public.night_actions(room_id, round);
CREATE INDEX IF NOT EXISTS idx_votes_room_round ON public.votes(room_id, round);
CREATE INDEX IF NOT EXISTS idx_game_logs_room ON public.game_logs(room_id);

-- ==============================================================================
-- Row Level Security (RLS) Configuration
-- Allows public anonymous clients to participate and play seamlessly
-- ==============================================================================
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.night_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert on rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on rooms" ON public.rooms FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on rooms" ON public.rooms FOR DELETE USING (true);

CREATE POLICY "Allow public read on players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public insert on players" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on players" ON public.players FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on players" ON public.players FOR DELETE USING (true);

CREATE POLICY "Allow public read on night_actions" ON public.night_actions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on night_actions" ON public.night_actions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on night_actions" ON public.night_actions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on night_actions" ON public.night_actions FOR DELETE USING (true);

CREATE POLICY "Allow public read on votes" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on votes" ON public.votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on votes" ON public.votes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on votes" ON public.votes FOR DELETE USING (true);

CREATE POLICY "Allow public read on game_logs" ON public.game_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on game_logs" ON public.game_logs FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- Realtime Publication Setup (Supabase Realtime)
-- ==============================================================================
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.night_actions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_logs;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- Automated Stale Rooms Cleanup Stored Procedure
-- Purges abandoned lobbies (> 6 hours) and finished/stale matches (> 24 hours).
-- Cascades automatically to players, actions, votes, and logs.
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_rooms_status_created_at ON public.rooms(status, created_at);

CREATE OR REPLACE FUNCTION public.cleanup_stale_rooms()
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
    WITH deleted_rooms AS (
        DELETE FROM public.rooms
        WHERE (status = 'lobby' AND created_at < now() - INTERVAL '6 hours')
           OR (created_at < now() - INTERVAL '24 hours')
        RETURNING id
    )
    SELECT count(*) INTO deleted_count FROM deleted_rooms;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- Daily 02:00 AM Game Logs & Maintenance Cleanup
-- Purges old chat logs and game events every day at 02:00 AM (server time).
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_daily_game_logs()
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
    -- Delete all game logs older than 24 hours
    WITH deleted_logs AS (
        DELETE FROM public.game_logs
        WHERE created_at < now() - INTERVAL '24 hours'
        RETURNING id
    )
    SELECT count(*) INTO deleted_count FROM deleted_logs;
    
    -- Also trigger stale rooms purge
    PERFORM public.cleanup_stale_rooms();
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.cleanup_stale_rooms() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_daily_game_logs() TO anon, authenticated, service_role;

-- Optional pg_cron scheduling at 02:00 AM every night (if pg_cron extension is active)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.unschedule('daily-game-logs-cleanup');
        PERFORM cron.schedule(
            'daily-game-logs-cleanup',
            '0 2 * * *',
            'SELECT public.cleanup_daily_game_logs();'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- 6. System Settings & Admin Security (Configurable via Supabase Dashboard)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default admin_password setting (empty by default = room creation is public)
INSERT INTO public.app_settings (key, value, description)
VALUES ('admin_password', '', 'Password required to create rooms. If empty, room creation is public.')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS on app_settings to prevent exposing raw values via public REST API
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 1. Checks if room creation requires an admin password (returns boolean without exposing password)
CREATE OR REPLACE FUNCTION public.is_admin_password_required()
RETURNS boolean AS $$
DECLARE
    pwd text;
BEGIN
    SELECT value INTO pwd FROM public.app_settings WHERE key = 'admin_password';
    RETURN (pwd IS NOT NULL AND length(trim(pwd)) > 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Securely verifies the provided admin password inside PostgreSQL
CREATE OR REPLACE FUNCTION public.verify_admin_password(input_password text)
RETURNS boolean AS $$
DECLARE
    actual_pwd text;
BEGIN
    SELECT value INTO actual_pwd FROM public.app_settings WHERE key = 'admin_password';
    
    -- If no password is set in database, verification passes automatically
    IF actual_pwd IS NULL OR length(trim(actual_pwd)) = 0 THEN
        RETURN true;
    END IF;
    
    RETURN (input_password IS NOT NULL AND trim(input_password) = trim(actual_pwd));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.is_admin_password_required() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_admin_password(text) TO anon, authenticated, service_role;


