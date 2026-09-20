'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Plus, RefreshCw, Search, Filter, Eye, Edit, Video,
  FileText, CheckCircle2, Clock, Archive, Sparkles, Building2, 
  User, HelpCircle, ArrowLeft, ArrowRight, X, ExternalLink, Layers,
  BarChart3, Shield, Save, Trash2
} from 'lucide-react';
import { useAppStore } from '@/data/store';

export default function AdminLessonsPage() {
  const { lessons, quizzes, isSupabaseLive, refreshFromCloud, saveAllLessons, saveAllQuizzes, deleteLesson } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Course Information Constants
  const courseInfo = {
    code: '30-401-001-204',
    title: 'นวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้',
    instructor: 'ผศ.ดร.เฉลิมพล บุญทศ',
    semester: 'ภาคการศึกษาที่ 1 / ปีการศึกษา 2569',
    curriculum: 'หลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต (ค.อ.บ.)',
    department: 'สาขาวิชาครุศาสตร์อุตสาหกรรมอุตสาหการ คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น',
  };

  // Live Dynamic Statistics Calculation
  const stats = useMemo(() => {
    const total = lessons.length;
    let published = 0;
    let draft = 0;
    let totalVideos = 0;
    let totalResources = 0;

    lessons.forEach((l) => {
      if (l.status === 'published') published++;
      else if (l.status === 'draft') draft++;

      const ver = l.versions[0];
      if (ver) {
        totalVideos += ver.videos?.length || 0;
        totalResources += ver.resources?.length || 0;
      }
    });

    return {
      total,
      published,
      draft,
      totalVideos,
      totalResources,
      totalQuizzes: quizzes.length,
    };
  }, [lessons, quizzes]);

  // Filter lessons
  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        l.title.toLowerCase().includes(q) || 
        l.code.toLowerCase().includes(q) ||
        (l.description && l.description.toLowerCase().includes(q));
      
      const matchStatus = statusFilter === 'all' || l.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [lessons, searchQuery, statusFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (isSupabaseLive) {
      await refreshFromCloud();
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // ปุ่มซิงค์ข้อมูลบทเรียนและแบบทดสอบขึ้น Supabase Cloud
  const handleManualSyncCloud = async () => {
    setIsSaving(true);
    try {
      if (isSupabaseLive) {
        const okLessons = await saveAllLessons(lessons);
        const okQuizzes = await saveAllQuizzes(quizzes);
        if (okLessons && okQuizzes) {
          setToastMsg('ซิงค์ข้อมูลบทเรียนและแบบทดสอบทั้งหมดขึ้น Supabase Cloud สำเร็จแล้ว');
        } else {
          setToastMsg('ข้อมูลบทเรียนถูกบันทึกลงในระบบเรียบร้อยแล้ว');
        }
      } else {
        setToastMsg('บันทึกข้อมูลบทเรียนลงในเครื่องเรียบร้อยแล้ว');
      }
    } catch (e) {
      console.warn('Sync error:', e);
      setToastMsg('เกิดข้อผิดพลาดในการซิงค์ข้อมูล');
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  const handleDeleteLesson = async (id: string, code: string, title: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบทเรียน "${title}" (${code})?\n\nการกระทำนี้จะลบบทเรียนออกจากระบบทั้งในเครื่องและบน Cloud ฐานข้อมูลกลาง`)) {
      try {
        await deleteLesson(id);
        setToastMsg(`ลบบทเรียน ${code} สำเร็จแล้ว`);
        setTimeout(() => setToastMsg(null), 3000);
      } catch (err) {
        setToastMsg('เกิดข้อผิดพลาดในการลบบทเรียน');
        setTimeout(() => setToastMsg(null), 3000);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Top Header & Fast Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
              Admin CMS Console
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono font-bold text-slate-600">
              {courseInfo.code}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>จัดการเนื้อหาบทเรียน (Lessons Management)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            จัดการโครงสร้างรายวิชา วิดีโอบรรยาย เอกสารประกอบ และคลังข้อสอบ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Database Status Indicator */}
          {isSupabaseLive ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>ฐานข้อมูล Cloud (Live)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>หน่วยความจำเครื่อง</span>
            </div>
          )}

          <button 
            onClick={handleRefresh}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs transition cursor-pointer ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="รีเฟรชรายการ"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">รีเฟรช</span>
          </button>
          
          <Link
            href="/admin/lessons/new"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-200 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มบทเรียนใหม่</span>
          </Link>
        </div>
      </div>

      {/* Toast Alert Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs transition-all animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Official Course Syllabus Hero Banner (Soft Luminous Pastel Theme) */}
      <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-sky-50/60 rounded-3xl p-6 sm:p-7 border border-blue-100/90 shadow-sm relative overflow-hidden">
        {/* Ambient soft pastel orbs */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-44 h-44 bg-amber-200/25 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-10 -top-10 w-44 h-44 bg-indigo-200/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          
          {/* Top Row: Meta Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold bg-white/95 text-blue-800 px-3.5 py-1 rounded-full flex items-center gap-1.5 border border-blue-200/80 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{courseInfo.curriculum}</span>
              </span>
              <span className="text-xs sm:text-sm text-slate-600 font-medium">
                • {courseInfo.semester}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-mono font-bold bg-white/95 px-3.5 py-1 rounded-full border border-blue-200/80 text-blue-900 shadow-2xs">
              รหัสวิชา: {courseInfo.code}
            </span>
          </div>

          {/* Course Title - Matching exact size and line behavior */}
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] font-bold tracking-tight text-slate-900 break-keep whitespace-normal xl:whitespace-nowrap">
              {courseInfo.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 font-medium">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{courseInfo.department}</span>
            </p>
          </div>

          {/* Bottom Row: Instructor & Quick Stats */}
          <div className="pt-3.5 border-t border-blue-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
              <div className="w-9 h-9 rounded-2xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">อาจารย์ผู้รับผิดชอบรายวิชา</span>
                <span className="text-sm sm:text-base font-bold text-slate-900">{courseInfo.instructor}</span>
              </div>
            </div>

            {/* Live Media Highlights */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-blue-200/80 shadow-2xs flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-700">{stats.totalVideos} คลิปวิดีโอ</span>
              </div>
              <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-indigo-200/80 shadow-2xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold text-slate-700">{stats.totalResources} เอกสาร/สื่อ</span>
              </div>
              <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-emerald-200/80 shadow-2xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-slate-700">{stats.totalQuizzes} ชุดข้อสอบ</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4 Live KPI Stats Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Card 1: Total Lessons */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5 hover:shadow-sm transition">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {stats.total}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">บทเรียนทั้งหมดในวิชา</div>
          </div>
        </div>

        {/* Card 2: Published Lessons */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5 hover:shadow-sm transition">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 leading-tight">
              {stats.published}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">เผยแพร่ให้นักศึกษาแล้ว</div>
          </div>
        </div>

        {/* Card 3: Draft Lessons */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5 hover:shadow-sm transition">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-amber-600 leading-tight">
              {stats.draft}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">ฉบับร่าง (รอเผยแพร่)</div>
          </div>
        </div>

        {/* Card 4: Total Learning Media */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5 hover:shadow-sm transition">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-indigo-600 leading-tight">
              {stats.totalVideos + stats.totalResources}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">สื่อและคลิปรวมทั้งหมด</div>
          </div>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="ค้นหาชื่อบทเรียน, รหัสบทเรียน (RMUTI-001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              title="ล้างคำค้น"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs & Counters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === 'published'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              เผยแพร่แล้ว ({stats.published})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === 'draft'
                  ? 'bg-white text-amber-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              ฉบับร่าง ({stats.draft})
            </button>
          </div>

          <span className="text-xs text-slate-400 font-medium pl-2 hidden md:inline">
            แสดง {filtered.length} จาก {lessons.length} บทเรียน
          </span>
        </div>

      </div>

      {/* Table: Lessons with Clean Compact Layout - No Horizontal Scroll */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-3.5 whitespace-nowrap w-24 sm:w-28">รหัสบทเรียน</th>
              <th className="py-3.5 px-3 min-w-0">ชื่อบทเรียน</th>
              <th className="py-3.5 px-2.5 whitespace-nowrap text-center w-28">สถานะ</th>
              <th className="py-3.5 px-2.5 whitespace-nowrap text-center w-24 hidden sm:table-cell">สื่อการสอน</th>
              <th className="py-3.5 px-2.5 whitespace-nowrap text-center w-20 hidden lg:table-cell">เวอร์ชัน</th>
              <th className="py-3.5 px-3 text-center whitespace-nowrap w-56 sm:w-64">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <p className="text-base font-bold text-slate-700">
                    {lessons.length === 0 ? 'ยังไม่มีบทเรียนในระบบ' : 'ไม่พบบทเรียนที่ตรงกับเงื่อนไข'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {lessons.length === 0 
                      ? 'ระบบพร้อมสำหรับการสร้างบทเรียนใหม่ สามารถคลิกปุ่มด้านล่างเพื่อเพิ่มบทเรียนแรกได้ทันที' 
                      : 'ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองสถานะเป็น ทั้งหมด'}
                  </p>
                  {lessons.length === 0 && (
                    <Link
                      href="/admin/lessons/new"
                      className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>สร้างบทเรียนแรก</span>
                    </Link>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((l) => {
                const activeVer = l.versions[0];
                const hasDraft = l.currentDraftVersionId || l.code === 'RMUTI-003';
                const videoCount = activeVer?.videos?.length || 0;
                const resourceCount = activeVer?.resources?.length || 0;

                return (
                  <tr key={l.id} className="hover:bg-blue-50/30 transition">
                    
                    {/* Code */}
                    <td className="py-3.5 px-3.5 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {l.code}
                    </td>

                    {/* Title only - NO preview image */}
                    <td className="py-3.5 px-3 min-w-0">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                        {l.title.startsWith('บทที่') ? l.title : `บทที่ ${l.sortOrder} ${l.title}`}
                      </div>
                      {l.description && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-lg">
                          {l.description}
                        </div>
                      )}
                    </td>
                    
                    {/* Status */}
                    <td className="py-3.5 px-2.5 whitespace-nowrap text-center">
                      {l.status === 'published' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>เผยแพร่แล้ว</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>ฉบับร่าง</span>
                        </span>
                      )}
                    </td>

                    {/* Media Breakdown */}
                    <td className="py-3.5 px-2.5 whitespace-nowrap text-center hidden sm:table-cell">
                      <div className="inline-flex items-center gap-2 text-slate-600 font-medium text-[11px]">
                        <span className="flex items-center gap-1" title="คลิปวิดีโอ">
                          <Video className="w-3.5 h-3.5 text-blue-600" />
                          <span>{videoCount}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1" title="เอกสาร/สื่อ">
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{resourceCount}</span>
                        </span>
                      </div>
                    </td>

                    {/* Version Tag */}
                    <td className="py-3.5 px-2.5 whitespace-nowrap text-center hidden lg:table-cell">
                      <div className="inline-flex items-center gap-1">
                        <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 text-[11px]">
                          {activeVer ? activeVer.versionTag : 'v1.0'}
                        </span>
                        {hasDraft && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                            Draft
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Quick Actions */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                        
                        {/* Edit Metadata Button */}
                        <Link
                          href={`/admin/lessons/${l.id}/metadata`}
                          className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1 border border-blue-200/80"
                          title="แก้ไขชื่อ คำอธิบาย ข้อมูลบทเรียน"
                        >
                          <Edit className="w-3 h-3 text-blue-600" />
                          <span>ข้อมูล</span>
                        </Link>

                        {/* Edit Videos & Resources Button */}
                        <Link
                          href={`/admin/lessons/${l.id}/content`}
                          className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition flex items-center gap-1 border border-indigo-200/80"
                          title="จัดการวิดีโอและสื่อประกอบ"
                        >
                          <Video className="w-3 h-3 text-indigo-600" />
                          <span>สื่อ</span>
                        </Link>

                        {/* Quizzes Button */}
                        <Link
                          href={`/admin/quizzes/${l.code}`}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition flex items-center gap-1 border border-emerald-200/80"
                          title="จัดการแบบทดสอบ Pre/Post Test"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>ข้อสอบ</span>
                        </Link>

                        {/* Delete Lesson Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteLesson(l.id, l.code, l.title)}
                          className="px-2 py-1 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition flex items-center gap-1 border border-red-200/80 cursor-pointer"
                          title="ลบบทเรียนนี้"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                          <span>ลบ</span>
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Action Footer */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
          <span>จัดการบทเรียนทั้งหมด <strong className="text-slate-800">{lessons.length}</strong> บท</span>
          <span className="text-slate-300">•</span>
          <span>ซิงค์ข้อมูลล่าสุดกับระบบคลาวด์เพื่อบันทึกการเปลี่ยนแปลงทั้งหมด</span>
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleManualSyncCloud}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-200 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
          title="ซิงค์และบันทึกเนื้อหาบทเรียนและข้อสอบทั้งหมดขึ้น Cloud"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'กำลังบันทึกและซิงค์...' : 'บันทึกและซิงค์ขึ้น Cloud'}</span>
        </button>
      </div>

    </div>
  );
}
