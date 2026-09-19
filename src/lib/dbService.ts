import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { UserProfile, Announcement, AccessRule, UserLessonProgress } from '@/types';
import { SystemSettings } from '@/config/system-settings';

/**
 * ฐานข้อมูลกลาง - Data Access Layer (DAL)
 * ทำงานร่วมกับ Supabase และมี Error Handling ป้องกันเว็บค้างเมื่อออฟไลน์
 */

// ==========================================
// 1. USERS TABLE
// ==========================================

export async function dbFetchUsers(): Promise<UserProfile[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('users')
      .select('*')
      .order('last_login_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Error fetching users:', error.message);
      return null;
    }

    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name || '',
      displayName: row.display_name || row.full_name || '',
      studentId: row.student_id || '-',
      role: row.role || 'student',
      status: row.status || 'active',
      isProfileCompleted: row.is_profile_completed ?? true,
      avatarUrl: row.avatar_url || '',
      firstLoginAt: row.first_login_at || new Date().toISOString(),
      lastLoginAt: row.last_login_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('[Supabase] Exception fetching users:', err);
    return null;
  }
}

export async function dbUpsertUser(user: UserProfile): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const row = {
      id: user.id,
      email: user.email.toLowerCase().trim(),
      full_name: user.fullName,
      display_name: user.displayName,
      student_id: user.studentId,
      role: user.role,
      status: user.status,
      is_profile_completed: user.isProfileCompleted,
      avatar_url: user.avatarUrl || '',
      first_login_at: user.firstLoginAt,
      last_login_at: user.lastLoginAt,
      updated_at: new Date().toISOString(),
    };

    const { error } = await sb.from('users').upsert(row, { onConflict: 'email' });
    if (error) {
      console.warn('[Supabase] Error upserting user:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Exception upserting user:', err);
    return false;
  }
}

export async function dbUpdateUser(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.displayName !== undefined) payload.display_name = updates.displayName;
    if (updates.studentId !== undefined) payload.student_id = updates.studentId;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

    const { error } = await sb.from('users').update(payload).eq('id', userId);
    if (error) {
      console.warn('[Supabase] Error updating user:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Exception updating user:', err);
    return false;
  }
}

export async function dbDeleteUser(userId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb.from('users').delete().eq('id', userId);
    if (error) {
      console.warn('[Supabase] Error deleting user:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Exception deleting user:', err);
    return false;
  }
}

// ==========================================
// 2. ACCESS RULES TABLE
// ==========================================

export async function dbFetchAccessRules(): Promise<AccessRule[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('access_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Error fetching access_rules:', error.message);
      return null;
    }

    if (!data) return [];

    return data.map((r: any) => ({
      id: r.id,
      type: r.type,
      value: r.value,
      decision: r.decision,
      defaultRole: r.default_role,
      isActive: r.is_active,
      note: r.note || '',
      updatedAt: r.updated_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('[Supabase] Exception fetching access_rules:', err);
    return null;
  }
}

export async function dbUpsertAccessRule(rule: AccessRule): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const row = {
      id: rule.id,
      type: rule.type,
      value: rule.value.toLowerCase().trim(),
      decision: rule.decision,
      default_role: rule.defaultRole,
      is_active: rule.isActive,
      note: rule.note || '',
      updated_at: new Date().toISOString(),
    };

    const { error } = await sb.from('access_rules').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] Error upserting access_rule:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Exception upserting access_rule:', err);
    return false;
  }
}

export async function dbDeleteAccessRule(ruleId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb.from('access_rules').delete().eq('id', ruleId);
    if (error) {
      console.warn('[Supabase] Error deleting access_rule:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Exception deleting access_rule:', err);
    return false;
  }
}

// ==========================================
// 3. ANNOUNCEMENTS TABLE
// ==========================================

export async function dbFetchAnnouncements(): Promise<Announcement[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('announcements')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Error fetching announcements:', error.message);
      return null;
    }

    if (!data) return [];

    return data.map((a: any) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      category: a.category,
      imageUrl: a.image_url || undefined,
      status: a.status,
      publishedAt: a.published_at || new Date().toISOString(),
      expiresAt: a.expires_at || '',
      updatedAt: a.updated_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('[Supabase] Exception fetching announcements:', err);
    return null;
  }
}

export async function dbUpsertAnnouncement(announcement: Announcement): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const row = {
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      category: announcement.category,
      image_url: announcement.imageUrl || null,
      status: announcement.status,
      published_at: announcement.publishedAt,
      expires_at: announcement.expiresAt ? announcement.expiresAt : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await sb.from('announcements').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] Error upserting announcement:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Exception upserting announcement:', err);
    return false;
  }
}

export async function dbDeleteAnnouncement(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb.from('announcements').delete().eq('id', id);
    if (error) {
      console.warn('[Supabase] Error deleting announcement:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Exception deleting announcement:', err);
    return false;
  }
}

// ==========================================
// 4. USER LESSON PROGRESS TABLE
// ==========================================

export async function dbFetchUserProgress(userId: string): Promise<Record<string, UserLessonProgress> | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.warn('[Supabase] Error fetching user_progress:', error.message);
      return null;
    }

    if (!data) return {};

    const progressMap: Record<string, UserLessonProgress> = {};
    for (const row of data) {
      progressMap[row.lesson_id] = {
        userId: row.user_id,
        lessonId: row.lesson_id,
        assignedVersionId: row.assigned_version_id || 'v1.0',
        status: row.status,
        progressPercent: Number(row.progress_percent) || 0,
        isPreTestCompleted: row.is_pre_test_completed ?? false,
        preTestScore: row.pre_test_score || undefined,
        isPostTestUnlocked: row.is_post_test_unlocked ?? false,
        postTestAttempts: row.post_test_attempts || [],
        preTestAttempts: row.pre_test_attempts || [],
        bestPostTestScorePercent: row.best_post_test_score_percent ? Number(row.best_post_test_score_percent) : undefined,
        watchedVideos: row.watched_videos || {},
        firstStartedAt: row.first_started_at || undefined,
        completedAt: row.completed_at || undefined,
        lastAccessedAt: row.last_accessed_at || new Date().toISOString(),
      };
    }
    return progressMap;
  } catch (err) {
    console.warn('[Supabase] Exception fetching user_progress:', err);
    return null;
  }
}

export async function dbUpsertUserProgress(progress: UserLessonProgress): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const row = {
      id: `${progress.userId}_${progress.lessonId}`,
      user_id: progress.userId,
      lesson_id: progress.lessonId,
      assigned_version_id: progress.assignedVersionId,
      status: progress.status,
      progress_percent: progress.progressPercent,
      is_pre_test_completed: progress.isPreTestCompleted,
      pre_test_score: progress.preTestScore || null,
      is_post_test_unlocked: progress.isPostTestUnlocked,
      post_test_attempts: progress.postTestAttempts || [],
      pre_test_attempts: progress.preTestAttempts || [],
      best_post_test_score_percent: progress.bestPostTestScorePercent ?? null,
      watched_videos: progress.watchedVideos || {},
      first_started_at: progress.firstStartedAt || null,
      completed_at: progress.completedAt || null,
      last_accessed_at: progress.lastAccessedAt,
      updated_at: new Date().toISOString(),
    };

    const { error } = await sb.from('user_progress').upsert(row, { onConflict: 'user_id,lesson_id' });
    if (error) {
      console.warn('[Supabase] Error upserting user_progress:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Exception upserting user_progress:', err);
    return false;
  }
}

// ==========================================
// 5. REALTIME SUBSCRIPTIONS
// ==========================================

export function subscribeToUsersTable(onChange: (users: UserProfile[]) => void) {
  const sb = getSupabase();
  if (!sb || typeof window === 'undefined') return () => {};

  try {
    const channelId = `realtime-users-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const channel = sb
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        async () => {
          try {
            const freshUsers = await dbFetchUsers();
            if (freshUsers) {
              onChange(freshUsers);
            }
          } catch (e) {
            console.warn('[Realtime] Failed to process users update:', e);
          }
        }
      )
      .subscribe();

    return () => {
      try {
        sb.removeChannel(channel);
      } catch (e) {}
    };
  } catch (err) {
    console.warn('[Realtime] Failed to subscribe to users:', err);
    return () => {};
  }
}
