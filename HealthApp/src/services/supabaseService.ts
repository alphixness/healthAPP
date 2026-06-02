import { createClient } from '@supabase/supabase-js';
import { ENV } from '../config/env';
import { logger } from '../utils/logger';

let supabase: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!supabase && ENV.HAS_SUPABASE) {
    supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, detectSessionInUrl: false },
    });
  }
  return supabase;
}

export async function signInAnonymously(): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const { data, error } = await client.auth.signInAnonymously();
    if (error) throw error;
    return data.user?.id ?? null;
  } catch (error) {
    logger.warn('Supabase anonymous sign-in failed:', error);
    return null;
  }
}

export async function getUserId(): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  const { data } = await client.auth.getUser();
  return data.user?.id ?? null;
}

// ── User Profile ──

export async function syncProfile(profile: Record<string, unknown>): Promise<void> {
  const client = getClient();
  if (!client) return;

  const userId = await getUserId();
  if (!userId) return;

  try {
    const { error } = await (client.from('user_profiles') as any)
      .upsert({ ...profile, user_id: userId, updated_at: new Date().toISOString() });
    if (error) throw error;
  } catch (error) {
    logger.warn('Supabase syncProfile failed:', error);
  }
}

export async function loadProfile(): Promise<Record<string, unknown> | null> {
  const client = getClient();
  if (!client) return null;

  const userId = await getUserId();
  if (!userId) return null;

  try {
    const { data, error } = await client
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    logger.warn('Supabase loadProfile failed:', error);
    return null;
  }
}

// ── Food Logs ──

export async function syncFoodLogs(logs: Record<string, unknown>[]): Promise<void> {
  const client = getClient();
  if (!client) return;

  const userId = await getUserId();
  if (!userId) return;

  try {
    const { error } = await (client.from('food_logs') as any)
      .upsert(logs.map((l) => ({ ...l, user_id: userId })));
    if (error) throw error;
  } catch (error) {
    logger.warn('Supabase syncFoodLogs failed:', error);
  }
}

export async function loadFoodLogs(userId: string): Promise<Record<string, unknown>[]> {
  const client = getClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('food_logs')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    logger.warn('Supabase loadFoodLogs failed:', error);
    return [];
  }
}

// ── Exercise Logs ──

export async function syncExerciseLogs(logs: Record<string, unknown>[]): Promise<void> {
  const client = getClient();
  if (!client) return;

  const userId = await getUserId();
  if (!userId) return;

  try {
    const { error } = await (client.from('exercise_logs') as any)
      .upsert(logs.map((l) => ({ ...l, user_id: userId })));
    if (error) throw error;
  } catch (error) {
    logger.warn('Supabase syncExerciseLogs failed:', error);
  }
}

export async function loadExerciseLogs(): Promise<Record<string, unknown>[]> {
  const client = getClient();
  if (!client) return [];

  const userId = await getUserId();
  if (!userId) return [];

  try {
    const { data, error } = await client
      .from('exercise_logs')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    logger.warn('Supabase loadExerciseLogs failed:', error);
    return [];
  }
}

// ── Health Snapshots ──

export async function syncHealthSnapshot(snapshot: Record<string, unknown>): Promise<void> {
  const client = getClient();
  if (!client) return;

  const userId = await getUserId();
  if (!userId) return;

  try {
    const { error } = await (client.from('health_snapshots') as any)
      .upsert({ ...snapshot, user_id: userId });
    if (error) throw error;
  } catch (error) {
    logger.warn('Supabase syncHealthSnapshot failed:', error);
  }
}

// ── Sync All (called on app start) ──

export async function syncAll(
  profile: Record<string, unknown>,
  foodLogs: Record<string, unknown>[],
  exerciseLogs: Record<string, unknown>[],
): Promise<void> {
  const userId = await signInAnonymously();
  if (!userId) return;

  await Promise.all([
    syncProfile(profile),
    syncFoodLogs(foodLogs),
    syncExerciseLogs(exerciseLogs),
  ]);
}
