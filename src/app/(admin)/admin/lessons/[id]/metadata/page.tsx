'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, AlertTriangle, BookOpen, Clock, Users, 
  Send, Archive, Plus, CheckCircle2, ChevronRight, Target,
  Eye, ExternalLink, Layers, Film, Building2, User, Sparkles,
  X, Check, HelpCircle, FileText, Video, Info, Calendar
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { StructuralWarningDialog } from '@/components/shared/SharedDialogs';
import { ImageUploadField } from '@/components/shared/FileUploadBox';

export default function LessonMetadataEditorPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;
  const { lessons, setLessons } = useAppStore();

  // Course Information Constants matching the official syllabus
  const courseInfo = {
    code: '30-401-001-204',
    title: 'นวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้',
    instructor: 'ผศ.ดร.เฉลิมพล บุญทศ',
    semester: 'ภาคการศึกษาที่ 1 / ปีการศึกษา 2569',
    curriculum: 'หลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต (ค.อ.บ.)',
    department: 'สาขาวิชาครุศาสตร์อุตสาหกรรมอุตสาหการ คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น',
  };

  // Find target lesson supporting both id (e.g. lsn-001) and code (e.g. RMUTI-001) for all lessons
  const lesson = useMemo(() => {
    return lessons.find((l) => l.id === lessonId || l.code === lessonId) || lessons[0];
  }, [lessons, lessonId]);

  const publishedVer = lesson?.versions?.[0] || {
    versionTag: 'v1.0',
    learnerCount: 0,
    learningObjectives: [],
    videos: [],
    resources: [],
    updatedAt: new Date().toISOString(),
  };

  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description);
  const [infographic, setInfographic] = useState(lesson.introInfographicUrl || lesson.coverImageUrl || '');
  const [objectivesText, setObjectivesText] = useState(() => {
    return (publishedVer?.learningObjectives || []).join('\n');
  });
  const [showStructuralWarning, setShowStructuralWarning] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Synchronize state when lesson changes or rehydrates
  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title);
      setDescription(lesson.description);
      setInfographic(lesson.introInfographicUrl || lesson.coverImageUrl || '');
      const ver = lesson.versions?.[0];
      setObjectivesText((ver?.learningObjectives || []).join('\n'));
    }
  }, [lesson?.id, lesson?.code]);

  // Derived objectives list for counter & preview
  const objectivesList = useMemo(() => {
    return objectivesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [objectivesText]);

  // Save metadata handler
  const handleSaveMetadata = () => {
    const objectivesArray = objectivesList;

    const updated = lessons.map((l) => {
      if (l.id === lesson.id) {
        const updatedVersions = l.versions.map((v, idx) => {
          if (idx === 0) {
            return {
              ...v,
              learningObjectives: objectivesArray,
              updatedAt: new Date().toISOString(),
            };
          }
          return v;
        });

        return {
          ...l,
          title,
          description,
          introInfographicUrl: infographic,
          coverImageUrl: infographic || l.coverImageUrl,
          versions: updatedVersions,
          updatedAt: new Date().toISOString(),
        };
      }
      return l;
    });

    setLessons(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('edtech_lessons', JSON.stringify(updated));
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handlePublish = () => {
    setShowStructuralWarning(true);
  };

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
              Lesson Metadata CMS
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono font-bold text-slate-600">
              {lesson.code}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            แก้ไขข้อมูลบทเรียน: {lesson.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            จัดการข้อมูลพื้นฐาน คำอธิบาย จุดประสงค์การเรียนรู้ ภาพ Infographic และระบบควบคุมเวอร์ชัน (Version Control)
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/lessons/${lesson.code}/intro`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
            title="เปิดดูในมุมมองผู้เรียนในแท็บใหม่"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>มุมมองผู้เรียน (Intro)</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            onClick={handleSaveMetadata}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกข้อมูลบทเรียน</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <Link
          href={`/admin/lessons/${lesson.id}/metadata`}
          className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl shadow-xs flex items-center gap-2"
        >
          <Layers className="w-4 h-4" />
          <span>ข้อมูลบทเรียน & เวอร์ชัน (Metadata)</span>
        </Link>
        <Link
          href={`/admin/lessons/${lesson.id}/content`}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-2"
        >
          <Film className="w-4 h-4" />
          <span>วิดีโอ & สื่อประกอบ (Content & Media)</span>
        </Link>
      </div>

      {/* Save Success Toast Banner */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-950">บันทึกข้อมูลบทเรียนและจุดประสงค์การเรียนรู้สำเร็จเรียบร้อย!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                ข้อมูลที่แก้ไขมีผลทันทีในหน้ารายวิชาสำหรับนักศึกษา ({lesson.code}) และบันทึกในฐานข้อมูลระบบแล้ว
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
                {publishedVer?.versionTag || 'v1.0'}
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

            {/* Live Metadata Highlights */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-blue-200/80 shadow-2xs flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-700">{objectivesList.length} จุดประสงค์การเรียนรู้</span>
              </div>
              <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-amber-200/80 shadow-2xs flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-semibold text-slate-700">{publishedVer.videos?.length || 0} คลิปวิดีโอ</span>
              </div>
              <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-indigo-200/80 shadow-2xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold text-slate-700">{publishedVer.resources?.length || 0} เอกสาร/สื่อ</span>
              </div>
              <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-emerald-200/80 shadow-2xs flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-slate-700">{publishedVer.learnerCount || 0} ผู้เรียนที่ผูก</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Structural Change Warning Alert Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-amber-950">มีการเปลี่ยนแปลงโครงสร้างเนื้อหาบทเรียน (Structural Edit Mode)</span>
            <p className="text-[11px] text-amber-700 mt-0.5">
              การเปลี่ยนแปลงข้อมูลหรือจุดประสงค์อาจส่งผลต่อผู้เรียนเดิม จึงสามารถบันทึกเป็นเวอร์ชันร่าง (Draft) หรือเลือกเผยแพร่เป็นเวอร์ชันใหม่ได้
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowStructuralWarning(true)}
          className="px-3.5 py-1.5 bg-white hover:bg-amber-100/60 text-amber-900 font-bold rounded-xl border border-amber-200/80 shadow-2xs transition shrink-0 cursor-pointer"
        >
          ดูรายละเอียดผลกระทบ →
        </button>
      </div>

      {/* Dual Version Control Cards (Soft Pastel Accents) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Card 1: เวอร์ชันปัจจุบันที่เผยแพร่ (Current Published) */}
        <div className="p-6 bg-white rounded-3xl border border-emerald-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">เวอร์ชันปัจจุบัน (Published)</span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              เผยแพร่แล้ว
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{publishedVer.versionTag}</div>
          
          <div className="space-y-1.5 text-xs text-slate-500">
            <p className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>เผยแพร่เมื่อ: 15 ม.ค. 2568</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>จำนวนผู้เรียนที่ผูกเวอร์ชันนี้: <strong className="font-bold text-slate-800">{publishedVer.learnerCount || 0} คน</strong></span>
            </p>
            <p className="flex items-center gap-1.5 text-slate-400">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>สถานะ: เวอร์ชันหลักสำหรับผู้เรียนปัจจุบัน</span>
            </p>
          </div>
        </div>

        {/* Card 2: เวอร์ชันร่าง (Draft) */}
        <div className="p-6 bg-white rounded-3xl border border-amber-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">เวอร์ชันร่าง (Draft)</span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
              ร่างบันทึก
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-600">v1.1 (Draft)</div>
          
          <div className="space-y-1.5 text-xs text-slate-500">
            <p className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>แก้ไขล่าสุด: วันนี้</span>
            </p>
            <p className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>ผู้แก้ไข: นางสาวมน ยี่ดี</span>
            </p>
            <p className="flex items-center gap-1.5 text-slate-400">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>สถานะ: รองรับการแก้ไขข้อมูลและเผยแพร่เมื่อพร้อม</span>
            </p>
          </div>
        </div>

      </div>

      {/* SECTION: METADATA FORM */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">ข้อมูลบทเรียน (Lesson Metadata)</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  {lesson.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                กำหนดชื่อบทเรียน รหัสบทเรียน คำอธิบายย่อ และจุดประสงค์การเรียนรู้
              </p>
            </div>
          </div>
        </div>

        {/* Input Grid: Code, SortOrder, Title */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              รหัสบทเรียน
            </label>
            <input
              type="text"
              readOnly
              value={lesson.code}
              className="w-full px-3 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-600 font-semibold cursor-not-allowed"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ลำดับบทที่
            </label>
            <input
              type="text"
              readOnly
              value={`บทที่ ${lesson.sortOrder}`}
              className="w-full px-3 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold text-center cursor-not-allowed"
            />
          </div>
          <div className="sm:col-span-7">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ชื่อบทเรียน (Title) *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              placeholder="กรอกชื่อบทเรียน"
            />
          </div>
        </div>

        {/* Lesson Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            คำอธิบายบทเรียน (Description)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition leading-relaxed text-slate-800"
            placeholder="อธิบายสังเขปเกี่ยวกับเนื้อหาในบทเรียนนี้"
          ></textarea>
        </div>

        {/* Learning Objectives Box (Vertical Stack matching student intro) */}
        <div className="space-y-3 p-5 rounded-2xl bg-gradient-to-r from-blue-50/60 via-indigo-50/30 to-sky-50/40 border border-blue-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <label className="block text-xs font-bold text-slate-900">
                จุดประสงค์การเรียนรู้ (Learning Objectives)
              </label>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                {objectivesList.length} ข้อ
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              💡 พิมพ์แยก 1 จุดประสงค์ ต่อ 1 บรรทัด
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            จุดประสงค์ที่ระบุที่นี่จะนำไปแสดงที่หน้ารายละเอียดบทเรียนสำหรับนักศึกษา (หน้า Intro) โดยเรียงเป็นแนวตั้งจากบนลงล่างอย่างเป็นระเบียบ
          </p>
          <textarea
            rows={5}
            value={objectivesText}
            onChange={(e) => setObjectivesText(e.target.value)}
            placeholder={"ตัวอย่าง:\n1. อธิบายความหมายและวิวัฒนาการของเทคโนโลยีดิจิทัลเพื่อการศึกษาได้\n2. วิเคราะห์บทบาทของนวัตกรรมต่อการจัดการเรียนรู้ในศตวรรษที่ 21 ได้\n3. สามารถนำเครื่องมือดิจิทัลไปประยุกต์ใช้ในการจัดกิจกรรมการเรียนรู้ได้"}
            className="w-full p-3.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 leading-relaxed font-sans text-slate-800 transition"
          ></textarea>

          {/* Live Preview (Vertical Stack matching intro page) */}
          {objectivesList.length > 0 && (
            <div className="pt-2 space-y-2">
              <div className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ตัวอย่างการแสดงผลจริงสำหรับนักศึกษา (แนวตั้งจากบนลงล่าง)</span>
                </span>
                <span className="text-slate-400 text-[10px]">
                  แสดงผลในหน้า /lessons/{lesson.code}/intro
                </span>
              </div>
              <div className="space-y-2">
                {objectivesList.map((obj, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-blue-200/80 text-xs text-slate-800 shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                    <span className="leading-relaxed font-medium">{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Infographic Overview Image Upload */}
        <div className="pt-2">
          <ImageUploadField
            label="ภาพ Infographic สรุปภาพรวมเนื้อหา (แนบไฟล์จากเครื่อง หรือ URL)"
            sublabel="ภาพนี้จะแสดงให้นักศึกษาศึกษาในหน้าแรกของบทเรียน (Intro) ก่อนเริ่มทำแบบทดสอบ Pre-test"
            currentUrl={infographic}
            onImageSelected={(url) => setInfographic(url)}
          />
        </div>

        {/* Quick Link to Content Editor */}
        <div className="p-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-sky-50/60 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-blue-950 block">
                จัดการวิดีโอบรรยายและสื่อการสอนในบทเรียนนี้
              </span>
              <p className="text-[11px] text-blue-700 mt-0.5">
                ปัจจุบันมี {publishedVer.videos?.length || 0} คลิปวิดีโอ YouTube • {publishedVer.resources?.length || 0} เอกสาร/สไลด์ Canva
              </p>
            </div>
          </div>
          <Link
            href={`/admin/lessons/${lesson.id}/content`}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>ไปที่หน้าจัดการวิดีโอ & สื่อ (Content Editor)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Version History Table (Full-Width, Non-Scrollable) */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>ประวัติเวอร์ชันของบทเรียนนี้ (Version History)</span>
            </h3>
            <span className="text-[11px] text-slate-400">ระบบบันทึกประวัติการปรับปรุงอัตโนมัติ</span>
          </div>

          <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-24">เวอร์ชัน</th>
                  <th className="py-3 px-4 w-32 hidden sm:table-cell">วันที่</th>
                  <th className="py-3 px-4 w-32">สถานะ</th>
                  <th className="py-3 px-4 w-36 hidden md:table-cell">ผู้ดำเนินการ</th>
                  <th className="py-3 px-4">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-amber-600 font-mono">v1.1</td>
                  <td className="py-3 px-4 text-slate-500 hidden sm:table-cell">24 ม.ค. 2568</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                      ร่างบันทึก
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium hidden md:table-cell">นางสาวมน ยี่ดี</td>
                  <td className="py-3 px-4 text-slate-700">แก้ไขจุดประสงค์การเรียนรู้ + เพิ่มวิดีโอใหม่</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-emerald-600 font-mono">v1.0</td>
                  <td className="py-3 px-4 text-slate-500 hidden sm:table-cell">15 ม.ค. 2568</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      เผยแพร่แล้ว
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium hidden md:table-cell">ผศ.ดร.เฉลิมพล บุญทศ</td>
                  <td className="py-3 px-4 text-slate-700">เวอร์ชันแรกสำหรับใช้งานในห้องเรียนจริง</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-500 font-mono">v0.9</td>
                  <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">10 ม.ค. 2568</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-medium">
                      เก็บถาวร
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 hidden md:table-cell">นายสมชาย ใจดี</td>
                  <td className="py-3 px-4 text-slate-400">ทดลองใช้งานภายในและตรวจสอบเนื้อหา</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/lessons')}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            ← กลับไปหน้ารวมบทเรียน
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleSaveMetadata}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>บันทึกข้อมูลบทเรียน</span>
            </button>

            <button
              type="button"
              onClick={handlePublish}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Publish เวอร์ชันใหม่</span>
            </button>
          </div>
        </div>

      </div>

      {/* Structural Warning Modal */}
      <StructuralWarningDialog
        isOpen={showStructuralWarning}
        onClose={() => setShowStructuralWarning(false)}
        onConfirm={() => {
          setShowStructuralWarning(false);
          alert('เผยแพร่เวอร์ชันใหม่เรียบร้อยแล้ว! ผู้เรียนเก่าจะยังคงศึกษาตามเวอร์ชันเดิม');
        }}
        title="คำเตือนการแก้ไขโครงสร้างบทเรียน"
        description="การเปลี่ยนแปลงโครงสร้างอาจส่งผลต่อความคืบหน้าของผู้เรียนที่กำลังเรียนอยู่เดิม ระบบจะคงเวอร์ชันเดิมไว้ให้ผู้เรียนปัจจุบัน"
      />

    </div>
  );
}
