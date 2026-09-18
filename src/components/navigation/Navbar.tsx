'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/data/store';
import { 
  Search, Bell, BookOpen, User, LogOut, Shield, GraduationCap, ChevronDown, CheckCircle2
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { currentUser, switchRole } = useAppStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & University Title */}
          <div className="flex items-center gap-3">
            <Link href={currentUser.role === 'admin' ? '/admin/lessons' : '/dashboard'} className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white font-bold shadow-md">
                <BookOpen className="w-6 h-6 text-amber-400" />
              </div>
              <div className="hidden sm:block">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-blue-900 tracking-tight">EDTech</span>
                  <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Learn • Create • Grow
                  </span>
                </div>
              </div>
              <div className="sm:hidden flex flex-col">
                <span className="text-lg font-black text-blue-900">EDTech</span>
                <span className="text-[9px] text-slate-500">มทร.อีสาน ขอนแก่น</span>
              </div>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xs mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="ค้นหาข้อมูล, บทเรียน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Role Quick-Switch Button (สำหรับ Pair Programming & Demo) */}
            <button
              onClick={() => {
                const nextRole = currentUser.role === 'admin' ? 'student' : 'admin';
                switchRole(nextRole);
                if (nextRole === 'admin') {
                  router.push('/admin/lessons');
                } else {
                  router.push('/dashboard');
                }
              }}
              title="กดเพื่อสลับ Role ระหว่าง Student และ Admin เพื่อทดสอบ"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all shadow-xs cursor-pointer bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              {currentUser.role === 'admin' ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>โหมด: แอดมิน (คลิกสลับเป็น นศ.)</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>โหมด: นักศึกษา (คลิกสลับเป็น แอดมิน)</span>
                </>
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full sm:rounded-xl hover:bg-slate-50 transition border border-transparent sm:border-slate-200"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold border border-blue-200 overflow-hidden">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">{currentUser.fullName || currentUser.displayName}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      currentUser.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'นักศึกษา'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {currentUser.role === 'admin' ? currentUser.email : `รหัสนักศึกษา ${currentUser.studentId || '-'}`}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                    <p className="text-xs font-bold text-slate-800">{currentUser.fullName}</p>
                    <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      currentUser.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'นักศึกษา'}
                    </span>
                  </div>

                  <div className="px-2 py-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      ข้อมูลส่วนตัวของฉัน (Profile)
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      พื้นที่การเรียนรู้ (Student)
                    </Link>

                    {currentUser.role === 'admin' && (
                      <Link
                        href="/admin/lessons"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-amber-50 hover:text-amber-800 transition"
                      >
                        <Shield className="w-4 h-4 text-amber-500" />
                        ระบบหลังบ้าน (Admin CMS)
                      </Link>
                    )}

                    <Link
                      href="/my-progress"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      <CheckCircle2 className="w-4 h-4 text-slate-400" />
                      ความก้าวหน้าของฉัน
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                    <button
                      onClick={() => {
                        const nextRole = currentUser.role === 'admin' ? 'student' : 'admin';
                        switchRole(nextRole);
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-700 rounded-lg hover:bg-amber-50 transition text-left"
                    >
                      <Shield className="w-4 h-4 text-amber-500" />
                      สลับเป็น {currentUser.role === 'admin' ? 'นักศึกษา' : 'ผู้ดูแลระบบ (Admin)'}
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 rounded-lg hover:bg-red-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
