'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, CheckSquare, BarChart3, User, Shield } from 'lucide-react';
import { useAppStore } from '@/data/store';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { currentUser } = useAppStore();
  const isAdmin = currentUser.role === 'admin';

  const navItems = [
    { href: '/dashboard', label: 'หน้าแรก', icon: Home },
    { href: '/my-lessons', label: 'บทเรียน', icon: BookOpen },
    isAdmin 
      ? { href: '/admin/lessons', label: 'ระบบแอดมิน', icon: Shield }
      : { href: '/lessons/RMUTI-003/pre-test', label: 'แบบทดสอบ', icon: CheckSquare },
    { href: '/my-progress', label: 'ความก้าวหน้า', icon: BarChart3 },
    { href: '/profile', label: 'โปรไฟล์', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 shadow-lg transition-colors duration-200">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
