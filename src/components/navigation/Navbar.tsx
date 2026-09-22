'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/data/store';
import { 
  Bell, BookOpen, User, LogOut, Shield, GraduationCap, ChevronDown, CheckCircle2, Megaphone, HelpCircle
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Navbar() {
  const router = useRouter();
  const { currentUser, logout } = useAppStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Course Badge */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href="/dashboard" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition shrink-0">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-base leading-tight truncate">
                    ระบบการสอนออนไลน์
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 shrink-0">
                    EDTech
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[150px] xs:max-w-[220px] sm:max-w-none">
                  <span className="xs:hidden">มทร.อีสาน ขอนแก่น</span>
                  <span className="hidden xs:inline sm:hidden">มทร.อีสาน วิทยาเขตขอนแก่น</span>
                  <span className="hidden sm:inline">มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน</span>
                </span>
              </div>
            </Link>

            {/* Quick Mode Switcher Indicator for Admin */}
            {currentUser.role === 'admin' && (
              <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-slate-200 dark:border-slate-800">
                <Link
                  href="/admin/lessons"
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/20 dark:border-amber-500/30 flex items-center gap-1.5 hover:bg-amber-500/20 transition"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>โหมดผู้ดูแลระบบ (Admin)</span>
                </Link>
              </div>
            )}
          </div>

          {/* Right Header Navigation Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Quick Link to Announcements (Dedicated Page) */}
            <Link
              href="/announcements"
              className="hidden sm:flex p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700 items-center gap-1.5 text-xs font-medium"
              title="ดูประกาศและข่าวสารทั้งหมด"
            >
              <Megaphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden md:inline">ข่าวประกาศ</span>
            </Link>

            {/* Quick Link to FAQ (Dedicated Page) */}
            <Link
              href="/faq"
              className="hidden sm:flex p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700 items-center gap-1.5 text-xs font-medium"
              title="คำถามที่พบบ่อย (FAQ)"
            >
              <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">คำถามที่พบบ่อย</span>
            </Link>

            {/* Notifications Alert Bell */}
            <div className="relative">
              <Link
                href="/announcements"
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition relative block border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                title="ข่าวประกาศและแจ้งเตือน"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>
            </div>

            {/* Dark / Light Mode Toggle Button */}
            <ThemeToggle />

            {/* User Profile Dropdown or Login Button */}
            {!currentUser?.email ? (
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ</span>
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full sm:rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition border border-transparent sm:border-slate-200 dark:sm:border-slate-700 cursor-pointer"
                >
                <UserAvatar
                  src={currentUser.avatarUrl}
                  name={currentUser.fullName || currentUser.displayName}
                  email={currentUser.email}
                  size="sm"
                  rounded="rounded-full sm:rounded-xl"
                  showGoogleBadge={true}
                  className="w-8 h-8 sm:w-9 sm:h-9 border border-blue-200 dark:border-blue-800 shrink-0"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {currentUser.fullName || currentUser.displayName || 'ยังไม่ระบุชื่อ'}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      currentUser.role === 'admin' 
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' 
                        : 'bg-green-100 dark:bg-emerald-950/60 text-green-800 dark:text-emerald-300'
                    }`}>
                      {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'นักศึกษา'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {currentUser.role === 'admin'
                      ? currentUser.email
                      : (currentUser.studentId && currentUser.studentId !== '-' && currentUser.studentId !== '65123456789'
                          ? `รหัสนักศึกษา ${currentUser.studentId}`
                          : 'ยังไม่ระบุรหัสนักศึกษา')}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#111827] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                    <UserAvatar
                      src={currentUser.avatarUrl}
                      name={currentUser.fullName || currentUser.displayName}
                      email={currentUser.email}
                      size="sm"
                      rounded="rounded-xl"
                      showGoogleBadge={true}
                      className="w-9 h-9 border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {currentUser.fullName || currentUser.displayName || 'ยังไม่ระบุชื่อ'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                      <span className={`inline-block mt-0.5 text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                        currentUser.role === 'admin' 
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' 
                          : 'bg-green-100 dark:bg-emerald-950/60 text-green-800 dark:text-emerald-300'
                      }`}>
                        {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'นักศึกษา'}
                      </span>
                    </div>
                  </div>

                  <div className="px-2 py-1">
                    {currentUser.role === 'student' && (
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          window.dispatchEvent(new CustomEvent('edtech_open_profile_modal'));
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 transition cursor-pointer"
                      >
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>แก้ไขชื่อ / รหัสนักศึกษา</span>
                      </button>
                    )}

                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 transition"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      ข้อมูลส่วนตัวของฉัน (Profile)
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 transition"
                    >
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      พื้นที่การเรียนรู้ (Dashboard)
                    </Link>

                    <Link
                      href="/my-lessons"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 transition"
                    >
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      บทเรียนของฉัน (My Lessons)
                    </Link>

                    {currentUser.role === 'admin' && (
                      <Link
                        href="/admin/lessons"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-800 dark:hover:text-amber-400 transition"
                      >
                        <Shield className="w-4 h-4 text-amber-500" />
                        ระบบหลังบ้าน (Admin CMS)
                      </Link>
                    )}

                    <Link
                      href="/my-progress"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 transition"
                    >
                      <CheckCircle2 className="w-4 h-4 text-slate-400" />
                      ความก้าวหน้าของฉัน
                    </Link>

                    <Link
                      href="/announcements"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 transition"
                    >
                      <Megaphone className="w-4 h-4 text-slate-400" />
                      ข่าวประกาศ (Announcements)
                    </Link>

                    <Link
                      href="/faq"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 transition"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      ศูนย์ช่วยเหลือ (FAQ)
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1 px-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          </div>
        </div>
      </div>
    </header>
  );
}
