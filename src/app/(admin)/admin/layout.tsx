'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navigation/Navbar';
import AdminSidebar from '@/components/navigation/AdminSidebar';
import { useAppStore } from '@/data/store';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser, isLoaded } = useAppStore();

  const isAuthenticated = Boolean(currentUser?.email && currentUser?.id);
  const isAdmin = isAuthenticated && currentUser.role === 'admin';

  useEffect(() => {
    if (!isLoaded) return;

    if (!isAuthenticated) {
      router.replace('/login');
    } else if (!isAdmin) {
      router.replace('/dashboard');
    }
  }, [isLoaded, isAuthenticated, isAdmin, router]);

  // While checking or if unauthorized, do not show admin content
  if (!isLoaded || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">
            {!isLoaded ? 'กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...' : 'ไม่มีสิทธิ์เข้าถึงระบบผู้ดูแล กำลังนำทาง...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex pb-12 px-2 sm:px-4 lg:px-6">
        <AdminSidebar />
        <main className="flex-1 p-3 sm:p-5 lg:p-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
