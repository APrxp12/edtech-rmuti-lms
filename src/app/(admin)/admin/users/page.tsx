'use client';

import React, { useState } from 'react';
import { 
  Users, Search, Filter, Plus, CheckCircle2, Ban, Clock, 
  ChevronLeft, ChevronRight, UserCheck
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { UserRole, UserStatus } from '@/types';

export default function AdminUsersPage() {
  const { usersList } = useAppStore();
  const [users, setUsers] = useState(usersList);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const handleStatusChange = (userId: string, newStatus: UserStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
  };

  const filtered = users.filter((u) => {
    const matchQ = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   u.studentId.includes(searchQuery);
    const matchR = roleFilter === 'all' || u.role === roleFilter;
    return matchQ && matchR;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header matching Page 19 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            จัดการผู้ใช้งาน
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ค้นหา จัดการสิทธิ์ และสถานะของผู้ใช้งานในระบบ EDTech
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400">จำนวนผู้ใช้ทั้งหมด</div>
              <div className="text-xs sm:text-sm font-black text-slate-800">1,284 คน</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="ค้นหาด้วย ชื่อ - นามสกุล, รหัสนักศึกษา หรืออีเมล..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">ทุกบทบาท</option>
            <option value="student">นักศึกษา</option>
            <option value="admin">ผู้ดูแลระบบ</option>
          </select>
        </div>
      </div>

      {/* User Table matching Page 19 */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">ชื่อ - นามสกุล</th>
                <th className="py-3.5 px-4">รหัสนักศึกษา</th>
                <th className="py-3.5 px-4">อีเมล</th>
                <th className="py-3.5 px-4">บทบาท</th>
                <th className="py-3.5 px-4">สถานะ</th>
                <th className="py-3.5 px-4">เข้าใช้งานล่าสุด</th>
                <th className="py-3.5 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{user.fullName}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{user.studentId}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{user.email}</td>

                  {/* Role Dropdown */}
                  <td className="py-3.5 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      className={`text-[11px] font-bold p-1 rounded-lg border ${
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
                  <td className="py-3.5 px-4">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value as UserStatus)}
                      className={`text-[11px] font-bold p-1 rounded-lg border ${
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

                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {new Date(user.lastLoginAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => alert(`บันทึกข้อมูล ${user.fullName} เรียบร้อยแล้ว`)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      บันทึก
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
