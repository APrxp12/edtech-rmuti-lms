'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, GraduationCap, Calendar, ShieldCheck, 
  Award, BookOpen, CheckCircle2, ArrowLeft, LogOut,
  Save, Check, AlertCircle, BookMarked,
  FileCheck, FileText
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAppStore } from '@/data/store';
import { parseFullName, isStudentIdComplete } from '@/lib/profileValidation';

export default function StudentProfilePage() {
  const router = useRouter();
  const { currentUser, lessons, progressMap, settings, updateUserProfile, logout } = useAppStore();

  // Form State
  const initialParsed = parseFullName(currentUser.fullName || currentUser.displayName || '');
  const [titlePrefix, setTitlePrefix] = useState(initialParsed.prefix);
  const [firstName, setFirstName] = useState(initialParsed.first);
  const [lastName, setLastName] = useState(initialParsed.last);
  const [studentId, setStudentId] = useState(
    currentUser.studentId && currentUser.studentId !== '-' && currentUser.studentId !== '65123456789'
      ? currentUser.studentId
      : ''
  );
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when currentUser changes
  useEffect(() => {
    const parsed = parseFullName(currentUser.fullName || currentUser.displayName || '');
    setTitlePrefix(parsed.prefix);
    setFirstName(parsed.first);
    setLastName(parsed.last);
    setStudentId(
      currentUser.studentId && currentUser.studentId !== '-' && currentUser.studentId !== '65123456789'
        ? currentUser.studentId
        : ''
    );
  }, [currentUser]);

  // Compute course statistics
  const completedCount = Object.values(progressMap).filter((p) => p.status === 'passed' || p.progressPercent === 100).length;
  const inProgressCount = Object.values(progressMap).filter((p) => p.status === 'in_progress' || (p.progressPercent > 0 && p.progressPercent < 100)).length;
  const totalLessons = lessons.length || 8;
  const overallPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isCourseCompleted = overallPercent === 100;

  // Handle Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Sanitize any accidentally typed title prefix in firstName
    const cleanedFirst = firstName.replace(/^(นาย|นางสาว|นาง|ด\.ช\.|ด\.ญ\.)\s*/i, '').trim();
    const cleanedLast = lastName.trim();
    const cleanedStudentId = studentId.trim();

    if (!titlePrefix) {
      setErrorMessage('กรุณาเลือกคำนำหน้าชื่อ');
      return;
    }

    if (!cleanedFirst || cleanedFirst.length < 2) {
      setErrorMessage('กรุณากรอกชื่อจริงให้ถูกต้อง (อย่างน้อย 2 ตัวอักษร)');
      return;
    }

    if (!cleanedLast || cleanedLast.length < 2) {
      setErrorMessage('กรุณากรอกนามสกุลให้ครบถ้วน (อย่างน้อย 2 ตัวอักษร)');
      return;
    }

    if (!cleanedStudentId || !isStudentIdComplete(cleanedStudentId)) {
      setErrorMessage('กรุณากรอกรหัสนักศึกษาให้ถูกต้อง (ตัวเลข 10-15 หลัก เช่น 653321102001-1)');
      return;
    }

    const fullOfficialName = `${titlePrefix}${cleanedFirst} ${cleanedLast}`.trim();
    const cleanDisplayName = `${cleanedFirst} ${cleanedLast}`.trim();

    updateUserProfile({
      fullName: fullOfficialName,
      displayName: cleanDisplayName,
      studentId: cleanedStudentId,
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="w-full max-w-[1500px] mx-auto space-y-6 pb-16">
      
      {/* Top Breadcrumb & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition flex items-center justify-center shadow-2xs"
            title="กลับหน้าหลัก"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">ข้อมูลส่วนตัวและประวัติการเรียน</h1>
            <p className="text-xs text-slate-500">จัดการข้อมูลผู้ใช้งานและตรวจสอบสถานะการศึกษาอย่างเป็นทางการ</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200 shadow-2xs flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            <span>ระบบการเรียนรู้ EDTech RMUTI</span>
          </span>
        </div>
      </div>

      {/* Main Responsive Split Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (5 Cols): Profile ID Card & Edit Form */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* User Profile Badge Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              
              {/* Avatar with Verified Ring */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-blue-700 to-indigo-900 p-1 shadow-md">
                  <UserAvatar
                    src={currentUser.avatarUrl}
                    name={currentUser.fullName || currentUser.displayName}
                    email={currentUser.email}
                    size="xl"
                    rounded="rounded-[22px]"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full ring-4 ring-white shadow-xs" title="บัญชีผ่านการยืนยันตัวตน">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              {/* Identity Details */}
              <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                    {currentUser.fullName || currentUser.displayName}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                  <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {currentUser.role === 'student' ? 'นักศึกษา' : 'ผู้ดูแลระบบ (Admin)'}
                  </span>
                  <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    สถานะ: ปกติ (Active)
                  </span>
                  {((currentUser.avatarUrl && currentUser.avatarUrl.includes('googleusercontent.com')) || currentUser.email.toLowerCase().endsWith('@gmail.com')) && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                      <svg className="w-3 h-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>บัญชี Google</span>
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 flex items-center justify-center sm:justify-start gap-2 pt-1 font-mono">
                  <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>รหัสนักศึกษา: <strong>{currentUser.studentId || '-'}</strong></span>
                </p>

                <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{currentUser.email}</span>
                </p>

                {/* Registration Date */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>เข้าใช้งานระบบครั้งแรก: {new Date(currentUser.firstLoginAt).toLocaleDateString('th-TH', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Interactive Edit Profile Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">แก้ไขข้อมูลส่วนตัว</h3>
                  <p className="text-xs text-slate-500">ปรับปรุงข้อมูลชื่อและรหัสนักศึกษา</p>
                </div>
              </div>
            </div>

            {/* Success Alert */}
            {isSaved && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว ข้อมูลในระบบจะอัปเดตทันที</span>
              </div>
            )}

            {/* Error Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Prefix Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  คำนำหน้าชื่อ <span className="text-red-500">*</span>
                </label>
                <select
                  value={titlePrefix}
                  onChange={(e) => setTitlePrefix(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition cursor-pointer font-medium text-slate-800"
                >
                  <option value="นาย">นาย</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="นาง">นาง</option>
                </select>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ชื่อ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="เช่น ตั้งใจ"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="เช่น ใจดี"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  กรุณากรอกนามสกุลจริงตามทะเบียนนักศึกษา (บังคับทุกช่อง)
                </p>
              </div>

              {/* Student ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  รหัสนักศึกษา <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="เช่น 653321102001-1 หรือ 65123456789"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-mono transition"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  ตัวเลข 10-15 หลักตามบัตรประจำตัวนักศึกษา (เช่น 653321102001-1)
                </p>
              </div>

              {/* Google Email (Readonly) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>อีเมล Google Workspace</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    ยืนยันตัวตนแล้ว
                  </span>
                </label>
                <input
                  type="text"
                  value={currentUser.email}
                  disabled
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  เชื่อมโยงกับบัญชี Google ไม่สามารถเปลี่ยนแปลงได้
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-200 hover:shadow-lg transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกการเปลี่ยนแปลง</span>
                </button>
              </div>

            </form>
          </div>

          {/* Logout Section */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800">ต้องการออกจากระบบ?</span>
              <p className="text-[11px] text-slate-500">ออกจากเซสชันปัจจุบันเพื่อความปลอดภัย</p>
            </div>
            <button
              onClick={handleLogout}
              className="py-2 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>

        </div>

        {/* Right Column (7 Cols): Academic Record & Learning Stats */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 3 Learning Statistics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-bold">บทเรียนที่ผ่านเกณฑ์</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {completedCount} <span className="text-sm font-normal text-slate-500">/ {totalLessons} บท</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${overallPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-bold">บทเรียนที่กำลังศึกษา</span>
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {inProgressCount} <span className="text-sm font-normal text-slate-500">บทเรียน</span>
              </div>
              <p className="text-xs text-slate-500">อยู่ระหว่างศึกษาเนื้อหาหรือสอบ</p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-bold">เกณฑ์ผ่านการประเมิน</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {settings.defaultPassScorePercent}%
              </div>
              <p className="text-xs text-slate-500">คะแนนขั้นต่ำของแบบทดสอบ Post-test</p>
            </div>

          </div>

          {/* Official Academic & Course Enrollment Record */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-blue-50/50 via-white to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <BookMarked className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    ข้อมูลการลงทะเบียนและสถานะรายวิชาทางการ
                  </h3>
                  <p className="text-xs text-slate-500">บันทึกการศึกษาสาขาวิชาครุศาสตร์อุตสาหกรรมอุตสาหการ ประจำปีการศึกษา 2569</p>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                {isCourseCompleted ? '🏆 สำเร็จการศึกษา' : '🟢 อยู่ในสถานะปกติ'}
              </span>
            </div>

            <div className="p-6 divide-y divide-slate-100 text-xs sm:text-sm">
              
              {/* 1. รายวิชาที่ลงทะเบียน */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                  รายวิชาที่ลงทะเบียน
                </span>
                <span className="font-bold text-blue-900 text-right">
                  นวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้
                </span>
              </div>

              {/* 2. รหัสวิชา */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  รหัสวิชา
                </span>
                <span className="font-mono font-bold text-indigo-900 text-right text-sm sm:text-base">
                  30-401-001-204
                </span>
              </div>

              {/* 3. อาจารย์ผู้สอนประจำวิชา */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  อาจารย์ผู้สอนประจำวิชา
                </span>
                <span className="font-bold text-slate-800 text-right">
                  ผศ.ดร.เฉลิมพล บุญทศ
                </span>
              </div>

              {/* 4. ภาคการศึกษา / ปีการศึกษา */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  ภาคการศึกษา / ปีการศึกษา
                </span>
                <span className="font-bold text-slate-800 text-right">
                  ภาคการศึกษาที่ 1 / ปีการศึกษา 2569
                </span>
              </div>

              {/* 5. หลักสูตรการศึกษา */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                  หลักสูตรการศึกษา
                </span>
                <span className="font-bold text-slate-800 text-right">
                  หลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต (ค.อ.บ.)
                </span>
              </div>

              {/* 6. สถานะความก้าวหน้าโดยรวม */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  สถานะความก้าวหน้าโดยรวม
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                  เรียนผ่าน {completedCount} จากทั้งหมด {totalLessons} บทเรียน ({overallPercent}%)
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
