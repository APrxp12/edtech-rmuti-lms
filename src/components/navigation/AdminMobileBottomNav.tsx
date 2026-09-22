'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Users, Shield, Megaphone, Settings } from 'lucide-react';

export default function AdminMobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/lessons', label: 'บทเรียน', icon: BookOpen },
    { href: '/admin/users', label: 'ผู้ใช้งาน', icon: Users },
    { href: '/admin/access-rules', label: 'สิทธิ์', icon: Shield },
    { href: '/admin/announcements', label: 'ข่าวสาร', icon: Megaphone },
    { href: '/admin/settings', label: 'ตั้งค่า', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-lg transition-colors duration-200">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/admin/lessons'
            ? pathname === '/admin/lessons' || pathname.startsWith('/admin/lessons/')
            : pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition relative ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1 w-5 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
