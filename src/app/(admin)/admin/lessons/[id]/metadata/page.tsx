'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, AlertTriangle, BookOpen, Clock, Users, 
  Send, Archive, Plus, CheckCircle2, ChevronRight, Target
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { StructuralWarningDialog } from '@/components/shared/SharedDialogs';
import { ImageUploadField } from '@/components/shared/FileUploadBox';

export default function LessonMetadataEditorPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;
  const { lessons, setLessons } = useAppStore();

  const lesson = lessons.find((l) => l.id === lessonId || l.code === lessonId) || lessons[0];
  const publishedVer = lesson.versions[0];

  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description);
  const [infographic, setInfographic] = useState(lesson.introInfographicUrl || lesson.coverImageUrl || '');
  const [objectivesText, setObjectivesText] = useState(() => {
    return (publishedVer?.learningObjectives || []).join('\n');
  });
  const [showStructuralWarning, setShowStructuralWarning] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveMetadata = () => {
    const objectivesArray = objectivesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

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
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePublish = () => {
    setShowStructuralWarning(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            แก้ไขบทเรียน: {lesson.title}
          </h1>
          <p className="text-xs text-slate-500">จัดการข้อมูลบทเรียน เนื้อหา และเวอร์ชัน</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/lessons/${lesson.id}/metadata`}
            className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-xl shadow-xs"
          >
            ข้อมูลบทเรียน & เวอร์ชัน
          </Link>
          <Link
            href={`/admin/lessons/${lesson.id}/content`}
            className="px-3.5 py-1.5 text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition"
          >
            วิดีโอ & สื่อประกอบ (Content)
          </Link>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          บันทึกการแก้ไขข้อมูลบทเรียนและภาพ Infographic สำเร็จเรียบร้อย!
        </div>
      )}

      {/* Structural Change Warning Alert Banner matching Page 16 */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900 text-xs">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">มีการเปลี่ยนแปลงโครงสร้างเนื้อหาบทเรียน (Structural Edit)</span>
            <p className="text-[11px] text-amber-700">การเปลี่ยนแปลงนี้อาจส่งผลต่อผู้เรียนเดิม จึงควรบันทึกเป็นเวอร์ชันใหม่ (Draft)</p>
          </div>
        </div>
        <button
          onClick={() => setShowStructuralWarning(true)}
          className="text-xs font-bold text-amber-900 underline shrink-0"
        >
          ดูรายละเอียดผลกระทบ →
        </button>
      </div>

      {/* Dual Version Control Cards matching Page 16 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Card 1: เวอร์ชันปัจจุบันที่เผยแพร่ (Current Published) */}
        <div className="p-6 bg-white rounded-3xl border border-emerald-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">เวอร์ชันปัจจุบัน (Published)</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              เผยแพร่แล้ว
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{publishedVer.versionTag}</div>
          
          <div className="space-y-1 text-xs text-slate-500">
            <p>📅 เผยแพร่เมื่อ: 15 ม.ค. 2568</p>
            <p>👥 จำนวนผู้เรียนที่ผูกเวอร์ชันนี้: <span className="font-bold text-slate-800">{publishedVer.learnerCount} คน</span></p>
            <p>📝 หมายเหตุ: เวอร์ชันเสถียรสำหรับใช้งานจริง</p>
          </div>
        </div>

        {/* Card 2: เวอร์ชันร่าง (Draft) */}
        <div className="p-6 bg-white rounded-3xl border border-amber-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">เวอร์ชันร่าง (Draft)</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              ร่างบันทึก
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-600">v1.1 (Draft)</div>
          
          <div className="space-y-1 text-xs text-slate-500">
            <p>📅 แก้ไขล่าสุด: วันนี้</p>
            <p>👤 ผู้แก้ไข: นางสาวมน ยี่ดี</p>
            <p>📝 หมายเหตุ: เพิ่มวิดีโอใหม่และปรับปรุงเอกสาร</p>
          </div>
        </div>

      </div>

      {/* Form & Version History Table matching Page 16 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          ข้อมูลบทเรียน (Metadata)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">รหัสบทเรียน</label>
            <input
              type="text"
              readOnly
              value={lesson.code}
              className="w-full p-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อบทเรียน</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">คำอธิบายบทเรียน</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          ></textarea>
        </div>

        {/* Learning Objectives Box */}
        <div className="space-y-2.5 p-5 rounded-2xl bg-blue-50/40 border border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <label className="block text-xs font-bold text-slate-800">
                จุดประสงค์การเรียนรู้ (Learning Objectives)
              </label>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              💡 พิมพ์แยก 1 จุดประสงค์ ต่อ 1 บรรทัด
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            จุดประสงค์ที่ระบุที่นี่จะนำไปแสดงที่หน้าบทเรียนสำหรับนักศึกษา (แทนที่บล็อกเดิม) โดยอัตโนมัติ
          </p>
          <textarea
            rows={5}
            value={objectivesText}
            onChange={(e) => setObjectivesText(e.target.value)}
            placeholder={"ตัวอย่าง:\n1. อธิบายความหมายและวิวัฒนาการของเทคโนโลยีดิจิทัลเพื่อการศึกษาได้\n2. วิเคราะห์บทบาทของนวัตกรรมต่อการจัดการเรียนรู้ในศตวรรษที่ 21 ได้\n3. สามารถนำเครื่องมือดิจิทัลไปประยุกต์ใช้ในการจัดกิจกรรมการเรียนรู้ได้"}
            className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-sans"
          ></textarea>

          {/* Live Preview */}
          {objectivesText.trim() && (
            <div className="pt-2 space-y-2">
              <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <span>ตัวอย่างการแสดงผลสำหรับนักศึกษา</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  {objectivesText.split('\n').filter(s => s.trim()).length} ข้อ
                </span>
              </div>
              <div className="space-y-2">
                {objectivesText.split('\n').filter(s => s.trim()).map((obj, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-blue-200/80 text-xs text-slate-800 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <ImageUploadField
            label="ภาพ Infographic สรุปภาพรวมเนื้อหา (แนบไฟล์จากเครื่อง หรือ URL)"
            sublabel="ภาพนี้จะแสดงให้นักศึกษาศึกษาในหน้าแรกของบทเรียน ก่อนเริ่มทำแบบทดสอบ Pre-test"
            currentUrl={infographic}
            onImageSelected={(url) => setInfographic(url)}
          />
        </div>

        {/* Media & Resources Quick Overview Card */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
              📁 สื่อและเอกสารในบทเรียนนี้
            </span>
            <p className="text-[11px] text-blue-700 mt-0.5">
              มี {publishedVer.videos?.length || 0} คลิปวิดีโอ YouTube • {publishedVer.resources?.length || 0} ไฟล์เอกสาร/สไลด์ Canva
            </p>
          </div>
          <Link
            href={`/admin/lessons/${lesson.id}/content`}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0"
          >
            จัดการวิดีโอ & สื่อประกอบ (Content Editor) →
          </Link>
        </div>

        {/* Version History Table matching Page 16 */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-800">ประวัติเวอร์ชัน (Version History)</h3>
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">เวอร์ชัน</th>
                  <th className="py-2.5 px-4">วันที่</th>
                  <th className="py-2.5 px-4">สถานะ</th>
                  <th className="py-2.5 px-4">ผู้ดำเนินการ</th>
                  <th className="py-2.5 px-4">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="py-2.5 px-4 font-bold text-amber-600 font-mono">v1.1</td>
                  <td className="py-2.5 px-4">24 ม.ค. 2568</td>
                  <td className="py-2.5 px-4 text-amber-700 font-bold">ร่างบันทึก</td>
                  <td className="py-2.5 px-4">นางสาวมน ยี่ดี</td>
                  <td className="py-2.5 px-4">แก้ไขเนื้อหา + เพิ่มแบบทดสอบ</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-emerald-600 font-mono">v1.0</td>
                  <td className="py-2.5 px-4">15 ม.ค. 2568</td>
                  <td className="py-2.5 px-4 text-emerald-700 font-bold">เผยแพร่แล้ว</td>
                  <td className="py-2.5 px-4">นางสาวมน ยี่ดี</td>
                  <td className="py-2.5 px-4">เวอร์ชันแรกสำหรับใช้งานจริง</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-500 font-mono">v0.9</td>
                  <td className="py-2.5 px-4">10 ม.ค. 2568</td>
                  <td className="py-2.5 px-4 text-slate-400">เก็บถาวร</td>
                  <td className="py-2.5 px-4">นายสมชาย ใจดี</td>
                  <td className="py-2.5 px-4">ทดลองใช้งานภายใน</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Buttons matching Page 16 */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/lessons')}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            ยกเลิก
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveMetadata}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
            >
              บันทึกข้อมูล
            </button>

            <button
              type="button"
              onClick={handlePublish}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Publish เวอร์ชันใหม่
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
        title="คำเตือนการแก้ไขโครงสร้าง"
        description="การเปลี่ยนแปลงโครงสร้างอาจส่งผลต่อความคืบหน้าของผู้เรียนที่กำลังเรียนอยู่"
      />

    </div>
  );
}
