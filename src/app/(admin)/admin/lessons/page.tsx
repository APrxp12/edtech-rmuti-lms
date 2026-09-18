'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Plus, RefreshCw, Search, Filter, Eye, Edit, 
  MoreVertical, Users, CheckCircle2, Clock, Archive
} from 'lucide-react';
import { useAppStore } from '@/data/store';

export default function AdminLessonsPage() {
  const { lessons } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = lessons.filter((l) => {
    const matchQuery = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header matching Page 14 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            จัดการบทเรียน
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการเนื้อหาบทเรียนออนไลน์ เรียนรู้ได้ทุกที่ ทุกเวลา
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">รีเฟรชรายการ</span>
          </button>
          
          <Link
            href="/admin/lessons/new"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-200 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มบทเรียน</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Stats Counter Cards matching Page 14 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">48</div>
            <div className="text-[10px] font-bold text-slate-400">บทเรียนทั้งหมด</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">32</div>
            <div className="text-[10px] font-bold text-slate-400">เผยแพร่แล้ว</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">10</div>
            <div className="text-[10px] font-bold text-slate-400">ฉบับร่าง</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">6</div>
            <div className="text-[10px] font-bold text-slate-400">เก็บถาวร</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar matching Page 14 */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="ค้นหาชื่อบทเรียน, รหัสบทเรียน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="published">เผยแพร่แล้ว</option>
            <option value="draft">ฉบับร่าง</option>
          </select>

          <button 
            onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
            className="text-xs text-blue-600 font-bold hover:underline px-2 py-1"
          >
            ล้างตัวกรอง
          </button>
        </div>
      </div>

      {/* Table: Lessons with Versioning tags matching Page 14 */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">รหัสบทเรียน</th>
                <th className="py-3.5 px-4">ชื่อบทเรียน</th>
                <th className="py-3.5 px-4">สถานะ</th>
                <th className="py-3.5 px-4">เวอร์ชั่นปัจจุบัน</th>
                <th className="py-3.5 px-4">ฉบับร่าง</th>
                <th className="py-3.5 px-4">ผู้เรียน</th>
                <th className="py-3.5 px-4">อัปเดตล่าสุด</th>
                <th className="py-3.5 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((l) => {
                const activeVer = l.versions[0];
                const hasDraft = l.currentDraftVersionId || l.code === 'RMUTI-003';

                return (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{l.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{l.title}</td>
                    
                    <td className="py-3.5 px-4">
                      {l.status === 'published' ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          เผยแพร่แล้ว
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          ฉบับร่าง
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {activeVer ? activeVer.versionTag : 'v1.0'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {hasDraft ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          มีฉบับร่าง
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeVer ? activeVer.learnerCount : 0}</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(l.updatedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/lessons/${l.code}/intro`}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                        >
                          เปิด
                        </Link>
                        <Link
                          href={`/admin/lessons/${l.id}/metadata`}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                        >
                          แก้ไข
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
