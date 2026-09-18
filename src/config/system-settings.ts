/**
 * การตั้งค่าระบบกลาง (System Settings)
 * สอดคล้องกับ Visual Reference หน้า 21 (System Settings)
 */

export interface SystemSettings {
  videoThresholdPercent: number;    // เกณฑ์การรับชมวิดีโอ (เช่น 60% หรือ 90%)
  defaultPassScorePercent: number;  // คะแนนผ่านเริ่มต้น (เช่น 60%)
  defaultMaxAttempts: number;       // จำนวนครั้งที่ทำได้เริ่มต้น (เช่น 3 ครั้ง)
  appName: string;                  // ชื่อแอปพลิเคชัน
  adminEmail: string;               // อีเมลผู้ดูแลระบบ
  sessionTimeoutMinutes: number;    // ช่วงเวลาการใช้งานเซสชัน (นาที)
}

export const initialSystemSettings: SystemSettings = {
  videoThresholdPercent: 60,
  defaultPassScorePercent: 60,
  defaultMaxAttempts: 3,
  appName: 'EDTech',
  adminEmail: 'admin@rmuti.ac.th',
  sessionTimeoutMinutes: 120,
};
