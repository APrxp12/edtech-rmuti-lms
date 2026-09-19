/**
 * ไฟล์ควบคุมสิทธิ์การเข้าใช้งานระบบ (Access Control Configuration)
 * แก้ไขรายการ Domain หรือ Whitelist อีเมลได้ที่นี่
 */

export interface AccessRuleConfig {
  allowedDomains: string[];
  emailWhitelist: {
    email: string;
    role: 'student' | 'admin';
    name?: string;
    note?: string;
  }[];
  blockedEmails: string[];
}

export const defaultAccessControlConfig: AccessRuleConfig = {
  // โดเมนที่อนุญาตเข้าใช้งานอัตโนมัติเมื่อล็อกอินด้วย Google
  allowedDomains: [
    'rmuti.ac.th',
    'kkc.rmuti.ac.th',
  ],

  // รายชื่ออีเมลที่ได้รับอนุญาตพิเศษ (เช่น อาจารย์ หรือนักศึกษาภายนอกที่ใช้ @gmail.com)
  emailWhitelist: [
    { email: 'admin@rmuti.ac.th', role: 'admin', name: 'นายสมชาย ใจดี', note: 'ผู้ดูแลระบบหลัก (Admin)' },
    { email: 'somchai@rmuti.ac.th', role: 'admin', name: 'นายสมชาย ใจดี', note: 'อาจารย์ผู้สอน' },
    { email: 'teacher.edtech@gmail.com', role: 'admin', name: 'อาจารย์พิเศษ', note: 'อาจารย์ผู้รับผิดชอบรายวิชา' },
    { email: 'anun.j@rmuti.ac.th', role: 'student', name: 'นายอนันต์ ใจดี', note: 'นักศึกษาตัวอย่าง' },
    { email: 'student@rmuti.ac.th', role: 'student', name: 'สมชาย ใจดี', note: 'นักศึกษาทั่วไป' },
    { email: 'partner@rmuti.ac.th', role: 'student', name: 'บัญชีภายนอกที่ได้รับอนุญาต', note: 'ความร่วมมือภายนอก' },
    { email: 'special.student@gmail.com', role: 'student', name: 'ผู้เรียนโครงการพิเศษ', note: 'อนุมัติผ่าน Whitelist' },
    { email: 'Bugzonvazan@gmail.com', role: 'admin', name: 'นายพีรพล น้อยโนนงิ้ว', note: 'ผู้พัฒนา' },
  ],

  // บัญชีที่ถูกระงับการใช้งาน
  blockedEmails: [
    'kamonwan.j@rmuti.ac.th',
    'blocked@rmuti.ac.th',
  ],
};
