'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, User, ArrowLeft, ShieldAlert, BookOpen } from 'lucide-react';
import { useAppStore } from '@/data/store';

export function LessonAccessGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoaded } = useAppStore();

  if (!isLoaded) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // แอดมินสามารถเข้าเรียนได้ทุกบทเรียนเสมอ
  if (currentUser.role === 'admin') {
    return <>{children}</>;
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
  const isProfileIncomplete = !currentUser.isProfileCompleted || !hasValidName || !hasValidStudentId;

  if (isProfileIncomplete) {
    return (
      <div className="max-w-2xl mx-auto my-8 sm:my-16 p-6 sm:p-10 bg-white rounded-3xl border-2 border-amber-200 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold px-3.5 py-1 bg-amber-100 text-amber-800 rounded-full inline-flex items-center gap-1.5 border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            <span>จำเป็นต้องระบุข้อมูลนักศึกษาก่อนเข้าเรียน</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            คุณต้องกรอกชื่อ-นามสกุล และรหัสนักศึกษาก่อนเริ่มเข้าเรียน
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
            เพื่อความถูกต้องในการบันทึกเวลาเรียน การทำแบบทดสอบก่อนเรียน/หลังเรียน และการออกคะแนนประเมินผล
            ระบบกำหนดให้นักศึกษาทุกคนต้องระบุชื่อ-นามสกุลจริง และรหัสนักศึกษาให้เรียบร้อยก่อน จึงจะสามารถเข้าศึกษาบทเรียนนี้ได้
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="flex items-center justify-between text-slate-500">
            <span>บัญชีที่เข้าสู่ระบบ:</span>
            <span className="font-mono font-bold text-slate-800 truncate max-w-[200px]">{currentUser.email}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>สถานะข้อมูลนักศึกษา:</span>
            <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
              ยังไม่ระบุชื่อและรหัสนักศึกษา
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้าแดชบอร์ด</span>
          </Link>
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent('edtech_open_profile_modal', {
                  detail: { reason: 'lesson_guard' },
                })
              )
            }
            className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-200 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" />
            <span>กรอกชื่อและรหัสนักศึกษาเดี๋ยวนี้</span>
          </button>
        </div>

      </div>
    );
  }

  return <>{children}</>;
}
