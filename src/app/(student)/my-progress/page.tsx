'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BarChart3, CheckCircle2, Award, Play, BookOpen, ArrowLeft, 
  HelpCircle, FileText, ChevronRight
} from 'lucide-react';
import { useAppStore } from '@/data/store';

export default function MyProgressPage() {
  const { lessons, progressMap } = useAppStore();

  return (
    <div className="space-y-6 w-full max-w-[1440px] mx-auto">
      
      {/* Header Banner matching Page 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">ความก้าวหน้าของฉัน</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ติดตามพัฒนาการการเรียนรู้ของคุณในทุกบทเรียน
          </p>
        </div>

        <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-xs font-bold text-blue-900 text-right hidden sm:block">
          “การเรียนรู้ทำให้คุณไปได้ไกลกว่าเดิม”
        </div>
      </div>

      {/* Top 2 Cards: Overall Progress & Passing Criteria matching Page 5 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Card 1: ความก้าวหน้าโดยรวม */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-center gap-5">
          <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
            <svg className="w-18 h-18 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray="62, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-base font-black text-slate-800">62%</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-700">ความก้าวหน้าโดยรวมของฉัน</h3>
            <div className="w-40 bg-slate-100 h-2 rounded-full overflow-hidden my-1">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '62%' }}></div>
            </div>
            <p className="text-xs font-black text-slate-800">เรียนแล้ว 5 จาก 8 บทเรียน</p>
          </div>
        </div>

        {/* Card 2: เกณฑ์การผ่านรายวิชา matching Page 5 */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-emerald-200 bg-emerald-50/20 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-emerald-950">เกณฑ์การผ่านรายวิชา</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              คุณจะผ่านรายวิชาได้เมื่อเรียนครบทุกบทเรียน และได้คะแนนหลังเรียน (Post-test) ไม่น้อยกว่า <span className="font-bold text-emerald-700">70%</span> ในแต่ละบทเรียน
            </p>
          </div>
        </div>

      </div>

      {/* Lesson Progress Table (Desktop) matching Page 5 */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hidden md:block">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">รายการบทเรียน</h3>
          <span className="text-xs text-blue-600 font-semibold flex items-center gap-1 cursor-pointer">
            <FileText className="w-3.5 h-3.5" />
            คู่มือการเรียนรู้
          </span>
        </div>

        <div className="w-full">
          <table className="w-full text-left text-xs lg:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-xs">
              <tr>
                <th className="py-3 px-2 sm:px-3 text-center whitespace-nowrap w-[7%]">บทที่</th>
                <th className="py-3 px-2 sm:px-3 w-[26%]">ชื่อบทเรียน</th>
                <th className="py-3 px-2 sm:px-3 whitespace-nowrap w-[15%]">ความคืบหน้า</th>
                <th className="py-3 px-2 sm:px-3 text-center whitespace-nowrap w-[12%]">สถานะ</th>
                <th className="py-3 px-2 sm:px-3 text-center whitespace-nowrap w-[11%]">ก่อนเรียน (Pre)</th>
                <th className="py-3 px-2 sm:px-3 text-center whitespace-nowrap w-[11%]">หลังเรียน (Post)</th>
                <th className="py-3 px-2 sm:px-3 text-center whitespace-nowrap w-[7%]">สอบ</th>
                <th className="py-3 px-2 sm:px-3 text-center whitespace-nowrap w-[11%]">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lessons.map((lesson) => {
                const progress = progressMap[lesson.code] || {
                  progressPercent: 0,
                  status: 'not_started',
                  preTestScore: undefined,
                  bestPostTestScorePercent: undefined,
                  postTestAttempts: [],
                };

                const isCompleted = progress.status === 'passed';
                const isInProgress = progress.status === 'in_progress';

                return (
                  <tr key={lesson.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-2 sm:px-3 font-bold text-slate-700 whitespace-nowrap text-center">
                      บทที่ {lesson.sortOrder}
                    </td>
                    <td className="py-3 px-2 sm:px-3 font-semibold text-slate-800">
                      <span className="line-clamp-2">{lesson.title.replace(/^บทที่\s+\d+\s*/, '')}</span>
                    </td>
                    
                    <td className="py-3 px-2 sm:px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-12 sm:w-16 bg-slate-100 h-2 rounded-full overflow-hidden shrink-0">
                          <div
                            className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${progress.progressPercent}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-slate-700 text-xs">{progress.progressPercent}%</span>
                      </div>
                    </td>

                    <td className="py-3 px-2 sm:px-3 whitespace-nowrap text-center">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3" />
                          เสร็จสิ้น
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 whitespace-nowrap">
                          กำลังเรียน
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                          ยังไม่เริ่ม
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-2 sm:px-3 text-slate-600 font-mono text-xs whitespace-nowrap text-center">
                      {progress.preTestScore ? `${progress.preTestScore.score}/10` : '-'}
                    </td>

                    <td className="py-3 px-2 sm:px-3 text-slate-600 font-mono text-xs whitespace-nowrap text-center">
                      {progress.bestPostTestScorePercent ? `${progress.bestPostTestScorePercent}/100` : '-'}
                    </td>

                    <td className="py-3 px-2 sm:px-3 text-slate-600 font-mono text-xs whitespace-nowrap text-center">
                      {progress.postTestAttempts && progress.postTestAttempts.length > 0
                        ? `${progress.postTestAttempts.length} ครั้ง`
                        : '-'}
                    </td>

                    <td className="py-3 px-2 sm:px-3 text-center whitespace-nowrap">
                      {isCompleted ? (
                        <div className="inline-flex items-center justify-center gap-1">
                          <Link
                            href={`/lessons/${lesson.code}/intro?mode=review`}
                            className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition whitespace-nowrap"
                            title="ดูวัตถุประสงค์และ Infographic เพื่อทบทวน"
                          >
                            ทบทวน
                          </Link>
                          <Link
                            href={`/lessons/${lesson.code}/result`}
                            className="px-2 py-1 text-[11px] font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition whitespace-nowrap"
                          >
                            ดูผล
                          </Link>
                        </div>
                      ) : isInProgress ? (
                        <Link
                          href={`/lessons/${lesson.code}/learn`}
                          className="inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition whitespace-nowrap shadow-xs"
                        >
                          เรียนต่อ
                        </Link>
                      ) : (
                        <Link
                          href={`/lessons/${lesson.code}/intro`}
                          className="inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition whitespace-nowrap"
                        >
                          เริ่มเรียน
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List matching Page 5 */}
      <div className="md:hidden space-y-3">
        <h3 className="text-sm font-bold text-slate-800">รายการบทเรียน</h3>
        {lessons.map((lesson) => {
          const progress = progressMap[lesson.code] || {
            progressPercent: 0,
            status: 'not_started',
          };
          const isCompleted = progress.status === 'passed';
          const isInProgress = progress.status === 'in_progress';

          return (
            <div key={lesson.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase">บทที่ {lesson.sortOrder}</span>
                  <h4 className="text-xs font-bold text-slate-800">{lesson.title.replace(/^บทที่ d+s*/, '')}</h4>
                </div>
                {isCompleted ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    เสร็จสิ้น
                  </span>
                ) : isInProgress ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    กำลังเรียน
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    ยังไม่ได้เริ่ม
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>ความก้าวหน้า</span>
                  <span className="font-bold text-slate-800">{progress.progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    style={{ width: `${progress.progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Pre: {progress.preTestScore ? `${progress.preTestScore.score}/10` : '-'} | Post: {progress.bestPostTestScorePercent ? `${progress.bestPostTestScorePercent}%` : '-'}
                </span>
                
                {isCompleted ? (
                  <Link
                    href={`/lessons/${lesson.code}/result`}
                    className="px-3 py-1 text-xs font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                  >
                    ดูผล
                  </Link>
                ) : isInProgress ? (
                  <Link
                    href={`/lessons/${lesson.code}/learn`}
                    className="px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    เรียนต่อ
                  </Link>
                ) : (
                  <Link
                    href={`/lessons/${lesson.code}/intro`}
                    className="px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    เริ่มเรียน
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
