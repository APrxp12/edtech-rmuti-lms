'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, ShieldCheck, ShieldAlert, Plus, Trash2, Edit3, CheckCircle2, 
  AlertTriangle, RotateCcw, ArrowLeft, Search, X, Check, 
  Globe, Mail, GraduationCap, Lock, HelpCircle, Info, Save, RefreshCw
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { AccessRule, UserRole } from '@/types';
import { initialAccessRules } from '@/data/mock-data';
import { dbSaveAllAccessRules, dbDeleteAccessRule } from '@/lib/dbService';

export default function AdminAccessRulesPage() {
  const { accessRules, setAccessRules, isSupabaseLive } = useAppStore();
  const [rules, setRules] = useState<AccessRule[]>(() => accessRules);
  const [isSaving, setIsSaving] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'domain' | 'email'>('all');
  const [decisionFilter, setDecisionFilter] = useState<'all' | 'allow' | 'deny'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State for Add / Edit Rule
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'domain' | 'email'>('domain');
  const [modalValue, setModalValue] = useState('');
  const [modalDecision, setModalDecision] = useState<'allow' | 'deny'>('allow');
  const [modalDefaultRole, setModalDefaultRole] = useState<UserRole>('student');
  const [modalIsActive, setModalIsActive] = useState<boolean>(true);
  const [modalNote, setModalNote] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // อัปเดตรายการกฎเมื่อโหลดข้อมูลจาก Cloud หรือ Store สำเร็จ
  useEffect(() => {
    if (accessRules) {
      setRules(accessRules);
    }
  }, [accessRules]);

  // ซิงค์และบันทึกกฎไปยัง Store, LocalStorage และ Supabase Cloud DB
  const saveAndSyncRules = (updated: AccessRule[], message?: string) => {
    setRules(updated);
    setAccessRules(updated);
    try {
      localStorage.setItem('edtech_access_rules', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving access rules to localStorage:', e);
    }

    if (isSupabaseLive) {
      dbSaveAllAccessRules(updated).catch((err) => {
        console.warn('[Supabase] Auto-sync access_rules failed:', err);
      });
    }

    if (message) {
      setToastMsg(message);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  // ปุ่มบันทึกข้อมูลหลัก (Manual Save Button ตามที่ผู้ใช้ระบุ)
  const handleManualSave = async () => {
    setIsSaving(true);
    try {
      setAccessRules(rules);
      try {
        localStorage.setItem('edtech_access_rules', JSON.stringify(rules));
      } catch (e) {}

      if (isSupabaseLive) {
        const ok = await dbSaveAllAccessRules(rules);
        if (ok) {
          setToastMsg('บันทึกการตั้งค่าสิทธิ์การเข้าใช้งานลงฐานข้อมูล Cloud สำเร็จแล้ว');
        } else {
          setToastMsg('บันทึกลงหน่วยความจำเรียบร้อยแล้ว');
        }
      } else {
        setToastMsg('บันทึกข้อมูลลงในระบบเรียบร้อยแล้ว');
      }
    } catch (err) {
      console.error('Error saving access rules:', err);
      setToastMsg('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  // Open Add Rule Modal
  const handleOpenAddModal = () => {
    setEditingId(null);
    setModalType('domain');
    setModalValue('');
    setModalDecision('allow');
    setModalDefaultRole('student');
    setModalIsActive(true);
    setModalNote('');
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Edit Rule Modal
  const handleOpenEditModal = (rule: AccessRule) => {
    setEditingId(rule.id);
    setModalType(rule.type);
    setModalValue(rule.value);
    setModalDecision(rule.decision);
    setModalDefaultRole(rule.defaultRole);
    setModalIsActive(rule.isActive);
    setModalNote(rule.note || '');
    setModalError(null);
    setIsModalOpen(true);
  };

  // Handle Save in Modal (Add / Edit)
  const handleSaveModalRule = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVal = modalValue.trim().toLowerCase();
    if (!cleanVal) {
      setModalError('กรุณากรอกชื่อโดเมนหรือที่อยู่อีเมล');
      return;
    }

    // Format validation
    if (modalType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanVal)) {
      setModalError('รูปแบบที่อยู่อีเมลไม่ถูกต้อง (เช่น student@rmuti.ac.th)');
      return;
    }
    if (modalType === 'domain' && (cleanVal.includes('@') || !cleanVal.includes('.'))) {
      setModalError('รูปแบบโดเมนไม่ถูกต้อง ไม่ต้องใส่เครื่องหมาย @ (เช่น rmuti.ac.th)');
      return;
    }

    // Duplicate check (exclude currently edited rule)
    const isDup = rules.some(
      (r) => r.id !== editingId && r.type === modalType && r.value.toLowerCase() === cleanVal
    );
    if (isDup) {
      setModalError(`พบข้อมูลซ้ำ: กฎสำหรับ "${cleanVal}" มีอยู่ในระบบแล้ว`);
      return;
    }

    setModalError(null);

    if (editingId) {
      // Update existing
      const updated = rules.map((r) =>
        r.id === editingId
          ? {
              ...r,
              type: modalType,
              value: cleanVal,
              decision: modalDecision,
              defaultRole: modalDefaultRole,
              isActive: modalIsActive,
              note: modalNote.trim() || (modalType === 'domain' ? 'โดเมนที่กำหนด' : 'บัญชีเฉพาะบุคคล'),
              updatedAt: new Date().toISOString(),
            }
          : r
      );
      saveAndSyncRules(updated, `แก้ไขกฎสำหรับ "${cleanVal}" สำเร็จ`);
    } else {
      // Add new rule
      const newRule: AccessRule = {
        id: `ar-${Date.now()}`,
        type: modalType,
        value: cleanVal,
        decision: modalDecision,
        defaultRole: modalDefaultRole,
        isActive: modalIsActive,
        note: modalNote.trim() || (modalType === 'domain' ? 'โดเมนที่กำหนด' : 'บัญชีเฉพาะบุคคล'),
        updatedAt: new Date().toISOString(),
      };
      saveAndSyncRules([newRule, ...rules], `เพิ่มกฎสิทธิ์ใหม่สำหรับ "${cleanVal}" สำเร็จเรียบร้อย`);
    }

    setIsModalOpen(false);
  };

  // Toggle rule Active / Inactive
  const handleToggleActive = (id: string) => {
    const target = rules.find((r) => r.id === id);
    if (!target) return;
    const nextState = !target.isActive;
    const updated = rules.map((r) =>
      r.id === id ? { ...r, isActive: nextState, updatedAt: new Date().toISOString() } : r
    );
    saveAndSyncRules(
      updated,
      `${nextState ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} กฎสำหรับ "${target.value}" แล้ว`
    );
  };

  // Delete Rule
  const handleDeleteRule = (id: string, val: string) => {
    if (confirm(`คุณต้องการลบกฎสิทธิ์สำหรับ "${val}" ใช่หรือไม่?`)) {
      const updated = rules.filter((r) => r.id !== id);
      saveAndSyncRules(updated, `ลบกฎสิทธิ์สำหรับ "${val}" เรียบร้อยแล้ว`);
    }
  };

  // Reset to default rules
  const handleResetDefaults = () => {
    if (confirm('คุณต้องการล้างกฎสิทธิ์การเข้าถึงทั้งหมด (ให้เป็นค่าว่าง) ใช่หรือไม่?')) {
      saveAndSyncRules([], 'ล้างกฎสิทธิ์การเข้าถึงทั้งหมดเรียบร้อยแล้ว');
    }
  };

  // Dynamic Live KPI Statistics
  const stats = useMemo(() => {
    const total = rules.length;
    let domains = 0;
    let emails = 0;
    let allows = 0;
    let denies = 0;
    let active = 0;

    rules.forEach((r) => {
      if (r.type === 'domain') domains++;
      if (r.type === 'email') emails++;
      if (r.decision === 'allow') allows++;
      if (r.decision === 'deny') denies++;
      if (r.isActive) active++;
    });

    return { total, domains, emails, allows, denies, active };
  }, [rules]);

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.value.toLowerCase().includes(q) ||
        (r.note && r.note.toLowerCase().includes(q));

      const matchType = typeFilter === 'all' || r.type === typeFilter;
      const matchDecision = decisionFilter === 'all' || r.decision === decisionFilter;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && r.isActive) ||
        (statusFilter === 'inactive' && !r.isActive);

      return matchSearch && matchType && matchDecision && matchStatus;
    });
  }, [rules, searchQuery, typeFilter, decisionFilter, statusFilter]);

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
              Access Control & Security
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">
              ระบบส่วนกลาง (Global System)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>กำหนดสิทธิ์การเข้าใช้งาน (Access Rules)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            จัดการนโยบายการอนุญาต/ระงับการเข้าสู่ระบบตามโดเมนหรืออีเมล พร้อมกำหนดสิทธิ์บทบาทเริ่มต้น
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Database Status Indicator */}
          {isSupabaseLive ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>ฐานข้อมูล Cloud (Live)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>หน่วยความจำเครื่อง</span>
            </div>
          )}


          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มกฎสิทธิ์ใหม่</span>
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

      {/* COURSE HERO BANNER & LIVE KPI STATS (Soft Luminous Pastel Theme) */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-sky-50/60 p-6 sm:p-7 shadow-xs">
        {/* Ambient Pastel Background Orbs */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-indigo-200/25 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          
          {/* Security Tag Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-900 bg-white/90 px-3 py-1 rounded-xl shadow-2xs border border-blue-100 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>นโยบายความปลอดภัยและการควบคุมสิทธิ์การเข้าถึงระบบ</span>
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              ระบบตรวจสอบสิทธิ์ Google OAuth และอีเมลอัตโนมัติ
            </span>
          </div>

          {/* Dynamic KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
            
            {/* Total Rules */}
            <div className="bg-white/85 backdrop-blur-xs rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">กฎทั้งหมด</span>
                <Shield className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">{stats.total}</div>
              <span className="text-[10px] text-slate-400">เงื่อนไขในระบบ</span>
            </div>

            {/* Domains */}
            <div className="bg-sky-50/70 rounded-2xl p-3.5 border border-sky-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-sky-700">โดเมน (Domain)</span>
                <Globe className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <div className="text-xl font-bold text-sky-950 mt-1">{stats.domains}</div>
              <span className="text-[10px] text-sky-600/80">กฎระดับโดเมน</span>
            </div>

            {/* Emails */}
            <div className="bg-purple-50/70 rounded-2xl p-3.5 border border-purple-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-purple-700">อีเมล (Email)</span>
                <Mail className="w-3.5 h-3.5 text-purple-500" />
              </div>
              <div className="text-xl font-bold text-purple-950 mt-1">{stats.emails}</div>
              <span className="text-[10px] text-purple-600/80">บัญชีเฉพาะบุคคล</span>
            </div>

            {/* Allowed */}
            <div className="bg-emerald-50/70 rounded-2xl p-3.5 border border-emerald-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-700">อนุญาต (Allow)</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-xl font-bold text-emerald-950 mt-1">{stats.allows}</div>
              <span className="text-[10px] text-emerald-600/80">เข้าใช้งานได้</span>
            </div>

            {/* Denied */}
            <div className="bg-rose-50/70 rounded-2xl p-3.5 border border-rose-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-rose-700">ปฏิเสธ (Deny)</span>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="text-xl font-bold text-rose-950 mt-1">{stats.denies}</div>
              <span className="text-[10px] text-rose-600/80">ระงับการเข้าถึง</span>
            </div>

            {/* Active */}
            <div className="bg-blue-50/70 rounded-2xl p-3.5 border border-blue-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-blue-700">เปิดใช้งาน (Active)</span>
                <Lock className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-xl font-bold text-blue-950 mt-1">{stats.active}</div>
              <span className="text-[10px] text-blue-600/80">มีผลบังคับใช้</span>
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
            placeholder="ค้นหากฎด้วย โดเมน, อีเมล หรือหมายเหตุ..."
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
          
          {/* Type Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold hidden sm:inline">ประเภท:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
            >
              <option value="all">ทุกประเภท ({stats.total})</option>
              <option value="domain">เฉพาะโดเมน ({stats.domains})</option>
              <option value="email">เฉพาะอีเมล ({stats.emails})</option>
            </select>
          </div>

          {/* Decision Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold hidden sm:inline">ผลการตัดสิน:</span>
            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value as any)}
              className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
            >
              <option value="all">ทุกการตัดสิน ({stats.total})</option>
              <option value="allow">✓ อนุญาต ({stats.allows})</option>
              <option value="deny">✕ ปฏิเสธ ({stats.denies})</option>
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
              <option value="active">● เปิดใช้งาน ({stats.active})</option>
              <option value="inactive">○ ปิดใช้งาน ({stats.total - stats.active})</option>
            </select>
          </div>

          <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
            แสดง {filteredRules.length} รายการ
          </span>

        </div>

      </div>

      {/* ACCESS RULES TABLE (Full-Width, Non-Scrollable) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        {filteredRules.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Shield className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-slate-700">ไม่พบกฎสิทธิ์ที่ตรงกับเงื่อนไขการค้นหา</p>
              <p className="text-xs text-slate-400 mt-0.5">ลองปรับคำค้นหาหรือเปลี่ยนตัวกรองประเภท/สถานะ</p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setDecisionFilter('all');
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
                <th className="py-3 px-4 w-28">ประเภท</th>
                <th className="py-3 px-3">เป้าหมาย (โดเมน / อีเมล)</th>
                <th className="py-3 px-3 w-32">ผลการตัดสิน</th>
                <th className="py-3 px-3 w-32 hidden sm:table-cell">บทบาทเริ่มต้น</th>
                <th className="py-3 px-3 w-32">สถานะ</th>
                <th className="py-3 px-3 hidden lg:table-cell">หมายเหตุ</th>
                <th className="py-3 px-4 text-right pr-4 w-24">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/80 transition group">
                  
                  {/* Type Badge */}
                  <td className="py-3.5 px-4">
                    {rule.type === 'domain' ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200/80">
                        <Globe className="w-3 h-3 text-sky-600 shrink-0" />
                        <span>โดเมน</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200/80">
                        <Mail className="w-3 h-3 text-purple-600 shrink-0" />
                        <span>อีเมล</span>
                      </span>
                    )}
                  </td>

                  {/* Target Value */}
                  <td className="py-3.5 px-3">
                    <div className="space-y-0.5">
                      <div className="font-mono text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>{rule.value}</span>
                        {rule.type === 'domain' && (
                          <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                            (*@{rule.value})
                          </span>
                        )}
                      </div>
                      <div className="lg:hidden text-[11px] text-slate-500 truncate max-w-xs">
                        {rule.note}
                      </div>
                    </div>
                  </td>

                  {/* Decision Badge */}
                  <td className="py-3.5 px-3">
                    {rule.decision === 'allow' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/90">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>อนุญาต (Allow)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/90">
                        <X className="w-3 h-3 text-rose-600" />
                        <span>ปฏิเสธ (Deny)</span>
                      </span>
                    )}
                  </td>

                  {/* Default Role */}
                  <td className="py-3.5 px-3 hidden sm:table-cell">
                    {rule.defaultRole === 'admin' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/90">
                        <Shield className="w-3 h-3 text-amber-600" />
                        <span>ผู้ดูแลระบบ</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/90">
                        <GraduationCap className="w-3 h-3 text-blue-600" />
                        <span>นักศึกษา</span>
                      </span>
                    )}
                  </td>

                  {/* Interactive Status Toggle */}
                  <td className="py-3.5 px-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(rule.id)}
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border transition cursor-pointer ${
                        rule.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                      title="คลิกเพื่อเปิด/ปิดใช้งานกฎนี้"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${rule.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      <span>{rule.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span>
                    </button>
                  </td>

                  {/* Note */}
                  <td className="py-3.5 px-3 hidden lg:table-cell">
                    <span className="text-slate-600 text-[11px] truncate max-w-[220px] block" title={rule.note}>
                      {rule.note || '-'}
                    </span>
                  </td>

                  {/* Actions (Edit / Delete) */}
                  <td className="py-3.5 px-4 text-right pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(rule)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="แก้ไขกฎนี้"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id, rule.value)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="ลบกฎนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* SECURITY PRECEDENCE GUIDE CARD */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-3xl p-5 sm:p-6 border border-slate-200/80 space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
          <Info className="w-4 h-4 text-blue-600" />
          <span>ลำดับความสำคัญในการตรวจสอบสิทธิ์การเข้าใช้งาน (Access Precedence Hierarchy)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/80 p-3 rounded-2xl border border-slate-200/70 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-purple-700">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-[10px]">1</span>
              <span>Email Whitelist</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              มีความสำคัญสูงสุด หากอีเมลตรงกับใน Whitelist จะอนุญาตและกำหนดบทบาทตามที่ระบุทันที
            </p>
          </div>

          <div className="bg-white/80 p-3 rounded-2xl border border-slate-200/70 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-700">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center text-[10px]">2</span>
              <span>Blocked Emails</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              อีเมลที่ถูกระงับการใช้งาน จะถูกปฏิเสธทันทีไม่ว่าจะอยู่ในโดเมนใดก็ตาม
            </p>
          </div>

          <div className="bg-white/80 p-3 rounded-2xl border border-slate-200/70 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-sky-700">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center text-[10px]">3</span>
              <span>Allowed Domains</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              โดเมนสถาบัน (@rmuti.ac.th) เข้าสู่ระบบอัตโนมัติด้วยบทบาทนักศึกษา
            </p>
          </div>

          <div className="bg-white/80 p-3 rounded-2xl border border-slate-200/70 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-[10px]">4</span>
              <span>Default Deny</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              อีเมลส่วนตัวทั่วไปที่ไม่ผ่านเงื่อนไขด้านบน จะถูกปฏิเสธเพื่อความปลอดภัย
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleResetDefaults}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          title="ล้างกฎทั้งหมด"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>ล้างค่าทั้งหมด</span>
        </button>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleManualSave}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-200 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
          title="บันทึกการเปลี่ยนแปลงทั้งหมดลงฐานข้อมูล"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</span>
        </button>
      </div>

      {/* ADD / EDIT RULE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden p-6 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingId ? 'แก้ไขกฎสิทธิ์การเข้าถึง (Edit Rule)' : 'เพิ่มกฎสิทธิ์ใหม่ (Add Rule)'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    กำหนดขอบเขตการอนุญาตหรือปฏิเสธบัญชีผู้ใช้งาน
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

            {/* Modal Error Banner */}
            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveModalRule} className="space-y-4 text-xs">
              
              {/* Type Switch (Domain vs Email) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  ประเภทของกฎ (Rule Type) *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setModalType('domain')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      modalType === 'domain'
                        ? 'bg-sky-50/80 border-sky-300 text-sky-900 shadow-2xs font-bold ring-2 ring-sky-200/50'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Globe className={`w-4 h-4 ${modalType === 'domain' ? 'text-sky-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-bold">Domain (ทั้งโดเมน)</div>
                      <div className="text-[10px] text-slate-400 font-normal">เช่น rmuti.ac.th</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalType('email')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      modalType === 'email'
                        ? 'bg-purple-50/80 border-purple-300 text-purple-900 shadow-2xs font-bold ring-2 ring-purple-200/50'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Mail className={`w-4 h-4 ${modalType === 'email' ? 'text-purple-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-bold">Email (เฉพาะบุคคล)</div>
                      <div className="text-[10px] text-slate-400 font-normal">เช่น teacher@gmail.com</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Target Value Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {modalType === 'domain' ? 'ชื่อโดเมนที่ต้องการกำหนด *' : 'ที่อยู่อีเมลที่ต้องการกำหนด *'}
                </label>
                <input
                  type="text"
                  placeholder={modalType === 'domain' ? 'เช่น rmuti.ac.th หรือ kkc.rmuti.ac.th' : 'เช่น student@rmuti.ac.th หรือ teacher@gmail.com'}
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {modalType === 'domain'
                    ? 'กรอกเฉพาะชื่อโดเมนโดยไม่ต้องระบุเครื่องหมาย @ ระบบจะอนุญาต/ปฏิเสธผู้ใช้ทุกคนที่มีอีเมลลงท้ายด้วยโดเมนนี้'
                    : 'กรอกอีเมลฉบับเต็มของบัญชีผู้ใช้ที่ต้องการกำหนดสิทธิ์เฉพาะบุคคล'}
                </p>
              </div>

              {/* Decision & Default Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Decision */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ผลการตัดสิน (Decision) *
                  </label>
                  <select
                    value={modalDecision}
                    onChange={(e) => setModalDecision(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
                  >
                    <option value="allow">✓ อนุญาตให้เข้าใช้งาน (Allow)</option>
                    <option value="deny">✕ ปฏิเสธการเข้าถึง (Deny)</option>
                  </select>
                </div>

                {/* Default Role */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    บทบาทเริ่มต้น (Default Role)
                  </label>
                  <select
                    value={modalDefaultRole}
                    onChange={(e) => setModalDefaultRole(e.target.value as any)}
                    disabled={modalDecision === 'deny'}
                    className="w-full px-3 py-2 bg-white disabled:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
                  >
                    <option value="student">นักศึกษา (Student)</option>
                    <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                  </select>
                </div>

              </div>

              {/* Status Toggle & Note */}
              <div className="space-y-3">
                
                {/* Status */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <div className="font-bold text-slate-800">สถานะการทำงานของกฎ</div>
                    <div className="text-[10px] text-slate-500">หากปิดใช้งาน กฎนี้จะไม่ถูกนำไปตรวจสอบขณะล็อกอิน</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalIsActive(!modalIsActive)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      modalIsActive
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    {modalIsActive ? 'เปิดใช้งาน (Active)' : 'ปิดใช้งาน (Inactive)'}
                  </button>
                </div>

                {/* Note */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    หมายเหตุหรือวัตถุประสงค์
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น บัญชีอาจารย์พิเศษ, โครงการความร่วมมือ หรือโดเมนสาธารณะที่ระงับ"
                    value={modalNote}
                    onChange={(e) => setModalNote(e.target.value)}
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
                  disabled={!modalValue.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs"
                >
                  {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มกฎสิทธิ์'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
