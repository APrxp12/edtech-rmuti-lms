'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Plus, Play, FileText, Trash2, Edit, Save, 
  CheckCircle2, AlertTriangle, ExternalLink, Image as ImageIcon,
  FileCode, Layers, Sparkles
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { LessonVideo, LessonResource } from '@/types';
import { FileUploadBox } from '@/components/shared/FileUploadBox';

export default function LessonContentEditorPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;
  const { lessons, setLessons } = useAppStore();

  const lesson = lessons.find((l) => l.id === lessonId) || lessons[2];
  const activeVer = lesson.versions[0];

  const [videos, setVideos] = useState<LessonVideo[]>(activeVer?.videos || []);
  const [resources, setResources] = useState<LessonResource[]>(activeVer?.resources || []);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form for adding video
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoDuration, setNewVideoDuration] = useState('12:00');
  const [newVideoRequired, setNewVideoRequired] = useState(true);

  const handleAddVideo = () => {
    if (!newVideoTitle.trim()) return;
    const item: LessonVideo = {
      id: `vid-${Date.now()}`,
      title: newVideoTitle.trim(),
      provider: 'youtube',
      videoUrlOrId: newVideoUrl.trim() || 'dQw4w9WgXcQ',
      durationMinutes: newVideoDuration || '10:00',
      durationSeconds: 600,
      isRequired: newVideoRequired,
      sortOrder: videos.length + 1,
      status: 'published',
    };
    setVideos([...videos, item]);
    setNewVideoTitle('');
    setNewVideoUrl('');
  };

  const handleAddResourceItem = (item: Omit<LessonResource, 'id' | 'sortOrder' | 'status'>) => {
    const newRes: LessonResource = {
      ...item,
      id: `res-${Date.now()}`,
      sortOrder: resources.length + 1,
      status: 'published',
    };
    setResources([...resources, newRes]);
  };

  const handleSaveAll = () => {
    const updatedLessons = lessons.map((l) => {
      if (l.id === lesson.id) {
        return {
          ...l,
          updatedAt: new Date().toISOString(),
          versions: l.versions.map((ver, idx) => {
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
      }
      return l;
    });

    setLessons(updatedLessons);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/lessons"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับไปยังรายการบทเรียน
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            จัดการวิดีโอและสื่อ: {lesson.title}
          </h1>
          <p className="text-xs text-slate-500">จัดการวิดีโอ (YouTube) และไฟล์สื่อประกอบ (PDF, Canva, Infographic)</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/lessons/${lesson.id}/metadata`}
            className="px-3.5 py-1.5 text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition"
          >
            ข้อมูลบทเรียน & เวอร์ชัน
          </Link>
          <Link
            href={`/admin/lessons/${lesson.id}/content`}
            className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-xl shadow-xs"
          >
            วิดีโอ & สื่อประกอบ (Content)
          </Link>
          <button
            onClick={handleSaveAll}
            className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <Save className="w-3.5 h-3.5" />
            บันทึกทั้งหมด
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          บันทึกการเปลี่ยนแปลงวิดีโอและสื่อการสอนสำเร็จเรียบร้อย!
        </div>
      )}

      {/* SECTION 1: VIDEOS MANAGEMENT */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Play className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">รายการวิดีโอการสอน ({videos.length} คลิป)</h2>
              <p className="text-[11px] text-slate-400">กำหนดลำดับ และเลือกคลิปที่ "จำเป็น" (นับคะแนน Progress)</p>
            </div>
          </div>
        </div>

        {/* Videos Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 whitespace-nowrap">#</th>
                <th className="py-3 px-3 min-w-[200px]">ชื่อวิดีโอ</th>
                <th className="py-3 px-3 whitespace-nowrap">YouTube ID</th>
                <th className="py-3 px-3 whitespace-nowrap">ความยาว</th>
                <th className="py-3 px-3 whitespace-nowrap">เกณฑ์บังคับ</th>
                <th className="py-3 px-3 whitespace-nowrap">สถานะ</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {videos.map((vid, idx) => (
                <tr key={vid.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3 font-bold text-slate-800">{vid.title}</td>
                  <td className="py-3 px-3 font-mono text-blue-600">{vid.videoUrlOrId}</td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{vid.durationMinutes} นาที</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {vid.isRequired ? (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        จำเป็น (Required)
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        ไม่บังคับ (Optional)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      เผยแพร่
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => setVideos(videos.filter((v) => v.id !== vid.id))}
                      className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition"
                      title="ลบคลิป"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Video Form */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            เพิ่มวิดีโอใหม่ในบทเรียนนี้
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <input
                type="text"
                placeholder="ชื่อคลิปวิดีโอ"
                value={newVideoTitle}
                onChange={(e) => setNewVideoTitle(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div className="sm:col-span-4">
              <input
                type="text"
                placeholder="YouTube ID หรือ URL (เช่น dQw4w9WgXcQ)"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div className="sm:col-span-3 flex items-center justify-between gap-2">
              <label className="text-[11px] font-bold flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newVideoRequired}
                  onChange={(e) => setNewVideoRequired(e.target.checked)}
                />
                <span>จำเป็นต้องดู</span>
              </label>
              <button
                onClick={handleAddVideo}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                + เพิ่มคลิป
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: MEDIA & RESOURCES MANAGEMENT (PDF, Canva, Infographic, PPTX) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                คลังเอกสารและสื่อประกอบการสอน (PDF, Canva, Infographic) ({resources.length} ไฟล์)
              </h2>
              <p className="text-[11px] text-slate-400">
                แนบไฟล์เอกสาร, สไลด์ Canva, ภาพ Infographic หรือสไลด์นำเสนอให้นักศึกษาเปิดและดาวน์โหลด
              </p>
            </div>
          </div>
        </div>

        {/* Resources Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 whitespace-nowrap">#</th>
                <th className="py-3 px-3 whitespace-nowrap">ประเภทสื่อ</th>
                <th className="py-3 px-3 min-w-[180px]">ชื่อเอกสาร / สื่อ</th>
                <th className="py-3 px-3 min-w-[160px]">ลิงก์ URL / ไฟล์</th>
                <th className="py-3 px-3 whitespace-nowrap">ขนาด</th>
                <th className="py-3 px-3 whitespace-nowrap">ตำแหน่งที่แสดง</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resources.map((res, idx) => (
                <tr key={res.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {res.type === 'pdf' ? (
                      <span className="px-2 py-0.5 bg-red-50 text-red-700 font-bold rounded border border-red-200 text-[10px]">
                        📄 PDF
                      </span>
                    ) : res.type === 'canva' ? (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold rounded border border-purple-200 text-[10px]">
                        🎨 Canva Slide
                      </span>
                    ) : res.type === 'infographic' ? (
                      <span className="px-2 py-0.5 bg-sky-50 text-sky-700 font-bold rounded border border-sky-200 text-[10px]">
                        📊 Infographic
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">
                        📁 {res.type.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">{res.title}</td>
                  <td className="py-3 px-3 font-mono text-blue-600 max-w-xs truncate">
                    {res.fileUrl && (res.fileUrl.startsWith('http') || res.fileUrl.startsWith('blob:') || res.fileUrl.startsWith('data:')) ? (
                      <a
                        href={res.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-blue-800 flex items-center gap-1"
                        title="คลิกเพื่อเปิดดูไฟล์ / สื่อ"
                      >
                        <span className="truncate max-w-[140px]">{res.fileUrl.slice(0, 24)}...</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span>{res.fileUrl}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{res.fileSize || '-'}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {res.displayLocation === 'content' ? 'ห้องเรียนวิดีโอ' : res.displayLocation === 'intro' ? 'หน้าบทเรียน' : 'ทั้งสองหน้า'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => setResources(resources.filter((r) => r.id !== res.id))}
                      className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition cursor-pointer"
                      title="ลบสื่อ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modern File Upload Box */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            แนบไฟล์เอกสารหรือสื่อการสอนใหม่ (เน้นการแนบไฟล์จากคอมพิวเตอร์)
          </h4>
          <FileUploadBox onAddResource={handleAddResourceItem} defaultLocation="content" />
        </div>

      </div>

    </div>
  );
}
