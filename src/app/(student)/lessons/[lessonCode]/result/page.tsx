'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { 
  Award, CheckCircle2, AlertTriangle, RotateCcw, BookOpen, 
  ArrowLeft, CheckSquare, Clock, Trophy, ChevronRight
} from 'lucide-react';
import { useAppStore } from '@/data/store';

export default function LessonResultPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const lessonCode = (params.lessonCode as string) || 'RMUTI-003';
  const { lessons, progressMap } = useAppStore();

  const lesson = lessons.find((l) => l.code === lessonCode) || lessons[2];

  // Read URL query or default to test simulation
  const passedParam = searchParams.get('passed');
  const scoreParam = searchParams.get('score');

  // Toggle between Page 12 (Passed) and Page 13 (Completed Not Passed)
  const [outcome, setOutcome] = useState<'passed' | 'not_passed'>(
    passedParam === '0' ? 'not_passed' : 'passed'
  );

  const isPassed = outcome === 'passed';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* State Switcher to test Page 12 vs Page 13 */}
      <div className="p-2.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
        <span className="font-bold text-slate-600 pl-2">ทดสอบหน้าผลการเรียน (Visual Reference หน้า 12 & 13):</span>
        <div className="flex gap-2">
          <button
            onClick={() => setOutcome('passed')}
            className={`px-3 py-1 rounded-xl font-bold transition ${
              isPassed ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ผ่านเกณฑ์ (Page 12: Passed)
          </button>
          <button
            onClick={() => setOutcome('not_passed')}
            className={`px-3 py-1 rounded-xl font-bold transition ${
              !isPassed ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ไม่ผ่านเกณฑ์ (Page 13: Completed Not Passed)
          </button>
        </div>
      </div>

      {/* Stepper Progress Banner matching Page 13 */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-around text-center text-xs">
        <div className="space-y-1">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 text-[11px]">เรียนเนื้อหาบทเรียน</span>
        </div>
        <div className="w-8 sm:w-16 h-0.5 bg-emerald-500"></div>

        <div className="space-y-1">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 text-[11px]">ทำแบบทดสอบ Pre-test</span>
        </div>
        <div className="w-8 sm:w-16 h-0.5 bg-emerald-500"></div>

        <div className="space-y-1">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 text-[11px]">เรียนครบ 100%</span>
        </div>
        <div className="w-8 sm:w-16 h-0.5 bg-slate-200"></div>

        <div className="space-y-1">
          <div className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold text-white ${
            isPassed ? 'bg-emerald-500' : 'bg-amber-500'
          }`}>
            4
          </div>
          <span className="font-bold text-slate-800 text-[11px]">แบบทดสอบ Post-test</span>
        </div>
      </div>

      {/* Main Outcome Card */}
      {isPassed ? (
        /* PAGE 12: Passed Celebration Box */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-lg space-y-6">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <Trophy className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              ผ่านเกณฑ์การเรียนรู้แล้ว!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              ขอแสดงความยินดี คุณได้ผ่านบทเรียนนี้เรียบร้อยแล้ว สามารถไปเรียนบทถัดไป หรือทบทวนเนื้อหาเพิ่มเติมได้ตลอดเวลา
            </p>
          </div>

          {/* 4 Metric Cards matching Page 12 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
              <span className="text-[10px] text-slate-500">ความก้าวหน้าบทเรียน</span>
              <div className="text-xl font-black text-emerald-600">100%</div>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">เสร็จสมบูรณ์</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
              <span className="text-[10px] text-slate-500">คะแนน Pre-test</span>
              <div className="text-xl font-black text-slate-800">60%</div>
              <span className="text-[9px] text-slate-400">6 จาก 10 ข้อ</span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-1">
              <span className="text-[10px] text-emerald-800 font-bold">Post-test (ที่นับ)</span>
              <div className="text-xl font-black text-emerald-700">90%</div>
              <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">👑 คะแนนที่ดีที่สุด</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
              <span className="text-[10px] text-slate-500">เกณฑ์ผ่าน</span>
              <div className="text-xl font-black text-slate-800">60%</div>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">✓ ผ่านเกณฑ์</span>
            </div>
          </div>

          {/* Attempt History Table matching Page 12 */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-800">
              ประวัติการทำแบบทดสอบ
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-4">ครั้งที่</th>
                  <th className="py-2.5 px-4">ประเภท</th>
                  <th className="py-2.5 px-4">วันที่ทำ</th>
                  <th className="py-2.5 px-4">คะแนน</th>
                  <th className="py-2.5 px-4">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="py-2.5 px-4">1</td>
                  <td className="py-2.5 px-4">Pre-test</td>
                  <td className="py-2.5 px-4">15 เม.ย. 2568 10:15</td>
                  <td className="py-2.5 px-4 font-mono">60% (6/10)</td>
                  <td className="py-2.5 px-4">-</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4">2</td>
                  <td className="py-2.5 px-4">Post-test</td>
                  <td className="py-2.5 px-4">15 เม.ย. 2568 10:30</td>
                  <td className="py-2.5 px-4 font-mono">70% (7/10)</td>
                  <td className="py-2.5 px-4 text-slate-400">ไม่นับ</td>
                </tr>
                <tr className="bg-emerald-50/40 font-semibold">
                  <td className="py-2.5 px-4">3</td>
                  <td className="py-2.5 px-4">Post-test</td>
                  <td className="py-2.5 px-4">16 เม.ย. 2568 14:20</td>
                  <td className="py-2.5 px-4 font-mono text-emerald-700">90% (9/10)</td>
                  <td className="py-2.5 px-4 text-emerald-700">✓ นับคะแนน</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Actions matching Page 12 */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href={`/lessons/${lesson.code}/intro?mode=review`}
              className="w-full sm:w-1/3 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition text-center"
            >
              ทบทวนบทเรียน
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-1/3 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition text-center shadow-md shadow-blue-200"
            >
              กลับภาพรวม
            </Link>

            <button
              disabled
              className="w-full sm:w-1/3 py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed text-center"
            >
              ทำแบบทดสอบอีกครั้ง (คุณผ่านแล้ว)
            </button>
          </div>
        </div>
      ) : (
        /* PAGE 13: Completed Not Passed Box */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-lg space-y-6">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              เรียนเนื้อหาครบแล้ว แต่คะแนน Post-test ยังไม่ผ่านเกณฑ์
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              คุณได้เรียนเนื้อหาบทเรียนนี้ครบถ้วนแล้ว 100% แต่คะแนนแบบทดสอบยังไม่ถึงเกณฑ์ที่กำหนด กรุณาทบทวนเนื้อหาและทำแบบทดสอบอีกครั้ง
            </p>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
              <span className="text-[10px] text-slate-500">คะแนนครั้งล่าสุด</span>
              <div className="text-xl font-black text-slate-800">60%</div>
              <span className="text-[9px] text-slate-400">12 จาก 20 ข้อ</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
              <span className="text-[10px] text-slate-500">คะแนนที่ดีที่สุด</span>
              <div className="text-xl font-black text-amber-600">60%</div>
              <span className="text-[9px] text-amber-700">12 จาก 20 ข้อ</span>
            </div>

            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-center space-y-1">
              <span className="text-[10px] text-red-600 font-bold">เกณฑ์ผ่าน</span>
              <div className="text-xl font-black text-red-700">70%</div>
              <span className="text-[9px] text-red-600 font-bold">14 จาก 20 ข้อ</span>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center space-y-1">
              <span className="text-[10px] text-blue-700 font-bold">จำนวนครั้งที่เหลือ</span>
              <div className="text-xl font-black text-blue-800">1 ครั้ง</div>
              <span className="text-[9px] text-blue-600">จากทั้งหมด 3 ครั้ง</span>
            </div>
          </div>

          {/* Motivational Tip Card matching Page 13 */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            💡 <span className="font-bold">เคล็ดลับ:</span> ลองทบทวนเนื้อหาในบทเรียน โดยเฉพาะหัวข้อที่ยังไม่เข้าใจ และทำแบบทดสอบอีกครั้ง คุณสามารถทำได้อีก 1 ครั้ง!
          </div>

          {/* Actions matching Page 13 */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href={`/lessons/${lesson.code}/post-test`}
              className="w-full sm:w-1/2 py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-200 transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ทำแบบทดสอบอีกครั้ง</span>
            </Link>

            <Link
              href={`/lessons/${lesson.code}/intro?mode=review`}
              className="w-full sm:w-1/2 py-3 px-6 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2"
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
