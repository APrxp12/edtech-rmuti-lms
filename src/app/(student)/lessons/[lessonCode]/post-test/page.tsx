'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Wifi, 
  HelpCircle, Award, RotateCcw, Clock, ShieldCheck
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { QuizAttempt } from '@/types';

export default function PostTestPage() {
  const router = useRouter();
  const params = useParams();
  const lessonCode = (params.lessonCode as string) || 'RMUTI-003';
  const { currentUser, lessons, quizzes, progressMap, settings, saveUserLessonProgress } = useAppStore();

  const lesson = lessons.find((l) => l.code === lessonCode);
  const quiz = lesson
    ? quizzes.find((q) => q.type === 'post_test' && (q.lessonId === lesson.id || q.lessonId === lesson.code))
    : undefined;
  const questions = quiz?.versions?.[0]?.questions || [];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showWarning, setShowWarning] = useState(false);
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
        <h1 className="text-xl font-black text-slate-900 dark:text-white">บทเรียนนี้ยังไม่มีแบบทดสอบหลังเรียน (Post-test)</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          ผู้ดูแลระบบยังไม่ได้กำหนดข้อสอบหลังเรียนสำหรับบทเรียนนี้ คุณสามารถกลับไปทบทวนเนื้อหาหรือกลับสู่หน้าหลักได้
        </p>
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/lessons/${lesson.code}/learn`}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            กลับสู่ห้องเรียนวิดีโอ
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
          >
            กลับสู่แดชบอร์ดหลัก
          </Link>
        </div>
      </div>
    );
  }

  const passScorePercent = quiz?.versions?.[0]?.passScorePercent ?? 60;
  const maxAttempts = quiz?.versions?.[0]?.maxAttempts ?? 3;

  const currentQ = questions[currentIdx] || questions[0];
  const isSelected = !!selectedAnswers[currentQ.id];

  const handleSelectOption = (optId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optId,
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
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      setShowWarning(false);
    }
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      setShowWarning(true);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // คำนวณคะแนนตามที่นักศึกษาตอบจริง
      let correctCount = 0;
      questions.forEach((q) => {
        const correctOpt = q.options.find((o) => o.isCorrect);
        if (correctOpt && selectedAnswers[q.id] === correctOpt.id) {
          correctCount++;
        }
      });

      const totalQ = questions.length || 1;
      const scorePercent = Math.round((correctCount / totalQ) * 100);
      const isPassed = scorePercent >= passScorePercent;

      const existing = progressMap[lesson.code] || {
        userId: currentUser.id || 'usr-student',
        lessonId: lesson.code,
        assignedVersionId: 'v1',
        status: 'in_progress',
        progressPercent: 80,
        isPreTestCompleted: true,
        isPostTestUnlocked: true,
        postTestAttempts: [],
        preTestAttempts: [],
        watchedVideos: {},
        lastAccessedAt: new Date().toISOString(),
      };

      const newAttempt: QuizAttempt = {
        id: `att-${Date.now()}`,
        quizId: quiz?.id || `quiz-post-${lesson.code}`,
        quizVersionId: quiz?.versions?.[0]?.id || 'v1',
        quizType: 'post_test',
        attemptNumber: (existing.postTestAttempts?.length || 0) + 1,
        scoreObtained: correctCount,
        maxScore: totalQ,
        scorePercent,
        isPassed,
        isCountedInFinal: true,
        submittedAt: new Date().toISOString(),
        answers: questions.map((q) => ({
          questionId: q.id,
          selectedOptionId: selectedAnswers[q.id] || '',
          isCorrect: Boolean(q.options?.find((o) => o.isCorrect && o.id === selectedAnswers[q.id])),
          pointsAwarded: q.options?.find((o) => o.isCorrect && o.id === selectedAnswers[q.id]) ? q.points || 1 : 0,
        })),
      };

      const allAttempts = [...(existing.postTestAttempts || []), newAttempt];
      const bestScore = Math.max(...allAttempts.map((a) => a.scorePercent), scorePercent);
      const finalPassed = isPassed || bestScore >= passScorePercent;

      const updated = {
        ...existing,
        bestPostTestScorePercent: bestScore,
        postTestAttempts: allAttempts,
        status: finalPassed ? ('passed' as const) : ('completed_not_passed' as const),
        progressPercent: finalPassed ? 100 : Math.max(existing.progressPercent, 90),
        lastAccessedAt: new Date().toISOString(),
      };

      saveUserLessonProgress(lesson.code, updated);

      // Navigate to Result Page (Page 12 or 13)
      router.push(`/lessons/${lesson.code}/result?score=${scorePercent}&passed=${isPassed ? '1' : '0'}`);
    }, 700);
  };

  const currentAttemptNumber = (progressMap[lesson.code]?.postTestAttempts?.length || 0) + 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href={`/lessons/${lesson.code}/learn`}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับไปยังบทเรียน
        </Link>
        <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
          แบบทดสอบหลังเรียน (Post-test)
        </span>
      </div>

      {/* Header Info Banner matching Page 11 */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {lesson.title}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">แบบทดสอบหลังเรียน (Post-test)</p>
      </div>

      {/* Top 3 Info Cards matching Page 11 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Card 1: Attempts */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-800 dark:text-slate-100">ครั้งที่ {currentAttemptNumber} จาก {maxAttempts}</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">คุณยังมีสิทธิ์ทำแบบทดสอบอีก {Math.max(0, maxAttempts - currentAttemptNumber)} ครั้ง</p>
          </div>
        </div>

        {/* Card 2: Pass Score */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-800 dark:text-slate-100">เกณฑ์ผ่าน {passScorePercent}%</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">ต้องได้คะแนนอย่างน้อย {passScorePercent}% จึงจะถือว่าผ่าน</p>
          </div>
        </div>

        {/* Card 3: Score Policy */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-800 dark:text-slate-100">นโยบาย: ใช้คะแนนที่ดีที่สุด</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">ระบบจะบันทึกคะแนนที่ดีที่สุดจากทุกครั้งที่ทำ</p>
          </div>
        </div>

      </div>

      {/* Network Auto-Recovery Banner matching Page 11 */}
      <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
        <div className="flex items-center gap-2.5">
          <Wifi className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>หากสัญญาณอินเทอร์เน็ตขัดข้อง ระบบจะบันทึกคำตอบให้อัตโนมัติ เมื่อกลับมาเชื่อมต่อใหม่จะทำต่อได้ทันที</span>
        </div>
        <button className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-slate-700 shrink-0 transition">
          ดูวิธีแก้ไขปัญหา
        </button>
      </div>

      {/* Main Test & Question Navigator Layout matching Page 11 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left: Active Question Box */}
        <div className="md:col-span-8 bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-black text-blue-700 dark:text-blue-400">ข้อที่ {currentIdx + 1} จาก {questions.length}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">แบบทดสอบหลังเรียน (Post-test)</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
              {currentQ.questionText}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt) => {
              const isChecked = selectedAnswers[currentQ.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition flex items-center justify-between cursor-pointer ${
                    isChecked
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/50 text-blue-950 dark:text-blue-200 font-bold shadow-xs'
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

          {showWarning && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>กรุณาเลือกคำตอบให้ครบทุกข้อก่อนส่งข้อสอบ</span>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className={`px-4 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                currentIdx === 0
                  ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              ข้อก่อนหน้า
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-blue-200 dark:shadow-none cursor-pointer"
              >
                <span>ข้อถัดไป</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-200 dark:shadow-none cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>ส่งคำตอบแบบทดสอบ</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right: Question Grid Navigator matching Page 11 */}
        <div className="md:col-span-4 bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white">ความคืบหน้าในการทำแบบทดสอบ</h3>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = !!selectedAnswers[q.id];
              const isCurrent = idx === currentIdx;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-10 rounded-xl font-bold text-xs transition flex items-center justify-center cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300 dark:ring-blue-800'
                      : isAnswered
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>กำลังทำ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>ตอบแล้ว</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700"></span>
              <span>ยังไม่ได้ตอบ</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-bold text-slate-700 dark:text-slate-200">เมื่อส่งคำตอบแล้ว:</p>
            <p>✓ ระบบจะแสดงผลคะแนนทันที</p>
            <p>✓ สามารถดูเฉลยได้หลังส่งข้อสอบ</p>
            <p>✓ หากไม่ผ่าน สามารถทำใหม่ได้ตามจำนวนครั้งที่เหลือ</p>
          </div>
        </div>

      </div>

      {/* Loading Animation Modal matching Requirement 9 */}
      <LoadingOverlay
        isOpen={isSubmitting}
        message="กำลังตรวจข้อสอบและคำนวณคะแนน..."
        subMessage="ระบบกำลังเปรียบเทียบคะแนนกับเกณฑ์ผ่านเพื่อสรุปผลการเรียน"
      />

    </div>
  );
}
