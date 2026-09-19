'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Settings, Save, AlertTriangle, CheckCircle2, RotateCcw, 
  ArrowLeft, Video, Award, RefreshCw, Globe, Mail, 
  Clock, Shield, Database, Sliders, Check, Sparkles,
  Layers, Lock, Trash2, Info
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { SystemSettings, initialSystemSettings } from '@/config/system-settings';
import { dbUpsertSystemSettings } from '@/lib/dbService';

export default function AdminSettingsPage() {
  const { settings, setSettings, isSupabaseLive } = useAppStore();

  const [videoThreshold, setVideoThreshold] = useState<number>(settings.videoThresholdPercent);
  const [passScore, setPassScore] = useState<number>(settings.defaultPassScorePercent);
  const [maxAttempts, setMaxAttempts] = useState<number>(settings.defaultMaxAttempts);
  const [appName, setAppName] = useState<string>(settings.appName);
  const [adminEmail, setAdminEmail] = useState<string>(settings.adminEmail);
  const [sessionTimeout, setSessionTimeout] = useState<number>(settings.sessionTimeoutMinutes);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync state when settings are loaded from Cloud / Store
  React.useEffect(() => {
    if (settings) {
      setVideoThreshold(settings.videoThresholdPercent);
      setPassScore(settings.defaultPassScorePercent);
      setMaxAttempts(settings.defaultMaxAttempts);
      setAppName(settings.appName);
      setAdminEmail(settings.adminEmail);
      setSessionTimeout(settings.sessionTimeoutMinutes);
    }
  }, [settings]);

  // Save Settings to Store, LocalStorage, and Supabase Cloud
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const newSettings: SystemSettings = {
      videoThresholdPercent: Math.max(10, Math.min(100, Number(videoThreshold) || 60)),
      defaultPassScorePercent: Math.max(0, Math.min(100, Number(passScore) || 60)),
      defaultMaxAttempts: Math.max(1, Math.min(10, Number(maxAttempts) || 3)),
      appName: appName.trim() || 'EDTech',
      adminEmail: adminEmail.trim() || 'admin@rmuti.ac.th',
      sessionTimeoutMinutes: Math.max(5, Math.min(480, Number(sessionTimeout) || 120)),
    };

    setSettings(newSettings);
    try {
      localStorage.setItem('edtech_settings', JSON.stringify(newSettings));
    } catch (err) {
      console.error('Error saving settings to localStorage:', err);
    }

    if (isSupabaseLive) {
      try {
        const ok = await dbUpsertSystemSettings(newSettings);
        if (ok) {
          setToastMsg('บันทึกการตั้งค่าระบบลงฐานข้อมูล Cloud สำเร็จแล้ว');
        } else {
          setToastMsg('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
        }
      } catch (err) {
        console.warn('[Supabase] Error saving system settings:', err);
        setToastMsg('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
      }
    } else {
      setToastMsg('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
    }

    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setToastMsg(null);
    }, 3500);
  };

  // Reset to initial default settings
  const handleResetDefaults = async () => {
    if (confirm('คุณต้องการคืนค่าการตั้งค่าระบบทั้งหมดเป็นค่าเริ่มต้นมาตรฐานใช่หรือไม่?')) {
      setIsSaving(true);
      setVideoThreshold(initialSystemSettings.videoThresholdPercent);
      setPassScore(initialSystemSettings.defaultPassScorePercent);
      setMaxAttempts(initialSystemSettings.defaultMaxAttempts);
      setAppName(initialSystemSettings.appName);
      setAdminEmail(initialSystemSettings.adminEmail);
      setSessionTimeout(initialSystemSettings.sessionTimeoutMinutes);

      setSettings(initialSystemSettings);
      try {
        localStorage.setItem('edtech_settings', JSON.stringify(initialSystemSettings));
      } catch (err) {
        console.error('Error resetting settings to localStorage:', err);
      }

      if (isSupabaseLive) {
        try {
          await dbUpsertSystemSettings(initialSystemSettings);
        } catch (err) {
          console.warn('[Supabase] Error resetting cloud settings:', err);
        }
      }

      setIsSaving(false);
      setToastMsg('คืนค่าการตั้งค่าระบบเป็นค่าเริ่มต้นเรียบร้อยแล้ว');
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  // Clear client cache helper
  const handleClearCache = () => {
    if (confirm('คำเตือน: การล้างแคช LocalStorage จะล้างข้อมูลการทดสอบในเบราว์เซอร์นี้ทั้งหมด ต้องการดำเนินการต่อหรือไม่?')) {
      try {
        localStorage.clear();
        alert('ล้างแคชสำเร็จ ระบบจะรีโหลดหน้าเว็บใหม่');
        window.location.reload();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 px-2 sm:px-4">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <Link
            href="/admin/lessons"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition mb-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับสู่หน้ารวมบทเรียน</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              System Administration
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">
              ระบบส่วนกลาง (Global System)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <span>ตั้งค่าระบบส่วนกลาง (System Settings)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            กำหนดเกณฑ์การเรียนรู้เริ่มต้น มาตรฐานการทดสอบ ข้อมูลแพลตฟอร์ม และความปลอดภัยของเซสชัน
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Database Status Indicator */}
          {isSupabaseLive ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>ฐานข้อมูล Cloud (Live)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>หน่วยความจำเครื่อง</span>
            </div>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={handleResetDefaults}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
            title="คืนค่าการตั้งค่าทั้งหมดเป็นค่าเริ่มต้น"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่าเริ่มต้น</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-200 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</span>
          </button>
        </div>
      </div>

      {/* Toast Alert Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs transition-all animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* COURSE / SYSTEM HERO BANNER & LIVE KPI STATS (Soft Luminous Pastel Theme) */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-sky-50/60 p-6 sm:p-7 shadow-xs">
        {/* Ambient Pastel Background Orbs */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-indigo-200/25 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          
          {/* Security Tag Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-900 bg-white/90 px-3 py-1 rounded-xl shadow-2xs border border-blue-100 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>นโยบายและเกณฑ์มาตรฐานระบบ (System Policy & Standard Metrics)</span>
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              มีผลบังคับใช้กับการคำนวณผลการเรียนและการสร้างเนื้อหาใหม่ในระบบ
            </span>
          </div>

          {/* Dynamic KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
            
            {/* Video Threshold */}
            <div className="bg-white/85 backdrop-blur-xs rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">ดูวิดีโอผ่าน</span>
                <Video className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">{videoThreshold}%</div>
              <span className="text-[10px] text-blue-600/80">เกณฑ์รับชมขั้นต่ำ</span>
            </div>

            {/* Pass Score */}
            <div className="bg-emerald-50/70 rounded-2xl p-3.5 border border-emerald-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-700">คะแนนสอบผ่าน</span>
                <Award className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-xl font-bold text-emerald-950 mt-1">{passScore}%</div>
              <span className="text-[10px] text-emerald-600/80">เกณฑ์สอบมาตรฐาน</span>
            </div>

            {/* Max Attempts */}
            <div className="bg-purple-50/70 rounded-2xl p-3.5 border border-purple-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-purple-700">สอบแก้ตัว</span>
                <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
              </div>
              <div className="text-xl font-bold text-purple-950 mt-1">{maxAttempts} ครั้ง</div>
              <span className="text-[10px] text-purple-600/80">จำนวนครั้งสูงสุด</span>
            </div>

            {/* Session Timeout */}
            <div className="bg-amber-50/70 rounded-2xl p-3.5 border border-amber-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-700">เซสชันหมดอายุ</span>
                <Clock className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-amber-950 mt-1">{sessionTimeout} นาที</div>
              <span className="text-[10px] text-amber-600/80">เมื่อไม่มีการใช้งาน</span>
            </div>

            {/* Auth Method */}
            <div className="bg-sky-50/70 rounded-2xl p-3.5 border border-sky-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-sky-700">ยืนยันตัวตน</span>
                <Shield className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <div className="text-sm font-bold text-sky-950 mt-2">Google GIS</div>
              <span className="text-[10px] text-sky-600/80">OAuth 2.0 ปลอดภัย</span>
            </div>

            {/* Storage Engine */}
            <div className="bg-indigo-50/70 rounded-2xl p-3.5 border border-indigo-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-indigo-700">การจัดเก็บ</span>
                <Database className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="text-sm font-bold text-indigo-950 mt-2">LocalStore</div>
              <span className="text-[10px] text-indigo-600/80">ซิงก์ฝั่งผู้ใช้</span>
            </div>

          </div>

        </div>
      </div>

      {/* Critical Invariant Notice Card */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex items-start gap-3 text-amber-900 text-xs shadow-2xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">หมายเหตุสำคัญทางวิชาการ:</span>
          <p className="text-amber-800 leading-relaxed">
            การปรับเปลี่ยนเกณฑ์เหล่านี้จะนำไปใช้เป็นค่าเริ่มต้นสำหรับเนื้อหา บทเรียน และการทดสอบที่สร้างใหม่ โดยระบบจะไม่เปลี่ยนแปลงผลคะแนนในอดีตของผู้เรียนที่สอบผ่านไปแล้ว เพื่อรักษาความถูกต้องของประวัติการศึกษา
          </p>
        </div>
      </div>

      {/* MAIN SETTINGS FORM WITH LOGICAL CARDS */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION 1: LEARNING & QUIZ EVALUATION POLICIES */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
          
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                1. เกณฑ์การเรียนรู้และการผ่านบทเรียน (Learning & Quiz Policies)
              </h2>
              <p className="text-[11px] text-slate-500">
                กำหนดเปอร์เซ็นต์ขั้นต่ำและจำนวนครั้งในการทำแบบทดสอบเพื่อวัดผลสัมฤทธิ์
              </p>
            </div>
          </div>

          <div className="space-y-5 text-xs">
            
            {/* Setting: Video Threshold */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>เกณฑ์การรับชมวิดีโอ (Video Threshold)</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-bold">
                      {videoThreshold}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    สัดส่วนความยาววิดีโอขั้นต่ำที่ผู้เรียนต้องเปิดดู จึงจะถือว่าเรียนจบหัวข้อนั้น (ค่าแนะนำ: 60% หรือ 80%)
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={videoThreshold}
                    onChange={(e) => setVideoThreshold(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <span className="font-bold text-slate-600">%</span>
                </div>
              </div>

              {/* Range Slider for Video Threshold */}
              <div className="space-y-1 pt-1">
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={videoThreshold}
                  onChange={(e) => setVideoThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>10% (ยืดหยุ่น)</span>
                  <span>50%</span>
                  <span>60% (มาตรฐาน)</span>
                  <span>80% (เข้มงวด)</span>
                  <span>100% (ดูครบถ้วน)</span>
                </div>
              </div>
            </div>

            {/* Setting: Default Pass Score */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>คะแนนผ่านเริ่มต้น (Default Pass Score)</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                      {passScore}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    เกณฑ์เปอร์เซ็นต์คะแนนขั้นต่ำในการทำแบบทดสอบเพื่อบันทึกสถานะว่า "สอบผ่าน"
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={passScore}
                    onChange={(e) => setPassScore(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <span className="font-bold text-slate-600">%</span>
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-500 font-semibold">ระดับเกณฑ์แนะนำ:</span>
                {[50, 60, 70, 80].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPassScore(val)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      passScore === val
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val}% {val === 60 ? '(ค่ามาตรฐาน)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Setting: Default Max Attempts */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>จำนวนครั้งที่อนุญาตให้สอบแก้ตัว (Default Max Attempts)</span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md text-[10px] font-bold">
                      {maxAttempts} ครั้ง
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    จำนวนครั้งสูงสุดที่ผู้เรียนสามารถทำแบบทดสอบเพื่อแก้ตัวใหม่ได้ในแต่ละบทเรียน
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <span className="font-bold text-slate-600">ครั้ง</span>
                </div>
              </div>

              {/* Attempts Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-500 font-semibold">จำนวนครั้งแนะนำ:</span>
                {[1, 2, 3, 5, 10].map((attempts) => (
                  <button
                    key={attempts}
                    type="button"
                    onClick={() => setMaxAttempts(attempts)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      maxAttempts === attempts
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {attempts} ครั้ง {attempts === 3 ? '(แนะนำ)' : attempts === 1 ? '(สอบรอบเดียว)' : ''}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 2: PLATFORM & SYSTEM IDENTITY */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
          
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                2. ข้อมูลระบบและแพลตฟอร์ม (Platform & Profile)
              </h2>
              <p className="text-[11px] text-slate-500">
                กำหนดชื่อแพลตฟอร์มและอีเมลติดต่อประสานงานหลักของผู้ดูแลระบบ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* App Name */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                ชื่อแพลตฟอร์ม (App Name) *
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="เช่น EDTech หรือ RMUTI EDTech"
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                required
              />
              <p className="text-[10px] text-slate-400">
                แสดงบนแถบหัวข้อเว็บ เมนูด้านบน และรายงานผล
              </p>
            </div>

            {/* Admin Email */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                อีเมลติดต่อผู้ดูแลระบบ (Admin Email) *
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@rmuti.ac.th"
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                required
              />
              <p className="text-[10px] text-slate-400">
                อีเมลสำหรับรับข้อความแจ้งเตือนและแสดงเป็นช่องทางช่วยเหลือผู้เรียน
              </p>
            </div>

          </div>

          {/* Authentication Provider Card */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-2xs">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-slate-800">ระบบระบุตัวตน (Authentication Provider)</div>
                <div className="text-[11px] text-slate-500">Google Identity Services (OAuth 2.0 / GIS) กำหนดค่าพร้อมใช้งาน</div>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
              ● พร้อมใช้งาน (Active)
            </span>
          </div>
        </div>

        {/* SECTION 3: SECURITY & SESSION LIFECYCLE */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
          
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                3. ความปลอดภัยและระยะเวลาเซสชัน (Security & Session Lifecycle)
              </h2>
              <p className="text-[11px] text-slate-500">
                กำหนดเวลาหมดอายุการเข้าสู่ระบบเพื่อความปลอดภัย และจัดการข้อมูลแคช
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Session Timeout */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>ระยะเวลาเซสชันก่อนหมดอายุ (Session Timeout)</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-bold">
                      {sessionTimeout} นาที ({Math.round(sessionTimeout / 60 * 10) / 10} ชั่วโมง)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    หากไม่มีความเคลื่อนไหวเกินเวลาที่กำหนด ระบบจะทำการออกจากระบบโดยอัตโนมัติ
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="5"
                    max="480"
                    step="5"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <span className="font-bold text-slate-600">นาที</span>
                </div>
              </div>

              {/* Timeout Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-500 font-semibold">ช่วงเวลาแนะนำ:</span>
                {[
                  { label: '30 นาที (ปลอดภัยสูง)', value: 30 },
                  { label: '60 นาที (1 ชม.)', value: 60 },
                  { label: '120 นาที (2 ชม. ค่ามาตรฐาน)', value: 120 },
                  { label: '240 นาที (4 ชม.)', value: 240 },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSessionTimeout(item.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      sessionTimeout === item.value
                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage & Cache Management */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-slate-500" />
                  <span>การจัดการข้อมูลแคชและหน่วยความจำ (Client Storage)</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  ระบบบันทึกความคืบหน้า รายชื่อ และการตั้งค่าใน LocalStorage ของเบราว์เซอร์
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearCache}
                className="px-3.5 py-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>ล้างแคช LocalStorage</span>
              </button>
            </div>

          </div>
        </div>

        {/* BOTTOM STICKY ACTION BAR */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            คลิก <strong className="text-slate-800">"บันทึกการตั้งค่า"</strong> เพื่อนำค่าใหม่ไปใช้งานทันที
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>คืนค่าเริ่มต้น</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการตั้งค่าทั้งหมด</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
}
