'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Plus, Play, FileText, Trash2, Edit, Save, 
  CheckCircle2, AlertTriangle, ExternalLink, Image as ImageIcon,
  FileCode, Layers, Sparkles, Video, ArrowUp, ArrowDown, Eye,
  Building2, User, Clock, Check, X, Film, Info, HelpCircle,
  FolderOpen, Shield, ChevronRight, Copy, ArrowLeftRight, ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { LessonVideo, LessonResource } from '@/types';
import { FileUploadBox } from '@/components/shared/FileUploadBox';
import { dbUpsertLesson } from '@/lib/dbService';

// Helper to extract clean 11-char YouTube ID from various URL formats
function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1] : trimmed;
}

export default function LessonContentEditorPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;
  const { lessons, setLessons, isSupabaseLive } = useAppStore();

  // Course Information Constants matching the official syllabus
  const courseInfo = {
    code: '30-401-001-204',
    title: 'นวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้',
    instructor: 'ผศ.ดร.เฉลิมพล บุญทศ',
    semester: 'ภาคการศึกษาที่ 1 / ปีการศึกษา 2569',
    curriculum: 'หลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต (ค.อ.บ.)',
    department: 'สาขาวิชาครุศาสตร์อุตสาหกรรมอุตสาหการ คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น',
  };

  // Find target lesson supporting both id (e.g. lsn-001) and code (e.g. RMUTI-001)
  const lesson = useMemo(() => {
    return lessons.find((l) => l.id === lessonId || l.code === lessonId) || lessons[0];
  }, [lessons, lessonId]);

  const activeVer = lesson?.versions?.[0];

  const [videos, setVideos] = useState<LessonVideo[]>(() => activeVer?.videos || []);
  const [resources, setResources] = useState<LessonResource[]>(() => activeVer?.resources || []);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Video preview modal
  const [previewVideo, setPreviewVideo] = useState<LessonVideo | null>(null);

  // Resource filter
  const [resourceFilter, setResourceFilter] = useState<'all' | 'pdf' | 'canva' | 'infographic' | 'pptx'>('all');

  // Form for adding new video
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoDuration, setNewVideoDuration] = useState('12:00');
  const [newVideoRequired, setNewVideoRequired] = useState(true);

  // Synchronize state when store updates (e.g. on client rehydration)
  useEffect(() => {
    if (activeVer) {
      setVideos(activeVer.videos || []);
      setResources(activeVer.resources || []);
    }
  }, [lesson?.id]);

  // Derived YouTube ID for live form preview
  const liveExtractedVideoId = useMemo(() => {
    return extractYouTubeId(newVideoUrl);
  }, [newVideoUrl]);

  // Total duration in minutes
  const totalDurationMinutes = useMemo(() => {
    let totalSec = 0;
    videos.forEach((v) => {
      if (v.durationSeconds) {
        totalSec += v.durationSeconds;
      } else if (v.durationMinutes) {
        const parts = v.durationMinutes.split(':');
        if (parts.length === 2) {
          totalSec += parseInt(parts[0] || '0', 10) * 60 + parseInt(parts[1] || '0', 10);
        } else {
          totalSec += parseInt(v.durationMinutes || '0', 10) * 60;
        }
      }
    });
    return Math.round(totalSec / 60);
  }, [videos]);

  // Reorder Videos
  const moveVideo = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === videos.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newVideos = [...videos];
    const temp = newVideos[index];
    newVideos[index] = newVideos[targetIndex];
    newVideos[targetIndex] = temp;
    const updated = newVideos.map((v, idx) => ({ ...v, sortOrder: idx + 1 }));
    setVideos(updated);
  };

  // Reorder Resources
  const moveResource = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === resources.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newResources = [...resources];
    const temp = newResources[index];
    newResources[index] = newResources[targetIndex];
    newResources[targetIndex] = temp;
    const updated = newResources.map((r, idx) => ({ ...r, sortOrder: idx + 1 }));
    setResources(updated);
  };

  // Toggle Video Requirement
  const toggleVideoRequired = (id: string) => {
    setVideos(videos.map((v) => v.id === id ? { ...v, isRequired: !v.isRequired } : v));
  };

  // Update Resource Location
  const updateResourceLocation = (id: string, loc: 'intro' | 'content' | 'both') => {
    setResources(resources.map((r) => r.id === id ? { ...r, displayLocation: loc } : r));
  };

  // Add Video Handler
  const handleAddVideo = () => {
    if (!newVideoTitle.trim()) return;
    const extractedId = liveExtractedVideoId || 'dQw4w9WgXcQ';
    const item: LessonVideo = {
      id: `vid-${Date.now()}`,
      title: newVideoTitle.trim(),
      provider: 'youtube',
      videoUrlOrId: extractedId,
      durationMinutes: newVideoDuration.trim() || '10:00',
      durationSeconds: 600,
      isRequired: newVideoRequired,
      sortOrder: videos.length + 1,
      status: 'published',
    };
    setVideos([...videos, item]);
    setNewVideoTitle('');
    setNewVideoUrl('');
    setNewVideoDuration('12:00');
    setNewVideoRequired(true);
  };

  // Add Resource Handler
  const handleAddResourceItem = (item: Omit<LessonResource, 'id' | 'sortOrder' | 'status'>) => {
    const newRes: LessonResource = {
      ...item,
      id: `res-${Date.now()}`,
      sortOrder: resources.length + 1,
      status: 'published',
    };
    setResources([...resources, newRes]);
  };

  // Save All Changes
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAll = async () => {
    setIsSaving(true);
    const updatedTargetLesson = {
      ...lesson,
      updatedAt: new Date().toISOString(),
      versions: lesson.versions.map((ver, idx) => {
        if (idx === 0) {
          return {
            ...ver,
            videos: videos,
            resources: resources,
            updatedAt: new Date().toISOString(),
          };
        }
        return ver;
      }),
    };

    const updatedLessons = lessons.map((l) => (l.id === lesson.id ? updatedTargetLesson : l));

    setLessons(updatedLessons);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('edtech_lessons', JSON.stringify(updatedLessons));
      } catch (e) {}
    }

    if (isSupabaseLive) {
      try {
        await dbUpsertLesson(updatedTargetLesson);
      } catch (e) {
        console.warn('[Supabase] Failed to upsert lesson:', e);
      }
    }

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered resources
  const filteredResources = useMemo(() => {
    if (resourceFilter === 'all') return resources;
    return resources.filter((r) => r.type === resourceFilter);
  }, [resources, resourceFilter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-2 sm:px-4">
      
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <Link
            href="/admin/lessons"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับสู่รายการบทเรียนทั้งหมด</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              Content & Media CMS
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono font-bold text-slate-600">
              {lesson.code}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            จัดการวิดีโอและสื่อการสอน: {lesson.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            กำหนดลำดับวิดีโอบรรยาย (YouTube) และแนบเอกสารสื่อประกอบ (PDF, Canva, Infographic, PPTX)
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
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

          <Link
            href={`/lessons/${lesson.code}/learn`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
            title="เปิดดูในมุมมองผู้เรียนในแท็บใหม่"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>มุมมองผู้เรียน</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            disabled={isSaving}
            onClick={handleSaveAll}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-200 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลทั้งหมด'}</span>
          </button>
        </div>
      </div>

      {/* Compact Single-Row Segmented Tab Switcher */}
      <div className="flex items-center">
        <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/90 gap-1.5 shadow-2xs">
          {/* Tab 1: Metadata (Clickable Button to Switch) */}
          <Link
            href={`/admin/lessons/${lesson.id}/metadata`}
            className="px-3.5 sm:px-4 py-2 bg-white hover:bg-blue-50/80 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-400 rounded-xl text-xs font-bold shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 group cursor-pointer"
            title="คลิกเพื่อสลับไปยังหน้าแก้ไขข้อมูลบทเรียนและเวอร์ชัน"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 shrink-0 transition" />
            <span>ข้อมูลบทเรียน & เวอร์ชัน (Metadata)</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
          </Link>

          {/* Tab 2: Content (Active) */}
          <div className="px-3.5 sm:px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 select-none">
            <Film className="w-3.5 h-3.5 text-white shrink-0" />
            <span>วิดีโอ & สื่อประกอบ (Content & Media)</span>
          </div>
        </div>
      </div>

      {/* Save Success Toast Banner */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-950">บันทึกข้อมูลวิดีโอและสื่อการสอนสำเร็จเรียบร้อย!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                การเปลี่ยนแปลงมีผลทันทีในห้องเรียนของผู้เรียน และบันทึกลงในระบบจัดเก็บข้อมูลแล้ว
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSaveSuccess(false)}
            className="p-1 text-emerald-700 hover:text-emerald-900 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
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
                <span>บทที่ {lesson.sortOrder} • {lesson.code}</span>
              </span>
              <span className="text-xs sm:text-sm text-slate-600 font-medium">
                • {courseInfo.code}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-white/95 px-3 py-1 rounded-full border border-blue-200/80 text-blue-900 shadow-2xs">
                {activeVer?.versionTag || 'v1.0'}
              </span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                {lesson.status === 'published' ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
              </span>
            </div>
          </div>

          {/* Lesson Title */}
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              {lesson.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 font-medium">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{courseInfo.title} ({courseInfo.department})</span>
            </p>
          </div>

          {/* Bottom Row: Instructor & Live Content Highlights */}
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
                <span className="font-semibold text-slate-700">{videos.length} คลิปวิดีโอ ({totalDurationMinutes} นาที)</span>
              </div>
              <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-amber-200/80 shadow-2xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-semibold text-slate-700">{videos.filter(v => v.isRequired).length} คลิปจำเป็น</span>
              </div>
              <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-indigo-200/80 shadow-2xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold text-slate-700">{resources.length} เอกสาร/สื่อ</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 1: VIDEOS MANAGEMENT */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-2xs">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">รายการวิดีโอบรรยาย (Video Lectures)</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  {videos.length} คลิป
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                จัดเรียงลำดับการเรียนรู้ ตรวจสอบ YouTube ID และกำหนดคลิปที่เป็นเกณฑ์บังคับในการผ่านบทเรียน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>ความยาวรวมประมาณ <strong className="text-slate-800 font-bold">{totalDurationMinutes} นาที</strong></span>
          </div>
        </div>

        {/* Guidance Tip Alert */}
        <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/70 text-sky-900 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">เงื่อนไขการเรียนรู้ (Learning Requirement):</span> คลิปที่ตั้งค่าเป็น 
            <span className="font-bold text-blue-800 bg-blue-100/70 px-1.5 py-0.5 rounded mx-1">จำเป็น (Required)</span>
            จะถูกนำไปคำนวณในเปอร์เซ็นต์ความคืบหน้า (Progress) และเป็นเงื่อนไขในการปลดล็อกแบบทดสอบหลังเรียน (Post-test)
          </div>
        </div>

        {/* Videos Table (No Horizontal Scroll) */}
        {videos.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-2">
            <Video className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">ยังไม่มีวิดีโอในบทเรียนนี้</p>
            <p className="text-xs text-slate-400">กรุณาเพิ่มวิดีโอด้านล่างเพื่อเริ่มต้นสร้างเนื้อหา</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 text-center w-14">#</th>
                  <th className="py-3 px-3">ชื่อคลิปวิดีโอ</th>
                  <th className="py-3 px-3 w-40 hidden sm:table-cell">YouTube ID</th>
                  <th className="py-3 px-3 text-center w-24 hidden md:table-cell">ความยาว</th>
                  <th className="py-3 px-3 text-center w-36">เกณฑ์บังคับ</th>
                  <th className="py-3 px-3 text-right pr-4 w-28">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {videos.map((vid, idx) => (
                  <tr key={vid.id} className="hover:bg-slate-50/80 transition group">
                    
                    {/* Reorder & Index */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <span className="font-bold text-slate-700 text-xs">{idx + 1}</span>
                        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition">
                          <button
                            type="button"
                            onClick={() => moveVideo(idx, 'up')}
                            disabled={idx === 0}
                            className={`p-0.5 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer`}
                            title="เลื่อนขึ้น"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveVideo(idx, 'down')}
                            disabled={idx === videos.length - 1}
                            className={`p-0.5 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer`}
                            title="เลื่อนลง"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Video Title & Quick info */}
                    <td className="py-3 px-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-bold text-slate-900 leading-snug break-words">
                            {vid.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span className="sm:hidden font-mono text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                              ID: {vid.videoUrlOrId}
                            </span>
                            <span className="md:hidden text-slate-400">
                              • {vid.durationMinutes} นาที
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* YouTube ID / Link */}
                    <td className="py-3 px-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-blue-700 bg-blue-50/90 border border-blue-200/80 px-2 py-0.5 rounded-md text-[11px] font-semibold truncate max-w-[110px]" title={vid.videoUrlOrId}>
                          {vid.videoUrlOrId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(vid.videoUrlOrId, vid.id)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition cursor-pointer"
                          title="คัดลอกรหัส YouTube"
                        >
                          {copiedId === vid.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-3 text-center text-slate-600 font-medium whitespace-nowrap hidden md:table-cell">
                      {vid.durationMinutes} นาที
                    </td>

                    {/* Requirement Toggle Button */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleVideoRequired(vid.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                          vid.isRequired
                            ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100/80'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="คลิกเพื่อสลับสถานะจำเป็น/ไม่บังคับ"
                      >
                        {vid.isRequired ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            <span>จำเป็น</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span>ไม่บังคับ</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions: Preview & Delete */}
                    <td className="py-3 px-3 text-right pr-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewVideo(vid)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                          title="ทดสอบดูคลิปวิดีโอ"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideos(videos.filter((v) => v.id !== vid.id))}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                          title="ลบคลิปวิดีโอ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Video Form (Soft Pastel Accent) */}
        <div className="p-5 bg-gradient-to-r from-blue-50/60 via-indigo-50/30 to-sky-50/40 rounded-2xl border border-blue-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>เพิ่มวิดีโอบรรยายใหม่ในบทเรียนนี้</span>
            </h4>
            <span className="text-[11px] text-slate-500">
              วาง YouTube URL หรือ Video ID ได้โดยตรง
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            
            {/* Title Input */}
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                ชื่อคลิปวิดีโอบรรยาย *
              </label>
              <input
                type="text"
                placeholder="เช่น การใช้นวัตกรรมดิจิทัลในศตวรรษที่ 21"
                value={newVideoTitle}
                onChange={(e) => setNewVideoTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>

            {/* URL or YouTube ID Input */}
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                YouTube URL หรือ Video ID *
              </label>
              <input
                type="text"
                placeholder="https://youtu.be/... หรือ dQw4w9WgXcQ"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>

            {/* Duration Input */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                ความยาว (นาที:วินาที)
              </label>
              <input
                type="text"
                placeholder="เช่น 15:00"
                value={newVideoDuration}
                onChange={(e) => setNewVideoDuration(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>

          </div>

          {/* Form Bottom Row: Thumbnail Preview & Checkbox & Submit */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-blue-100">
            
            {/* Live Detected Video ID Preview */}
            <div className="flex items-center gap-3">
              {liveExtractedVideoId && liveExtractedVideoId.length === 11 ? (
                <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-blue-200 shadow-2xs">
                  <img
                    src={`https://img.youtube.com/vi/${liveExtractedVideoId}/default.jpg`}
                    alt="YouTube thumbnail preview"
                    className="w-8 h-6 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="text-[11px]">
                    <span className="text-slate-500">รหัสที่ตรวจพบ: </span>
                    <span className="font-mono font-bold text-blue-700">{liveExtractedVideoId}</span>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>ระบบจะสกัดรหัส 11 หลักจาก YouTube URL ให้อัตโนมัติ</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 self-end sm:self-auto">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newVideoRequired}
                  onChange={(e) => setNewVideoRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>จำเป็นต้องดูเพื่อผ่านบทเรียน</span>
              </label>

              <button
                type="button"
                onClick={handleAddVideo}
                disabled={!newVideoTitle.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ เพิ่มคลิปวิดีโอ</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* SECTION 2: MEDIA & RESOURCES MANAGEMENT */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  คลังเอกสารและสื่อประกอบการสอน (PDF, Canva, Infographic)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                  {resources.length} ไฟล์
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                แนบไฟล์เอกสาร, สไลด์ Canva, ภาพ Infographic หรือเอกสารนำเสนอให้นักศึกษาเปิดและดาวน์โหลด
              </p>
            </div>
          </div>

          {/* Media Category Filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setResourceFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                resourceFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({resources.length})
            </button>
            <button
              onClick={() => setResourceFilter('pdf')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                resourceFilter === 'pdf'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              📄 PDF ({resources.filter(r => r.type === 'pdf').length})
            </button>
            <button
              onClick={() => setResourceFilter('canva')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                resourceFilter === 'canva'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              🎨 Canva ({resources.filter(r => r.type === 'canva').length})
            </button>
            <button
              onClick={() => setResourceFilter('infographic')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                resourceFilter === 'infographic'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
              }`}
            >
              📊 Infographic ({resources.filter(r => r.type === 'infographic').length})
            </button>
          </div>
        </div>

        {/* Resources Table (No Horizontal Scroll) */}
        {filteredResources.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-2">
            <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">ยังไม่มีเอกสารหรือสื่อในหมวดหมู่นี้</p>
            <p className="text-xs text-slate-400">แนบไฟล์หรือระบุลิงก์ด้านล่างเพื่อเพิ่มสื่อการสอน</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 text-center w-14">#</th>
                  <th className="py-3 px-3 w-32">ประเภทสื่อ</th>
                  <th className="py-3 px-3">ชื่อเอกสาร / สื่อ</th>
                  <th className="py-3 px-3 w-40 hidden sm:table-cell">ตำแหน่งแสดง</th>
                  <th className="py-3 px-3 w-36 hidden md:table-cell">ลิงก์ / ไฟล์</th>
                  <th className="py-3 px-3 text-right pr-4 w-20">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResources.map((res, idx) => (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition group">
                    
                    {/* Index & Reorder */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <span className="font-bold text-slate-700 text-xs">{idx + 1}</span>
                        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition">
                          <button
                            type="button"
                            onClick={() => moveResource(idx, 'up')}
                            disabled={idx === 0}
                            className={`p-0.5 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer`}
                            title="เลื่อนขึ้น"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveResource(idx, 'down')}
                            disabled={idx === resources.length - 1}
                            className={`p-0.5 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer`}
                            title="เลื่อนลง"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Media Type Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {res.type === 'pdf' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg border border-rose-200 text-[11px]">
                          <span>📄 PDF</span>
                        </span>
                      ) : res.type === 'canva' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 font-bold rounded-lg border border-purple-200 text-[11px]">
                          <span>🎨 Canva Slide</span>
                        </span>
                      ) : res.type === 'infographic' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-700 font-bold rounded-lg border border-sky-200 text-[11px]">
                          <span>📊 Infographic</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-200 text-[11px]">
                          <span>📁 {res.type.toUpperCase()}</span>
                        </span>
                      )}
                    </td>

                    {/* Title & Size */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-bold text-slate-800 leading-snug break-words">
                          {res.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          {res.fileSize && (
                            <span className="text-slate-400">ขนาด: {res.fileSize}</span>
                          )}
                          <span className="sm:hidden text-slate-400">
                            • {res.displayLocation === 'content' ? 'ห้องเรียน' : res.displayLocation === 'intro' ? 'หน้าบทเรียน' : 'ทั้งสองหน้า'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Display Location Selector */}
                    <td className="py-3 px-3 hidden sm:table-cell">
                      <select
                        value={res.displayLocation}
                        onChange={(e) => updateResourceLocation(res.id, e.target.value as 'intro' | 'content' | 'both')}
                        className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      >
                        <option value="content">ห้องเรียนวิดีโอ (Content)</option>
                        <option value="intro">หน้าแนะนำบทเรียน (Intro)</option>
                        <option value="both">แสดงทั้งสองหน้า (Both)</option>
                      </select>
                    </td>

                    {/* Link / Open */}
                    <td className="py-3 px-3 hidden md:table-cell">
                      {res.fileUrl && (res.fileUrl.startsWith('http') || res.fileUrl.startsWith('blob:') || res.fileUrl.startsWith('data:')) ? (
                        <a
                          href={res.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium underline max-w-[130px] truncate"
                          title="คลิกเพื่อเปิดดูสื่อ"
                        >
                          <span className="truncate">เปิดดูสื่อ</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">{res.fileUrl || '-'}</span>
                      )}
                    </td>

                    {/* Delete */}
                    <td className="py-3 px-3 text-right pr-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setResources(resources.filter((r) => r.id !== res.id))}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                        title="ลบสื่อการสอนนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modern Attachment Upload Box */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            <span>แนบไฟล์เอกสารหรือสื่อการสอนใหม่ (เน้นการอัปโหลดไฟล์จากคอมพิวเตอร์)</span>
          </h4>
          <FileUploadBox onAddResource={handleAddResourceItem} defaultLocation="content" />
        </div>

      </div>

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{previewVideo.title}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">YouTube ID: {previewVideo.videoUrlOrId}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Responsive Player */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-inner">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${previewVideo.videoUrlOrId}?autoplay=1`}
                title={previewVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>ความยาวประมาณ: <strong className="text-slate-800 font-bold">{previewVideo.durationMinutes} นาที</strong></span>
              <button
                onClick={() => setPreviewVideo(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
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
