'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, GraduationCap, Calendar, ShieldCheck, 
  Award, BookOpen, CheckCircle2, ArrowLeft, LogOut,
  Save, Check, AlertCircle, Building2, BookMarked,
  FileCheck, Download, Sparkles, ExternalLink, X
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { siteBranding } from '@/config/site-branding';

export default function StudentProfilePage() {
  const router = useRouter();
  const { currentUser, lessons, progressMap, settings, updateUserProfile, logout } = useAppStore();

  // Form State
  const [fullName, setFullName] = useState(currentUser.fullName || currentUser.displayName || '');
  const [studentId, setStudentId] = useState(currentUser.studentId || '');
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Sync state when currentUser changes
  useEffect(() => {
    setFullName(currentUser.fullName || currentUser.displayName || '');
    setStudentId(currentUser.studentId || '');
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

    if (!fullName.trim()) {
      setErrorMessage('กรุณาระบุชื่อ-นามสกุล');
      return;
    }

    updateUserProfile({
      fullName: fullName.trim(),
      displayName: fullName.trim(),
      studentId: studentId.trim(),
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
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.displayName}
                      className="w-full h-full object-cover rounded-[22px]"
                    />
                  ) : (
                    <div className="w-full h-full rounded-[22px] bg-blue-50 flex items-center justify-center text-blue-600">
                      <User className="w-12 h-12" />
                    </div>
                  )}
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
                </div>

                <p className="text-xs sm:text-sm text-slate-600 flex items-center justify-center sm:justify-start gap-2 pt-1 font-mono">
                  <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>รหัสนักศึกษา: <strong>{currentUser.studentId || '-'}</strong></span>
                </p>

                <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{currentUser.email}</span>
                </p>

                {/* Registration Date (No Session 120 Mins) */}
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
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ชื่อ - นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="เช่น นายสมชาย ใจดี"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  ชื่อนี้จะปรากฏในหน้าหลัก ระบบคะแนน และใบประกาศนียบัตร
                </p>
              </div>

              {/* Student ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  รหัสนักศึกษา
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="เช่น 65123456789 หรือ -"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-mono transition"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  ระบุรหัสนักศึกษา 11-13 หลักของมหาวิทยาลัย
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
                  <p className="text-xs text-slate-500">บันทึกการศึกษาหลักสูตรเทคโนโลยีการศึกษา ประจำปีการศึกษา 2569</p>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                {isCourseCompleted ? '🏆 สำเร็จการศึกษา' : '🟢 อยู่ในสถานะปกติ'}
              </span>
            </div>

            <div className="p-6 divide-y divide-slate-100 text-xs sm:text-sm">
              
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  สถาบันการศึกษา
                </span>
                <span className="font-bold text-slate-900 text-right">
                  มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น
                </span>
              </div>

              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                  รายวิชาที่ลงทะเบียน
                </span>
                <span className="font-bold text-blue-900 text-right">
                  EDTech: การเรียนรู้แบบกำกับตนเองในยุคดิจิทัล (Self-Directed Learning)
                </span>
              </div>

              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  อาจารย์ผู้สอนประจำวิชา
                </span>
                <span className="font-bold text-slate-800 text-right">
                  อาจารย์ประจำสาขาวิชาเทคโนโลยีการศึกษา
                </span>
              </div>

              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  ภาคการศึกษา / ปีการศึกษา
                </span>
                <span className="font-bold text-slate-800 text-right">
                  ภาคการศึกษาที่ 1 / ปีการศึกษา 2569
                </span>
              </div>

              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                  หลักสูตรการศึกษา
                </span>
                <span className="font-bold text-slate-800 text-right">
                  หลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต (ค.อ.บ.)
                </span>
              </div>

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

          {/* Digital Certificate Box */}
          <div className={`p-6 rounded-3xl border transition-all ${
            isCourseCompleted 
              ? 'bg-gradient-to-br from-amber-500/10 via-amber-50 to-white border-amber-200 shadow-sm' 
              : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isCourseCompleted ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : 'bg-slate-100 text-slate-400'
                }`}>
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>ใบประกาศนียบัตรดิจิทัล (E-Certificate)</span>
                    {isCourseCompleted && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                        พร้อมรับ
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isCourseCompleted 
                      ? 'คุณได้สำเร็จการศึกษาครบ 100% สามารถเปิดดูและดาวน์โหลดใบประกาศนียบัตรได้' 
                      : `เรียนผ่านแล้ว ${completedCount} / ${totalLessons} บทเรียน (ทำต่ออีก ${totalLessons - completedCount} บท เพื่อปลดล็อกใบประกาศ)`}
                  </p>
                </div>
              </div>

              {isCourseCompleted ? (
                <button
                  onClick={() => setShowCertificateModal(true)}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-200 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Award className="w-4 h-4" />
                  <span>ดูใบประกาศนียบัตร</span>
                </button>
              ) : (
                <div className="text-xs text-slate-400 font-medium text-right shrink-0">
                  <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden mb-1">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${overallPercent}%` }}></div>
                  </div>
                  <span>สำเร็จแล้ว {overallPercent}%</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Digital Certificate Modal */}
      {showCertificateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setShowCertificateModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full border-4 border-amber-200/80 shadow-2xl p-6 sm:p-10 space-y-6 relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCertificateModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* University Logo & Certificate Header */}
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 mx-auto flex items-center justify-center text-white font-bold shadow-md">
                <BookOpen className="w-8 h-8 text-amber-400" />
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                {siteBranding.universityName}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                ใบประกาศนียบัตรสำเร็จการศึกษา
              </h3>
              <p className="text-xs text-amber-700 font-bold">CERTIFICATE OF ACHIEVEMENT</p>
            </div>

            <div className="space-y-3 py-4 border-y border-amber-100 bg-amber-50/40 rounded-2xl p-6">
              <p className="text-xs text-slate-500">ใบประกาศนียบัตรนี้มอบให้แก่</p>
              <h2 className="text-2xl sm:text-3xl font-black text-blue-900">
                {currentUser.fullName || currentUser.displayName}
              </h2>
              {currentUser.studentId && currentUser.studentId !== '-' && (
                <p className="text-xs font-mono font-bold text-slate-600">
                  รหัสนักศึกษา: {currentUser.studentId}
                </p>
              )}
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed pt-2">
                ได้สำเร็จการศึกษาและผ่านเกณฑ์การประเมินผลการเรียนรู้ในรายวิชา
                <br />
                <strong className="text-slate-900">EDTech: การเรียนรู้แบบกำกับตนเองในยุคดิจิทัล</strong>
                <br />
                ครบถ้วนตามหลักสูตรการเรียนรู้ด้วยตนเอง ประจำปีการศึกษา 2569
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-slate-500">
              <div>
                <span>ออกให้ ณ วันที่: </span>
                <strong className="text-slate-800">
                  {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                </strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>พิมพ์ / บันทึก PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
