'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, BookOpen, BarChart3, Megaphone, HelpCircle, LogOut, User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/data/store';

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAppStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'หน้าหลัก', icon: Home },
    { href: '/profile', label: 'ข้อมูลส่วนตัวของฉัน', icon: User },
    { href: '/my-lessons', label: 'บทเรียนของฉัน', icon: BookOpen },
    { href: '/my-progress', label: 'ความก้าวหน้าของฉัน', icon: BarChart3 },
    { href: '/announcements', label: 'ข่าวประกาศ', icon: Megaphone },
    { href: '/faq', label: 'ช่วยเหลือ (FAQ)', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6 px-4 hidden lg:flex transition-colors duration-200">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
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

      {/* Decorative Quote Card matching Page 3 */}
      <div className="mt-8">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-slate-800/70 dark:to-indigo-950/40 border border-blue-100 dark:border-slate-700/60">
          <p className="text-xs font-bold text-blue-900 dark:text-blue-200 leading-snug">
            “การเรียนรู้เปลี่ยนอนาคตได้ เริ่มได้ที่นี่”
          </p>
          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-1 uppercase tracking-wider">
            Better Learning Brighter Tomorrow
          </p>
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
