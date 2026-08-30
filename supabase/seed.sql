-- ==============================================================================
-- Pocket Werewolf - Local Development Database Seed Script 🐺
-- Inserts a full 6-player mock room with all roles, votes, and logs.
-- ==============================================================================

-- 1. Clean previous mock room with code 'TEST'
DELETE FROM public.rooms WHERE code = 'TEST';

-- 2. Insert mock room
INSERT INTO public.rooms (
  id,
  code,
  host_session_id,
  status,
  round,
  deck,
  settings,
  winner
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'TEST',
  'sess-host-alice',
  'day',
  1,
  '[
    {"role": "Werewolf", "count": 2},
    {"role": "Seer", "count": 1},
    {"role": "Doctor", "count": 1},
    {"role": "Witch", "count": 1},
    {"role": "Villager", "count": 1}
  ]'::jsonb,
  '{
    "revealRoleOnDeath": true,
    "nightDuration": 45,
    "dayDuration": 90,
    "votingDuration": 45,
    "allowSelfProtect": true,
    "anonymousVoting": false
  }'::jsonb,
  NULL
);

-- 3. Insert mock players
INSERT INTO public.players (
  id,
  room_id,
  session_id,
  name,
  avatar,
  is_host,
  is_ready,
  is_alive,
  is_revealed,
  role,
  team,
  death_reason,
  death_round
) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'sess-host-alice', 'Alice (Host)', '👑', true, true, true, false, 'Seer', 'good', NULL, NULL),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'sess-bob-wolf', 'Bob (Wolf)', '🐺', false, true, true, false, 'Werewolf', 'evil', NULL, NULL),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'sess-charlie-doc', 'Charlie (Doc)', '💉', false, true, true, false, 'Doctor', 'good', NULL, NULL),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'sess-diana-vill', 'Diana (Villager)', '👩‍🌾', false, true, true, false, 'Villager', 'good', NULL, NULL),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'sess-eve-wolf2', 'Eve (Wolf 2)', '👺', false, true, true, false, 'Werewolf', 'evil', NULL, NULL),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'sess-frank-witch', 'Frank (Witch)', '🧙‍♂️', false, true, false, true, 'Witch', 'good', 'night_kill', 1);

-- 4. Insert mock night actions
INSERT INTO public.night_actions (
  room_id,
  round,
  actor_id,
  action_type,
  target_id
) VALUES
  ('a0000000-0000-0000-0000-000000000001', 1, 'b0000000-0000-0000-0000-000000000002', 'werewolf_kill', 'b0000000-0000-0000-0000-000000000006'),
  ('a0000000-0000-0000-0000-000000000001', 1, 'b0000000-0000-0000-0000-000000000001', 'seer_inspect', 'b0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000001', 1, 'b0000000-0000-0000-0000-000000000003', 'doctor_heal', 'b0000000-0000-0000-0000-000000000001');

-- 5. Insert mock game logs & chat
INSERT INTO public.game_logs (
  room_id,
  round,
  message,
  type,
  sender_id,
  sender_name,
  sender_avatar
) VALUES
  ('a0000000-0000-0000-0000-000000000001', 1, 'A new game has begun. Roles have been distributed!', 'info', NULL, NULL, NULL),
  ('a0000000-0000-0000-0000-000000000001', 1, '☀️ Dawn breaks... Frank (Witch) was brutally murdered during the night!', 'night_result', NULL, NULL, NULL),
  ('a0000000-0000-0000-0000-000000000001', 1, 'I think Bob is acting suspicious today!', 'chat', 'b0000000-0000-0000-0000-000000000001', 'Alice (Host)', '👑');
