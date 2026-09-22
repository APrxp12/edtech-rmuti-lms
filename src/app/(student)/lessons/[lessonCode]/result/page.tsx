'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { 
  Award, CheckCircle2, AlertTriangle, RotateCcw, BookOpen, 
  ArrowLeft, CheckSquare, Clock, Trophy, ChevronRight,
  Printer, User, GraduationCap, Building2, Calendar
} from 'lucide-react';
import { useAppStore } from '@/data/store';

function LessonResultContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const lessonCode = (params.lessonCode as string) || 'RMUTI-001';
  const { currentUser, lessons, quizzes, progressMap } = useAppStore();

  const lesson = lessons.find((l) => l.code === lessonCode);

  const progress = lesson ? progressMap[lesson.code] : undefined;

  // Resolve quiz for passing threshold and max attempts
  const quiz = lesson
    ? quizzes.find((q) => q.type === 'post_test' && (q.lessonId === lesson.id || q.lessonId === lesson.code))
    : undefined;
  const passScorePercent = quiz?.versions?.[0]?.passScorePercent ?? 60;
  const maxAttempts = quiz?.versions?.[0]?.maxAttempts ?? 3;

  // Read URL query or retrieve from store progress
  const passedParam = searchParams.get('passed');
  const scoreParam = searchParams.get('score');

  const isPassed = passedParam === '1'
    ? true
    : passedParam === '0'
    ? false
    : (progress?.status === 'passed' || (progress?.bestPostTestScorePercent || 0) >= passScorePercent);

  const displayScore = scoreParam
    ? Number(scoreParam)
    : (progress?.bestPostTestScorePercent || (isPassed ? 90 : 50));

  const postAttempts = progress?.postTestAttempts || [];
  const attemptsUsed = postAttempts.length > 0 ? postAttempts.length : 1;
  const remainingAttempts = Math.max(0, maxAttempts - attemptsUsed);

  if (!lesson) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900">ไม่พบบทเรียน "{lessonCode}" ในระบบ</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
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

  const handlePrint = () => {
    window.print();
  };

  const studentFullName = currentUser.fullName || currentUser.displayName || 'นักศึกษา';
  const studentIdDisplay = currentUser.studentId && currentUser.studentId !== '-' ? currentUser.studentId : 'ยังไม่ระบุรหัส';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 print:p-0 print:space-y-4 print:max-w-full">

      {/* Stepper Progress Banner (Hidden on Print) */}
      <div className="p-4 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-around text-center text-xs print:hidden shadow-xs">
        <div className="space-y-1">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">เรียนเนื้อหาบทเรียน</span>
        </div>
        <div className="w-8 sm:w-16 h-0.5 bg-emerald-500"></div>

        <div className="space-y-1">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">ทำแบบทดสอบ Pre-test</span>
        </div>
        <div className="w-8 sm:w-16 h-0.5 bg-emerald-500"></div>

        <div className="space-y-1">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">เรียนครบ 100%</span>
        </div>
        <div className="w-8 sm:w-16 h-0.5 bg-slate-200 dark:bg-slate-700"></div>

        <div className="space-y-1">
          <div className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold text-white ${
            isPassed ? 'bg-emerald-500' : 'bg-amber-500'
          }`}>
            4
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">แบบทดสอบ Post-test</span>
        </div>
      </div>

      {/* Student Profile & Course Identification Header (Visible in both screen & print) */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-sky-50/60 dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 rounded-3xl border border-blue-100 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100/90 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 shadow-2xs font-mono">
              รหัสวิชา 30-401-001-204
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium hidden sm:inline">
              นวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-100 dark:border-slate-700 shadow-2xs shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">ผู้เข้าศึกษา / ผู้ทำแบบทดสอบ:</span>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                {studentFullName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:justify-end">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold border border-blue-100 dark:border-slate-700 shadow-2xs shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">รหัสนักศึกษา:</span>
              <span className="text-sm sm:text-base font-mono font-bold text-slate-900 dark:text-white leading-snug">
                {studentIdDisplay}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-blue-100/80 dark:border-slate-800 text-xs text-blue-950 dark:text-blue-200 font-semibold flex items-center justify-between">
          <span>บทเรียน: {lesson.title.startsWith('บทที่') ? lesson.title : `บทที่ ${lesson.sortOrder} ${lesson.title}`}</span>
          <span className="font-mono text-blue-700 dark:text-blue-300 text-[11px] bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
            {lesson.code}
          </span>
        </div>
      </div>

      {/* Main Outcome Card */}
      {isPassed ? (
        /* PAGE 12: Passed Celebration Box */
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-emerald-200 dark:border-emerald-800/80 shadow-lg space-y-6">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner print:w-14 print:h-14">
              <Trophy className="w-10 h-10 text-emerald-600 dark:text-emerald-400 print:w-7 print:h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ผ่านเกณฑ์การเรียนรู้แล้ว!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              ขอแสดงความยินดี คุณได้ผ่านบทเรียนนี้เรียบร้อยแล้ว สามารถไปเรียนบทถัดไป หรือพิมพ์ใบรายงานผลการเรียนเก็บเป็นหลักฐานได้
            </p>
          </div>

          {/* 4 Metric Cards matching Page 12 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400">ความก้าวหน้าบทเรียน</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
              <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">เสร็จสมบูรณ์</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400">คะแนน Pre-test</span>
              <div className="text-xl font-black text-slate-800 dark:text-slate-100">
                {progress?.preTestScore ? `${progress.preTestScore.percent}%` : '-'}
              </div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500">
                {progress?.preTestScore ? `${progress.preTestScore.score} จาก ${progress.preTestScore.max || 10} ข้อ` : 'ไม่มีข้อมูล'}
              </span>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-center space-y-1">
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold">Post-test (ที่นับ)</span>
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-300">{displayScore}%</div>
              <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">👑 คะแนนที่ดีที่สุด</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400">เกณฑ์ผ่าน</span>
              <div className="text-xl font-black text-slate-800 dark:text-slate-100">{passScorePercent}%</div>
              <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">✓ ผ่านเกณฑ์</span>
            </div>
          </div>

          {/* Attempt History Table (Real-time Dynamic Data) */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white flex items-center justify-between">
              <span>ประวัติการทำแบบทดสอบจริง</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">บันทึกอัตโนมัติ</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-4">ครั้งที่</th>
                  <th className="py-2.5 px-4">ประเภท</th>
                  <th className="py-2.5 px-4">วันที่-เวลา</th>
                  <th className="py-2.5 px-4">คะแนนที่ได้</th>
                  <th className="py-2.5 px-4">ผลการประเมิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                {/* Row 1: Pre-test */}
                {progress?.preTestScore && (
                  <tr>
                    <td className="py-2.5 px-4 font-mono">1</td>
                    <td className="py-2.5 px-4">แบบทดสอบก่อนเรียน (Pre-test)</td>
                    <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">ก่อนเริ่มเรียน</td>
                    <td className="py-2.5 px-4 font-mono">{progress.preTestScore.percent}% ({progress.preTestScore.score}/{progress.preTestScore.max || 10})</td>
                    <td className="py-2.5 px-4 text-slate-400">-</td>
                  </tr>
                )}

                {/* Post-test attempts */}
                {postAttempts.length > 0 ? (
                  postAttempts.map((att, idx) => {
                    const isBest = att.scorePercent === displayScore;
                    return (
                      <tr key={idx} className={isBest ? 'bg-emerald-50/50 dark:bg-emerald-950/30 font-semibold' : ''}>
                        <td className="py-2.5 px-4 font-mono">{(progress?.preTestScore ? 2 : 1) + idx}</td>
                        <td className="py-2.5 px-4">แบบทดสอบหลังเรียน (Post-test)</td>
                        <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">
                          {new Date(att.submittedAt).toLocaleString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className={`py-2.5 px-4 font-mono ${isBest ? 'text-emerald-700 dark:text-emerald-400 font-bold' : ''}`}>
                          {att.scorePercent}% ({att.scoreObtained}/{att.maxScore})
                        </td>
                        <td className="py-2.5 px-4">
                          {att.isPassed ? (
                            <span className="text-emerald-700 dark:text-emerald-400">✓ ผ่านเกณฑ์</span>
                          ) : (
                            <span className="text-slate-400">ไม่ผ่าน</span>
                          )}
                          {isBest && <span className="ml-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold">(นับคะแนน)</span>}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="bg-emerald-50/40 dark:bg-emerald-950/30 font-semibold">
                    <td className="py-2.5 px-4 font-mono">1</td>
                    <td className="py-2.5 px-4">แบบทดสอบหลังเรียน (Post-test)</td>
                    <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">เพิ่งเสร็จสิ้น</td>
                    <td className="py-2.5 px-4 font-mono text-emerald-700 dark:text-emerald-400">{displayScore}%</td>
                    <td className="py-2.5 px-4 text-emerald-700 dark:text-emerald-400">✓ ผ่านเกณฑ์ (นับคะแนน)</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Actions matching Page 12 (Hidden on Print) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 print:hidden">
            <Link
              href={`/lessons/${lesson.code}/intro?mode=review`}
              className="w-full sm:w-1/4 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition text-center"
            >
              ทบทวนบทเรียน
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-1/4 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition text-center shadow-md shadow-blue-200 dark:shadow-none"
            >
              กลับแดชบอร์ด
            </Link>

            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-emerald-200 dark:shadow-none cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ใบรายงานผลการเรียน (Print Slip)</span>
            </button>
          </div>
        </div>
      ) : (
        /* PAGE 13: Completed Not Passed Box */
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-amber-200 dark:border-amber-800/80 shadow-lg space-y-6">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              เรียนเนื้อหาครบแล้ว แต่คะแนน Post-test ยังไม่ผ่านเกณฑ์
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              คุณได้เรียนเนื้อหาบทเรียนนี้ครบถ้วนแล้ว 100% แต่คะแนนแบบทดสอบยังไม่ถึงเกณฑ์ที่กำหนด ({passScorePercent}%) กรุณาทบทวนเนื้อหาและทำแบบทดสอบอีกครั้ง
            </p>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400">คะแนนครั้งล่าสุด</span>
              <div className="text-xl font-black text-slate-800 dark:text-slate-100">{displayScore}%</div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500">คำนวณจากข้อที่ตอบถูก</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400">คะแนนที่ดีที่สุด</span>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">{displayScore}%</div>
              <span className="text-[9px] text-amber-700 dark:text-amber-400">รอบที่ผ่านมา</span>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-100 dark:border-red-900/60 text-center space-y-1">
              <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">เกณฑ์ผ่าน</span>
              <div className="text-xl font-black text-red-700 dark:text-red-400">{passScorePercent}%</div>
              <span className="text-[9px] text-red-600 dark:text-red-400 font-bold">ต้องได้ {passScorePercent}% ขึ้นไป</span>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/60 text-center space-y-1">
              <span className="text-[10px] text-blue-700 dark:text-blue-300 font-bold">จำนวนครั้งที่เหลือ</span>
              <div className="text-xl font-black text-blue-800 dark:text-blue-300">{remainingAttempts} ครั้ง</div>
              <span className="text-[9px] text-blue-600 dark:text-blue-400">จากทั้งหมด {maxAttempts} ครั้ง</span>
            </div>
          </div>

          {/* Motivational Tip Card matching Page 13 */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            💡 <span className="font-bold">เคล็ดลับ:</span> ลองทบทวนเนื้อหาในบทเรียน โดยเฉพาะหัวข้อที่ยังไม่เข้าใจ และทำแบบทดสอบอีกครั้ง {remainingAttempts > 0 ? `คุณสามารถทำได้อีก ${remainingAttempts} ครั้ง!` : 'คุณใช้สิทธิ์ครบแล้ว กรุณาติดต่อผู้สอน'}
          </div>

          {/* Actions matching Page 13 (Hidden on Print) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 print:hidden">
            {remainingAttempts > 0 ? (
              <Link
                href={`/lessons/${lesson.code}/post-test`}
                className="w-full sm:w-1/2 py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-200 dark:shadow-none transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ทำแบบทดสอบอีกครั้ง (เหลือ {remainingAttempts} ครั้ง)</span>
              </Link>
            ) : (
              <button
                disabled
                className="w-full sm:w-1/2 py-3 px-6 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold cursor-not-allowed flex items-center justify-center gap-2"
              >
                หมดสิทธิ์ทำแบบทดสอบแล้ว
              </button>
            )}

            <Link
              href={`/lessons/${lesson.code}/intro?mode=review`}
              className="w-full sm:w-1/2 py-3 px-6 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>ทบทวนบทเรียน</span>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}

export default function LessonResultPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">กำลังโหลดข้อมูลผลการเรียน...</div>}>
      <LessonResultContent />
    </React.Suspense>
  );
}
