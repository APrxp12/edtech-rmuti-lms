'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { 
  BarChart3, CheckCircle2, Award, Play, BookOpen, ArrowLeft, 
  HelpCircle, FileText, ChevronRight, Sparkles, Building2, 
  User, Calendar, GraduationCap, Target, Clock
} from 'lucide-react';
import { useAppStore } from '@/data/store';

export default function MyProgressPage() {
  const { lessons, progressMap } = useAppStore();

  // Course Information Constants
  const courseInfo = {
    code: '30-401-001-204',
    title: 'นวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้',
    instructor: 'ผศ.ดร.เฉลิมพล บุญทศ',
    semester: 'ภาคการศึกษาที่ 1 / ปีการศึกษา 2569',
    curriculum: 'หลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต (ค.อ.บ.)',
    department: 'สาขาวิชาครุศาสตร์อุตสาหกรรมอุตสาหการ คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น',
  };

  // Live Statistics Calculation
  const stats = useMemo(() => {
    const total = lessons.length;
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    let totalPreScore = 0;
    let preCount = 0;
    let totalPostScore = 0;
    let postCount = 0;

    lessons.forEach((lesson) => {
      const p = progressMap[lesson.code];
      const isPassed = p?.status === 'passed' || p?.progressPercent === 100;
      const isProg = p && p.progressPercent > 0 && p.progressPercent < 100;

      if (isPassed) {
        completed++;
      } else if (isProg) {
        inProgress++;
      } else {
        notStarted++;
      }

      if (p?.preTestScore?.score !== undefined) {
        totalPreScore += p.preTestScore.score;
        preCount++;
      }
      if (p?.bestPostTestScorePercent !== undefined) {
        totalPostScore += p.bestPostTestScorePercent;
        postCount++;
      }
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const avgPre = preCount > 0 ? (totalPreScore / preCount).toFixed(1) : '-';
    const avgPost = postCount > 0 ? Math.round(totalPostScore / postCount) : '-';

    return {
      total,
      completed,
      inProgress,
      notStarted,
      percent,
      avgPre,
      avgPost,
      preCount,
      postCount,
    };
  }, [lessons, progressMap]);

  return (
    <div className="space-y-6 w-full max-w-[1500px] mx-auto pb-16">
      
      {/* Top Breadcrumb & Page Title */}
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
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">ความก้าวหน้าของฉัน (My Learning Progress)</h1>
            <p className="text-xs text-slate-500">ติดตามผลการเรียนรู้ สถิติแบบทดสอบ และสถานะการผ่านเกณฑ์รายวิชา</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200 shadow-2xs font-mono">
            {courseInfo.code}
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
            {stats.completed} / {stats.total} บทเรียนผ่านแล้ว
          </span>
        </div>
      </div>

      {/* Official Course Banner (Theme unified with Dashboard & My Lessons) */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden shadow-lg border border-blue-600/30">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-blue-50 flex items-center gap-1.5 border border-white/15 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{courseInfo.curriculum}</span>
              </span>
              <span className="text-xs text-blue-100 font-medium">
                • {courseInfo.semester}
              </span>
            </div>
            <span className="text-xs font-mono font-bold bg-white/15 px-3.5 py-1 rounded-full border border-white/20 text-amber-300 shadow-xs">
              รหัสวิชา: {courseInfo.code}
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-xs break-keep">
              {courseInfo.title}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1.5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-200 shrink-0" />
              <span>{courseInfo.department}</span>
            </p>
          </div>

          <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs text-blue-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-amber-300" />
              <span>อาจารย์ผู้สอนประจำวิชา: <strong className="text-white">{courseInfo.instructor}</strong></span>
            </div>
            <div className="flex items-center gap-4">
              <span>ความก้าวหน้ารวม: <strong className="text-amber-300 text-sm font-black">{stats.percent}%</strong></span>
              <span className="hidden sm:inline text-white/40">•</span>
              <span>สถานะ: <strong className="text-emerald-300 font-bold">{stats.percent === 100 ? 'สำเร็จการศึกษา' : 'กำลังศึกษา'}</strong></span>
            </div>
          </div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute -right-8 -bottom-8 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-36 h-36 bg-amber-400/15 rounded-full blur-xl pointer-events-none"></div>
      </div>

      {/* 3 Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Card 1: ความก้าวหน้าโดยรวม */}
        <div className="md:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">ความก้าวหน้าโดยรวม</h3>
                <span className="text-xs text-slate-500">บทเรียนที่สำเร็จแล้ว</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {stats.completed}/{stats.total} บท
            </span>
          </div>

          <div className="flex items-center gap-4 my-4">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 transition-all duration-700"
                  strokeDasharray={`${stats.percent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-black text-slate-800">{stats.percent}%</span>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${stats.percent}%` }}
                ></div>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {stats.percent === 100 ? 'ผ่านครบทุกบทเรียนแล้ว 🎉' : `คงเหลืออีก ${stats.total - stats.completed} บทเรียน`}
              </p>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>กำลังเรียน: <strong className="text-blue-600">{stats.inProgress}</strong></span>
            <span>ยังไม่เริ่ม: <strong className="text-slate-600">{stats.notStarted}</strong></span>
          </div>
        </div>

        {/* Card 2: สถิติคะแนนเฉลี่ยแบบทดสอบ */}
        <div className="md:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-2xs">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">สถิติการทดสอบ</h3>
                <span className="text-xs text-slate-500">คะแนนประเมินผลสัมฤทธิ์</span>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Pre / Post
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs text-slate-500 font-medium block">เฉลี่ยก่อนเรียน (Pre)</span>
              <div className="text-lg font-black text-slate-800 font-mono mt-0.5">
                {stats.avgPre !== '-' ? `${stats.avgPre}/10` : '-'}
              </div>
              <span className="text-[11px] text-slate-400">ทำแล้ว {stats.preCount} บท</span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
              <span className="text-xs text-emerald-800 font-medium block">เฉลี่ยหลังเรียน (Post)</span>
              <div className="text-lg font-black text-emerald-700 font-mono mt-0.5">
                {stats.avgPost !== '-' ? `${stats.avgPost}%` : '-'}
              </div>
              <span className="text-[11px] text-emerald-600">ทำแล้ว {stats.postCount} บท</span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>เกณฑ์ประเมินหลังเรียน: <strong>ต้องได้ 70% ขึ้นไป</strong></span>
          </div>
        </div>

        {/* Card 3: เกณฑ์การผ่านรายวิชา */}
        <div className="md:col-span-4 bg-gradient-to-br from-emerald-50/50 via-white to-white rounded-3xl p-5 sm:p-6 border border-emerald-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2.5 border-b border-emerald-100/80 pb-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">เกณฑ์การผ่านรายวิชา</h3>
              <span className="text-xs text-emerald-600">มาตรฐานหลักสูตร ค.อ.บ.</span>
            </div>
          </div>

          <div className="my-3 space-y-2 text-xs text-slate-700 leading-relaxed">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>ศึกษาเนื้อหาบทเรียนและรับชมคลิปวิดีโอครบถ้วน</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>ทำแบบทดสอบก่อนเรียน (Pre-test) ครบทุกบทเรียน</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>ได้คะแนนแบบทดสอบหลังเรียน (Post-test) <strong className="text-emerald-700">ไม่น้อยกว่า 70%</strong> ในแต่ละบทเรียน</span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-emerald-100 flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>สถานะเกณฑ์:</span>
            <span className="bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              {stats.percent === 100 ? 'ผ่านเกณฑ์ครบถ้วน' : 'กำลังดำเนินการ'}
            </span>
          </div>
        </div>

      </div>

      {/* Lesson Progress Table (Full-Width, Strict Zero Horizontal Scroll) */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hidden md:block">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">ตารางความก้าวหน้ารายบทเรียนทั้งหมด ({lessons.length} บทเรียน)</h3>
              <p className="text-xs text-slate-500">แสดงข้อมูลผลการเรียนรู้และคะแนนแบบทดสอบอย่างละเอียด</p>
            </div>
          </div>
          <Link
            href="/my-lessons"
            className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition"
          >
            <span>ดูหน้ารายวิชาเต็ม</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Table container with table-fixed w-full to guarantee 100% full width and 0 horizontal scroll */}
        <div className="w-full">
          <table className="w-full table-fixed divide-y divide-slate-100 text-left">
            <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200 text-xs">
              <tr>
                <th className="py-3.5 px-4 w-[34%]">บทเรียน</th>
                <th className="py-3.5 px-3 w-[16%]">ความคืบหน้า</th>
                <th className="py-3.5 px-2 text-center w-[11%]">ก่อนเรียน (Pre)</th>
                <th className="py-3.5 px-2 text-center w-[13%]">หลังเรียน (Post)</th>
                <th className="py-3.5 px-2 text-center w-[13%]">สถานะ</th>
                <th className="py-3.5 px-3 text-center w-[13%]">การจัดการ</th>
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

                const isCompleted = progress.status === 'passed' || progress.progressPercent === 100;
                const isInProgress = progress.status === 'in_progress' || (progress.progressPercent > 0 && progress.progressPercent < 100);

                return (
                  <tr key={lesson.id} className="hover:bg-slate-50/70 transition">
                    
                    {/* 1. บทเรียน (บทที่ + ชื่อ) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="shrink-0 text-xs font-black px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                          บทที่ {lesson.sortOrder}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={lesson.title}>
                          {lesson.title.replace(/^บทที่\s+\d+\s*/, '')}
                        </span>
                      </div>
                    </td>
                    
                    {/* 2. ความคืบหน้า */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-1 pr-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 font-mono">
                          <span>{progress.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${progress.progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* 3. ก่อนเรียน (Pre) */}
                    <td className="py-3.5 px-2 text-center font-mono">
                      {progress.preTestScore ? (
                        <span className="inline-block text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                          {progress.preTestScore.score}/10
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>

                    {/* 4. หลังเรียน (Post) */}
                    <td className="py-3.5 px-2 text-center font-mono">
                      {progress.bestPostTestScorePercent !== undefined ? (
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-lg ${
                            progress.bestPostTestScorePercent >= 70 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {progress.bestPostTestScorePercent}%
                          </span>
                          {progress.postTestAttempts && progress.postTestAttempts.length > 0 && (
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              ({progress.postTestAttempts.length} ครั้ง)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>

                    {/* 5. สถานะ */}
                    <td className="py-3.5 px-2 text-center">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 whitespace-nowrap shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>ผ่านเกณฑ์</span>
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 whitespace-nowrap shadow-2xs">
                          <Play className="w-3 h-3 fill-blue-600 shrink-0" />
                          <span>กำลังเรียน</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                          ยังไม่เริ่ม
                        </span>
                      )}
                    </td>

                    {/* 6. การจัดการ */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {isCompleted ? (
                        <div className="inline-flex items-center justify-center gap-1">
                          <Link
                            href={`/lessons/${lesson.code}/intro?mode=review`}
                            className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition shadow-2xs"
                            title="ทบทวนบทเรียน"
                          >
                            ทบทวน
                          </Link>
                          <Link
                            href={`/lessons/${lesson.code}/result`}
                            className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition shadow-2xs"
                            title="ดูผลคะแนน"
                          >
                            ดูผล
                          </Link>
                        </div>
                      ) : isInProgress ? (
                        <Link
                          href={`/lessons/${lesson.code}/learn`}
                          className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs"
                        >
                          เรียนต่อ
                        </Link>
                      ) : (
                        <Link
                          href={`/lessons/${lesson.code}/intro`}
                          className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
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

      {/* Mobile Card List (Screen < 768px) */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-800">รายการบทเรียน ({lessons.length})</h3>
          <span className="text-xs text-blue-600 font-semibold">มุมมองมือถือ</span>
        </div>

        {lessons.map((lesson) => {
          const progress = progressMap[lesson.code] || {
            progressPercent: 0,
            status: 'not_started',
            preTestScore: undefined,
            bestPostTestScorePercent: undefined,
            postTestAttempts: [],
          };
          const isCompleted = progress.status === 'passed' || progress.progressPercent === 100;
          const isInProgress = progress.status === 'in_progress' || (progress.progressPercent > 0 && progress.progressPercent < 100);

          return (
            <div key={lesson.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 inline-block mb-1">
                    บทที่ {lesson.sortOrder}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {lesson.title.replace(/^บทที่\s+\d+\s*/, '')}
                  </h4>
                </div>
                {isCompleted ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    เสร็จสิ้น
                  </span>
                ) : isInProgress ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    กำลังเรียน
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
                    ยังไม่เริ่ม
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>ความก้าวหน้า</span>
                  <span className="font-bold text-slate-800">{progress.progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    style={{ width: `${progress.progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs font-mono text-slate-600">
                  <span>Pre: <strong>{progress.preTestScore ? `${progress.preTestScore.score}/10` : '-'}</strong></span>
                  <span className="mx-1.5 text-slate-300">|</span>
                  <span>Post: <strong className={progress.bestPostTestScorePercent && progress.bestPostTestScorePercent >= 70 ? 'text-emerald-600' : 'text-slate-800'}>
                    {progress.bestPostTestScorePercent !== undefined ? `${progress.bestPostTestScorePercent}%` : '-'}
                  </strong></span>
                </div>
                
                {isCompleted ? (
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/lessons/${lesson.code}/intro?mode=review`}
                      className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100"
                    >
                      ทบทวน
                    </Link>
                    <Link
                      href={`/lessons/${lesson.code}/result`}
                      className="px-2.5 py-1 text-xs font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                    >
                      ดูผล
                    </Link>
                  </div>
                ) : isInProgress ? (
                  <Link
                    href={`/lessons/${lesson.code}/learn`}
                    className="px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs"
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
