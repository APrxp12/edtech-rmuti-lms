'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, User, GraduationCap, Mail, ShieldCheck, 
  CheckCircle2, AlertCircle, Save, LogOut 
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { siteBranding } from '@/config/site-branding';
import { 
  parseFullName, 
  isFullNameComplete, 
  isStudentIdComplete, 
  isProfileComplete 
} from '@/lib/profileValidation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function RequiredProfilePage() {
  const router = useRouter();
  const { currentUser, isLoaded, saveRequiredProfile } = useAppStore();

  const [titlePrefix, setTitlePrefix] = useState('นาย');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
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
    if (isProfileComplete(currentUser)) {
      router.replace('/dashboard');
    }
  }, [isLoaded, currentUser, router]);

  React.useEffect(() => {
    const parsed = parseFullName(currentUser.fullName || currentUser.displayName || '');
    setTitlePrefix(parsed.prefix || 'นาย');
    setFirstName(parsed.first || '');
    setLastName(parsed.last || '');
    if (
      currentUser.studentId &&
      currentUser.studentId !== '-' &&
      currentUser.studentId !== '65123456789'
    ) {
      setStudentId(currentUser.studentId);
    }
  }, [currentUser]);

  const cleanedFirst = firstName.replace(/^(นาย|นางสาว|นาง|ด\.ช\.|ด\.ญ\.)\s*/i, '').trim();
  const cleanedLast = lastName.trim();
  const cleanedStudentId = studentId.trim();

  const isValidFirst = cleanedFirst.length >= 2;
  const isValidLast = cleanedLast.length >= 2;
  const isValidStudentId = isStudentIdComplete(cleanedStudentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titlePrefix) {
      setErrorMessage('กรุณาเลือกคำนำหน้าชื่อ');
      return;
    }
    if (!isValidFirst) {
      setErrorMessage('กรุณากรอกชื่อจริงให้ครบถ้วน (อย่างน้อย 2 ตัวอักษร)');
      return;
    }
    if (!isValidLast) {
      setErrorMessage('กรุณากรอกนามสกุลให้ครบถ้วน (อย่างน้อย 2 ตัวอักษร)');
      return;
    }
    if (!isValidStudentId) {
      setErrorMessage('กรุณากรอกรหัสนักศึกษาให้ถูกต้อง (ตัวเลข 10-15 หลัก เช่น 653321102001-1)');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const fullOfficialName = `${titlePrefix}${cleanedFirst} ${cleanedLast}`.trim();
      await saveRequiredProfile(fullOfficialName, cleanedStudentId);
      setIsSaving(false);
      router.push('/dashboard');
    } catch (err) {
      setIsSaving(false);
      setErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-blue-50/50 via-white to-slate-50 dark:from-slate-950 dark:via-[#0B0F19] dark:to-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Top Navbar */}
      <nav className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white font-bold shadow-md">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">{siteBranding.universityName}</div>
              <div className="text-lg font-black text-blue-900 dark:text-blue-400">EDTech</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <User className="w-4 h-4 text-slate-400" />
              <span>นักเรียน ไอดี</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Profile Form matching Page 2 */}
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero & Mascot */}
          <div className="md:col-span-5 space-y-4 text-center md:text-left">
            <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              ข้อมูลผู้ใช้งาน
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              กรอกข้อมูลผู้ใช้งาน
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              กรุณากรอกข้อมูลเพิ่มเติมเพื่อเข้าใช้งานระบบ EDTech และเริ่มต้นการเรียนรู้
            </p>
            <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-xs font-semibold text-blue-900 dark:text-blue-300">
              “ข้อมูลที่ถูกต้อง ช่วยให้การเรียนรู้ของคุณราบรื่นยิ่งขึ้น”
            </div>

            <div className="space-y-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>ข้อมูลของคุณปลอดภัย ตามมาตรฐานสากล</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>ใช้สำหรับการศึกษาและออกผลคะแนนเท่านั้น</span>
              </div>
            </div>
          </div>

          {/* Right Form Card matching Page 2 */}
          <div className="md:col-span-7">
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">กรอกข้อมูลผู้ใช้งาน</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">กรุณากรอกข้อมูลให้ครบถ้วนก่อนเข้าสู่ระบบ</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email Field (Read-only from Google) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    อีเมล (จาก Google)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={currentUser.email}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">อีเมลจาก Google ไม่สามารถแก้ไขได้</p>
                </div>

                {/* Prefix Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    คำนำหน้าชื่อ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={titlePrefix}
                    onChange={(e) => setTitlePrefix(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="นาย" className="dark:bg-slate-800 dark:text-white">นาย</option>
                    <option value="นางสาว" className="dark:bg-slate-800 dark:text-white">นางสาว</option>
                    <option value="นาง" className="dark:bg-slate-800 dark:text-white">นาง</option>
                  </select>
                </div>

                {/* First Name & Last Name Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* First Name Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      ชื่อจริง (ภาษาไทย) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="เช่น สมชาย หรือ พีรพล"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 transition text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                          isValidFirst
                            ? 'border-emerald-300 dark:border-emerald-700 focus:ring-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-blue-600 bg-white dark:bg-slate-800'
                        }`}
                        required
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    {isValidFirst ? (
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ระบุชื่อจริงถูกต้อง</span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">กรุณากรอกชื่อจริง (บังคับ)</p>
                    )}
                  </div>

                  {/* Last Name Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      นามสกุล (ภาษาไทย) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="เช่น ใจดี หรือ น้อยโนนงิ้ว"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 transition text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                          isValidLast
                            ? 'border-emerald-300 dark:border-emerald-700 focus:ring-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                            : 'border-rose-300 dark:border-rose-700 focus:ring-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
                        }`}
                        required
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    {isValidLast ? (
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ระบุนามสกุลถูกต้อง</span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-rose-500 dark:text-rose-400 font-medium mt-1">กรุณากรอกนามสกุล (บังคับ)</p>
                    )}
                  </div>
                </div>

                {/* Student ID Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    รหัสนักศึกษา <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="เช่น 653321102001-1 หรือ 65123456789"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 transition font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                        isValidStudentId
                          ? 'border-emerald-300 dark:border-emerald-700 focus:ring-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-blue-600 bg-white dark:bg-slate-800'
                      }`}
                      required
                    />
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  {isValidStudentId ? (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>รูปแบบรหัสนักศึกษาถูกต้อง</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">ตัวเลข 10-15 หลักตามบัตรนักศึกษา (บังคับ)</p>
                  )}
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Buttons matching Page 2 */}
                <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    ยกเลิก / ออกจากระบบ
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:flex-1 py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-200 dark:shadow-none transition cursor-pointer"
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
