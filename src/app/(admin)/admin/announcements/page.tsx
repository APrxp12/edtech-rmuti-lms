'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Megaphone, Plus, Trash2, Edit3, CheckCircle2, Calendar, AlertTriangle, 
  Image as ImageIcon, ArrowLeft, ExternalLink, Search, X, Eye, 
  Sparkles, Building2, User, Filter, Clock, Check, Layers, AlertCircle
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { Announcement } from '@/types';
import { ImageUploadField } from '@/components/shared/FileUploadBox';

export default function AdminAnnouncementsPage() {
  const { announcements, setAnnouncements } = useAppStore();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'announcement' | 'update' | 'activity'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalBody, setModalBody] = useState('');
  const [modalCategory, setModalCategory] = useState<'announcement' | 'update' | 'activity'>('announcement');
  const [modalStatus, setModalStatus] = useState<'published' | 'draft' | 'archived'>('published');
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [modalPublishDate, setModalPublishDate] = useState('2025-04-15');
  const [modalExpireDate, setModalExpireDate] = useState('2025-05-31');
  const [modalError, setModalError] = useState<string | null>(null);

  // Preview Modal State
  const [previewAnnouncement, setPreviewAnnouncement] = useState<Announcement | null>(null);

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Course Information matching student /announcements page
  const courseInfo = {
    code: '30-401-001-204',
    title: 'นวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้',
    instructor: 'ผศ.ดร.เฉลิมพล บุญทศ',
    semester: 'ภาคการศึกษาที่ 1 / ปีการศึกษา 2569',
    curriculum: 'หลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต (ค.อ.บ.)',
    department: 'สาขาวิชาครุศาสตร์อุตสาหกรรมอุตสาหการ คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น',
  };

  // Sync to Store and LocalStorage
  const saveAndSync = (updated: Announcement[], message?: string) => {
    setAnnouncements(updated);
    try {
      localStorage.setItem('edtech_announcements', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving announcements to localStorage:', e);
    }
    if (message) {
      setToastMsg(message);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingId(null);
    setModalTitle('');
    setModalBody('');
    setModalCategory('announcement');
    setModalStatus('published');
    setModalImageUrl('');
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setModalPublishDate(today);
    setModalExpireDate(nextMonth);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setModalTitle(ann.title);
    setModalBody(ann.body);
    setModalCategory(ann.category);
    setModalStatus(ann.status);
    setModalImageUrl(ann.imageUrl || '');
    setModalPublishDate(ann.publishedAt ? ann.publishedAt.split('T')[0] : '2025-04-15');
    setModalExpireDate(ann.expiresAt ? ann.expiresAt.split('T')[0] : '2025-05-31');
    setModalError(null);
    setIsModalOpen(true);
  };

  // Save Modal (Add or Edit)
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim() || !modalBody.trim()) {
      setModalError('กรุณากรอกหัวข้อและรายละเอียดข่าวประกาศให้ครบถ้วน');
      return;
    }

    if (new Date(modalExpireDate) < new Date(modalPublishDate)) {
      setModalError('วันหมดอายุต้องไม่น้อยกว่าวันที่เริ่มเผยแพร่');
      return;
    }

    setModalError(null);

    if (editingId) {
      // Edit existing
      const updated = announcements.map((a) =>
        a.id === editingId
          ? {
              ...a,
              title: modalTitle.trim(),
              body: modalBody.trim(),
              category: modalCategory,
              status: modalStatus,
              imageUrl: modalImageUrl.trim() || undefined,
              publishedAt: new Date(modalPublishDate).toISOString(),
              expiresAt: new Date(modalExpireDate).toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : a
      );
      saveAndSync(updated, `แก้ไขข่าวประกาศ "${modalTitle.trim()}" สำเร็จ`);
    } else {
      // Add new
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title: modalTitle.trim(),
        body: modalBody.trim(),
        category: modalCategory,
        status: modalStatus,
        imageUrl: modalImageUrl.trim() || undefined,
        publishedAt: new Date(modalPublishDate).toISOString(),
        expiresAt: new Date(modalExpireDate).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveAndSync([newAnn, ...announcements], `สร้างข่าวประกาศใหม่ "${newAnn.title}" สำเร็จ`);
    }

    setIsModalOpen(false);
  };

  // Delete Announcement
  const handleDelete = (id: string, title: string) => {
    if (confirm(`คุณต้องการลบข่าวประกาศ "${title}" ใช่หรือไม่?`)) {
      const updated = announcements.filter((a) => a.id !== id);
      saveAndSync(updated, `ลบข่าวประกาศ "${title}" เรียบร้อยแล้ว`);
    }
  };

  // KPI Statistics matching student view categories
  const stats = useMemo(() => {
    const total = announcements.length;
    let urgentCount = 0;
    let updateCount = 0;
    let activityCount = 0;
    let publishedCount = 0;
    let draftCount = 0;

    announcements.forEach((a) => {
      if (a.category === 'announcement') urgentCount++;
      if (a.category === 'update') updateCount++;
      if (a.category === 'activity') activityCount++;
      if (a.status === 'published') publishedCount++;
      if (a.status === 'draft') draftCount++;
    });

    return { total, urgentCount, updateCount, activityCount, publishedCount, draftCount };
  }, [announcements]);

  // Filtered Announcements
  const filtered = useMemo(() => {
    return announcements.filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q);

      const matchCat = categoryFilter === 'all' || a.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;

      return matchSearch && matchCat && matchStatus;
    });
  }, [announcements, searchQuery, categoryFilter, statusFilter]);

  // Format Thai Date
  const formatThaiDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-2 sm:px-4">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <Link
            href="/admin/lessons"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition mb-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับสู่หน้ารวมบทเรียน</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              Announcements Management
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono font-bold text-slate-600">
              {courseInfo.code}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-600" />
            <span>จัดการข่าวประกาศ (Announcements)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            สร้าง เผยแพร่ และแก้ไขข้อมูลข่าวสาร กิจกรรม และอัปเดตรายวิชาสำหรับผู้เรียน
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/announcements"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="เปิดดูหน้าข่าวประกาศในมุมมองของผู้เรียน"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>ดูมุมมองผู้เรียน</span>
          </Link>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างข่าวประกาศใหม่</span>
          </button>
        </div>
      </div>

      {/* Toast Alert Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs transition-all animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* COURSE HERO BANNER & LIVE KPI STATS (Soft Luminous Pastel Theme matching student page) */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-sky-50/60 p-6 sm:p-7 shadow-xs">
        {/* Ambient soft pastel orbs */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-44 h-44 bg-amber-200/25 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-10 -top-10 w-44 h-44 bg-indigo-200/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-5">
          
          {/* Top Row: Meta Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-blue-900 bg-white/90 px-3 py-1 rounded-xl shadow-2xs border border-blue-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{courseInfo.curriculum}</span>
              </span>
              <span className="text-xs font-semibold text-slate-600 bg-white/70 px-3 py-1 rounded-xl border border-slate-200/60">
                {courseInfo.semester}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              ผู้รับผิดชอบ: <strong className="text-slate-800">{courseInfo.instructor}</strong>
            </span>
          </div>

          {/* Dynamic KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
            
            {/* Total */}
            <div className="bg-white/85 backdrop-blur-xs rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">ประกาศทั้งหมด</span>
                <Megaphone className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">{stats.total}</div>
              <span className="text-[10px] text-slate-400">รายการในระบบ</span>
            </div>

            {/* Urgent / Announcement */}
            <div className="bg-red-50/70 rounded-2xl p-3.5 border border-red-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-red-700">ประกาศสำคัญ</span>
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
              </div>
              <div className="text-xl font-bold text-red-950 mt-1">{stats.urgentCount}</div>
              <span className="text-[10px] text-red-600/80">ข่าวด่วน/สำคัญ</span>
            </div>

            {/* Update */}
            <div className="bg-blue-50/70 rounded-2xl p-3.5 border border-blue-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-blue-700">อัปเดตบทเรียน</span>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
              <div className="text-xl font-bold text-blue-950 mt-1">{stats.updateCount}</div>
              <span className="text-[10px] text-blue-600/80">เนื้อหาใหม่</span>
            </div>

            {/* Activity */}
            <div className="bg-emerald-50/70 rounded-2xl p-3.5 border border-emerald-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-700">กิจกรรม/นัดหมาย</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-xl font-bold text-emerald-950 mt-1">{stats.activityCount}</div>
              <span className="text-[10px] text-emerald-600/80">กำหนดการ</span>
            </div>

            {/* Published */}
            <div className="bg-teal-50/70 rounded-2xl p-3.5 border border-teal-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-teal-700">เผยแพร่แล้ว</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
              </div>
              <div className="text-xl font-bold text-teal-950 mt-1">{stats.publishedCount}</div>
              <span className="text-[10px] text-teal-600/80">ผู้เรียนมองเห็น</span>
            </div>

            {/* Draft */}
            <div className="bg-amber-50/70 rounded-2xl p-3.5 border border-amber-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-700">ฉบับร่าง</span>
                <Clock className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-amber-950 mt-1">{stats.draftCount}</div>
              <span className="text-[10px] text-amber-600/80">รอยืนยันเผยแพร่</span>
            </div>

          </div>

        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS BAR */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="ค้นหาข่าวประกาศ หรือรายละเอียด..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters and Counters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold hidden sm:inline">หมวดหมู่:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
            >
              <option value="all">ทุกหมวดหมู่ ({stats.total})</option>
              <option value="announcement">📢 ประกาศสำคัญ ({stats.urgentCount})</option>
              <option value="update">🚀 อัปเดตบทเรียน ({stats.updateCount})</option>
              <option value="activity">📅 กิจกรรม ({stats.activityCount})</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold hidden sm:inline">สถานะ:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
            >
              <option value="all">ทุกสถานะ ({stats.total})</option>
              <option value="published">● เผยแพร่แล้ว ({stats.publishedCount})</option>
              <option value="draft">○ ฉบับร่าง ({stats.draftCount})</option>
              <option value="archived">✕ เก็บถาวร ({stats.total - stats.publishedCount - stats.draftCount})</option>
            </select>
          </div>

          <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
            แสดง {filtered.length} รายการ
          </span>

        </div>

      </div>

      {/* ANNOUNCEMENTS TABLE (Full-Width, Non-Scrollable) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-slate-700">ไม่พบข่าวประกาศที่ตรงกับการค้นหา</p>
              <p className="text-xs text-slate-400 mt-0.5">ลองปรับคำค้นหา หรือเลือกดูหมวดหมู่อื่น</p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">ข่าวประกาศ</th>
                <th className="py-3 px-3 w-36 hidden sm:table-cell">หมวดหมู่</th>
                <th className="py-3 px-3 w-32">สถานะ</th>
                <th className="py-3 px-3 w-40 hidden md:table-cell">ช่วงเวลาเผยแพร่</th>
                <th className="py-3 px-4 text-right pr-4 w-28">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((ann) => {
                const isUrgent = ann.category === 'announcement';
                const isUpdate = ann.category === 'update';
                const isActivity = ann.category === 'activity';

                return (
                  <tr key={ann.id} className="hover:bg-slate-50/80 transition group">
                    
                    {/* Announcement Title & Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        {ann.imageUrl ? (
                          <img
                            src={ann.imageUrl}
                            alt={ann.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                            isUrgent ? 'bg-red-50 text-red-600 border-red-100' :
                            isUpdate ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            <Megaphone className="w-5 h-5 opacity-80" />
                          </div>
                        )}

                        <div className="min-w-0 space-y-0.5">
                          <p className="font-bold text-slate-900 leading-snug truncate max-w-sm sm:max-w-md" title={ann.title}>
                            {ann.title}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 max-w-sm sm:max-w-md">
                            {ann.body}
                          </p>
                          <div className="sm:hidden flex items-center gap-2 pt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isUrgent ? 'bg-red-50 text-red-700 border border-red-200' :
                              isUpdate ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {isUrgent ? 'ประกาศสำคัญ' : isUpdate ? 'อัปเดตบทเรียน' : 'กิจกรรม'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="py-3.5 px-3 hidden sm:table-cell">
                      {isUrgent && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-50 px-2.5 py-1 rounded-full border border-red-200/90">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          <span>ประกาศสำคัญ</span>
                        </span>
                      )}
                      {isUpdate && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/90">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span>อัปเดตบทเรียน</span>
                        </span>
                      )}
                      {isActivity && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/90">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>กิจกรรม/นัดหมาย</span>
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3">
                      {ann.status === 'published' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/90">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>เผยแพร่แล้ว</span>
                        </span>
                      )}
                      {ann.status === 'draft' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/90">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>ฉบับร่าง</span>
                        </span>
                      )}
                      {ann.status === 'archived' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          <span>เก็บถาวร</span>
                        </span>
                      )}
                    </td>

                    {/* Date Range */}
                    <td className="py-3.5 px-3 hidden md:table-cell">
                      <div className="space-y-0.5 text-[11px]">
                        <div className="text-slate-700 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatThaiDate(ann.publishedAt)}</span>
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          ถึง {formatThaiDate(ann.expiresAt)}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewAnnouncement(ann)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="ดูตัวอย่างแบบผู้เรียน"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(ann)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="แก้ไขข่าวประกาศนี้"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(ann.id, ann.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="ลบข่าวประกาศนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ADD / EDIT ANNOUNCEMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingId ? 'แก้ไขข่าวประกาศ' : 'สร้างข่าวประกาศใหม่'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    กรอกข้อมูลเนื้อหาข่าว กำหนดหมวดหมู่ และวันเผยแพร่
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner */}
            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              
              {/* Category Selection Cards */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  หมวดหมู่ข่าวประกาศ *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  
                  <button
                    type="button"
                    onClick={() => setModalCategory('announcement')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      modalCategory === 'announcement'
                        ? 'bg-red-50/80 border-red-300 text-red-950 font-bold ring-2 ring-red-200/50 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                    <div>
                      <div className="text-xs font-bold">ประกาศสำคัญ / ด่วน</div>
                      <div className="text-[10px] text-slate-400 font-normal">แจ้งเตือนเร่งด่วน</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalCategory('update')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      modalCategory === 'update'
                        ? 'bg-blue-50/80 border-blue-300 text-blue-950 font-bold ring-2 ring-blue-200/50 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                    <div>
                      <div className="text-xs font-bold">อัปเดตบทเรียน</div>
                      <div className="text-[10px] text-slate-400 font-normal">เอกสาร / สื่อใหม่</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalCategory('activity')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      modalCategory === 'activity'
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold ring-2 ring-emerald-200/50 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <div>
                      <div className="text-xs font-bold">กิจกรรม / นัดหมาย</div>
                      <div className="text-[10px] text-slate-400 font-normal">กำหนดการและแบบสอบถาม</div>
                    </div>
                  </button>

                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  หัวข้อข่าวประกาศ *
                </label>
                <input
                  type="text"
                  placeholder="เช่น กำหนดการสอบกลางภาค รายวิชานวัตกรรม..."
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                  required
                />
              </div>

              {/* Body */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  รายละเอียดข่าวสาร *
                </label>
                <textarea
                  rows={4}
                  placeholder="กรอกรายละเอียดข่าวประกาศอย่างชัดเจน..."
                  value={modalBody}
                  onChange={(e) => setModalBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                  required
                ></textarea>
              </div>

              {/* Image Upload / URL Field */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <ImageUploadField
                  label="รูปภาพประกอบข่าวประกาศ (ไม่บังคับ)"
                  sublabel="อัปโหลดภาพจากเครื่อง หรือระบุ URL รูปภาพ (จะนำไปแสดงบนการ์ดในมุมมองของผู้เรียน)"
                  currentUrl={modalImageUrl}
                  onImageSelected={(url) => setModalImageUrl(url)}
                />
              </div>

              {/* Status, Publish Date & Expire Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Status */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    สถานะการเผยแพร่
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
                  >
                    <option value="published">● เผยแพร่ทันที (Published)</option>
                    <option value="draft">○ ฉบับร่าง (Draft)</option>
                    <option value="archived">✕ เก็บถาวร (Archived)</option>
                  </select>
                </div>

                {/* Publish Date */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    วันที่เริ่มเผยแพร่
                  </label>
                  <input
                    type="date"
                    value={modalPublishDate}
                    onChange={(e) => setModalPublishDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Expire Date */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    วันสิ้นสุดการแสดง
                  </label>
                  <input
                    type="date"
                    value={modalExpireDate}
                    onChange={(e) => setModalExpireDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs"
                >
                  {editingId ? 'บันทึกการแก้ไข' : 'บันทึกและเผยแพร่'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* PREVIEW MODAL (Exact match of student modal) */}
      {previewAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                ตัวอย่างมุมมองผู้เรียน (Student Preview)
              </span>
              <button
                onClick={() => setPreviewAnnouncement(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewAnnouncement.imageUrl && (
              <div className="w-full h-56 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 relative">
                <img
                  src={previewAnnouncement.imageUrl}
                  alt={previewAnnouncement.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  previewAnnouncement.category === 'announcement'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : previewAnnouncement.category === 'update'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {previewAnnouncement.category === 'announcement' ? 'ประกาศสำคัญ' :
                   previewAnnouncement.category === 'update' ? 'อัปเดตบทเรียน' : 'กิจกรรม'}
                </span>

                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>เผยแพร่เมื่อ: {formatThaiDate(previewAnnouncement.publishedAt)}</span>
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {previewAnnouncement.title}
              </h3>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {previewAnnouncement.body}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>อาจารย์ผู้สอน: {courseInfo.instructor}</span>
                <button
                  type="button"
                  onClick={() => setPreviewAnnouncement(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  ปิดหน้าต่างตัวอย่าง
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
