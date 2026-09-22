'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, BookOpen, Clock, FileText, CheckCircle2, Play, 
  Award, HelpCircle, Download, ExternalLink, Sparkles, Lock, X, Maximize2, Target
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import LessonCoverPoster from '@/components/shared/LessonCoverPoster';

export default function LessonIntroPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const lessonCode = (params?.lessonCode as string) || 'RMUTI-001';
  const { lessons, progressMap } = useAppStore();

  const [lightboxOpen, setLightboxOpen] = useState(false);

  const lesson = lessons.find((l) => l.code === lessonCode);

  if (!lesson) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">ไม่พบบทเรียน "{lessonCode}" ในระบบ</h1>
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

  const activeVersion = lesson.versions?.[0] || {
    description: 'รายละเอียดบทเรียน',
    learningObjectives: ['เรียนรู้เนื้อหาและทักษะประจำบทเรียน'],
    estimatedDurationMinutes: 30,
    videos: [],
    resources: [],
  };
  const videos = activeVersion.videos || [];
  const resources = activeVersion.resources || [];
  const learningObjectives = activeVersion.learningObjectives || [];
  const progress = progressMap[lesson.code] || { progressPercent: 0, status: 'not_started' };

  const isReviewMode = searchParams?.get('mode') === 'review' || progress.status === 'passed' || progress.isPreTestCompleted;

  const infographicSrc = lesson.introInfographicUrl || lesson.coverImageUrl || '';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">

      {/* Top Breadcrumb & Status Tag matching Page 6 */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับรายการบทเรียน
        </Link>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
          progress.status === 'passed'
            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : progress.status === 'in_progress'
            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
            : 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
        }`}>
          {progress.status === 'passed' ? '✓ ผ่านเกณฑ์แล้ว' : progress.status === 'in_progress' ? 'กำลังเรียน' : 'ยังไม่ได้เริ่ม'}
        </span>
      </div>

      {/* Hero Info Header matching Page 6 */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-8 space-y-3">
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800">
              รหัสวิชา {lesson.code}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 leading-tight">
              {lesson.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {activeVersion.description}
            </p>

            {/* Quick Metrics Chips */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                <Play className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                วิดีโอ {videos.length} รายการ ({activeVersion.estimatedDurationMinutes || 30} นาที)
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                เอกสารประกอบ {resources.length} ไฟล์
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                <Award className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                แบบทดสอบ 2 ชุด (Pre/Post)
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/40 border border-blue-100 dark:border-blue-900/50 text-center w-full">
              <div className="w-32 h-32 rounded-xl overflow-hidden mx-auto shadow-sm border-2 border-white dark:border-slate-700 mb-2">
                <LessonCoverPoster lesson={lesson} compact={true} />
              </div>
              <p className="text-xs font-bold text-blue-900 dark:text-blue-200">“สื่อการสอนที่ดี สร้างการเรียนรู้ที่ดีกว่า”</p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400">มาเรียนรู้การสร้างสื่อออนไลน์ที่น่าสนใจกันเถอะ</p>
            </div>
          </div>

        </div>
      </div>

      {/* Infographic Overview Card with Lightbox Fullscreen click */}
      {infographicSrc && (
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Infographic สรุปภาพรวมเนื้อหาประจำบท</h2>
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="text-xs font-semibold px-3 py-1 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              คลิกดูภาพเต็มจอ
            </button>
          </div>

          {/* Big Infographic Display */}
          <div 
            onClick={() => setLightboxOpen(true)}
            className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shadow-inner cursor-pointer group relative"
          >
            <img
              src={infographicSrc}
              alt={`Infographic ${lesson.title}`}
              className="w-full h-72 sm:h-[420px] object-cover group-hover:scale-[1.01] transition duration-300"
            />
            <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="px-4 py-2 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xs rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 shadow-lg flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                คลิกเพื่อดูภาพขยายเต็มจอ
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium">
            💡 ศึกษา Infographic สรุปสาระสำคัญด้านบน เพื่อเตรียมความพร้อมในการทำแบบทดสอบหรือทบทวนบทเรียน
          </p>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-50"
            title="ปิดภาพขยาย"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl max-h-[90vh] overflow-auto rounded-2xl">
            <img
              src={infographicSrc}
              alt="Infographic Full"
              className="w-full h-auto object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Section 1: จุดประสงค์การเรียนรู้ (Learning Objectives) */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              จุดประสงค์การเรียนรู้ (Learning Objectives)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              เป้าหมายและผลลัพธ์การเรียนรู้ที่ผู้เรียนจะได้รับหลังจากศึกษาบทเรียนนี้
            </p>
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          {learningObjectives && learningObjectives.length > 0 ? (
            learningObjectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-blue-50/40 dark:bg-slate-800/60 border border-blue-100/80 dark:border-slate-700/60 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{obj}</span>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs text-center">
              ยังไม่มีการระบุจุดประสงค์การเรียนรู้สำหรับบทเรียนนี้
            </div>
          )}
        </div>
      </div>

      {/* Section 2: ลำดับกิจกรรมในบทเรียนนี้ (Learning Stepper) matching Page 6 */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white">ลำดับกิจกรรมในบทเรียนนี้</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs mx-auto flex items-center justify-center">
              1
            </div>
            <h4 className="text-xs font-bold text-blue-950 dark:text-blue-200">แบบทดสอบก่อนเรียน (Pre-test)</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">วัดระดับความรู้เดิม (ประมาณ 10 นาที)</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs mx-auto flex items-center justify-center">
              2
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">ศึกษาเนื้อหา วิดีโอ / เอกสาร</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">เรียนตามจังหวะตนเอง ({activeVersion.estimatedDurationMinutes || 30} นาที)</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs mx-auto flex items-center justify-center">
              3
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">แบบทดสอบหลังเรียน (Post-test)</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">ประเมินผลผ่านเกณฑ์ (ประมาณ 10 นาที)</p>
          </div>
        </div>
      </div>

      {/* Section 3: สื่อและเอกสารประกอบการสอน */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isReviewMode ? (
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Lock className="w-4 h-4 text-slate-400" />
            )}
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">สื่อและเอกสารประกอบการสอน ({resources.length} รายการ)</h2>
          </div>
          {isReviewMode ? (
            <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ปลดล็อกดาวน์โหลดแล้ว
            </span>
          ) : (
            <span className="text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              ปลดล็อกดาวน์โหลดในห้องเรียนวิดีโอ
            </span>
          )}
        </div>

        {!isReviewMode && (
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-blue-950 dark:text-blue-200">
                เอกสารประกอบการสอน (PDF, สไลด์ Canva, ภาพ Infographic) จะเปิดให้ดาวน์โหลดในห้องเรียนวิดีโอ
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                เพื่อประสิทธิภาพในการวัดระดับความรู้เดิมที่แท้จริง กรุณาทำแบบทดสอบก่อนเรียน (Pre-test) ให้เสร็จสิ้นก่อนเริ่มดาวน์โหลดเอกสาร
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {resources.map((res) => (
            <div key={res.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{res.title}</span>
              </div>
              {isReviewMode ? (
                <a
                  href={res.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition shrink-0"
                >
                  เปิด
                </a>
              ) : (
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 px-2 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg flex items-center gap-1 shrink-0">
                  <Lock className="w-3 h-3" />
                  ล็อก
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Call to Action Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          {isReviewMode ? (
            <>
              <h3 className="text-sm font-bold">ขั้นตอนถัดไป: เข้าสู่ห้องเรียนวิดีโอเพื่อทบทวนเนื้อหา</h3>
              <p className="text-xs text-blue-200 mt-0.5">
                คุณได้ผ่านแบบทดสอบก่อนเรียนแล้ว สามารถเข้าศึกษาคลิปวิดีโอและเอกสารประกอบได้ตลอดเวลา
              </p>
            </>
          ) : (
            <>
              <h3 className="text-sm font-bold">ขั้นตอนถัดไป: เริ่มทำแบบทดสอบก่อนเรียน (Pre-test)</h3>
              <p className="text-xs text-blue-200 mt-0.5">
                ทำแบบทดสอบก่อนเรียนเพื่อประเมินความรู้พื้นฐานและปลดล็อกเนื้อหาวิดีโอ
              </p>
            </>
          )}
        </div>

        {isReviewMode ? (
          <Link
            href={`/lessons/${lesson.code}/learn`}
            className="w-full sm:w-auto py-3 px-8 rounded-2xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-blue-900" />
            <span>เข้าสู่ห้องเรียนวิดีโอ (ทบทวนเนื้อหา)</span>
          </Link>
        ) : (
          <Link
            href={`/lessons/${lesson.code}/pre-test`}
            className="w-full sm:w-auto py-3 px-8 rounded-2xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-blue-900" />
            <span>เริ่มทำแบบทดสอบก่อนเรียน</span>
          </Link>
        )}
      </div>

    </div>
  );
}
