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
  // โดเมนที่อนุญาตเข้าใช้งาน (ให้ใช้กฎไดนามิกจากระบบจัดการสิทธิ์ /admin/access-rules เป็นหลัก)
  allowedDomains: [],

  // รายชื่ออีเมลผู้พัฒนาหลัก (Master Admin - ป้องกันระบบล็อกตัวเอง)
  emailWhitelist: [
    { email: 'bugzonvazan@gmail.com', role: 'admin', name: 'Lamut (ผู้พัฒนา)', note: 'ผู้พัฒนา (Developer)' },
    { email: 'Bugzonvazan@gmail.com', role: 'admin', name: 'Lamut (ผู้พัฒนา)', note: 'ผู้พัฒนา (Developer)' },
  ],

  // บัญชีที่ถูกระงับการใช้งาน
  blockedEmails: [],
};
