'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, X, 
  HelpCircle, ShieldAlert
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';

export default function PreTestPage() {
  const router = useRouter();
  const params = useParams();
  const lessonCode = (params.lessonCode as string) || 'RMUTI-003';
  const { currentUser, lessons, quizzes, progressMap, saveUserLessonProgress } = useAppStore();

  const lesson = lessons.find((l) => l.code === lessonCode);

  const quiz = lesson 
    ? quizzes.find((q) => q.type === 'pre_test' && (q.lessonId === lesson.id || q.lessonId === lesson.code))
    : undefined;
  const questions = quiz?.versions?.[0]?.questions || [];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showWarning, setShowWarning] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal Page 8
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!lesson) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white">ไม่พบบทเรียน "{lessonCode}" ในระบบ</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          บทเรียนนี้อาจยังไม่ได้ถูกสร้าง หรือถูกลบออกจากระบบแล้ว กรุณาตรวจสอบรหัสบทเรียนหรือกลับสู่หน้ารายการบทเรียน
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่หน้ารายการบทเรียน</span>
          </Link>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white">บทเรียนนี้ยังไม่มีแบบทดสอบก่อนเรียน (Pre-test)</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          ผู้ดูแลระบบยังไม่ได้กำหนดข้อสอบก่อนเรียนสำหรับบทเรียนนี้ คุณสามารถเข้าสู่ห้องเรียนวิดีโอเพื่อศึกษาเนื้อหาได้ทันที
        </p>
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/lessons/${lesson.code}/intro`}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            กลับหน้าแนะนำบทเรียน
          </Link>
          <button
            type="button"
            onClick={() => {
              const existing = progressMap[lesson.code] || {
                userId: currentUser.id || 'usr-student',
                lessonId: lesson.code,
                assignedVersionId: 'v1',
                status: 'in_progress',
                progressPercent: 20,
                isPreTestCompleted: true,
                isPostTestUnlocked: false,
                postTestAttempts: [],
                preTestAttempts: [],
                watchedVideos: {},
                lastAccessedAt: new Date().toISOString(),
              };
              saveUserLessonProgress(lesson.code, {
                ...existing,
                isPreTestCompleted: true,
                status: 'in_progress',
              });
              router.push(`/lessons/${lesson.code}/learn`);
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            เข้าสู่ห้องเรียนวิดีโอทันที →
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx] || questions[0];
  const isSelected = !!selectedAnswers[currentQ.id];

  const handleSelectOption = (optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
    setShowWarning(false);
  };

  const handleNext = () => {
    if (!isSelected) {
      setShowWarning(true);
      return;
    }

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Last question -> open Page 8 Confirmation Dialog
      setShowConfirmModal(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      setShowWarning(false);
    }
  };

  const handleConfirmSubmit = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowConfirmModal(false);

      // ตรวจคะแนนตามคำตอบที่นักศึกษาเลือกจริง
      let correctCount = 0;
      questions.forEach((q) => {
        const correctOpt = q.options?.find((o) => o.isCorrect);
        if (correctOpt && selectedAnswers[q.id] === correctOpt.id) {
          correctCount++;
        }
      });
      const total = questions.length || 1;
      const percent = Math.round((correctCount / total) * 100);

      // Record pre-test completed in store & Supabase
      const existing = progressMap[lesson.code] || {
        userId: currentUser.id || 'usr-student',
        lessonId: lesson.code,
        assignedVersionId: 'v1',
        status: 'in_progress',
        progressPercent: 20,
        isPreTestCompleted: true,
        isPostTestUnlocked: false,
        postTestAttempts: [],
        preTestAttempts: [],
        watchedVideos: {},
        lastAccessedAt: new Date().toISOString(),
      };

      const updated = {
        ...existing,
        isPreTestCompleted: true,
        preTestScore: { score: correctCount, max: total, percent },
        status: 'in_progress' as const,
        lastAccessedAt: new Date().toISOString(),
      };

      saveUserLessonProgress(lesson.code, updated);

      // Navigate straight into Learning Page (Page 9)
      router.push(`/lessons/${lesson.code}/learn`);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Breadcrumbs matching Page 7 */}
      <div className="flex items-center justify-between">
        <Link
          href={`/lessons/${lesson.code}/intro`}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้ารายละเอียดบทเรียน
        </Link>
        <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
          แบบทดสอบก่อนเรียน
        </span>
      </div>

      {/* Main Quiz Box matching Page 7 */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Header & Stepper */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {lesson.title}
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            แบบทดสอบก่อนเรียน (Pre-test)
          </h1>

          {/* Stepper Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-blue-700 dark:text-blue-400">ข้อที่ {currentIdx + 1} จาก {questions.length}</span>
              <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question Text */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
            {currentQ.questionText}
          </h2>
        </div>

        {/* Options List matching Page 7 */}
        <div className="space-y-3">
          {currentQ.options.map((opt) => {
            const isChecked = selectedAnswers[currentQ.id] === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(opt.id)}
                className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition flex items-center justify-between cursor-pointer ${
                  isChecked
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/50 text-blue-950 dark:text-blue-200 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{opt.optionText}</span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isChecked ? 'border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                  }`}
                >
                  {isChecked && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Validation Warning Alert matching Page 7 */}
        {showWarning && (
          <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 flex items-center gap-3 text-orange-800 dark:text-orange-300 text-xs">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
            <div>
              <span className="font-bold">กรุณาเลือกคำตอบก่อนต่อ</span>
              <p className="text-[11px] text-orange-700 dark:text-orange-400">คุณต้องเลือกคำตอบอย่างน้อย 1 ตัวเลือกเพื่อจะสามารถต่อไปได้</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons matching Page 7 */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              currentIdx === 0
                ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            ย้อนกลับ
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-200 dark:shadow-none cursor-pointer"
          >
            <span>{currentIdx === questions.length - 1 ? 'ส่งคำตอบ' : 'ส่งคำตอบ / ข้อถัดไป'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Confirmation Modal matching Page 8 (Quiz Confirmation) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center relative">
            
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warning Icon */}
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-500 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Title & Body matching Page 8 */}
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              ยืนยันส่งคำตอบ?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed px-2">
              เมื่อส่งคำตอบแล้ว คุณจะไม่สามารถแก้ไขคำตอบในการทำแบบทดสอบครั้งนี้ได้อีก โปรดตรวจสอบคำตอบให้เรียบร้อยก่อนส่ง
            </p>

            {/* Modal Actions matching Page 8 */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                กลับไปตรวจคำตอบ
              </button>

              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-200 dark:shadow-none transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>ยืนยันส่งคำตอบ</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Loading Animation Modal matching Requirement 9 */}
      <LoadingOverlay
        isOpen={isSubmitting}
        message="กำลังบันทึกคะแนน Pre-test..."
        subMessage="ระบบกำลังคำนวณผลการทดสอบและนำคุณเข้าสู่ห้องเรียนวิดีโอ"
      />

    </div>
  );
}
