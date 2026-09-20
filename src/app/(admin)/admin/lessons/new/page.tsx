'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, BookOpen, AlertTriangle, CheckCircle2, Save, Upload,
  Play, FileText, Plus, Trash2, Image as ImageIcon
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { LessonVideo, LessonResource } from '@/types';
import { FileUploadBox, ImageUploadField } from '@/components/shared/FileUploadBox';
import { dbUpsertLesson } from '@/lib/dbService';

export default function AddLessonPage() {
  const router = useRouter();
  const { lessons, setLessons, isSupabaseLive } = useAppStore();

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState('');
  const [sortOrder, setSortOrder] = useState(() => (lessons.length + 1).toString());
  const [countsInProgress, setCountsInProgress] = useState(true);
  const [infographicUrl, setInfographicUrl] = useState('');

  // Initial Videos
  const [videos, setVideos] = useState<LessonVideo[]>([
    {
      id: 'vid-new-1',
      title: '1. บทนำและเนื้อหาการสอน',
      provider: 'youtube',
      videoUrlOrId: 'dQw4w9WgXcQ',
      durationMinutes: '12:00',
      durationSeconds: 720,
      isRequired: true,
      sortOrder: 1,
      status: 'published',
    },
  ]);
  const [vidTitle, setVidTitle] = useState('');
  const [vidUrl, setVidUrl] = useState('');

  // Initial Resources (PDF, Canva, Infographic)
  const [resources, setResources] = useState<LessonResource[]>([
    {
      id: 'res-new-1',
      title: 'เอกสารประกอบบทเรียน (PDF)',
      type: 'pdf',
      fileUrl: '#',
      fileSize: '3.5 MB',
      displayLocation: 'content',
      sortOrder: 1,
      status: 'published',
    },
  ]);
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState<'pdf' | 'canva' | 'infographic' | 'pptx'>('pdf');
  const [resUrl, setResUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const handleCodeChange = (val: string) => {
    setCode(val);
    const exists = lessons.some((l) => l.code.toUpperCase() === val.trim().toUpperCase());
    if (exists) {
      setCodeError('รหัสบทเรียนนี้มีอยู่แล้วในระบบ กรุณาใช้รหัสอื่น');
    } else {
      setCodeError(null);
    }
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
    if (!code || !title || codeError) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newLesson = {
        id: `lsn-${Date.now()}`,
        code: code.trim().toUpperCase(),
        title: title.trim(),
        description: description.trim(),
        sortOrder: parseInt(sortOrder) || 9,
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
            title: title.trim(),
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

      const updated = [...lessons, newLesson];
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รหัสบทเรียน (Code) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น RMUTI-009"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className={`w-full p-2.5 text-sm rounded-xl border focus:outline-none font-mono ${
                  codeError ? 'border-red-500 bg-red-50/50' : 'border-slate-200 bg-slate-50'
                }`}
                required
              />
              {codeError && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {codeError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อบทเรียน (Title) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น บทที่ 9 การประยุกต์ใช้ AI ในการสอน"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                required
              />
            </div>
          </div>

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
              disabled={isSubmitting || !code || !title}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              บันทึก Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('published')}
              disabled={isSubmitting || !code || !title}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition"
            >
              สร้างบทเรียนและบันทึกสื่อ
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
