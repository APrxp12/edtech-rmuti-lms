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

  // รายชื่ออีเมลที่ได้รับอนุญาตพิเศษ (ผู้พัฒนา และแอดมิน)
  emailWhitelist: [
    { email: 'bugzonvazan@gmail.com', role: 'admin', name: 'นายพีรพล น้อยโนนงิ้ว', note: 'ผู้พัฒนา (Developer)' },
    { email: 'Bugzonvazan@gmail.com', role: 'admin', name: 'นายพีรพล น้อยโนนงิ้ว', note: 'ผู้พัฒนา (Developer)' },
    { email: 'admin@rmuti.ac.th', role: 'admin', name: 'ผู้ดูแลระบบ', note: 'ผู้ดูแลระบบหลัก (Admin)' },
  ],

  // บัญชีที่ถูกระงับการใช้งาน
  blockedEmails: [
    'kamonwan.j@rmuti.ac.th',
    'blocked@rmuti.ac.th',
  ],
};
