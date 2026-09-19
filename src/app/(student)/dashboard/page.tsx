'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Play, BookOpen, CheckCircle2, Award, Search, ArrowRight, 
  Clock, Lock, Megaphone, FileText, Calendar, RefreshCw, AlertTriangle, Eye,
  X, Sparkles, Filter, ChevronRight
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { EmptyStateCard } from '@/components/shared/SharedDialogs';
import { Announcement } from '@/types';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { currentUser, lessons, announcements, progressMap } = useAppStore();

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

    if (hour >= 5 && hour < 12) {
      text = 'อรุณสวัสดิ์ยามเช้า';
      icon = '🌅';
      period = 'ช่วงเช้า';
    } else if (hour >= 12 && hour < 17) {
      text = 'สวัสดีตอนบ่าย';
      icon = '🌤️';
      period = 'ช่วงบ่าย';
    } else if (hour >= 17 && hour < 21) {
      text = 'สวัสดีตอนเย็น';
      icon = '🌇';
      period = 'ช่วงเย็น';
    } else {
      text = 'สวัสดีช่วงค่ำ';
      icon = '🌙';
      period = 'ช่วงค่ำ';
    }

    const thaiDate = now.toLocaleDateString('th-TH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return { text, icon, period, thaiDate };
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
      
      {/* 3 Top Executive Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* Card 1: Greeting Hero with Real-Time Flair */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden shadow-lg flex flex-col justify-between border border-blue-600/30">
          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-blue-50 flex items-center gap-1.5 border border-white/10 shadow-xs">
                <span>{greetingInfo.icon}</span>
                <span>{greetingInfo.text}</span>
              </span>
              <span className="text-xs text-blue-200 font-medium hidden sm:inline-block">
                • {greetingInfo.thaiDate}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                สวัสดีคุณ <span className="text-amber-300">{currentUser.fullName || currentUser.displayName || 'นักศึกษา'}</span>
              </h1>
              <p className="text-sm text-blue-100/90 mt-1 font-medium">
                ยินดีต้อนรับสู่ระบบการเรียนรู้วิชาเทคโนโลยีการศึกษา
              </p>
            </div>
          </div>

          {/* Quick Resume Button */}
          {stats.activeLesson && (
            <div className="relative z-10 pt-6 mt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-xs text-blue-200 font-semibold block">บทเรียนถัดไปสำหรับคุณ:</span>
                <p className="text-sm font-bold text-white truncate max-w-xs">
                  {stats.activeLesson.title.startsWith('บทที่')
                    ? stats.activeLesson.title
                    : `บทที่ ${stats.activeLesson.sortOrder} ${stats.activeLesson.title}`}
                </p>
              </div>
              <Link
                href={`/lessons/${stats.activeLesson.code}/intro`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-blue-900 hover:bg-amber-300 hover:text-slate-900 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition active:scale-95 shrink-0"
              >
                <span>เข้าสู่บทเรียน</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Background Decorative Blur Orbs */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Card 2: Overall Progress Card (Elevated & Live Calc) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-emerald-50/70 via-white to-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">ความก้าวหน้าโดยรวม</h3>
                <span className="text-xs text-slate-500">ภาพรวมการเรียนของคุณ</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              {stats.completed} จาก {stats.total} บทเรียน
            </span>
          </div>

          <div className="flex items-center gap-5 my-4">
            {/* Circular SVG Ring */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200/70"
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
              <span className="absolute text-base sm:text-lg font-black text-slate-800">
                {stats.percent}%
              </span>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${stats.percent}%` }}
                ></div>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                {stats.percent === 100 
                  ? 'สำเร็จครบทุกบทเรียนแล้ว! 🎉' 
                  : stats.percent > 0 
                  ? 'คุณกำลังไปได้ดีมาก!' 
                  : 'เริ่มต้นบทเรียนแรกกันเลย!'}
              </p>
              <p className="text-xs text-slate-500">
                {stats.percent === 100 
                  ? 'ยินดีด้วย! คุณสามารถทบทวนเนื้อหาได้ตลอดเวลา' 
                  : `เหลืออีก ${stats.total - stats.completed} บทเรียน เพื่อเรียนจบวิชา`}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>กำลังเรียน: <strong className="text-blue-600">{stats.inProgress}</strong></span>
            <span>ผ่านแล้ว: <strong className="text-emerald-600">{stats.completed}</strong></span>
            <span>ยังไม่เริ่ม: <strong className="text-slate-600">{stats.notStarted}</strong></span>
          </div>
        </div>

        {/* Card 3: Quick Stats Counters (Elevated with colorful chips) */}
        <div className="lg:col-span-3 bg-gradient-to-br from-indigo-50/60 via-white to-white rounded-3xl p-6 sm:p-7 border border-indigo-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">สรุปกิจกรรมของฉัน</h3>
              <span className="text-xs text-slate-500">สถิติการเรียนรู้</span>
            </div>
          </div>
          
          <div className="space-y-3.5 my-auto py-1">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs">
              <span className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Play className="w-3.5 h-3.5 fill-blue-600" />
                </div>
                วิดีโอที่รับชมแล้ว
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                {stats.completed * 2} / {stats.totalVideos}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs">
              <span className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                แบบทดสอบที่ทำแล้ว
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                {stats.completed * 2} / {stats.total * 2}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs">
              <span className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                </div>
                บทเรียนที่ผ่านเกณฑ์
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-600 font-mono">
                {stats.completed} / {stats.total}
              </span>
            </div>
          </div>

          <Link
            href="/my-progress"
            className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 transition pt-2 border-t border-slate-100"
          >
            <span>ดูตารางความก้าวหน้าละเอียด</span>
            <ChevronRight className="w-3.5 h-3.5" />
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
              <h2 className="text-base sm:text-lg font-black text-slate-900">ข่าวประกาศล่าสุด</h2>
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
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                {ann.imageUrl && (
                  <div className="w-full h-36 rounded-2xl overflow-hidden mb-1 border border-slate-100 bg-slate-50 relative">
                    <img src={ann.imageUrl} alt={ann.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      ann.category === 'announcement'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : ann.category === 'update'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {ann.category === 'announcement' ? 'ประกาศด่วน' : ann.category === 'update' ? 'อัปเดตบทเรียน' : 'กิจกรรมการเรียน'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(ann.publishedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition">
                    {ann.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {ann.body}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
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
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                บทเรียนทั้งหมด ({lessons.length} บทเรียน)
              </h2>
              <p className="text-xs text-slate-500">
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
                className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-2xs transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
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
              className="text-xs sm:text-sm bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs font-medium text-slate-700 cursor-pointer"
            >
              <option value="order">เรียงตามลำดับบทเรียน</option>
              <option value="progress">เรียงตามความก้าวหน้า</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            ทั้งหมด ({lessons.length})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              statusFilter === 'in_progress'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            กำลังเรียน ({stats.inProgress})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            ผ่านแล้ว ({stats.completed})
          </button>
          <button
            onClick={() => setStatusFilter('not_started')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              statusFilter === 'not_started'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            ยังไม่เริ่ม ({stats.notStarted})
          </button>

          {searchQuery && (
            <div className="ml-auto text-xs font-semibold text-blue-600">
              ผลการค้นหา: พบ {filteredLessons.length} บทเรียน
            </div>
          )}
        </div>

        {/* Lesson Cards Grid */}
        {filteredLessons.length === 0 ? (
          <EmptyStateCard
            title="ไม่พบบทเรียนที่ตรงกับเงื่อนไข"
            description={searchQuery ? `ไม่พบบทเรียนที่มีคำว่า "${searchQuery}" ลองค้นหาด้วยคำอื่น หรือกดล้างการค้นหา` : 'ยังไม่มีบทเรียนในสถานะนี้'}
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
                  onClick={() => !isLocked && router.push(destinationUrl)}
                  className={`bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-400 transition-all flex flex-col justify-between group ${
                    isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                  }`}
                >
                  {/* Card Thumbnail / Header */}
                  <div className="relative h-40 sm:h-44 bg-slate-100 overflow-hidden">
                    {lesson.coverImageUrl ? (
                      <img
                        src={lesson.coverImageUrl}
                        alt={lesson.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-300">
                        <BookOpen className="w-10 h-10" />
                      </div>
                    )}

                    {/* Number Badge */}
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-xl bg-blue-600 text-white text-sm font-black flex items-center justify-center shadow-md">
                      {lesson.sortOrder}
                    </div>

                    {/* Status Tag Pill (Enlarged to text-xs) */}
                    <div className="absolute top-3 right-3">
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
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 shadow-2xs">
                          ยังไม่ได้เริ่ม
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-xs font-mono font-semibold text-blue-600 mb-1">
                        {lesson.code}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition">
                        {lesson.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                        {lesson.description}
                      </p>

                      {/* Media Badges (text-xs) */}
                      <div className="flex items-center gap-2 pt-3 text-xs text-slate-600 font-medium">
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          <Play className="w-3.5 h-3.5 text-blue-600" />
                          {lesson.versions[0]?.videos?.length || 2} คลิปวิดีโอ
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          {lesson.versions[0]?.resources?.length || 1} สื่อเอกสาร
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>ความก้าวหน้า</span>
                        <span className="font-bold text-slate-800">{isLocked ? '-' : `${progress.progressPercent}%`}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' : isReadyForPostTest ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: isLocked ? '0%' : `${progress.progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Dynamic Action Buttons (Enlarged to text-sm) */}
                    <div className="pt-2">
                      {isCompleted ? (
                        <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/lessons/${lesson.code}/intro?mode=review`}
                            className="py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border border-emerald-200 transition active:scale-95"
                          >
                            <BookOpen className="w-4 h-4" />
                            ทบทวน
                          </Link>
                          <Link
                            href={`/lessons/${lesson.code}/result`}
                            className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                          >
                            <Award className="w-4 h-4 text-blue-600" />
                            ดูผลคะแนน
                          </Link>
                        </div>
                      ) : isInProgress ? (
                        <Link
                          href={`/lessons/${lesson.code}/learn`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-xs active:scale-95"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          เรียนต่อ
                        </Link>
                      ) : isReadyForPostTest ? (
                        <Link
                          href={`/lessons/${lesson.code}/post-test`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-xs active:scale-95"
                        >
                          <FileText className="w-4 h-4" />
                          ทำแบบทดสอบหลังเรียน
                        </Link>
                      ) : isLocked ? (
                        <button
                          disabled
                          className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 text-slate-400 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <Lock className="w-4 h-4" />
                          ยังไม่เปิดเรียน
                        </button>
                      ) : (
                        <Link
                          href={`/lessons/${lesson.code}/intro`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full py-2.5 px-4 rounded-2xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition active:scale-95"
                        >
                          <Play className="w-4 h-4 fill-blue-600" />
                          เริ่มเรียน
                        </Link>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${
                  selectedAnnouncement.category === 'announcement'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : selectedAnnouncement.category === 'update'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {selectedAnnouncement.category === 'announcement' ? 'ประกาศสำคัญ' : selectedAnnouncement.category === 'update' ? 'อัปเดตบทเรียน' : 'กิจกรรมการเรียน'}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
                  {selectedAnnouncement.title}
                </h3>
                <p className="text-xs text-slate-500">
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
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedAnnouncement.imageUrl && (
              <div className="w-full max-h-72 rounded-2xl overflow-hidden border border-slate-100">
                <img 
                  src={selectedAnnouncement.imageUrl} 
                  alt={selectedAnnouncement.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
            )}

            <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line py-2 border-t border-slate-100">
              {selectedAnnouncement.body}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="py-2.5 px-6 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
