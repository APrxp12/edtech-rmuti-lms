'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, BookOpen, AlertTriangle, CheckCircle2, Save, Upload,
  Play, FileText, Plus, Trash2, Image as ImageIcon, Sparkles
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { Lesson, LessonVideo, LessonResource } from '@/types';
import { FileUploadBox, ImageUploadField } from '@/components/shared/FileUploadBox';
import { dbUpsertLesson } from '@/lib/dbService';

export default function AddLessonPage() {
  const router = useRouter();
  const { lessons, setLessons, isSupabaseLive } = useAppStore();

  // Find the next available positive integer chapter number (e.g. 1, 2, 3...)
  const nextSuggestedChapter = useMemo(() => {
    const existingOrders = lessons
      .map((l) => l.sortOrder)
      .filter((n) => typeof n === 'number' && n > 0);
    let candidate = 1;
    while (existingOrders.includes(candidate)) {
      candidate++;
    }
    return candidate;
  }, [lessons]);

  const [chapterNumber, setChapterNumber] = useState<string>(() => nextSuggestedChapter.toString());
  const [lessonTitle, setLessonTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState('');
  const [countsInProgress, setCountsInProgress] = useState(true);
  const [infographicUrl, setInfographicUrl] = useState('');

  // Auto-generate lesson code based on chapterNumber: IDTLM-001, IDTLM-002, etc.
  const generatedCode = useMemo(() => {
    const num = parseInt(chapterNumber, 10);
    if (isNaN(num) || num <= 0) return 'IDTLM-001';
    return `IDTLM-${String(num).padStart(3, '0')}`;
  }, [chapterNumber]);

  // Check if a lesson with this chapter number or generated code already exists
  const duplicateLesson = useMemo(() => {
    const num = parseInt(chapterNumber, 10);
    if (isNaN(num) || num <= 0) return null;
    const targetCode = `IDTLM-${String(num).padStart(3, '0')}`;
    return (
      lessons.find(
        (l) =>
          l.sortOrder === num ||
          l.code.trim().toUpperCase() === targetCode
      ) || null
    );
  }, [lessons, chapterNumber]);

  const duplicateError = duplicateLesson
    ? `มีบทที่ ${chapterNumber} ในระบบแล้ว`
    : null;

  // Initial Videos
  const [videos, setVideos] = useState<LessonVideo[]>([]);
  const [vidTitle, setVidTitle] = useState('');
  const [vidUrl, setVidUrl] = useState('');

  // Initial Resources (PDF, Canva, Infographic)
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState<'pdf' | 'canva' | 'infographic' | 'pptx'>('pdf');
  const [resUrl, setResUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleChapterChange = (val: string) => {
    setChapterNumber(val);
  };

  const handleAddVideo = () => {
    if (!vidTitle.trim()) return;
    setVideos([
      ...videos,
      {
        id: `vid-${Date.now()}`,
        title: vidTitle.trim(),
        provider: 'youtube',
        videoUrlOrId: vidUrl.trim() || 'dQw4w9WgXcQ',
        durationMinutes: '10:00',
        durationSeconds: 600,
        isRequired: true,
        sortOrder: videos.length + 1,
        status: 'published',
      },
    ]);
    setVidTitle('');
    setVidUrl('');
  };

  const handleAddResource = () => {
    if (!resTitle.trim()) return;
    setResources([
      ...resources,
      {
        id: `res-${Date.now()}`,
        title: resTitle.trim(),
        type: resType,
        fileUrl: resUrl.trim() || '#',
        fileSize: '3.0 MB',
        displayLocation: 'content',
        sortOrder: resources.length + 1,
        status: 'published',
      },
    ]);
    setResTitle('');
    setResUrl('');
  };

  const handleSave = (status: 'draft' | 'published') => {
    if (!lessonTitle.trim() || !chapterNumber || !!duplicateError || isSubmitting) return;

    const num = parseInt(chapterNumber, 10);
    if (isNaN(num) || num <= 0) return;

    const codeToSave = `IDTLM-${String(num).padStart(3, '0')}`;
    const cleanTitle = lessonTitle.trim().replace(/^บทที่\s*\d+\s*[:.-]?\s*/, '');
    const finalTitle = `บทที่ ${num} ${cleanTitle}`;

    setIsSubmitting(true);
    setTimeout(() => {
      const newLesson: Lesson = {
        id: `lsn-${Date.now()}`,
        code: codeToSave,
        title: finalTitle,
        description: description.trim(),
        sortOrder: num,
        countsInCourseProgress: countsInProgress,
        coverImageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
        introInfographicUrl: infographicUrl.trim() || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200',
        status: status,
        updatedAt: new Date().toISOString(),
        versions: [
          {
            id: `ver-${Date.now()}`,
            lessonId: `lsn-${Date.now()}`,
            versionTag: 'v1.0',
            title: finalTitle,
            description: description.trim(),
            learningObjectives: objectives.split('\n').filter(Boolean),
            estimatedDurationMinutes: 45,
            videos: videos,
            resources: resources,
            status: status,
            learnerCount: 0,
            updatedAt: new Date().toISOString(),
          },
        ],
      };

      const updated = [...lessons, newLesson].sort((a, b) => a.sortOrder - b.sortOrder);
      setLessons(updated);
      try {
        localStorage.setItem('edtech_lessons', JSON.stringify(updated));
      } catch (e) {}

      if (isSupabaseLive) {
        dbUpsertLesson(newLesson).catch((err) => {
          console.warn('[Supabase] Failed to upsert new lesson:', err);
        });
      }

      setIsSubmitting(false);
      setShowSuccessToast(true);

      setTimeout(() => {
        router.push('/admin/lessons');
      }, 1000);
    }, 500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/lessons"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับรายการบทเรียน
        </Link>
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          เพิ่มบทเรียนใหม่
        </span>
      </div>

      {showSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          บันทึกข้อมูลสำเร็จ! เพิ่มบทเรียนและสื่อการสอนใหม่เรียบร้อยแล้ว
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        
        <div>
          <h1 className="text-xl font-black text-slate-900">สร้างบทเรียนใหม่ (New Lesson)</h1>
          <p className="text-xs text-slate-500 mt-0.5">กรอกข้อมูลพื้นฐาน วิดีโอ YouTube สไลด์ Canva และเอกสารประกอบการสอน</p>
        </div>

        {/* Basic Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            
            {/* 1. บทที่ (ลำดับบทเรียน) */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                บทที่ (ลำดับบทเรียน) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">บทที่</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="1"
                  value={chapterNumber}
                  onChange={(e) => handleChapterChange(e.target.value)}
                  className={`w-full pl-13 pr-3 py-2.5 text-sm rounded-xl border font-bold text-slate-900 focus:outline-none focus:ring-2 transition ${
                    duplicateError 
                      ? 'border-amber-400 bg-amber-50/50 focus:ring-amber-300 text-amber-900' 
                      : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-blue-200'
                  }`}
                  required
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                ระบุเฉพาะตัวเลข เช่น 1, 2, 3
              </span>
            </div>

            {/* 2. รหัสบทเรียน (สร้างให้อัตโนมัติ IDTLM-XXX) */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>รหัสบทเรียน (Code)</span>
                <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-semibold border border-blue-200">
                  ระบบกำหนดอัตโนมัติ
                </span>
              </label>
              <input
                type="text"
                readOnly
                value={generatedCode}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-100/90 font-mono font-bold text-blue-700 cursor-not-allowed select-all"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                อ้างอิงตามเลขบท เช่น IDTLM-001
              </span>
            </div>

            {/* 3. ชื่อบทเรียน (Title) */}
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ชื่อบทเรียน (Title) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น การรู้ดิจิทัลและการรู้สารสนเทศ (ไม่ต้องพิมพ์คำว่า บทที่)"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {lessonTitle.trim() && !duplicateError ? (
                  <span className="text-emerald-600 font-medium">
                    ✓ แสดงผลจริง: บทที่ {chapterNumber || '?'} {lessonTitle.trim().replace(/^บทที่\s*\d+\s*[:.-]?\s*/, '')}
                  </span>
                ) : (
                  'พิมพ์เฉพาะชื่อหัวข้อบทเรียน ระบบจะรวมคำว่า "บทที่..." ให้อัตโนมัติ'
                )}
              </span>
            </div>

          </div>

          {/* Duplicate Warning Box if chapter already exists */}
          {duplicateLesson && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2.5 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs sm:text-sm">
                  <div className="font-bold text-amber-900">
                    มีบทที่ {chapterNumber} ในระบบแล้ว ({duplicateLesson.code}: {duplicateLesson.title})
                  </div>
                  <p className="mt-1 text-amber-800 text-xs leading-relaxed">
                    ระบบตรวจพบว่าบทที่ {chapterNumber} ถูกสร้างไปแล้ว จึงไม่สามารถสร้างบทที่ {chapterNumber} ซ้ำได้ หากต้องการปรับปรุงข้อมูล กรุณาไปแก้ไขที่หน้ารายการบทเรียนแทน หรือเลือกหมายเลขบทอื่น
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1 pl-7">
                <Link
                  href={`/admin/lessons/${duplicateLesson.id}/metadata`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition shadow-2xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>ไปแก้ไขบทที่ {chapterNumber} ({duplicateLesson.code})</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setChapterNumber(nextSuggestedChapter.toString())}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/60 rounded-xl font-bold text-xs transition shadow-2xs cursor-pointer"
                >
                  <span>เปลี่ยนเป็นบทที่ {nextSuggestedChapter} (ว่างอยู่)</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              คำอธิบายบทเรียน (Description)
            </label>
            <textarea
              rows={3}
              placeholder="สรุปเนื้อหาสำคัญของบทเรียนนี้..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
            ></textarea>
          </div>

          <div>
            <ImageUploadField
              label="ภาพ Infographic สรุปภาพรวมเนื้อหา (แนบไฟล์จากเครื่อง หรือ URL)"
              sublabel="ภาพนี้จะแสดงให้นักศึกษาศึกษาในหน้าแรกของบทเรียน ก่อนเริ่มทำแบบทดสอบ Pre-test"
              currentUrl={infographicUrl}
              onImageSelected={(url) => setInfographicUrl(url)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              วัตถุประสงค์การเรียนรู้ (แยกบรรทัดละ 1 ข้อ)
            </label>
            <textarea
              rows={3}
              placeholder="เข้าใจหลักการ...&#10;สามารถเลือกใช้เครื่องมือ...&#10;ประเมินผลการเรียนรู้ได้..."
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              className="w-full p-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
            ></textarea>
          </div>
        </div>

        {/* SECTION: ATTACH VIDEOS (YOUTUBE) */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-600" />
              วิดีโอประกอบการสอน ({videos.length} คลิป)
            </h3>
          </div>

          <div className="space-y-2">
            {videos.map((v, i) => (
              <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500">#{i + 1}</span>
                  <span className="font-bold text-slate-800">{v.title}</span>
                  <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">ID: {v.videoUrlOrId}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVideos(videos.filter((item) => item.id !== v.id))}
                  className="text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Mini Add Video Form */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <div className="sm:col-span-6">
              <input
                type="text"
                placeholder="ชื่อคลิปวิดีโอ"
                value={vidTitle}
                onChange={(e) => setVidTitle(e.target.value)}
                className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div className="sm:col-span-4">
              <input
                type="text"
                placeholder="YouTube ID / ลิงก์"
                value={vidUrl}
                onChange={(e) => setVidUrl(e.target.value)}
                className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleAddVideo}
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
              >
                + เพิ่มคลิป
              </button>
            </div>
          </div>
        </div>

        {/* SECTION: ATTACH MEDIA (PDF, CANVA, INFOGRAPHIC) */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              เอกสารและสื่อประกอบ (PDF, Canva, Infographic) ({resources.length} ไฟล์)
            </h3>
          </div>

          <div className="space-y-2">
            {resources.map((r, i) => (
              <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500">#{i + 1}</span>
                  <span className="font-bold text-slate-800">{r.title}</span>
                  <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800">{r.type}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setResources(resources.filter((item) => item.id !== r.id))}
                  className="text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* File Upload Box */}
          <FileUploadBox
            onAddResource={(item) => {
              setResources([
                ...resources,
                {
                  ...item,
                  id: `res-${Date.now()}`,
                  sortOrder: resources.length + 1,
                  status: 'published',
                },
              ]);
            }}
            defaultLocation="content"
          />
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/admin/lessons')}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            ยกเลิก
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave('draft')}
              disabled={isSubmitting || !lessonTitle.trim() || !chapterNumber || !!duplicateError}
              className={`px-4 py-2 border border-slate-300 text-xs font-bold rounded-xl transition ${
                isSubmitting || !lessonTitle.trim() || !chapterNumber || !!duplicateError
                  ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-50'
                  : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              บันทึก Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('published')}
              disabled={isSubmitting || !lessonTitle.trim() || !chapterNumber || !!duplicateError}
              className={`px-6 py-2.5 text-white text-xs font-bold rounded-xl shadow-xs transition ${
                isSubmitting || !lessonTitle.trim() || !chapterNumber || !!duplicateError
                  ? 'opacity-40 cursor-not-allowed bg-slate-400'
                  : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }`}
            >
              สร้างบทเรียนและบันทึกสื่อ
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
