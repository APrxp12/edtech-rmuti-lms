'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, User, GraduationCap, Mail, ShieldCheck, 
  CheckCircle2, AlertCircle, Save, LogOut 
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { siteBranding } from '@/config/site-branding';

export default function RequiredProfilePage() {
  const router = useRouter();
  const { currentUser, isLoaded, saveRequiredProfile } = useAppStore();

  const [fullName, setFullName] = useState(
    currentUser.fullName && !currentUser.fullName.includes('@') ? currentUser.fullName : ''
  );
  const [studentId, setStudentId] = useState(
    currentUser.studentId && currentUser.studentId !== '-' && currentUser.studentId !== '65123456789'
      ? currentUser.studentId
      : ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isLoaded) return;
    if (!currentUser?.email || !currentUser?.id) {
      router.replace('/login');
      return;
    }
    if (currentUser.role === 'admin') {
      router.replace('/admin/lessons');
      return;
    }
    const hasValidName = Boolean(
      currentUser.fullName &&
      currentUser.fullName.trim().length >= 3 &&
      !currentUser.fullName.includes('@')
    );
    const hasValidStudentId = Boolean(
      currentUser.studentId &&
      currentUser.studentId.trim() !== '' &&
      currentUser.studentId !== '-' &&
      currentUser.studentId !== '65123456789'
    );
    if (currentUser.isProfileCompleted && hasValidName && hasValidStudentId) {
      router.replace('/dashboard');
    }
  }, [isLoaded, currentUser, router]);

  React.useEffect(() => {
    if (currentUser?.fullName && !currentUser.fullName.includes('@')) {
      setFullName(currentUser.fullName);
    }
    if (currentUser?.studentId && currentUser.studentId !== '-' && currentUser.studentId !== '65123456789') {
      setStudentId(currentUser.studentId);
    }
  }, [currentUser]);

  const isValidName = fullName.trim().length >= 3;
  const isValidStudentId = /^[0-9A-Za-z-]{10,15}$/.test(studentId.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidName) {
      setErrorMessage('กรุณากรอกชื่อ - นามสกุลจริงให้ครบถ้วน (อย่างน้อย 3 ตัวอักษร)');
      return;
    }
    if (!isValidStudentId) {
      setErrorMessage('กรุณากรอกรหัสนักศึกษาให้ถูกต้อง (ตัวเลข 10-14 หลัก)');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await saveRequiredProfile(fullName.trim(), studentId.trim());
      setIsSaving(false);
      router.push('/dashboard');
    } catch (err) {
      setIsSaving(false);
      setErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-blue-50/50 via-white to-slate-50">
      
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white font-bold shadow-md">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase">{siteBranding.universityName}</div>
              <div className="text-lg font-black text-blue-900">EDTech</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <User className="w-4 h-4 text-slate-400" />
            <span>นักเรียน ไอดี</span>
          </div>
        </div>
      </nav>

      {/* Main Profile Form matching Page 2 */}
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero & Mascot */}
          <div className="md:col-span-5 space-y-4 text-center md:text-left">
            <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-200">
              ข้อมูลผู้ใช้งาน
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              กรอกข้อมูลผู้ใช้งาน
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              กรุณากรอกข้อมูลเพิ่มเติมเพื่อเข้าใช้งานระบบ EDTech และเริ่มต้นการเรียนรู้
            </p>
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 text-xs font-semibold text-blue-900">
              “ข้อมูลที่ถูกต้อง ช่วยให้การเรียนรู้ของคุณราบรื่นยิ่งขึ้น”
            </div>

            <div className="space-y-2 pt-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ข้อมูลของคุณปลอดภัย ตามมาตรฐานสากล</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>ใช้สำหรับการศึกษาและออกผลคะแนนเท่านั้น</span>
              </div>
            </div>
          </div>

          {/* Right Form Card matching Page 2 */}
          <div className="md:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
              <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">กรอกข้อมูลผู้ใช้งาน</h2>
                  <p className="text-[11px] text-slate-500">กรุณากรอกข้อมูลให้ครบถ้วนก่อนเข้าสู่ระบบ</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email Field (Read-only from Google) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    อีเมล (จาก Google)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={currentUser.email}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">อีเมลจาก Google ไม่สามารถแก้ไขได้</p>
                </div>

                {/* Full Name Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อ - นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="เช่น สมชาย ใจดี"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 transition ${
                        isValidName
                          ? 'border-emerald-300 focus:ring-emerald-500 bg-emerald-50/20'
                          : 'border-slate-200 focus:ring-blue-600 bg-white'
                      }`}
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  {isValidName ? (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>กรอกชื่อ - นามสกุลถูกต้อง</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1">กรุณากรอกชื่อและนามสกุลจริง</p>
                  )}
                </div>

                {/* Student ID Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    รหัสนักศึกษา <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="เช่น 65123456789"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 transition ${
                        isValidStudentId
                          ? 'border-emerald-300 focus:ring-emerald-500 bg-emerald-50/20'
                          : 'border-slate-200 focus:ring-blue-600 bg-white'
                      }`}
                    />
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  {isValidStudentId ? (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>รูปแบบรหัสนักศึกษาถูกต้อง</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1">ตัวเลข 11-13 หลักตามบัตรนักศึกษา</p>
                  )}
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Buttons matching Page 2 */}
                <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    ยกเลิก / ออกจากระบบ
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:flex-1 py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition cursor-pointer"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>บันทึกและเข้าสู่ระบบ</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
