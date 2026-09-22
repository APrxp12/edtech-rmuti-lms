'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BookOpen, Users, Shield, Settings, Megaphone, 
  ArrowLeft, Menu, X, LogOut, ExternalLink, ChevronRight,
  Sparkles, CheckCircle2
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function AdminMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAppStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/admin/lessons', label: 'จัดการบทเรียน', shortLabel: 'บทเรียน', icon: BookOpen },
    { href: '/admin/users', label: 'จัดการผู้ใช้งาน', shortLabel: 'ผู้ใช้', icon: Users },
    { href: '/admin/access-rules', label: 'กำหนดสิทธิ์', shortLabel: 'กำหนดสิทธิ์', icon: Shield },
    { href: '/admin/announcements', label: 'ประกาศข่าวสาร', shortLabel: 'ข่าวสาร', icon: Megaphone },
    { href: '/admin/settings', label: 'ตั้งค่าระบบ', shortLabel: 'ตั้งค่า', icon: Settings },
    { href: '/dashboard', label: 'กลับสู่แดชบอร์ด', shortLabel: 'แดชบอร์ด', icon: ArrowLeft, isSecondary: true },
  ];

  return (
    <>
      {/* Top Mobile Admin Subheader & Tab Bar (Visible on mobile/tablet < 1024px) */}
      <div className="lg:hidden sticky top-16 z-30 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
        <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 px-2 py-0.5 rounded-md border border-amber-300/60 dark:border-amber-900/60 flex items-center gap-1">
              <Shield className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Admin CMS</span>
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              แถบเลือกจัดการระบบ
            </span>
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
            aria-label="เปิดเมนูแอดมินทั้งหมด"
          >
            <Menu className="w-3.5 h-3.5 text-slate-500" />
            <span>เมนูทั้งหมด</span>
          </button>
        </div>

        {/* Horizontal Scrollable Tabs */}
        <div className="px-2.5 py-2 overflow-x-auto flex items-center gap-1.5 no-scrollbar scroll-smooth">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/admin/lessons'
              ? pathname === '/admin/lessons' || pathname.startsWith('/admin/lessons/')
              : pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-semibold'
                    : item.isSecondary
                      ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Admin Mobile Drawer / Modal */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-[#111827] h-full shadow-2xl flex flex-col justify-between p-5 z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">ระบบจัดการผู้ดูแล</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Admin Control Panel</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Admin Profile Info */}
              <div className="py-3.5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                <UserAvatar
                  src={currentUser.avatarUrl}
                  name={currentUser.fullName || currentUser.displayName}
                  email={currentUser.email}
                  size="sm"
                  rounded="rounded-xl"
                  showGoogleBadge={true}
                  className="w-10 h-10 border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.fullName || currentUser.displayName || 'ผู้ดูแลระบบ'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.email}
                  </p>
                  <span className="inline-block mt-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                    Admin Role
                  </span>
                </div>
              </div>

              {/* Nav Items List */}
              <div className="space-y-1 mt-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === '/admin/lessons'
                    ? pathname === '/admin/lessons' || pathname.startsWith('/admin/lessons/')
                    : pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-blue-200' : 'text-slate-400'}`} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>มุมมองนักศึกษา (Dashboard)</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 rounded-xl transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
