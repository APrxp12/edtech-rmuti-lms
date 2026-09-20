'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Play, BookOpen, CheckCircle2, Award, Search, ArrowRight, 
  Clock, Lock, FileText, LayoutGrid, List, Check, ArrowLeft,
  Sparkles, GraduationCap, User, Building2, Calendar, X, AlertCircle, AlertTriangle
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { EmptyStateCard } from '@/components/shared/SharedDialogs';
import LessonCoverPoster, { LessonCardSkeleton } from '@/components/shared/LessonCoverPoster';
import { isProfileComplete } from '@/lib/profileValidation';

export default function MyLessonsPage() {
  const router = useRouter();
  const { currentUser, isLoaded, lessons, progressMap, settings } = useAppStore();

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Course Information Constants
  const courseInfo = {
    code: '30-401-001-204',
    title: 'นวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้',
    instructor: 'ผศ.ดร.เฉลิมพล บุญทศ',
    semester: 'ภาคการศึกษาที่ 1 / ปีการศึกษา 2569',
    curriculum: 'หลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต (ค.อ.บ.)',
    department: 'สาขาวิชาครุศาสตร์อุตสาหกรรมอุตสาหการ คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น',
  };

  // Compute stats
  const stats = useMemo(() => {
    const total = lessons.length;
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    let totalVideos = 0;
    let totalResources = 0;
    let totalMinutes = 0;

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

      const version = lesson.versions[0];
      const vCount = version?.videos?.length || 2;
      const rCount = version?.resources?.length || 1;
      const estMin = version?.estimatedDurationMinutes || 30;

      totalVideos += vCount;
      totalResources += rCount;
      totalMinutes += estMin;
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Find active / next lesson
    const nextLesson = lessons.find((l) => {
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
      totalMinutes,
      nextLesson,
    };
  }, [lessons, progressMap]);

  // Filter lessons
  const filteredLessons = useMemo(() => {
    let result = [...lessons];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((lesson) => {
        const titleMatch = lesson.title.toLowerCase().includes(q);
        const codeMatch = lesson.code.toLowerCase().includes(q);
        const descMatch = lesson.description && lesson.description.toLowerCase().includes(q);
        const objMatch = lesson.versions[0]?.learningObjectives?.some(obj => obj.toLowerCase().includes(q));
        return titleMatch || codeMatch || descMatch || objMatch;
      });
    }

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
    <div className="w-full max-w-[1500px] mx-auto space-y-8 pb-16">
      
      {/* Top Breadcrumbs */}
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
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">บทเรียนของฉัน (My Lessons)</h1>
            <p className="text-xs text-slate-500">แผนผังรายวิชาและบทเรียนการเรียนรู้แบบกำกับตนเองทั้งหมด</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 shadow-2xs font-mono">
            {courseInfo.code}
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
            {stats.completed} / {stats.total} บทเรียนผ่านแล้ว
          </span>
        </div>
      </div>

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
                ระบบไม่อนุญาตให้เริ่มเรียนบทเรียนหรือทำแบบทดสอบ จนกว่าจะระบุชื่อและรหัสนักศึกษาให้เรียบร้อย
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

      {/* Official Course Syllabus Hero Header (Soft Luminous Tone with Circular Progress Wheel) */}
      <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-sky-50/60 dark:from-[#111827] dark:via-indigo-950/30 dark:to-[#111827] rounded-3xl p-6 sm:p-8 border border-blue-100/90 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
        {/* Ambient soft pastel orbs matching my-progress */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-200/30 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-44 h-44 bg-amber-200/25 dark:bg-amber-600/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-10 -top-10 w-44 h-44 bg-indigo-200/20 dark:bg-indigo-600/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-5">
          
          {/* Top Row: Meta Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold bg-white/95 dark:bg-slate-800 text-blue-800 dark:text-blue-300 px-3.5 py-1 rounded-full flex items-center gap-1.5 border border-blue-200/80 dark:border-slate-700 shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{courseInfo.curriculum}</span>
              </span>
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                • {courseInfo.semester}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-mono font-bold bg-white/95 dark:bg-slate-800 px-3.5 py-1 rounded-full border border-blue-200/80 dark:border-slate-700 text-blue-900 dark:text-blue-300 shadow-2xs">
              รหัสวิชา: {courseInfo.code}
            </span>
          </div>

          {/* Course Title - Full width across top so it stays strictly on a single line! */}
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[30px] font-black tracking-tight text-slate-900 dark:text-white break-keep whitespace-normal xl:whitespace-nowrap">
              {courseInfo.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2 font-medium">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{courseInfo.department}</span>
            </p>
          </div>

          {/* Bottom Section: Split into Instructor on Left & Circular Progress Wheel & Resume on Right */}
          <div className="pt-4 border-t border-blue-100/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Instructor Badge */}
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="w-9 h-9 rounded-2xl bg-blue-100/70 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">อาจารย์ผู้สอนประจำวิชา</span>
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{courseInfo.instructor}</span>
              </div>
            </div>

            {/* Right: Circular Progress Wheel & Quick Resume Button */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 self-start lg:self-auto">
              
              {/* Circular Wheel Widget in Banner */}
              <div className="flex items-center gap-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-blue-200/80 dark:border-slate-700 shadow-xs">
                <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                  <svg className="w-11 h-11 transform -rotate-90 drop-shadow-2xs" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100 dark:text-slate-700"
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
                  <span className="text-xs font-black text-slate-900 dark:text-white absolute font-mono">{stats.percent}%</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block">ความก้าวหน้ารวม</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{stats.completed}/{stats.total} บทเรียน</span>
                </div>
              </div>

              {/* Quick Resume Button */}
              {stats.nextLesson && (
                <Link
                  href={`/lessons/${stats.nextLesson.code}/intro`}
                  className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition active:scale-95 shrink-0 whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {stats.percent === 100 
                      ? 'ทบทวนบทเรียน' 
                      : `เรียนต่อ: ${stats.nextLesson.title.startsWith('บทที่') ? stats.nextLesson.title.split(' ')[0] + ' ' + (stats.nextLesson.title.split(' ')[1] || '') : `บทที่ ${stats.nextLesson.sortOrder}`}`}
                  </span>
                </Link>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Control Bar: Search, Status Tabs, View Switcher */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Real-time Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="ค้นหาบทเรียน, รหัส, วิดีโอ, หรือจุดประสงค์การเรียนรู้..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-2xs transition"
            />
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                title="ล้างคำค้น"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right controls: View Mode Switcher + Sort */}
          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#111827] text-blue-700 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="มุมมองการ์ด (Grid View)"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">การ์ด</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-[#111827] text-blue-700 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="มุมมองรายการแผนการสอน (List View)"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">รายการ</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as 'order' | 'progress')}
              className="text-xs sm:text-sm bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="order">เรียงตามลำดับบทเรียน (1-8)</option>
              <option value="progress">เรียงตามความก้าวหน้า</option>
            </select>
          </div>

        </div>

        {/* Status Filter Tabs */}
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
            ผ่านเกณฑ์แล้ว ({stats.completed})
          </button>
          <button
            onClick={() => setStatusFilter('not_started')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              statusFilter === 'not_started'
                ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            ยังไม่ได้เริ่ม ({stats.notStarted})
          </button>

          {searchQuery && (
            <div className="ml-auto text-xs font-semibold text-blue-600 dark:text-blue-400">
              พบ {filteredLessons.length} บทเรียนที่ตรงกับคำค้น
            </div>
          )}
        </div>
      </div>

      {/* Content: Grid or List View */}
      {!isLoaded ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <LessonCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredLessons.length === 0 ? (
        <EmptyStateCard
          title={lessons.length === 0 ? "ยังไม่มีบทเรียนในรายวิชานี้" : "ไม่พบบทเรียนที่ตรงกับเงื่อนไข"}
          description={lessons.length === 0 ? "ระบบพร้อมสำหรับเนื้อหาใหม่ เมื่ออาจารย์ผู้สอนเพิ่มบทเรียนจะแสดงที่นี่โดยอัตโนมัติ" : (searchQuery ? `ไม่พบบทเรียนที่มีคำว่า "${searchQuery}" กรุณาลองค้นหาด้วยคำอื่น หรือกดล้างการค้นหา` : 'ยังไม่มีบทเรียนในสถานะที่เลือก')}
          actionLabel={searchQuery ? 'ล้างคำค้นหา' : undefined}
          onAction={searchQuery ? () => setSearchQuery('') : undefined}
        />
      ) : viewMode === 'grid' ? (
        
        /* Grid View (⊞) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

            const version = lesson.versions[0];

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
                {/* Thumbnail Header */}
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  <LessonCoverPoster lesson={lesson} />

                  {/* Order Badge */}
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-xl bg-blue-600 text-white text-sm font-black flex items-center justify-center shadow-md z-20">
                    {lesson.sortOrder}
                  </div>

                  {/* Status Badge */}
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

                {/* Card Content Body */}
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

                    {/* Media Badges */}
                    <div className="flex items-center gap-2 pt-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Play className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        {version?.videos?.length || 2} คลิปวิดีโอ
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {version?.resources?.length || 1} สื่อเอกสาร
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

                  {/* Dynamic Action Buttons */}
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

      ) : (

        /* List / Syllabus View (☰) */
        <div className="space-y-4">
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

            const version = lesson.versions[0];

            return (
              <div
                key={lesson.id}
                onClick={() => handleStartLesson(destinationUrl, lesson.title, isLocked)}
                className={`bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 group transition-all duration-300 ${
                  isLocked
                    ? 'cursor-not-allowed opacity-80'
                    : 'cursor-pointer hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/40 hover:border-blue-400 dark:hover:border-blue-500 active:translate-y-0'
                }`}
              >
                {/* Left: Thumbnail & Lesson info */}
                <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
                  <div className="relative w-full sm:w-44 h-28 rounded-2xl bg-slate-900 overflow-hidden shrink-0">
                    <LessonCoverPoster lesson={lesson} compact={true} />
                    <div className="absolute top-2 left-2 w-7 h-7 rounded-xl bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-md z-20">
                      {lesson.sortOrder}
                    </div>
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/50">
                        {lesson.code}
                      </span>
                      {isCompleted ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white">
                          เสร็จสิ้น (Passed)
                        </span>
                      ) : isInProgress ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                          กำลังเรียน (In Progress)
                        </span>
                      ) : isReadyForPostTest ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white">
                          รอสอบ Post-test
                        </span>
                      ) : isLocked ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-400 text-white">
                          ยังไม่เปิดเรียน
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-900/50">
                          ยังไม่ได้เริ่ม
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {lesson.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>

                    {/* Learning Objectives Chips */}
                    {version?.learningObjectives && version.learningObjectives.length > 0 && (
                      <div className="pt-1 flex flex-wrap items-center gap-1.5">
                        {version.learningObjectives.slice(0, 2).map((obj, i) => (
                          <span key={i} className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1 border border-transparent dark:border-slate-700/60">
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="truncate max-w-xs">{obj}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Media counts, Progress & Action buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 shrink-0 lg:w-56 pt-2 lg:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  
                  {/* Media counts */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                      <Play className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      {version?.videos?.length || 2} คลิป
                    </span>
                    <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                      <FileText className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      {version?.resources?.length || 1} สื่อ
                    </span>
                    <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                      <Clock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                      {version?.estimatedDurationMinutes || 30} น.
                    </span>
                  </div>

                  {/* Circular Progress Wheel in List View */}
                  <div className="w-full flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">ความก้าวหน้า</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {isCompleted ? 'ผ่านเกณฑ์' : isInProgress ? 'กำลังเรียน' : isReadyForPostTest ? 'รอสอบ' : isLocked ? '-' : 'ยังไม่เริ่ม'}
                      </span>
                    </div>
                    <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
                      <svg className="w-9 h-9 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-200/80 dark:text-slate-700"
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
                  </div>

                  {/* Action Buttons */}
                  <div className="w-full" onClick={(e) => e.stopPropagation()}>
                    {isCompleted ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartLesson(`/lessons/${lesson.code}/intro?mode=review`, lesson.title, false)}
                          className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1 border border-emerald-200 dark:border-emerald-800 transition whitespace-nowrap cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>ทบทวน</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartLesson(`/lessons/${lesson.code}/result`, lesson.title, false)}
                          className="py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-1 border border-blue-200 dark:border-blue-800 transition whitespace-nowrap cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>ดูผล</span>
                        </button>
                      </div>
                    ) : isInProgress ? (
                      <button
                        type="button"
                        onClick={() => handleStartLesson(`/lessons/${lesson.code}/learn`, lesson.title, false)}
                        className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs whitespace-nowrap cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-white shrink-0" />
                        <span>เรียนต่อ</span>
                      </button>
                    ) : isReadyForPostTest ? (
                      <button
                        type="button"
                        onClick={() => handleStartLesson(`/lessons/${lesson.code}/post-test`, lesson.title, false)}
                        className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs whitespace-nowrap cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span>ทำแบบทดสอบ</span>
                      </button>
                    ) : isLocked ? (
                      <button
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed whitespace-nowrap"
                      >
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span>ยังไม่เปิดเรียน</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartLesson(`/lessons/${lesson.code}/intro`, lesson.title, false)}
                        className="w-full py-2.5 px-4 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-bold flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-blue-600 dark:fill-blue-400 shrink-0" />
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

    </div>
  );
}
