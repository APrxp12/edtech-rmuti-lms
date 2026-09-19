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
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition flex items-center justify-center shadow-2xs"
            title="กลับหน้าหลัก"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">ความก้าวหน้าของฉัน (My Learning Progress)</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">ติดตามผลการเรียนรู้ สถิติแบบทดสอบ และสถานะการผ่านเกณฑ์รายวิชา</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200 shadow-2xs font-mono">
            {courseInfo.code}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
            {stats.completed} / {stats.total} บทเรียนผ่านแล้ว
          </span>
        </div>
      </div>

      {/* Official Course Banner (Soft Luminous Tone with Circular Progress Widget) */}
      <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-sky-50/60 rounded-3xl p-6 sm:p-7 border border-blue-100/90 shadow-sm relative overflow-hidden">
        {/* Ambient soft pastel orbs */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-44 h-44 bg-amber-200/25 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-10 -top-10 w-44 h-44 bg-indigo-200/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          
          {/* Top Row: Meta Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold bg-white/95 text-blue-800 px-3.5 py-1 rounded-full flex items-center gap-1.5 border border-blue-200/80 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{courseInfo.curriculum}</span>
              </span>
              <span className="text-xs sm:text-sm text-slate-600 font-medium">
                • {courseInfo.semester}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-mono font-semibold bg-white/95 px-3.5 py-1 rounded-full border border-blue-200/80 text-blue-900 shadow-2xs">
              รหัสวิชา: {courseInfo.code}
            </span>
          </div>

          {/* Course Title */}
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 break-keep">
              {courseInfo.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 flex items-center gap-2 font-normal">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{courseInfo.department}</span>
            </p>
          </div>

          {/* Bottom Row: Instructor & Circular Wheel Hero Widget */}
          <div className="pt-3.5 border-t border-blue-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
              <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <span>อาจารย์ผู้สอนประจำวิชา: <strong className="text-slate-900 font-semibold">{courseInfo.instructor}</strong></span>
            </div>

            {/* Circular Wheel Widget in Banner */}
            <div className="flex items-center gap-3 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-blue-200/80 shadow-xs self-start sm:self-auto">
              <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                <svg className="w-11 h-11 transform -rotate-90 drop-shadow-2xs" viewBox="0 0 36 36">
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
                <span className="text-xs font-bold text-slate-800 absolute font-mono">{stats.percent}%</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">ความก้าวหน้ารวม</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900">ผ่าน {stats.completed}/{stats.total} บทเรียน</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 3 Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Card 1: ความก้าวหน้าโดยรวม */}
        <div className="md:col-span-4 bg-gradient-to-br from-white via-emerald-50/20 to-white rounded-3xl p-5 sm:p-6 border border-emerald-100/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">ความก้าวหน้าโดยรวม</h3>
                <span className="text-xs text-slate-500 font-normal">ภาพรวมบทเรียนทั้งหมด</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {stats.completed}/{stats.total} บท
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-4">
            {/* Circular Wheel */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 sm:w-28 sm:h-28 transform -rotate-90 drop-shadow-xs" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 transition-all duration-1000 ease-out"
                  strokeDasharray={`${stats.percent}, 100`}
                  strokeWidth="3.6"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono leading-none">{stats.percent}%</span>
                <span className="text-[10px] font-semibold text-emerald-700 mt-1 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {stats.percent === 100 ? 'เสร็จสมบูรณ์' : 'ความคืบหน้า'}
                </span>
              </div>
            </div>

            {/* Status breakdown metrics */}
            <div className="space-y-2 min-w-[130px] w-full sm:w-auto">
              <div className="flex items-center justify-between text-xs sm:text-sm bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-100">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  ผ่านแล้ว:
                </span>
                <strong className="text-emerald-700 font-mono font-bold">{stats.completed} บท</strong>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-100">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  กำลังเรียน:
                </span>
                <strong className="text-blue-700 font-mono font-bold">{stats.inProgress} บท</strong>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-100">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                  ยังไม่เริ่ม:
                </span>
                <strong className="text-slate-600 font-mono font-bold">{stats.notStarted} บท</strong>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>
              {stats.percent === 100 
                ? '🏆 ผ่านการเรียนรู้ครบทุกบทเรียนตามเกณฑ์!' 
                : `คงเหลืออีก ${stats.total - stats.completed} บทเรียน เพื่อสำเร็จการศึกษา`}
            </span>
          </div>
        </div>

        {/* Card 2: สถิติคะแนนแบบทดสอบ */}
        <div className="md:col-span-4 bg-gradient-to-br from-white via-blue-50/20 to-white rounded-3xl p-5 sm:p-6 border border-blue-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-2xs">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">สถิติแบบทดสอบ</h3>
                <span className="text-xs text-slate-500 font-normal">ผลสัมฤทธิ์ทางการเรียนรู้</span>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Pre / Post
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 my-3">
            {/* Pre-test Wheel */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs flex flex-col items-center text-center">
              <span className="text-xs font-semibold text-slate-600 mb-2">ก่อนเรียน (Pre-test)</span>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90 drop-shadow-2xs" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.6"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-600 transition-all duration-700"
                    strokeDasharray={`${stats.avgPre !== '-' ? Math.round(Number(stats.avgPre) * 10) : 0}, 100`}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-base sm:text-lg font-bold text-slate-800 font-mono leading-none">
                    {stats.avgPre !== '-' ? `${stats.avgPre}` : '-'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">เต็ม 10</span>
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-2 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                ทำแล้ว {stats.preCount} บท
              </span>
            </div>

            {/* Post-test Wheel */}
            <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-2xs flex flex-col items-center text-center">
              <span className="text-xs font-semibold text-emerald-800 mb-2">หลังเรียน (Post-test)</span>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90 drop-shadow-2xs" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.6"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500 transition-all duration-700"
                    strokeDasharray={`${stats.avgPost !== '-' ? Number(stats.avgPost) : 0}, 100`}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-base sm:text-lg font-bold text-emerald-700 font-mono leading-none">
                    {stats.avgPost !== '-' ? `${stats.avgPost}%` : '-'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium mt-0.5">เฉลี่ย</span>
                </div>
              </div>
              <span className="text-[11px] font-medium text-emerald-700 mt-2 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                ทำแล้ว {stats.postCount} บท
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>เกณฑ์ประเมินหลังเรียน: <strong className="text-emerald-700 font-semibold">ต้องได้ 70% ขึ้นไป</strong></span>
          </div>
        </div>

        {/* Card 3: เกณฑ์การผ่านรายวิชา */}
        <div className="md:col-span-4 bg-gradient-to-br from-white via-slate-50/50 to-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">เกณฑ์การผ่านรายวิชา</h3>
              <span className="text-xs text-emerald-700 font-semibold">มาตรฐานหลักสูตร ค.อ.บ.</span>
            </div>
          </div>

          <div className="my-4 space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>ศึกษาเนื้อหาบทเรียนและรับชมคลิปวิดีโอครบถ้วน</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>ทำแบบทดสอบก่อนเรียน (Pre-test) ครบทุกบทเรียน</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>ได้คะแนนแบบทดสอบหลังเรียน (Post-test) <strong className="text-emerald-700 font-semibold">ไม่น้อยกว่า 70%</strong> ในแต่ละบท</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700">
            <span>สถานะเกณฑ์:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stats.percent === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
              {stats.percent === 100 ? 'ผ่านเกณฑ์ครบถ้วน 🎉' : 'กำลังดำเนินการเรียนรู้'}
            </span>
          </div>
        </div>

      </div>

      {/* Lesson Progress Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hidden md:block">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">ตารางความก้าวหน้ารายบทเรียนทั้งหมด ({lessons.length} บทเรียน)</h3>
              <p className="text-xs text-slate-500">แสดงผลความก้าวหน้าแบบวงล้อ และสถิติคลิป/แบบทดสอบละเอียด</p>
            </div>
          </div>
          <Link
            href="/my-lessons"
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition"
          >
            <span>ดูหน้ารายวิชาเต็ม</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Table container with table-fixed w-full to guarantee 100% full width and 0 horizontal scroll */}
        <div className="w-full">
          <table className="w-full table-fixed divide-y divide-slate-100 text-left">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 text-xs">
              <tr>
                <th className="py-3.5 px-4 w-[34%]">บทเรียน</th>
                <th className="py-3.5 px-3 w-[18%]">ความคืบหน้า (วงล้อ)</th>
                <th className="py-3.5 px-2 text-center w-[12%]">ก่อนเรียน (Pre)</th>
                <th className="py-3.5 px-2 text-center w-[12%]">หลังเรียน (Post)</th>
                <th className="py-3.5 px-2 text-center w-[12%]">สถานะ</th>
                <th className="py-3.5 px-3 text-center w-[12%]">การจัดการ</th>
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
                    
                    {/* 1. บทเรียน */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 font-mono">
                          บทที่ {lesson.sortOrder}
                        </span>
                        <span className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition truncate" title={lesson.title}>
                          {lesson.title.replace(/^บทที่\s+\d+\s*/, '')}
                        </span>
                      </div>
                    </td>
                    
                    {/* 2. ความคืบหน้า (วงล้อเด่นชัด + สถานะแบบไม่ซ้ำซ้อน) */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                          <svg className="w-10 h-10 transform -rotate-90 drop-shadow-2xs" viewBox="0 0 36 36">
                            <path
                              className="text-slate-100"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className={`transition-all duration-700 ${
                                isCompleted 
                                  ? 'text-emerald-500' 
                                  : isInProgress 
                                  ? 'text-blue-600' 
                                  : 'text-slate-300'
                              }`}
                              strokeDasharray={`${progress.progressPercent}, 100`}
                              strokeWidth="3.6"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute" />
                          ) : (
                            <span className="text-[10px] font-bold text-slate-800 absolute font-mono">
                              {progress.progressPercent}%
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className={`text-xs font-semibold block whitespace-nowrap ${
                            isCompleted ? 'text-emerald-600' : isInProgress ? 'text-blue-600' : 'text-slate-500'
                          }`}>
                            {isCompleted ? 'ผ่านเกณฑ์แล้ว' : isInProgress ? 'กำลังเรียนรู้' : 'ยังไม่เริ่มเรียน'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal block whitespace-nowrap">
                            {isCompleted ? 'ครบ 100%' : isInProgress ? `${progress.progressPercent}% คืบหน้า` : '0%'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 3. ก่อนเรียน (Pre) */}
                    <td className="py-3.5 px-2 text-center font-mono">
                      {progress.preTestScore ? (
                        <span className="inline-block text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                          {progress.preTestScore.score}/10
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-normal">-</span>
                      )}
                    </td>

                    {/* 4. หลังเรียน (Post) */}
                    <td className="py-3.5 px-2 text-center font-mono">
                      {progress.bestPostTestScorePercent !== undefined ? (
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                            progress.bestPostTestScorePercent >= 70 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {progress.bestPostTestScorePercent}%
                          </span>
                          {progress.postTestAttempts && progress.postTestAttempts.length > 0 && (
                            <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                              ({progress.postTestAttempts.length} ครั้ง)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-normal">-</span>
                      )}
                    </td>

                    {/* 5. สถานะ */}
                    <td className="py-3.5 px-2 text-center">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>ผ่านเกณฑ์</span>
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 whitespace-nowrap">
                          <Play className="w-3 h-3 fill-blue-600 shrink-0" />
                          <span>กำลังเรียน</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-normal text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                          ยังไม่เริ่ม
                        </span>
                      )}
                    </td>

                    {/* 6. การจัดการ */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {isCompleted ? (
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <Link
                            href={`/lessons/${lesson.code}/intro?mode=review`}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                            title="ทบทวนบทเรียน"
                          >
                            ทบทวน
                          </Link>
                          <Link
                            href={`/lessons/${lesson.code}/result`}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition"
                            title="ดูผลคะแนน"
                          >
                            ดูผล
                          </Link>
                        </div>
                      ) : isInProgress ? (
                        <Link
                          href={`/lessons/${lesson.code}/learn`}
                          className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-2xs"
                        >
                          เรียนต่อ
                        </Link>
                      ) : (
                        <Link
                          href={`/lessons/${lesson.code}/intro`}
                          className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
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
      <div className="md:hidden space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-800">รายการบทเรียน ({lessons.length})</h3>
          <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            มุมมองมือถือ
          </span>
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
            <div key={lesson.id} className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 inline-block mb-1 font-mono">
                    บทที่ {lesson.sortOrder}
                  </span>
                  <h4 className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">
                    {lesson.title.replace(/^บทที่\s+\d+\s*/, '')}
                  </h4>
                </div>
                {isCompleted ? (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    เสร็จสิ้น
                  </span>
                ) : isInProgress ? (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    กำลังเรียน
                  </span>
                ) : (
                  <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
                    ยังไม่เริ่ม
                  </span>
                )}
              </div>

              {/* Mobile Circular Progress Wheel Row */}
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                  <svg className="w-10 h-10 transform -rotate-90 drop-shadow-2xs" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200/80"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={isCompleted ? 'text-emerald-500' : isInProgress ? 'text-blue-600' : 'text-slate-300'}
                      strokeDasharray={`${progress.progressPercent}, 100`}
                      strokeWidth="3.6"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute" />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-800 absolute font-mono">
                      {progress.progressPercent}%
                    </span>
                  )}
                </div>
                <div className="text-xs">
                  <span className="text-slate-500 block font-normal">ความก้าวหน้ารายบท</span>
                  <span className="font-semibold text-slate-800">
                    {isCompleted ? 'เรียนผ่านเกณฑ์แล้ว (100%)' : isInProgress ? `กำลังเรียนรู้ (${progress.progressPercent}%)` : 'ยังไม่ได้เริ่มเรียน (0%)'}
                  </span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs font-mono text-slate-600">
                  <span>Pre: <strong className="font-semibold">{progress.preTestScore ? `${progress.preTestScore.score}/10` : '-'}</strong></span>
                  <span className="mx-2 text-slate-300">|</span>
                  <span>Post: <strong className={`font-semibold ${progress.bestPostTestScorePercent && progress.bestPostTestScorePercent >= 70 ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {progress.bestPostTestScorePercent !== undefined ? `${progress.bestPostTestScorePercent}%` : '-'}
                  </strong></span>
                </div>
                
                {isCompleted ? (
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/lessons/${lesson.code}/intro?mode=review`}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100"
                    >
                      ทบทวน
                    </Link>
                    <Link
                      href={`/lessons/${lesson.code}/result`}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                    >
                      ดูผล
                    </Link>
                  </div>
                ) : isInProgress ? (
                  <Link
                    href={`/lessons/${lesson.code}/learn`}
                    className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-2xs"
                  >
                    เรียนต่อ
                  </Link>
                ) : (
                  <Link
                    href={`/lessons/${lesson.code}/intro`}
                    className="px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
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
