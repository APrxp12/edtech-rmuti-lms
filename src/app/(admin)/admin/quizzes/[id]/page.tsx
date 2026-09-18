'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, Plus, HelpCircle, Save, AlertTriangle, CheckCircle2, 
  Trash2, MoveUp, MoveDown, Shield, Eye
} from 'lucide-react';
import { useAppStore } from '@/data/store';

export default function AdminQuizBuilderPage() {
  const params = useParams();
  const quizId = params.id as string;
  const { quizzes } = useAppStore();

  const quiz = quizzes[0]; // Default mock quiz
  const version = quiz.versions[0];

  const [passScore, setPassScore] = useState(version.passScorePercent.toString());
  const [maxAttempts, setMaxAttempts] = useState(version.maxAttempts.toString());
  const [scorePolicy, setScorePolicy] = useState(version.scorePolicy);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [questions, setQuestions] = useState(version.questions);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Header matching Page 18 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/lessons"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับไปหน้าจัดการบทเรียน
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {quiz.title}
          </h1>
          <p className="text-xs text-slate-500">สร้างและแก้ไขแบบทดสอบ พร้อมระบบ Quiz Versioning อิสระ</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            สร้าง Draft Quiz Version ใหม่
          </button>
        </div>
      </div>

      {/* Quiz Version Alert Callout matching Page 18 */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-900 text-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <span>หากมีผู้ทำแบบทดสอบแล้ว การเผยแพร่จะสร้างเวอร์ชันใหม่ และเวอร์ชันเดิมจะยังคงอยู่เพื่อรักษาประวัติผู้เรียน</span>
      </div>

      {/* Settings Grid matching Page 18 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          การตั้งค่าแบบทดสอบ (Quiz Settings)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              คะแนนผ่าน (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={passScore}
              onChange={(e) => setPassScore(e.target.value)}
              className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              จำนวนครั้งสูงสุดที่ทำได้ (Max Attempts) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              นโยบายการให้คะแนน (Score Policy)
            </label>
            <select
              value={scorePolicy}
              onChange={(e) => setScorePolicy(e.target.value as any)}
              className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="highest">คะแนนสูงสุด (Best Score)</option>
              <option value="latest">คะแนนล่าสุด (Latest Score)</option>
              <option value="first">คะแนนครั้งแรก (First Attempt)</option>
            </select>
          </div>
        </div>

        {/* Toggles matching Page 18 */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-6 text-xs text-slate-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={shuffleQuestions}
              onChange={(e) => setShuffleQuestions(e.target.checked)}
              className="rounded"
            />
            <span className="font-semibold">สลับลำดับข้อคำถาม (Shuffle Questions)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="font-semibold">สลับลำดับตัวเลือก (Shuffle Options)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="font-semibold">แสดงคำอธิบายคำตอบหลังสอบ</span>
          </label>
        </div>

        {/* Questions Table matching Page 18 */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">รายการคำถาม ({questions.length} ข้อ)</h3>
            <button className="text-xs font-bold text-blue-600 hover:underline">+ เพิ่มคำถามใหม่</button>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">ลำดับ</th>
                  <th className="py-2.5 px-3">คำถาม / ตัวเลือก</th>
                  <th className="py-2.5 px-3">คำตอบที่ถูกต้อง (เฉพาะผู้สอน)</th>
                  <th className="py-2.5 px-3">คะแนน</th>
                  <th className="py-2.5 px-3">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {questions.map((q, idx) => {
                  const correct = q.options.find((o) => o.isCorrect);
                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{q.questionText}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {q.options.map((o) => o.optionText).join(' • ')}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {correct ? correct.optionText.slice(0, 15) : 'ตัวเลือกที่ 1'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">{q.points} คะแนน</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">ใช้งาน</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs">
            บันทึก Quiz Settings
          </button>
        </div>
      </div>

    </div>
  );
}
