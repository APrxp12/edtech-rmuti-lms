'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  User, GraduationCap, Mail, ShieldAlert, CheckCircle2, 
  AlertCircle, Save, ArrowLeft, Sparkles, X, Lock, ExternalLink 
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { 
  parseFullName, 
  isFullNameComplete, 
  isStudentIdComplete, 
  isProfileComplete 
} from '@/lib/profileValidation';

export function RequiredProfileModal() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isLoaded, saveRequiredProfile } = useAppStore();

  const isStudent = currentUser.role === 'student';
  const hasCompleteName = isFullNameComplete(currentUser.fullName);
  const hasCompleteStudentId = isStudentIdComplete(currentUser.studentId);
  const isProfileCompleteState = Boolean(
    currentUser.isProfileCompleted && hasCompleteName && hasCompleteStudentId
  );

  // บังคับกรอกเฉพาะเมื่อโหลดเสร็จแล้ว เป็นนักศึกษา และยังกรอกข้อมูลไม่ครบทุกช่อง
  const isIncomplete = Boolean(
    isLoaded &&
    currentUser.email &&
    isStudent &&
    !isProfileCompleteState
  );

  const isLessonPage = pathname?.includes('/lessons/');

  const [isOpen, setIsOpen] = useState(false);
  const [isForced, setIsForced] = useState(false);
  const [forceReason, setForceReason] = useState<string | null>(null);
  const [pendingDestination, setPendingDestination] = useState<string | null>(null);

  const [titlePrefix, setTitlePrefix] = useState('นาย');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ตรวจจับสถานะข้อมูลโปรไฟล์เมื่อโหลดหน้าเว็บ
  useEffect(() => {
    if (!isLoaded || !currentUser.email) {
      setIsOpen(false);
      return;
    }

    // แอดมิน หรือนักศึกษาที่กรอกครบทุกช่องแล้ว -> ปิด Modal ทันที และไม่เด้งขึ้นมา
    if (!isStudent || isProfileCompleteState) {
      setIsOpen(false);
      setIsForced(false);
      setForceReason(null);
      return;
    }

    // สำหรับนักศึกษาที่ยังกรอกไม่ครบ (รวมถึงคนที่เคยใส่แค่ชื่อ)
    if (isIncomplete) {
      setIsOpen(true);
      if (isLessonPage) {
        setIsForced(true);
        setForceReason('กรุณาระบุชื่อ นามสกุล และรหัสนักศึกษาก่อนเริ่มเข้าเรียน');
      }
    }
  }, [isLoaded, currentUser.email, isStudent, isProfileCompleteState, isIncomplete, isLessonPage]);

  // ซิงค์ค่าเริ่มต้นจาก currentUser
  useEffect(() => {
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
  }, [currentUser.fullName, currentUser.displayName, currentUser.studentId]);

  // ดักฟังสัญญาณสั่งเปิด Modal จากภายนอก (เช่น เมื่อคลิกเริ่มเรียนแล้วโดนบล็อก หรือคลิกแก้ไขจาก Navbar)
  useEffect(() => {
    const handleOpenModal = (event: any) => {
      // แอดมินไม่ต้องเปิดป็อบอัพข้อมูลนักศึกษา
      if (currentUser.role === 'admin') return;

      const detail = event?.detail || {};
      if (detail.reason === 'lesson_blocked' || detail.reason === 'lesson_guard') {
        setIsForced(true);
        setForceReason(
          detail.message ||
            (detail.lessonTitle
              ? `ไม่สามารถเข้าเรียน "${detail.lessonTitle}" ได้: คุณต้องระบุชื่อ นามสกุล และรหัสนักศึกษาก่อน`
              : 'กรุณากรอกชื่อ นามสกุล และรหัสนักศึกษาก่อนเริ่มเข้าเรียน')
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
  }, [currentUser.role]);

  // ถ้ายังโหลดไม่เสร็จ หรือไม่ได้ล็อกอิน หรือเป็น Admin หรือ Modal ไม่ได้เปิด -> ไม่เรนเดอร์อะไรเลย
  if (!isLoaded || !currentUser.email) return null;
  if (currentUser.role === 'admin') return null;
  if (!isOpen) return null;

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

          {/* Prefix Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              คำนำหน้าชื่อ <span className="text-red-500">*</span>
            </label>
            <select
              value={titlePrefix}
              onChange={(e) => setTitlePrefix(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="นาย">นาย</option>
              <option value="นางสาว">นางสาว</option>
              <option value="นาง">นาง</option>
            </select>
          </div>

          {/* First Name & Last Name in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* First Name Input */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                ชื่อจริง (ภาษาไทย) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="เช่น สมชาย หรือ พีรพล"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoFocus
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 transition ${
                    isValidFirst
                      ? 'border-emerald-300 focus:ring-emerald-500 bg-emerald-50/20'
                      : 'border-slate-200 focus:ring-blue-600 bg-white'
                  }`}
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              {isValidFirst ? (
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ระบุชื่อเรียบร้อย</span>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1">กรอกชื่อจริง (บังคับ)</p>
              )}
            </div>

            {/* Last Name Input */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                นามสกุล (ภาษาไทย) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="เช่น ใจดี หรือ น้อยโนนงิ้ว"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 transition ${
                    isValidLast
                      ? 'border-emerald-300 focus:ring-emerald-500 bg-emerald-50/20'
                      : 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                  }`}
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              {isValidLast ? (
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ระบุนามสกุลเรียบร้อย</span>
                </div>
              ) : (
                <p className="text-[10px] text-rose-500 font-medium mt-1">กรุณาระบุนามสกุล (บังคับ)</p>
              )}
            </div>
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
                required
              />
              <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            {isValidStudentId ? (
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>รูปแบบรหัสนักศึกษาถูกต้อง</span>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1">ตัวเลข 10-15 หลักตามบัตรนักศึกษา (บังคับ)</p>
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
