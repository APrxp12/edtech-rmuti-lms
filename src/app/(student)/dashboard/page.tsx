'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Play, BookOpen, CheckCircle2, Award, Search, ArrowRight, 
  Clock, Lock, Megaphone, FileText, Calendar, RefreshCw, AlertTriangle, Eye,
  X, Sparkles, Filter, ChevronRight, User, ShieldAlert
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { EmptyStateCard } from '@/components/shared/SharedDialogs';
import LessonCoverPoster, { LessonCardSkeleton } from '@/components/shared/LessonCoverPoster';
import { Announcement } from '@/types';
import { isProfileComplete } from '@/lib/profileValidation';
import CertificateModal from '@/components/certificate/CertificateModal';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { currentUser, isLoaded, lessons, announcements, progressMap } = useAppStore();
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const isProfileIncomplete = Boolean(
    isLoaded &&
    currentUser.email &&
    currentUser.role === 'student' &&
    !isProfileComplete(currentUser)
  );

  const handleStartLesson = (destinationUrl: string, lessonTitle: string, isLocked?: boolean) => {
    if (isLocked) return;
    if (isProfileIncomplete) {
      window.dispatchEvent(
        new CustomEvent('edtech_open_profile_modal', {
          detail: {
            reason: 'lesson_blocked',
            lessonTitle,
            destinationUrl,
          },
        })
      );
      return;
    }
    router.push(destinationUrl);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<'order' | 'progress'>('order');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'not_started'>('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // คำนวณช่วงเวลาและคำทักทายตามเวลาจริง
  const greetingInfo = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    let text = 'สวัสดี';
    let icon = '☀️';
    let period = 'ตอนกลางวัน';
    if (hour < 12) {
      text = 'สวัสดีตอนเช้า';
      icon = '🌅';
      period = 'ช่วงเช้า';
    } else if (hour < 17) {
      text = 'สวัสดีตอนบ่าย';
      icon = '☀️';
      period = 'ช่วงบ่าย';
    } else {
      text = 'สวัสดีตอนเย็น';
      icon = '🌙';
      period = 'ช่วงค่ำ';
    }

    const thaiDays = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const dayName = thaiDays[now.getDay()];
    const dateNum = now.getDate();
    const monthName = thaiMonths[now.getMonth()];
    const thaiYear = now.getFullYear() + 543;

    return {
      text,
      icon,
      period,
      thaiDate: `${dayName}ที่ ${dateNum} ${monthName} ${thaiYear}`,
    };
  }, []);

  // คำนวณสถิติความก้าวหน้าจริงจาก Store
  const stats = useMemo(() => {
    const total = lessons.length;
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    let totalVideos = 0;
    let totalResources = 0;

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

      const vCount = lesson.versions[0]?.videos?.length || 2;
      const rCount = lesson.versions[0]?.resources?.length || 1;
      totalVideos += vCount;
      totalResources += rCount;
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // ค้นหาบทเรียนที่ควรแนะนำให้เรียนต่อ
    const activeLesson = lessons.find((l) => {
      const p = progressMap[l.code];
      return p && p.progressPercent > 0 && p.progressPercent < 100;
    }) || lessons.find((l) => {
      const p = progressMap[l.code];
      return (!p || p.progressPercent === 0) && l.status === 'published';
    }) || lessons[0];

    return {
      total,
      completed,
      inProgress,
      notStarted,
      percent,
      totalVideos,
      totalResources,
      activeLesson,
    };
  }, [lessons, progressMap]);

  // กรองบทเรียนตามค้นหา และสถานะ
  const filteredLessons = useMemo(() => {
    let result = [...lessons];

    // ค้นหาเฉพาะในส่วนของบทเรียน (Title, Code, Description)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (lesson) =>
          lesson.title.toLowerCase().includes(q) ||
          lesson.code.toLowerCase().includes(q) ||
          (lesson.description && lesson.description.toLowerCase().includes(q))
      );
    }

    // กรองตามแท็บสถานะ
    if (statusFilter === 'completed') {
      result = result.filter((l) => {
        const p = progressMap[l.code];
        return p?.status === 'passed' || p?.progressPercent === 100;
      });
    } else if (statusFilter === 'in_progress') {
      result = result.filter((l) => {
        const p = progressMap[l.code];
        return p && p.progressPercent > 0 && p.progressPercent < 100;
      });
    } else if (statusFilter === 'not_started') {
      result = result.filter((l) => {
        const p = progressMap[l.code];
        return (!p || p.progressPercent === 0) && l.status === 'published';
      });
    }

    // เรียงลำดับ
    if (selectedSort === 'order') {
      result.sort((a, b) => a.sortOrder - b.sortOrder);
    } else if (selectedSort === 'progress') {
      result.sort((a, b) => {
        const pA = progressMap[a.code]?.progressPercent || 0;
        const pB = progressMap[b.code]?.progressPercent || 0;
        return pB - pA;
      });
    }

    return result;
  }, [lessons, searchQuery, statusFilter, selectedSort, progressMap]);

  return (
    <div className="space-y-8 w-full max-w-[1500px] mx-auto pb-12">
      
      {/* แถบเตือนกรณีข้อมูลนักศึกษายังไม่สมบูรณ์ (Persistent Warning Banner) */}
      {isProfileIncomplete && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/90 border-2 border-amber-300/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-amber-950">
                  บัญชีของคุณยังไม่ได้ระบุชื่อ-นามสกุล และรหัสนักศึกษา
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                  จำเป็นต้องกรอกก่อนเริ่มเรียน
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                ระบบไม่อนุญาตให้เริ่มเรียนหรือทำแบบทดสอบ จนกว่าจะระบุชื่อและรหัสนักศึกษาให้เรียบร้อย
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent('edtech_open_profile_modal', {
                  detail: { reason: 'banner' },
                })
              )
            }
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition shrink-0 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <User className="w-3.5 h-3.5" />
            <span>กรอกข้อมูลนักศึกษาทันที</span>
          </button>
        </div>
      )}

      {/* 3 Top Executive Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* Card 1: Greeting Hero with Soft Luminous Pastel Theme */}
        <div className="lg:col-span-4 bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-sky-50/60 dark:from-[#111827] dark:via-indigo-950/30 dark:to-[#111827] rounded-3xl p-5 sm:p-6 border border-blue-100/90 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between transition-colors">
          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold bg-white/95 dark:bg-slate-800 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full flex items-center gap-1.5 border border-blue-200/80 dark:border-slate-700 shadow-2xs">
                <span>{greetingInfo.icon}</span>
                <span>{greetingInfo.text}</span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline-block">
                • {greetingInfo.thaiDate}
              </span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                สวัสดีคุณ <span className="text-blue-700 dark:text-blue-400 font-black">
                  {(currentUser.displayName || currentUser.fullName || 'นักศึกษา').replace(/^(นาย|นางสาว|นาง)\s*/i, '').trim() || 'นักศึกษา'}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                ยินดีต้อนรับสู่ระบบการเรียนรู้วิชานวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้
              </p>
            </div>
          </div>

          {/* Quick Resume Button */}
          {stats.activeLesson && (
            <div className="relative z-10 pt-5 mt-4 border-t border-blue-100/80 dark:border-slate-800 flex flex-col sm:flex-row lg:flex-col xl:flex-row lg:items-start xl:items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">บทเรียนถัดไปสำหรับคุณ:</span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs">
                  {stats.activeLesson.title.startsWith('บทที่')
                    ? stats.activeLesson.title
                    : `บทที่ ${stats.activeLesson.sortOrder} ${stats.activeLesson.title}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleStartLesson(
                    `/lessons/${stats.activeLesson.code}/intro`,
                    stats.activeLesson.title,
                    false
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm hover:shadow-md transition active:scale-95 shrink-0 whitespace-nowrap w-full sm:w-auto lg:w-full xl:w-auto cursor-pointer"
              >
                <span>เข้าสู่บทเรียน</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Background Decorative Blur Orbs */}
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-blue-200/30 dark:bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute top-0 right-1/4 w-36 h-36 bg-amber-200/25 dark:bg-amber-600/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="absolute -left-10 -top-10 w-36 h-36 bg-indigo-200/20 dark:bg-indigo-600/10 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Card 2: Overall Progress Card (Elevated & Live Calc) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-emerald-50/70 via-white to-white dark:from-emerald-950/20 dark:via-[#111827] dark:to-[#111827] rounded-3xl p-5 sm:p-6 border border-emerald-100 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">ความก้าวหน้าโดยรวม</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">ภาพรวมการเรียนของคุณ</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              {stats.completed} จาก {stats.total} บทเรียน
            </span>
          </div>

          <div className="flex items-center gap-5 my-4">
            {/* Circular SVG Ring */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200/70 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 transition-all duration-1000 ease-out"
                  strokeDasharray={`${stats.percent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-base sm:text-lg font-black text-slate-800 dark:text-white">
                {stats.percent}%
              </span>
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {stats.percent === 100 
                  ? 'สำเร็จครบทุกบทเรียนแล้ว! 🎉' 
                  : stats.percent > 0 
                  ? 'คุณกำลังไปได้ดีมาก!' 
                  : 'เริ่มต้นบทเรียนแรกกันเลย!'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {stats.percent === 100 
                  ? 'ยินดีด้วย! คุณสามารถทบทวนเนื้อหาได้ตลอดเวลา' 
                  : `เหลืออีก ${stats.total - stats.completed} บทเรียน เพื่อเรียนจบวิชา`}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>กำลังเรียน: <strong className="text-blue-600 dark:text-blue-400">{stats.inProgress}</strong></span>
            <span>ผ่านแล้ว: <strong className="text-emerald-600 dark:text-emerald-400">{stats.completed}</strong></span>
            <span>ยังไม่เริ่ม: <strong className="text-slate-600 dark:text-slate-400">{stats.notStarted}</strong></span>
          </div>

          <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => setIsCertModalOpen(true)}
              className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                stats.percent === 100
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{stats.percent === 100 ? 'รับใบเกียรติบัตร (Certificate)' : 'ดูตัวอย่างเกียรติบัตร'}</span>
            </button>
          </div>
        </div>

        {/* Card 3: Quick Stats Counters (Elevated & Perfectly Aligned) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-indigo-50/50 via-white to-white dark:from-indigo-950/20 dark:via-[#111827] dark:to-[#111827] rounded-3xl p-5 sm:p-6 border border-indigo-100/80 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold shadow-2xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-none">สรุปกิจกรรมของฉัน</h3>
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">สถิติการเรียนรู้สะสม</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900">
              สถิติล่าสุด
            </span>
          </div>
          
          <div className="space-y-2.5 my-3">
            {/* 1. วิดีโอที่รับชมแล้ว */}
            <div className="flex items-center justify-between p-2.5 sm:px-3 rounded-2xl bg-white dark:bg-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shadow-2xs hover:shadow-xs transition group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Play className="w-3.5 h-3.5 fill-blue-600 dark:fill-blue-400" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  วิดีโอที่รับชมแล้ว
                </span>
              </div>
              <div className="flex items-baseline gap-0.5 font-mono shrink-0 ml-2 bg-blue-50/80 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl border border-blue-100/80 dark:border-blue-900/60 whitespace-nowrap shadow-2xs">
                <span className="text-xs sm:text-sm font-black text-blue-700 dark:text-blue-300">{stats.completed * 2}</span>
                <span className="text-[11px] font-bold text-blue-400">/{stats.totalVideos}</span>
              </div>
            </div>

            {/* 2. แบบทดสอบที่ทำแล้ว */}
            <div className="flex items-center justify-between p-2.5 sm:px-3 rounded-2xl bg-white dark:bg-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shadow-2xs hover:shadow-xs transition group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  แบบทดสอบที่ทำแล้ว
                </span>
              </div>
              <div className="flex items-baseline gap-0.5 font-mono shrink-0 ml-2 bg-emerald-50/80 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-100/80 dark:border-emerald-900/60 whitespace-nowrap shadow-2xs">
                <span className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-300">{stats.completed * 2}</span>
                <span className="text-[11px] font-bold text-emerald-400">/{stats.total * 2}</span>
              </div>
            </div>

            {/* 3. บทเรียนที่ผ่านเกณฑ์ */}
            <div className="flex items-center justify-between p-2.5 sm:px-3 rounded-2xl bg-white dark:bg-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shadow-2xs hover:shadow-xs transition group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  บทเรียนที่ผ่านเกณฑ์
                </span>
              </div>
              <div className="flex items-baseline gap-0.5 font-mono shrink-0 ml-2 bg-amber-50/80 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-100/80 dark:border-amber-900/60 whitespace-nowrap shadow-2xs">
                <span className="text-xs sm:text-sm font-black text-amber-700 dark:text-amber-300">{stats.completed}</span>
                <span className="text-[11px] font-bold text-amber-400">/{stats.total}</span>
              </div>
            </div>
          </div>

          <Link
            href="/my-progress"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center justify-center gap-1.5 transition pt-3 border-t border-slate-100 dark:border-slate-800 group"
          >
            <span>ดูตารางความก้าวหน้าละเอียด</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

      </div>

      {/* Section 1: Announcements Section */}
      <section id="announcements" className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">ข่าวประกาศล่าสุด</h2>
                <Link
                  href="/announcements"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition"
                >
                  <span>ดูประกาศทั้งหมด</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-xs text-slate-500">ข้อมูลข่าวสารและกำหนดการสำคัญจากอาจารย์ผู้สอน</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {announcements.length} ข่าวประกาศ
          </span>
        </div>

        {announcements.length === 0 ? (
          <EmptyStateCard
            title="ขณะนี้ยังไม่มีข่าวประกาศ"
            description="เมื่อมีข่าวประกาศใหม่จากอาจารย์ผู้สอน จะแสดงที่นี่ทันที"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                onClick={() => setSelectedAnnouncement(ann)}
                className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                {ann.imageUrl && (
                  <div className="w-full h-36 rounded-2xl overflow-hidden mb-1 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 relative">
                    <img src={ann.imageUrl} alt={ann.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      ann.category === 'announcement'
                        ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60'
                        : ann.category === 'update'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                    }`}>
                      {ann.category === 'announcement' ? 'ประกาศด่วน' : ann.category === 'update' ? 'อัปเดตบทเรียน' : 'กิจกรรมการเรียน'}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {new Date(ann.publishedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {ann.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {ann.body}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  <span>อ่านรายละเอียด</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: All Lessons Section with Real-Time Search & Tabs */}
      <section id="lessons" className="space-y-5 pt-4">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  บทเรียนทั้งหมด ({lessons.length} บทเรียน)
                </h2>
                <Link
                  href="/my-lessons"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-2.5 py-1 rounded-lg transition"
                >
                  <span>เปิดหน้ารายวิชาเต็ม</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                รายวิชาการเรียนรู้แบบกำกับตนเอง (Self-Directed Learning)
              </p>
            </div>
          </div>

          {/* Search Bar & Sort Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Real-Time Lesson Search Box */}
            <div className="relative flex-1 sm:w-72">
              <input
                type="text"
                placeholder="ค้นหาชื่อบทเรียน, รหัสวิชา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-2xs transition"
              />
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  title="ล้างคำค้น"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as 'order' | 'progress')}
              className="text-xs sm:text-sm bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="order">เรียงตามลำดับบทเรียน</option>
              <option value="progress">เรียงตามความก้าวหน้า</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            ทั้งหมด ({lessons.length})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              statusFilter === 'in_progress'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            กำลังเรียน ({stats.inProgress})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            ผ่านแล้ว ({stats.completed})
          </button>
          <button
            onClick={() => setStatusFilter('not_started')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              statusFilter === 'not_started'
                ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            ยังไม่เริ่ม ({stats.notStarted})
          </button>

          {searchQuery && (
            <div className="ml-auto text-xs font-semibold text-blue-600 dark:text-blue-400">
              ผลการค้นหา: พบ {filteredLessons.length} บทเรียน
            </div>
          )}
        </div>

        {/* Lesson Cards Grid */}
        {!isLoaded ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <LessonCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredLessons.length === 0 ? (
          <EmptyStateCard
            title={lessons.length === 0 ? "ยังไม่มีบทเรียนในรายวิชานี้" : "ไม่พบบทเรียนที่ตรงกับเงื่อนไข"}
            description={lessons.length === 0 ? "ระบบพร้อมสำหรับเนื้อหาใหม่ เมื่ออาจารย์เพิ่มบทเรียนจะแสดงที่นี่ทันที" : (searchQuery ? `ไม่พบบทเรียนที่มีคำว่า "${searchQuery}" ลองค้นหาด้วยคำอื่น หรือกดล้างการค้นหา` : 'ยังไม่มีบทเรียนในสถานะนี้')}
            actionLabel={searchQuery ? 'ล้างการค้นหา' : undefined}
            onAction={searchQuery ? () => setSearchQuery('') : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {filteredLessons.map((lesson) => {
              const progress = progressMap[lesson.code] || {
                progressPercent: 0,
                status: 'not_started',
              };

              const isCompleted = progress.progressPercent === 100 && progress.status === 'passed';
              const isInProgress = progress.progressPercent > 0 && progress.progressPercent < 100;
              const isReadyForPostTest = progress.status === 'content_completed' || (progress.progressPercent === 100 && progress.status !== 'passed');
              const isLocked = lesson.status === 'draft';

              const destinationUrl = isLocked
                ? '#'
                : isCompleted
                ? `/lessons/${lesson.code}/intro?mode=review`
                : isInProgress
                ? `/lessons/${lesson.code}/learn`
                : isReadyForPostTest
                ? `/lessons/${lesson.code}/post-test`
                : `/lessons/${lesson.code}/intro`;

              return (
                <div
                  key={lesson.id}
                  onClick={() => handleStartLesson(destinationUrl, lesson.title, isLocked)}
                  className={`bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col justify-between group transition-all duration-300 ${
                    isLocked
                      ? 'cursor-not-allowed opacity-80'
                      : 'cursor-pointer hover:-translate-y-1.5 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 active:translate-y-0 active:scale-[0.99]'
                  }`}
                >
                  {/* Card Thumbnail / Header */}
                  <div className="relative h-40 sm:h-44 bg-slate-900 overflow-hidden">
                    <LessonCoverPoster lesson={lesson} />

                    {/* Number Badge */}
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-xl bg-blue-600 text-white text-sm font-black flex items-center justify-center shadow-md z-20">
                      {lesson.sortOrder}
                    </div>

                    {/* Status Tag Pill (Enlarged to text-xs) */}
                    <div className="absolute top-3 right-3 z-20">
                      {isCompleted ? (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500 text-white shadow-xs">
                          เสร็จสิ้น
                        </span>
                      ) : isInProgress ? (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-600 text-white shadow-xs">
                          กำลังเรียน
                        </span>
                      ) : isReadyForPostTest ? (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500 text-white shadow-xs">
                          รอทำแบบทดสอบ
                        </span>
                      ) : isLocked ? (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-400 text-white shadow-xs">
                          ยังไม่เปิดเรียน
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-900/60 shadow-2xs">
                          ยังไม่ได้เริ่ม
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 mb-1">
                        {lesson.code}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {lesson.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                        {lesson.description}
                      </p>

                      {/* Media Badges (text-xs) */}
                      <div className="flex items-center gap-2 pt-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                          <Play className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          {lesson.versions[0]?.videos?.length || 2} คลิปวิดีโอ
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                          <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          {lesson.versions[0]?.resources?.length || 1} สื่อเอกสาร
                        </span>
                      </div>
                    </div>

                    {/* Circular Progress Wheel */}
                    <div className="flex items-center justify-between pt-1 px-1">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                          <svg className="w-10 h-10 transform -rotate-90 drop-shadow-2xs" viewBox="0 0 36 36">
                            <path
                              className="text-slate-100 dark:text-slate-800"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className={`transition-all duration-500 ${
                                isCompleted ? 'text-emerald-500' : isReadyForPostTest ? 'text-amber-500' : 'text-blue-600 dark:text-blue-400'
                              }`}
                              strokeDasharray={isLocked ? '0, 100' : `${progress.progressPercent}, 100`}
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 absolute font-mono">
                            {isLocked ? '-' : `${progress.progressPercent}%`}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">ความก้าวหน้า</span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {isCompleted ? 'ผ่านเกณฑ์แล้ว' : isInProgress ? 'กำลังศึกษา' : isReadyForPostTest ? 'รอสอบ' : isLocked ? 'ปิด' : 'ยังไม่เริ่ม'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Action Buttons (Enlarged to text-sm) */}
                    <div className="pt-2">
                      {isCompleted ? (
                        <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleStartLesson(`/lessons/${lesson.code}/intro?mode=review`, lesson.title, false)}
                            className="py-2.5 px-2 sm:px-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition shadow-2xs active:scale-95 whitespace-nowrap cursor-pointer"
                          >
                            <BookOpen className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <span>ทบทวน</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartLesson(`/lessons/${lesson.code}/result`, lesson.title, false)}
                            className="py-2.5 px-2 sm:px-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800 transition shadow-2xs active:scale-95 whitespace-nowrap cursor-pointer"
                          >
                            <Award className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                            <span>ดูผล</span>
                          </button>
                        </div>
                      ) : isInProgress ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartLesson(`/lessons/${lesson.code}/learn`, lesson.title, false);
                          }}
                          className="w-full py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-xs active:scale-95 whitespace-nowrap cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-white shrink-0" />
                          <span>เรียนต่อ</span>
                        </button>
                      ) : isReadyForPostTest ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartLesson(`/lessons/${lesson.code}/post-test`, lesson.title, false);
                          }}
                          className="w-full py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-xs active:scale-95 whitespace-nowrap cursor-pointer"
                        >
                          <FileText className="w-4 h-4 shrink-0" />
                          <span>ทำแบบทดสอบหลังเรียน</span>
                        </button>
                      ) : isLocked ? (
                        <button
                          disabled
                          className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed whitespace-nowrap"
                        >
                          <Lock className="w-4 h-4 shrink-0" />
                          <span>ยังไม่เปิดเรียน</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartLesson(`/lessons/${lesson.code}/intro`, lesson.title, false);
                          }}
                          className="w-full py-2.5 px-4 rounded-2xl border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition active:scale-95 whitespace-nowrap cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-blue-600 dark:fill-blue-400 shrink-0" />
                          <span>เริ่มเรียน</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div 
            className="bg-white dark:bg-[#111827] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${
                  selectedAnnouncement.category === 'announcement'
                    ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60'
                    : selectedAnnouncement.category === 'update'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                }`}>
                  {selectedAnnouncement.category === 'announcement' ? 'ประกาศสำคัญ' : selectedAnnouncement.category === 'update' ? 'อัปเดตบทเรียน' : 'กิจกรรมการเรียน'}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-2">
                  {selectedAnnouncement.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  เผยแพร่เมื่อ: {new Date(selectedAnnouncement.publishedAt).toLocaleDateString('th-TH', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedAnnouncement.imageUrl && (
              <div className="w-full max-h-72 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                <img 
                  src={selectedAnnouncement.imageUrl} 
                  alt={selectedAnnouncement.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
            )}

            <div className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line py-2 border-t border-slate-100 dark:border-slate-800">
              {selectedAnnouncement.body}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="py-2.5 px-6 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-xs sm:text-sm font-bold transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      <CertificateModal 
        isOpen={isCertModalOpen} 
        onClose={() => setIsCertModalOpen(false)} 
      />

    </div>
  );
}
