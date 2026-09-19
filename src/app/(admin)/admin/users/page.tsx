'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Search, Filter, Plus, CheckCircle2, Ban, Clock, 
  ChevronLeft, ChevronRight, UserCheck, Shield, Sparkles,
  Building2, User, Mail, Hash, Edit3, Trash2, X, Check,
  ArrowLeft, Download, AlertTriangle, ShieldAlert, Eye, Copy,
  GraduationCap, RefreshCw, Layers
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { UserProfile, UserRole, UserStatus } from '@/types';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function AdminUsersPage() {
  const { usersList, setUsersList } = useAppStore();
  const [users, setUsers] = useState<UserProfile[]>(() => usersList);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'blocked'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State for Add/Edit User
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [modalEditingId, setModalEditingId] = useState<string | null>(null);
  const [modalFullName, setModalFullName] = useState('');
  const [modalDisplayName, setModalDisplayName] = useState('');
  const [modalStudentId, setModalStudentId] = useState('');
  const [modalEmail, setModalEmail] = useState('');
  const [modalRole, setModalRole] = useState<UserRole>('student');
  const [modalStatus, setModalStatus] = useState<UserStatus>('active');

  // Course Information Constants matching the official syllabus
  const courseInfo = {
    code: '30-401-001-204',
    title: 'นวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้',
    instructor: 'ผศ.ดร.เฉลิมพล บุญทศ',
    semester: 'ภาคการศึกษาที่ 1 / ปีการศึกษา 2569',
    curriculum: 'หลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต (ค.อ.บ.)',
    department: 'สาขาวิชาครุศาสตร์อุตสาหกรรมอุตสาหการ คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น',
  };

  // Synchronize when store loads from localStorage on client
  useEffect(() => {
    if (usersList && usersList.length > 0) {
      setUsers(usersList);
    }
  }, [usersList]);

  // Synchronize and persist users to store & localStorage
  const saveAndSyncUsers = (updatedUsers: UserProfile[], successMessage?: string) => {
    setUsers(updatedUsers);
    if (setUsersList) {
      setUsersList(updatedUsers);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('edtech_users_list', JSON.stringify(updatedUsers));
    }
    if (successMessage) {
      setToastMsg(successMessage);
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  // Change Role
  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const target = users.find((u) => u.id === userId);
    const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    saveAndSyncUsers(
      updated,
      `ปรับเปลี่ยนสิทธิ์ของ "${target?.fullName || 'ผู้ใช้'}" เป็น ${newRole === 'admin' ? 'ผู้ดูแลระบบ' : 'นักศึกษา'} เรียบร้อย`
    );
  };

  // Change Status
  const handleStatusChange = (userId: string, newStatus: UserStatus) => {
    const target = users.find((u) => u.id === userId);
    const updated = users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));
    saveAndSyncUsers(
      updated,
      `ปรับสถานะของ "${target?.fullName || 'ผู้ใช้'}" เป็น ${
        newStatus === 'active' ? 'ใช้งานอยู่' : newStatus === 'blocked' ? 'ถูกระงับ' : 'ไม่ได้ใช้งาน'
      } เรียบร้อย`
    );
  };

  // Delete User
  const handleDeleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target && target.email.toLowerCase() === 'bugzonvazan@gmail.com') {
      alert('ไม่สามารถลบบัญชีผู้พัฒนาระบบหลักได้');
      return;
    }
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ "${target?.fullName || ''}"?`)) {
      const updated = users.filter((u) => u.id !== userId);
      saveAndSyncUsers(updated, `ลบผู้ใช้งาน "${target?.fullName || ''}" ออกจากระบบแล้ว`);
    }
  };

  // Open modal to add user
  const handleOpenAddModal = () => {
    setModalEditingId(null);
    setModalFullName('');
    setModalDisplayName('');
    setModalStudentId('');
    setModalEmail('');
    setModalRole('student');
    setModalStatus('active');
    setIsUserModalOpen(true);
  };

  // Open modal to edit user
  const handleOpenEditModal = (user: UserProfile) => {
    setModalEditingId(user.id);
    setModalFullName(user.fullName);
    setModalDisplayName(user.displayName);
    setModalStudentId(user.studentId === '-' ? '' : user.studentId);
    setModalEmail(user.email);
    setModalRole(user.role);
    setModalStatus(user.status);
    setIsUserModalOpen(true);
  };

  // Save Modal User
  const handleSaveModalUser = () => {
    if (!modalFullName.trim() || !modalEmail.trim()) return;

    if (modalEditingId) {
      // Edit existing user
      const updated = users.map((u) =>
        u.id === modalEditingId
          ? {
              ...u,
              fullName: modalFullName.trim(),
              displayName: modalDisplayName.trim() || modalFullName.trim(),
              studentId: modalRole === 'student' ? (modalStudentId.trim() || '-') : '-',
              email: modalEmail.trim().toLowerCase(),
              role: modalRole,
              status: modalStatus,
            }
          : u
      );
      saveAndSyncUsers(updated, `แก้ไขข้อมูลของ "${modalFullName.trim()}" สำเร็จ`);
    } else {
      // Add new user
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        fullName: modalFullName.trim(),
        displayName: modalDisplayName.trim() || modalFullName.trim(),
        studentId: modalRole === 'student' ? (modalStudentId.trim() || '-') : '-',
        email: modalEmail.trim().toLowerCase(),
        role: modalRole,
        status: modalStatus,
        isProfileCompleted: true,
        firstLoginAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        avatarUrl: '',
      };
      saveAndSyncUsers([newUser, ...users], `เพิ่มผู้ใช้งานใหม่ "${newUser.fullName}" สำเร็จเรียบร้อย`);
    }
    setIsUserModalOpen(false);
  };

  // Copy email helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    const total = users.length;
    let students = 0;
    let admins = 0;
    let active = 0;
    let inactive = 0;
    let blocked = 0;

    users.forEach((u) => {
      if (u.role === 'student') students++;
      if (u.role === 'admin') admins++;
      if (u.status === 'active') active++;
      if (u.status === 'inactive') inactive++;
      if (u.status === 'blocked') blocked++;
    });

    return { total, students, admins, active, inactive, blocked, blockedOrInactive: inactive + blocked };
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.studentId && u.studentId.includes(q));

      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

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
            <span>กลับสู่หน้ารวมบทเรียน</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              User Access Management
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono font-bold text-slate-600">
              {courseInfo.code}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>จัดการบัญชีผู้ใช้งาน (User Management)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ค้นหา ตรวจสอบบทบาทสิทธิ์การเข้าถึง และจัดการสถานะผู้เรียนและผู้สอนในระบบ
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มผู้ใช้งานใหม่</span>
          </button>
        </div>
      </div>

      {/* Save / Feedback Toast Alert */}
      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-950">{toastMsg}</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                การเปลี่ยนแปลงถูกบันทึกลงในระบบเรียบร้อยแล้ว
              </p>
            </div>
          </div>
          <button 
            onClick={() => setToastMsg(null)}
            className="p-1 text-emerald-700 hover:text-emerald-900 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Course Hero Banner (Soft Luminous Pastel Theme) */}
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
                <span>{courseInfo.curriculum}</span>
              </span>
              <span className="text-xs sm:text-sm text-slate-600 font-medium">
                • {courseInfo.semester}
              </span>
            </div>
            
            <span className="text-xs font-bold bg-white/95 px-3.5 py-1 rounded-full border border-blue-200/80 text-blue-900 shadow-2xs">
              รหัสวิชา: {courseInfo.code}
            </span>
          </div>

          {/* Course Title */}
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              {courseInfo.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 font-medium">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{courseInfo.department}</span>
            </p>
          </div>

          {/* Bottom Row: Instructor & Live User KPI Highlights */}
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

            {/* Live Highlights */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-blue-200/80 shadow-2xs flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-700">{stats.total} ผู้ใช้งานทั้งหมด</span>
              </div>
              <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-indigo-200/80 shadow-2xs flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold text-slate-700">{stats.students} นักศึกษา</span>
              </div>
              <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-amber-200/80 shadow-2xs flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-semibold text-slate-700">{stats.admins} ผู้ดูแล/อาจารย์</span>
              </div>
              <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-emerald-200/80 shadow-2xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-slate-700">{stats.active} ใช้งานอยู่</span>
              </div>
              {stats.blocked > 0 && (
                <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-red-200/80 shadow-2xs flex items-center gap-1.5">
                  <Ban className="w-3.5 h-3.5 text-red-600" />
                  <span className="font-semibold text-red-700">{stats.blocked} ถูกระงับ</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="ค้นหาด้วย ชื่อ-นามสกุล, รหัสนักศึกษา หรืออีเมล..."
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

        {/* Filters and count */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold hidden sm:inline">บทบาท:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
            >
              <option value="all">ทุกบทบาท ({stats.total})</option>
              <option value="student">นักศึกษา ({stats.students})</option>
              <option value="admin">ผู้ดูแลระบบ ({stats.admins})</option>
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
              <option value="active">● ใช้งานอยู่ ({stats.active})</option>
              <option value="inactive">● ไม่ได้ใช้งาน ({stats.inactive})</option>
              <option value="blocked">● ถูกระงับ ({stats.blocked})</option>
            </select>
          </div>

          <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
            แสดง {filteredUsers.length} รายการ
          </span>

        </div>

      </div>

      {/* USER LIST TABLE (Full-Width, Non-Scrollable) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        {filteredUsers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-slate-700">ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไขการค้นหา</p>
              <p className="text-xs text-slate-400 mt-0.5">ลองปรับคำค้นหาหรือเปลี่ยนตัวกรองบทบาท/สถานะ</p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
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
                <th className="py-3 px-4">ผู้ใช้งาน</th>
                <th className="py-3 px-3 w-36 hidden sm:table-cell">รหัสนักศึกษา</th>
                <th className="py-3 px-3 hidden md:table-cell">อีเมล</th>
                <th className="py-3 px-3 w-32">บทบาท</th>
                <th className="py-3 px-3 w-36">สถานะ</th>
                <th className="py-3 px-3 w-32 hidden lg:table-cell">เข้าใช้งานล่าสุด</th>
                <th className="py-3 px-4 text-right pr-4 w-24">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition group">
                  
                  {/* User Profile Info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        src={user.avatarUrl}
                        name={user.fullName || user.displayName}
                        email={user.email}
                        size="sm"
                        rounded="rounded-xl"
                        showGoogleBadge={true}
                        className="w-9 h-9 border border-slate-200 shadow-2xs shrink-0"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-bold text-slate-900 leading-snug truncate max-w-[180px] sm:max-w-xs" title={user.fullName}>
                          {user.fullName}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="truncate max-w-[120px]">{user.displayName}</span>
                          <span className="sm:hidden font-mono text-slate-400">
                            • {user.studentId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Student ID */}
                  <td className="py-3 px-3 hidden sm:table-cell">
                    <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/80">
                      {user.studentId || '-'}
                    </span>
                  </td>

                  {/* Email with copy */}
                  <td className="py-3 px-3 hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-600 text-[11px] truncate max-w-[170px]" title={user.email}>
                        {user.email}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(user.email, user.id)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded transition cursor-pointer"
                        title="คัดลอกอีเมล"
                      >
                        {copiedId === user.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Role Dropdown */}
                  <td className="py-3 px-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition cursor-pointer ${
                        user.role === 'admin'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      <option value="student">นักศึกษา</option>
                      <option value="admin">ผู้ดูแลระบบ</option>
                    </select>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-3">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value as UserStatus)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition cursor-pointer ${
                        user.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : user.status === 'blocked'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="active">● ใช้งานอยู่</option>
                      <option value="inactive">● ไม่ได้ใช้งาน</option>
                      <option value="blocked">● ถูกระงับ</option>
                    </select>
                  </td>

                  {/* Last Login Date */}
                  <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap hidden lg:table-cell">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: '2-digit',
                        })
                      : '-'}
                  </td>

                  {/* Action Buttons: Edit & Delete */}
                  <td className="py-3 px-4 text-right pr-4 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(user)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                        title="แก้ไขข้อมูลผู้ใช้"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                        title="ลบผู้ใช้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ADD / EDIT USER MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {modalEditingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {modalEditingId ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    กำหนดข้อมูลประจำตัว สิทธิ์บทบาท และสถานะการเข้าใช้งาน
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อ - นามสกุล *
                </label>
                <input
                  type="text"
                  placeholder="เช่น นายกิตติศักดิ์ พลอยแสง"
                  value={modalFullName}
                  onChange={(e) => setModalFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium"
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อที่ใช้แสดงผล (Display Name)
                </label>
                <input
                  type="text"
                  placeholder="เช่น กิตติศักดิ์ (เว้นว่างไว้จะใช้ชื่อจริง)"
                  value={modalDisplayName}
                  onChange={(e) => setModalDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Student ID & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    รหัสนักศึกษา
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 6730401008-8"
                    disabled={modalRole === 'admin'}
                    value={modalStudentId}
                    onChange={(e) => setModalStudentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white disabled:bg-slate-100 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    อีเมลประจำตัว *
                  </label>
                  <input
                    type="email"
                    placeholder="name@rmuti.ac.th"
                    value={modalEmail}
                    onChange={(e) => setModalEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    บทบาทในระบบ
                  </label>
                  <select
                    value={modalRole}
                    onChange={(e) => setModalRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="student">นักศึกษา (Student)</option>
                    <option value="admin">ผู้ดูแลระบบ (Admin / Teacher)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    สถานะการใช้งาน
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as UserStatus)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="active">● ใช้งานอยู่ (Active)</option>
                    <option value="inactive">● ไม่ได้ใช้งาน (Inactive)</option>
                    <option value="blocked">● ถูกระงับ (Blocked)</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveModalUser}
                disabled={!modalFullName.trim() || !modalEmail.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                {modalEditingId ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้งาน'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
