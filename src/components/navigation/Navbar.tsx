'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/data/store';
import { 
  Bell, BookOpen, User, LogOut, Shield, GraduationCap, ChevronDown, CheckCircle2
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { currentUser, logout } = useAppStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & University Title */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3 group transition">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition">
                <BookOpen className="w-6 h-6 text-amber-400" />
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black text-blue-900 tracking-tight group-hover:text-blue-700 transition">EDTech</span>
                </div>
              </div>
              <div className="sm:hidden flex flex-col">
                <span className="text-lg font-black text-blue-900">EDTech</span>
                <span className="text-[10px] text-slate-500">มทร.อีสาน ขอนแก่น</span>
              </div>
            </Link>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* If Admin, show official button to toggle to Admin Panel */}
            {currentUser.role === 'admin' && (
              <Link
                href="/admin/lessons"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition shadow-xs"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>แผงผู้ดูแลระบบ (Admin)</span>
              </Link>
            )}

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
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 rounded-lg hover:bg-red-50 transition text-left cursor-pointer"
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
