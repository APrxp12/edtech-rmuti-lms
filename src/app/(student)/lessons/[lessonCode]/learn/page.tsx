'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, Play, CheckCircle2, Lock, FileText, Download, 
  ExternalLink, AlertTriangle, RefreshCw, Award, CheckSquare, BookOpen
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { LessonVideo, LessonResource } from '@/types';

export default function LearningVideoPage() {
  const params = useParams();
  const rawLessonCode = (params?.lessonCode as string) || 'RMUTI-003';
  const { lessons, progressMap, updateVideoProgress, settings } = useAppStore();

  const lesson = lessons.find((l) => l.code === rawLessonCode);

  if (!lesson) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white">ไม่พบบทเรียน "{rawLessonCode}" ในระบบ</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          บทเรียนนี้อาจยังไม่ได้ถูกสร้าง หรือถูกลบออกจากระบบแล้ว กรุณาตรวจสอบรหัสบทเรียนหรือกลับสู่หน้ารายการบทเรียน
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่หน้ารายการบทเรียน</span>
          </Link>
        </div>
      </div>
    );
  }

  const activeVersion = lesson.versions?.[0];
  const videos: LessonVideo[] = activeVersion?.videos || [];
  const resources: LessonResource[] = activeVersion?.resources || [];

  const [activeVideoId, setActiveVideoId] = useState<string>(videos[0]?.id || '');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  const progress = progressMap[lesson.code] || {
    userId: '',
    lessonId: lesson.code,
    assignedVersionId: 'v1',
    progressPercent: 0,
    status: 'in_progress',
    isPreTestCompleted: false,
    isPostTestUnlocked: false,
    watchedVideos: {},
    postTestAttempts: [],
    lastAccessedAt: new Date().toISOString(),
  };

  const activeVideo: LessonVideo | undefined = videos.find((v) => v.id === activeVideoId) || videos[0];

  // Helper to mark a video complete
  const handleMarkVideoComplete = (vidId: string) => {
    if (!vidId) return;
    setSaveStatus('saving');
    setTimeout(() => {
      if (lesson?.code) {
        updateVideoProgress(lesson.code, vidId, 100, 755);
      }
      setSaveStatus('saved');
    }, 400);
  };

  const isPostTestUnlocked = progress.isPostTestUnlocked || progress.progressPercent >= 80 || (videos.length === 0 && progress.isPreTestCompleted);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Header & Pre-test Badge matching Page 9 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับไปยังบทเรียน
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {lesson?.title || 'บทเรียนออนไลน์'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {activeVersion?.description || 'เรียนรู้วิธีการสร้างสื่อการสอนที่น่าสนใจด้วยเครื่องมือดิจิทัล'}
          </p>
        </div>

        {/* Scores & Progress Badges */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">คะแนน Pre-test</div>
              <div className="text-xs sm:text-sm font-black text-blue-900 dark:text-blue-200">
                {progress.preTestScore ? `${progress.preTestScore.score} / ${progress.preTestScore.max || 10}` : 'ผ่านแล้ว'}
              </div>
            </div>
          </div>

          <div className="p-2.5 sm:p-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 shadow-xs">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">ความก้าวหน้าในบทนี้</div>
              <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">{progress.progressPercent}%</div>
            </div>
            <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${progress.progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Network Tracking Error Banner */}
      {saveStatus === 'error' && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-center justify-between text-red-800 dark:text-red-300 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <span className="font-bold">ไม่สามารถบันทึกความคืบหน้าได้</span>
              <p className="text-[11px] text-red-700 dark:text-red-400">กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต แล้วลองใหม่อีกครั้ง</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSaveStatus('saved');
            }}
            className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            ลองอีกครั้ง
          </button>
        </div>
      )}

      {/* Main Video & Playlist Layout */}
      {videos.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Play className="w-8 h-8 ml-1" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">ยังไม่มีคลิปวิดีโอบรรยายสำหรับบทเรียนนี้</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              อาจารย์ผู้สอนกำลังจัดเตรียมสื่อและคลิปวิดีโอบรรยาย คุณสามารถศึกษาเอกสารประกอบด้านล่างได้
            </p>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Video Player Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
            {/* Embedded YouTube Player with IFrame */}
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo?.videoUrlOrId || ''}?autoplay=0&enablejsapi=1`}
              title={activeVideo?.title || 'วิดีโอการเรียนรู้'}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          {/* Video Metadata & Save Indicator */}
          <div className="p-4 sm:p-5 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeVideo?.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">ความยาว: {activeVideo?.durationMinutes || '10:00'} นาที • การเรียนรู้แบบยืดหยุ่น</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Save Status Badge matching Page 9 */}
              {saveStatus === 'saved' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  บันทึกแล้ว (อัตโนมัติ)
                </span>
              )}
              {saveStatus === 'saving' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  กำลังบันทึก...
                </span>
              )}

              {/* Mark Complete Button */}
              <button
                onClick={() => handleMarkVideoComplete(activeVideo?.id || 'vid-1')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ทำเครื่องหมายว่าเรียนจบแล้ว</span>
              </button>
            </div>
          </div>
        </div>

        {/* Playlist Column (Flexible Playlist) matching Page 9 */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">รายการวิดีโอในบทเรียน</h3>
              <span className="text-[10px] text-blue-600 dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                {videos.length} คลิป
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">เรียนต่อเนื่องได้เลย ไม่ต้องโหลดหน้าใหม่</p>
          </div>

          <div className="space-y-2">
            {videos.map((vid, idx) => {
              const isActive = vid.id === activeVideoId;
              const isWatched = progress.watchedVideos[vid.id]?.isCompleted || idx < 3;

              return (
                <button
                  key={vid.id}
                  onClick={() => {
                    setActiveVideoId(vid.id);
                    setSaveStatus('saved');
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                    isActive
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/60 shadow-xs'
                      : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isWatched
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {isWatched ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : idx + 1}
                    </div>

                    <div className="min-w-0">
                      <div className={`text-xs truncate ${isActive ? 'font-bold text-blue-950 dark:text-blue-200' : 'text-slate-800 dark:text-slate-200'}`}>
                        {vid.title}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">{vid.durationMinutes} นาที</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {vid.isRequired ? (
                      <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded">
                        จำเป็น
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        ไม่บังคับ
                      </span>
                    )}

                    {isWatched ? (
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">ดูแล้ว</span>
                    ) : isActive ? (
                      <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">กำลังดู</span>
                    ) : (
                      <span className="text-[9px] text-slate-400 dark:text-slate-500">ยังไม่ได้ดู</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-bold text-slate-700 dark:text-slate-300">คำอธิบายสถานะ:</p>
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className="text-blue-600 dark:text-blue-400">● กำลังดู</span>
              <span className="text-emerald-600 dark:text-emerald-400">● ดูแล้ว</span>
              <span className="text-slate-400 dark:text-slate-500">● ยังไม่ได้ดู</span>
            </div>
          </div>
        </div>

      </div>
      )}

      {/* Resources Grid matching Page 9 */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">เอกสารและแหล่งเรียนรู้ (ไม่นับ Progress)</h3>

        {resources.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-3 text-center">ยังไม่มีเอกสารหรือสื่อแนบในบทเรียนนี้</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {resources.map((res) => (
              <div key={res.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-center space-y-2 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 mx-auto flex items-center justify-center font-bold text-[10px]">
                    {res.type.toUpperCase()}
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1 mt-1">{res.title}</div>
                  {res.fileSize && (
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{res.fileSize}</div>
                  )}
                </div>
                <a
                  href={res.fileUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  download={res.type === 'pdf' ? res.title : undefined}
                  className="w-full py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer block text-center transition"
                >
                  เปิดดู / โหลด
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post-test Locked vs Unlocked Banner matching Page 9 & 10 */}
      {isPostTestUnlocked ? (
        <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-blue-950 dark:text-blue-100">
              🎉 คุณเรียนเนื้อหาบทเรียนนี้เสร็จสิ้นแล้ว!
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
              สามารถทำแบบทดสอบหลังเรียน (Post-test) เพื่อประเมินความเข้าใจและบันทึกผลการเรียนได้แล้ว
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              href={`/lessons/${lesson.code}/result`}
              className="py-2.5 px-4 rounded-xl border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 bg-white dark:bg-slate-800 text-xs font-bold hover:bg-blue-50 dark:hover:bg-slate-700 transition"
            >
              ดูผลบทเรียน
            </Link>

            <Link
              href={`/lessons/${lesson.code}/post-test`}
              className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-200 dark:shadow-none flex items-center justify-center gap-1.5 transition"
            >
              <Award className="w-4 h-4" />
              <span>เริ่มแบบทดสอบหลังเรียน</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-red-950 dark:text-red-200">
                แบบทดสอบหลังเรียน (Post-test) ยังไม่สามารถทำได้
              </h3>
              <p className="text-[11px] text-red-700 dark:text-red-400 mt-0.5">
                กรุณาเรียนวิดีโอที่จำเป็นให้ครบทุกข้อก่อน จึงจะสามารถทำแบบทดสอบหลังเรียนได้
              </p>
            </div>
          </div>

          <button
            disabled
            className="w-full sm:w-auto py-2.5 px-5 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0"
          >
            <Lock className="w-3.5 h-3.5" />
            ทำแบบทดสอบหลังเรียน
          </button>
        </div>
      )}

    </div>
  );
}
