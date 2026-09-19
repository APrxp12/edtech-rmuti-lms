import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ตรวจสอบค่า Environment Variables สำหรับเชื่อมต่อ Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * ตรวจสอบว่าระบบมีค่า Credentials ของ Supabase พร้อมใช้งานหรือไม่
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim().length > 0 &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim().length > 0 &&
    supabaseUrl.startsWith('https://')
  );
};

// สร้าง Singleton Client (สร้างเมื่อมี Credentials ที่ถูกต้อง)
let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl.trim(), supabaseAnonKey.trim(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  return clientInstance;
};

// Export instance สะดวกสำหรับการเรียกใช้งานตรง
export const supabase = getSupabase();
