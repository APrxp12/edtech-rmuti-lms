'use client';

import React, { useState } from 'react';
import { 
  Settings, Save, AlertTriangle, CheckCircle2, RotateCcw
} from 'lucide-react';
import { useAppStore } from '@/data/store';

export default function AdminSettingsPage() {
  const { settings, setSettings } = useAppStore();

  const [videoThreshold, setVideoThreshold] = useState(settings.videoThresholdPercent.toString());
  const [passScore, setPassScore] = useState(settings.defaultPassScorePercent.toString());
  const [maxAttempts, setMaxAttempts] = useState(settings.defaultMaxAttempts.toString());
  const [appName, setAppName] = useState(settings.appName);
  const [adminEmail, setAdminEmail] = useState(settings.adminEmail);
  const [sessionTimeout, setSessionTimeout] = useState(settings.sessionTimeoutMinutes.toString());

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings({
      videoThresholdPercent: parseInt(videoThreshold) || 60,
      defaultPassScorePercent: parseInt(passScore) || 60,
      defaultMaxAttempts: parseInt(maxAttempts) || 3,
      appName: appName.trim(),
      adminEmail: adminEmail.trim(),
      sessionTimeoutMinutes: parseInt(sessionTimeout) || 120,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header matching Page 21 */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          ตั้งค่าระบบ (System Settings)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          กำหนดค่าเริ่มต้นของระบบ สำหรับการใช้งานแพลตฟอร์ม EDTech
        </p>
      </div>

      {/* Critical Invariant Warning matching Page 21 & Spec Rule 23 */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-900 text-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <span>หมายเหตุ: การตั้งค่าเหล่านี้มีผลเฉพาะกับเนื้อหาและรายวิชาที่สร้างใหม่เท่านั้น ไม่ส่งผลต่อข้อมูลเดิมที่มีอยู่ในระบบ</span>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          บันทึกการตั้งค่าเรียบร้อยแล้ว อัปเดตค่าระบบเรียบร้อย
        </div>
      )}

      {/* Settings Table Form matching Page 21 */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        
        <div className="divide-y divide-slate-100 text-xs">
          
          {/* Row 1: Video Threshold */}
          <div className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-5">
              <div className="font-bold text-slate-800">เกณฑ์การรับชมวิดีโอ (Video threshold)</div>
              <div className="text-[11px] text-slate-400">เปอร์เซ็นต์การรับชมวิดีโอขั้นต่ำที่ถือว่าเรียนครบ (10 - 100%)</div>
            </div>
            <div className="sm:col-span-5">
              <input
                type="number"
                value={videoThreshold}
                onChange={(e) => setVideoThreshold(e.target.value)}
                className="w-32 p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
              <span className="ml-2 font-bold text-slate-600">%</span>
            </div>
            <div className="sm:col-span-2 text-right">
              <span className="text-[10px] text-slate-400 font-mono">10 - 100</span>
            </div>
          </div>

          {/* Row 2: Default Pass Score */}
          <div className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-5">
              <div className="font-bold text-slate-800">คะแนนผ่านเริ่มต้น (Default pass score)</div>
              <div className="text-[11px] text-slate-400">คะแนนขั้นต่ำที่ถือว่าผ่านในการทำแบบทดสอบ (0 - 100%)</div>
            </div>
            <div className="sm:col-span-5">
              <input
                type="number"
                value={passScore}
                onChange={(e) => setPassScore(e.target.value)}
                className="w-32 p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
              <span className="ml-2 font-bold text-slate-600">%</span>
            </div>
            <div className="sm:col-span-2 text-right">
              <span className="text-[10px] text-slate-400 font-mono">0 - 100</span>
            </div>
          </div>

          {/* Row 3: Default Max Attempts */}
          <div className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-5">
              <div className="font-bold text-slate-800">จำนวนครั้งที่ทำได้เริ่มต้น (Default max attempts)</div>
              <div className="text-[11px] text-slate-400">จำนวนครั้งที่อนุญาตให้ทำแบบทดสอบในแต่ละบทเรียน</div>
            </div>
            <div className="sm:col-span-5">
              <input
                type="number"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                className="w-32 p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
              <span className="ml-2 font-bold text-slate-600">ครั้ง</span>
            </div>
            <div className="sm:col-span-2 text-right">
              <span className="text-[10px] text-slate-400 font-mono">1 - 10</span>
            </div>
          </div>

          {/* Row 4: App Name */}
          <div className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-5">
              <div className="font-bold text-slate-800">ชื่อแอปพลิเคชัน (App name)</div>
              <div className="text-[11px] text-slate-400">ชื่อที่แสดงบนแถบหัวข้อและแพลตฟอร์ม</div>
            </div>
            <div className="sm:col-span-5">
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-64 p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
            <div className="sm:col-span-2 text-right">
              <span className="text-[10px] text-slate-400 font-mono">ข้อความ</span>
            </div>
          </div>

          {/* Row 5: Admin Email */}
          <div className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-5">
              <div className="font-bold text-slate-800">อีเมลผู้ดูแลระบบ (Admin email)</div>
              <div className="text-[11px] text-slate-400">อีเมลสำหรับการแจ้งเตือนระบบ</div>
            </div>
            <div className="sm:col-span-5">
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-64 p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div className="sm:col-span-2 text-right">
              <span className="text-[10px] text-slate-400 font-mono">อีเมล</span>
            </div>
          </div>

          {/* Row 6: Session Timeout */}
          <div className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-5">
              <div className="font-bold text-slate-800">ช่วงเวลาการใช้งานเซสชัน (Session timeout)</div>
              <div className="text-[11px] text-slate-400">เวลาที่ไม่ได้ใช้งานก่อนออกจากระบบอัตโนมัติ (นาที)</div>
            </div>
            <div className="sm:col-span-5">
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-32 p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
              <span className="ml-2 font-bold text-slate-600">นาที</span>
            </div>
            <div className="sm:col-span-2 text-right">
              <span className="text-[10px] text-slate-400 font-mono">5 - 240</span>
            </div>
          </div>

        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setVideoThreshold('60');
              setPassScore('60');
              setMaxAttempts('3');
              setAppName('EDTech');
              setAdminEmail('admin@rmuti.ac.th');
              setSessionTimeout('30');
            }}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            รีเซ็ตเป็นค่าเริ่มต้น
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200"
          >
            บันทึกการตั้งค่า
          </button>
        </div>

      </form>

    </div>
  );
}
