'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, BookOpen, Users, Shield, Settings, Megaphone, BarChart3, LogOut, ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/data/store';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAppStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'กลับสู่แดชบอร์ดหลัก', icon: ArrowLeft },
    { href: '/admin/lessons', label: 'จัดการบทเรียน', icon: BookOpen },
    { href: '/admin/users', label: 'จัดการผู้ใช้งาน', icon: Users },
    { href: '/admin/access-rules', label: 'กำหนดสิทธิ์การใช้งาน', icon: Shield },
    { href: '/admin/settings', label: 'ตั้งค่าระบบ', icon: Settings },
    { href: '/admin/announcements', label: 'ประกาศข่าวสาร', icon: Megaphone },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6 px-4 hidden lg:flex transition-colors duration-200">
      <div className="space-y-1">
        <div className="px-3 pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-900/60">
            ระบบบริหารจัดการ (Admin)
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin/lessons' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-blue-400'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-200">RMUTI EDTech</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">ระบบบริการรายวิชาออนไลน์</div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
