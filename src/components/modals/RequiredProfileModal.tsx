'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  User, GraduationCap, Mail, ShieldAlert, CheckCircle2, 
  AlertCircle, Save, ArrowLeft, Sparkles, X, Lock, ExternalLink 
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { UserAvatar } from '@/components/ui/UserAvatar';

export function RequiredProfileModal() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, saveRequiredProfile } = useAppStore();

  const isStudent = currentUser.role === 'student';
  const isIncomplete =
    isStudent &&
    (!currentUser.isProfileCompleted ||
      !currentUser.studentId ||
      currentUser.studentId.trim() === '' ||
      currentUser.studentId === '-' ||
      currentUser.studentId === '65123456789' ||
      !currentUser.fullName ||
      currentUser.fullName.trim() === '');

  const isLessonPage = pathname?.includes('/lessons/');

  const [isOpen, setIsOpen] = useState(false);
  const [isForced, setIsForced] = useState(false);
  const [forceReason, setForceReason] = useState<string | null>(null);
  const [pendingDestination, setPendingDestination] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ตรวจจับสถานะข้อมูลโปรไฟล์เมื่อโหลดหน้าเว็บ
  useEffect(() => {
    if (isIncomplete) {
      setIsOpen(true);
      if (isLessonPage) {
        setIsForced(true);
        setForceReason('กรุณาระบุชื่อ-นามสกุล และรหัสนักศึกษาก่อนเริ่มเข้าเรียน');
      }
    }
  }, [isIncomplete, isLessonPage]);

  // ซิงค์ค่าเริ่มต้นจาก currentUser (ถ้าเคยมีค่าที่ถูกต้อง)
  useEffect(() => {
    if (currentUser.fullName && !currentUser.fullName.includes('@')) {
      setFullName(currentUser.fullName);
    }
    if (
      currentUser.studentId &&
      currentUser.studentId !== '-' &&
      currentUser.studentId !== '65123456789'
    ) {
      setStudentId(currentUser.studentId);
    }
  }, [currentUser]);

  // ดักฟังสัญญาณสั่งเปิด Modal จากภายนอก (เช่น เมื่อคลิกเริ่มเรียนแล้วโดนบล็อก)
  useEffect(() => {
    const handleOpenModal = (event: any) => {
      const detail = event?.detail || {};
      if (detail.reason === 'lesson_blocked' || detail.reason === 'lesson_guard') {
        setIsForced(true);
        setForceReason(
          detail.message ||
            (detail.lessonTitle
              ? `ไม่สามารถเข้าเรียน "${detail.lessonTitle}" ได้: คุณต้องระบุชื่อและรหัสนักศึกษาก่อน`
              : 'กรุณากรอกชื่อ-นามสกุล และรหัสนักศึกษาก่อนเริ่มเข้าเรียน')
        );
        if (detail.destinationUrl) {
          setPendingDestination(detail.destinationUrl);
        }
      } else {
        setIsForced(false);
        setForceReason(null);
      }
      setIsOpen(true);
    };

    const handleSaved = () => {
      setIsOpen(false);
      setIsForced(false);
      setForceReason(null);
    };

    window.addEventListener('edtech_open_profile_modal', handleOpenModal);
    window.addEventListener('edtech_profile_saved', handleSaved);

    return () => {
      window.removeEventListener('edtech_open_profile_modal', handleOpenModal);
      window.removeEventListener('edtech_profile_saved', handleSaved);
    };
  }, []);

  if (!isOpen) return null;

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
      setIsOpen(false);

      // ถ้านักศึกษาคลิกบทเรียนค้างไว้ นำทางไปยังบทเรียนนั้นทันที
      if (pendingDestination) {
        router.push(pendingDestination);
        setPendingDestination(null);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
      setIsSaving(false);
    }
  };

  const handleDismiss = () => {
    if (isLessonPage) {
      // หากอยู่ในหน้าบทเรียน แล้วผู้ใช้ต้องการปิด Modal ให้พากลับหน้า Dashboard
      router.push('/dashboard');
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button (เฉพาะเมื่อไม่ได้อยู่ในหน้าบทเรียน) */}
        {!isLessonPage && (
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
            title="ปิดหน้าต่างนี้ชั่วคราว"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Modal Header */}
        <div className="space-y-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                isForced || isLessonPage
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              {isForced || isLessonPage ? (
                <>
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>บังคับกรอกข้อมูลก่อนเริ่มเรียน</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>ข้อมูลนักศึกษา (ครั้งแรก)</span>
                </>
              )}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {isForced || isLessonPage
              ? 'กรุณาระบุข้อมูลนักศึกษาเพื่อเริ่มเรียน'
              : 'กรอกข้อมูลนักศึกษาเพื่อเริ่มต้นใช้งาน'}
          </h2>

          {forceReason ? (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div className="font-medium leading-relaxed">{forceReason}</div>
            </div>
          ) : (
            <p className="text-xs text-slate-600 leading-relaxed">
              ยินดีต้อนรับสู่ระบบ EDTech กรุณาระบุชื่อ-นามสกุลจริง และรหัสนักศึกษา เพื่อใช้ในการบันทึกประวัติการเรียน การทำแบบทดสอบ และการออกผลคะแนน
            </p>
          )}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Readonly Google Account Display */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <UserAvatar
                src={currentUser.avatarUrl}
                name={currentUser.fullName || currentUser.displayName}
                email={currentUser.email}
                size="sm"
                rounded="rounded-xl"
                showGoogleBadge={true}
                className="w-9 h-9 border border-blue-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase">บัญชี Google ที่เข้าสู่ระบบ</div>
                <div className="text-xs font-mono font-bold text-slate-800 truncate">{currentUser.email}</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>ยืนยันแล้ว</span>
            </span>
          </div>

          {/* Full Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              ชื่อ - นามสกุลจริง (ภาษาไทย) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="เช่น นายสมชาย ใจดี หรือ สมหญิง รักเรียน"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoFocus
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 transition ${
                  isValidName
                    ? 'border-emerald-300 focus:ring-emerald-500 bg-emerald-50/20'
                    : 'border-slate-200 focus:ring-blue-600 bg-white'
                }`}
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            {isValidName ? (
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>ระบุชื่อ-นามสกุลเรียบร้อย</span>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1">กรอกชื่อและนามสกุลจริงตามทะเบียนนักศึกษา</p>
            )}
          </div>

          {/* Student ID Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              รหัสนักศึกษา <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="เช่น 653321102001-1 หรือ 65123456789"
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
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>รูปแบบรหัสนักศึกษาถูกต้อง</span>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1">ตัวเลข 10-14 หลักตามบัตรนักศึกษา</p>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {isLessonPage ? (
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>กลับแดชบอร์ด</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>ดูภาพรวมก่อน</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition cursor-pointer"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>บันทึกข้อมูลและเข้าสู่ระบบ</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] text-center text-slate-400 pt-1">
            🔒 ข้อมูลของคุณปลอดภัยและใช้เพื่อการประเมินผลการเรียนรู้รายวิชาเท่านั้น
          </p>

        </form>

      </div>
    </div>
  );
}
