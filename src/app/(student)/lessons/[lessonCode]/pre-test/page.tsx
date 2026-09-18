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
  const { lessons, quizzes, progressMap } = useAppStore();

  const lesson = lessons.find((l) => l.code === lessonCode) || lessons[2];
  const quiz = quizzes.find((q) => q.type === 'pre_test' && q.lessonId === lesson.id) || quizzes[0];
  const questions = quiz.versions[0].questions;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showWarning, setShowWarning] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal Page 8
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Record pre-test completed in store
      const existing = progressMap[lesson.code] || {
        userId: 'usr-student-001',
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
        preTestScore: { score: 8, max: 10, percent: 80 },
        status: 'in_progress' as const,
      };

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
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้ารายละเอียดบทเรียน
        </Link>
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          แบบทดสอบก่อนเรียน
        </span>
      </div>

      {/* Main Quiz Box matching Page 7 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Header & Stepper */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {lesson.title}
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            แบบทดสอบก่อนเรียน (Pre-test)
          </h1>

          {/* Stepper Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-blue-700">ข้อที่ {currentIdx + 1} จาก {questions.length}</span>
              <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question Text */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <h2 className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed">
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
                    ? 'border-blue-600 bg-blue-50/60 text-blue-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>{opt.optionText}</span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isChecked ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
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
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-center gap-3 text-orange-800 text-xs">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
            <div>
              <span className="font-bold">กรุณาเลือกคำตอบก่อนต่อ</span>
              <p className="text-[11px] text-orange-700">คุณต้องเลือกคำตอบอย่างน้อย 1 ตัวเลือกเพื่อจะสามารถต่อไปได้</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons matching Page 7 */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              currentIdx === 0
                ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            ย้อนกลับ
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-200 cursor-pointer"
          >
            <span>{currentIdx === questions.length - 1 ? 'ส่งคำตอบ' : 'ส่งคำตอบ / ข้อถัดไป'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Confirmation Modal matching Page 8 (Quiz Confirmation) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center relative">
            
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warning Icon */}
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Title & Body matching Page 8 */}
            <h3 className="text-lg font-black text-slate-900">
              ยืนยันส่งคำตอบ?
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed px-2">
              เมื่อส่งคำตอบแล้ว คุณจะไม่สามารถแก้ไขคำตอบในการทำแบบทดสอบครั้งนี้ได้อีก โปรดตรวจสอบคำตอบให้เรียบร้อยก่อนส่ง
            </p>

            {/* Modal Actions matching Page 8 */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                กลับไปตรวจคำตอบ
              </button>

              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-200 transition flex items-center justify-center gap-2 cursor-pointer"
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
