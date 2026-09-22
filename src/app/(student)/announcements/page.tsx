'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Megaphone, Search, ArrowLeft, ArrowRight, Calendar, Sparkles, 
  Building2, User, Filter, X, LayoutGrid, List, Bell, Clock,
  CheckCircle2, Info, ChevronRight, ExternalLink
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { EmptyStateCard } from '@/components/shared/SharedDialogs';
import { Announcement } from '@/types';

export default function AnnouncementsPage() {
  const { announcements } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'announcement' | 'update' | 'activity'>('all');
  const [selectedSort, setSelectedSort] = useState<'newest' | 'oldest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Course Information Constants
  const courseInfo = {
    code: '30-401-001-204',
    title: 'นวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้',
    instructor: 'ผศ.ดร.เฉลิมพล บุญทศ',
    semester: 'ภาคการศึกษาที่ 1 / ปีการศึกษา 2569',
    curriculum: 'หลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต (ค.อ.บ.)',
    department: 'สาขาวิชาครุศาสตร์อุตสาหกรรมอุตสาหการ คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น',
  };

  // Category counts
  const categoryStats = useMemo(() => {
    const total = announcements.length;
    let urgentCount = 0;
    let updateCount = 0;
    let activityCount = 0;

    announcements.forEach((ann) => {
      if (ann.category === 'announcement') urgentCount++;
      else if (ann.category === 'update') updateCount++;
      else if (ann.category === 'activity') activityCount++;
    });

    return { total, urgentCount, updateCount, activityCount };
  }, [announcements]);

  // Filtered and sorted announcements
  const filteredAnnouncements = useMemo(() => {
    let result = [...announcements];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (ann) =>
          ann.title.toLowerCase().includes(q) ||
          ann.body.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      result = result.filter((ann) => ann.category === categoryFilter);
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return selectedSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [announcements, searchQuery, categoryFilter, selectedSort]);

  // Format date helper
  const formatThaiDate = (dateString: string, isFull: boolean = false) => {
    try {
      const d = new Date(dateString);
      if (isFull) {
        return d.toLocaleDateString('th-TH', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
      return d.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-[1500px] mx-auto pb-16">
      
      {/* Top Breadcrumb & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition flex items-center justify-center shadow-2xs"
            title="กลับหน้าหลัก"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              ข่าวประกาศและประชาสัมพันธ์ (Announcements)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              ติดตามข้อมูลข่าวสาร กำหนดการสำคัญ และกิจกรรมการเรียนรู้จากอาจารย์ผู้สอน
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 shadow-2xs font-mono">
            {courseInfo.code}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800 shadow-2xs">
            {announcements.length} ข่าวประกาศ
          </span>
        </div>
      </div>

      {/* Official Course & Announcement Hero Banner (Soft Luminous Pastel Theme) */}
      <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-sky-50/60 dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 rounded-3xl p-6 sm:p-8 border border-blue-100/90 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Ambient soft pastel orbs */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-44 h-44 bg-amber-200/25 dark:bg-amber-900/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-10 -top-10 w-44 h-44 bg-indigo-200/20 dark:bg-indigo-900/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-5">
          
          {/* Top Row: Meta Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold bg-white/95 dark:bg-slate-800/95 text-blue-800 dark:text-blue-300 px-3.5 py-1 rounded-full flex items-center gap-1.5 border border-blue-200/80 dark:border-blue-900 shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{courseInfo.curriculum}</span>
              </span>
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                • {courseInfo.semester}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-mono font-bold bg-white/95 dark:bg-slate-800/95 px-3.5 py-1 rounded-full border border-blue-200/80 dark:border-blue-900 text-blue-900 dark:text-blue-200 shadow-2xs">
              ศูนย์ข้อมูลข่าวสารรายวิชา
            </span>
          </div>

          {/* Course Title - Matching exact size and line behavior of my-lessons */}
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[30px] font-bold tracking-tight text-slate-900 dark:text-white break-keep whitespace-normal xl:whitespace-nowrap">
              {courseInfo.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2 font-medium">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{courseInfo.department}</span>
            </p>
          </div>

          {/* Bottom Row: Instructor & Category Highlights */}
          <div className="pt-4 border-t border-blue-100/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="w-9 h-9 rounded-2xl bg-blue-100/70 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">อาจารย์ผู้สอนประจำวิชา</span>
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{courseInfo.instructor}</span>
              </div>
            </div>

            {/* Category Stat Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-white/95 dark:bg-slate-800/95 px-3 py-1.5 rounded-xl border border-red-200/80 dark:border-red-900/60 shadow-2xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">ประกาศสำคัญ:</span>
                <span className="text-xs font-bold text-red-700 dark:text-red-400">{categoryStats.urgentCount}</span>
              </div>
              <div className="bg-white/95 dark:bg-slate-800/95 px-3 py-1.5 rounded-xl border border-blue-200/80 dark:border-blue-900/60 shadow-2xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">อัปเดตบทเรียน:</span>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{categoryStats.updateCount}</span>
              </div>
              <div className="bg-white/95 dark:bg-slate-800/95 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 shadow-2xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">กิจกรรม:</span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{categoryStats.activityCount}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                categoryFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-none'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <span>ทั้งหมด</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                categoryFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {categoryStats.total}
              </span>
            </button>

            <button
              onClick={() => setCategoryFilter('announcement')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                categoryFilter === 'announcement'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-200 dark:shadow-none'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-400'
              }`}
            >
              <span>ประกาศสำคัญ/ด่วน</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                categoryFilter === 'announcement' ? 'bg-red-500 text-white' : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
              }`}>
                {categoryStats.urgentCount}
              </span>
            </button>

            <button
              onClick={() => setCategoryFilter('update')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                categoryFilter === 'update'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-none'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-400'
              }`}
            >
              <span>อัปเดตบทเรียน</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                categoryFilter === 'update' ? 'bg-blue-500 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
              }`}>
                {categoryStats.updateCount}
              </span>
            </button>

            <button
              onClick={() => setCategoryFilter('activity')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                categoryFilter === 'activity'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200 dark:shadow-none'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400'
              }`}
            >
              <span>กิจกรรมการเรียน</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                categoryFilter === 'activity' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
              }`}>
                {categoryStats.activityCount}
              </span>
            </button>
          </div>

          {/* Search, Sort, and View Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="ค้นหาชื่อประกาศ, เนื้อหา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-2xs transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
                  title="ล้างคำค้น"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as 'newest' | 'oldest')}
              className="py-2 px-3 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium cursor-pointer shadow-2xs"
            >
              <option value="newest">ประกาศล่าสุดก่อน</option>
              <option value="oldest">ประกาศเก่าสุดก่อน</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="มุมมองการ์ด"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="มุมมองรายการ"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Announcements List / Grid */}
      {filteredAnnouncements.length === 0 ? (
        <EmptyStateCard
          title="ไม่พบข่าวประกาศที่ค้นหา"
          description="ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อดูประกาศเพิ่มเติม"
        />
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAnnouncements.map((ann) => {
            const isUrgent = ann.category === 'announcement';
            const isUpdate = ann.category === 'update';
            const isActivity = ann.category === 'activity';

            return (
              <div
                key={ann.id}
                onClick={() => setSelectedAnnouncement(ann)}
                className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {ann.imageUrl ? (
                    <div className="w-full h-44 rounded-2xl overflow-hidden mb-3 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 relative">
                      <img
                        src={ann.imageUrl}
                        alt={ann.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    </div>
                  ) : (
                    <div className="w-full h-24 rounded-2xl mb-3 bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-slate-800 dark:to-slate-800/60 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-400">
                      <Megaphone className="w-8 h-8 opacity-40" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        isUrgent
                          ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                          : isUpdate
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {isUrgent ? 'ประกาศด่วน' : isUpdate ? 'อัปเดตบทเรียน' : 'กิจกรรมการเรียน'}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatThaiDate(ann.publishedAt)}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug">
                      {ann.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {ann.body}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  <span>อ่านรายละเอียดฉบับเต็ม</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredAnnouncements.map((ann) => {
            const isUrgent = ann.category === 'announcement';
            const isUpdate = ann.category === 'update';

            return (
              <div
                key={ann.id}
                onClick={() => setSelectedAnnouncement(ann)}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  {ann.imageUrl ? (
                    <div className="w-20 h-20 sm:w-24 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                      <img
                        src={ann.imageUrl}
                        alt={ann.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800">
                      <Megaphone className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        isUrgent
                          ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                          : isUpdate
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {isUrgent ? 'ประกาศด่วน' : isUpdate ? 'อัปเดตบทเรียน' : 'กิจกรรมการเรียน'}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        • {formatThaiDate(ann.publishedAt)}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {ann.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {ann.body}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0 self-end sm:self-auto">
                  <span className="hidden sm:inline">อ่านต่อ</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Announcement Detail Modal Dialog */}
      {selectedAnnouncement && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            className="bg-white dark:bg-[#111827] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <span className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${
                  selectedAnnouncement.category === 'announcement'
                    ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                    : selectedAnnouncement.category === 'update'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}>
                  {selectedAnnouncement.category === 'announcement'
                    ? 'ประกาศสำคัญ'
                    : selectedAnnouncement.category === 'update'
                    ? 'อัปเดตบทเรียน'
                    : 'กิจกรรมการเรียน'}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                  {selectedAnnouncement.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>เผยแพร่เมื่อ: {formatThaiDate(selectedAnnouncement.publishedAt, true)}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedAnnouncement.imageUrl && (
              <div className="w-full max-h-80 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xs">
                <img
                  src={selectedAnnouncement.imageUrl}
                  alt={selectedAnnouncement.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line py-3 border-t border-slate-100 dark:border-slate-800">
              {selectedAnnouncement.body}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>รายวิชานวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้</span>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="py-2 px-5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 transition cursor-pointer"
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
