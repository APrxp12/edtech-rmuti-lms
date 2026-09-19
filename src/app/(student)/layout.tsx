'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navigation/Navbar';
import StudentSidebar from '@/components/navigation/StudentSidebar';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';
import { RequiredProfileModal } from '@/components/modals/RequiredProfileModal';
import { useAppStore } from '@/data/store';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser, isLoaded } = useAppStore();

  const isAuthenticated = Boolean(currentUser?.email && currentUser?.id);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoaded, isAuthenticated, router]);

  if (!isLoaded || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">
            {!isLoaded ? 'กำลังตรวจสอบการเข้าสู่ระบบ...' : 'กรุณาเข้าสู่ระบบ กำลังนำทางไปหน้าล็อกอิน...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex pb-20 lg:pb-0 px-2 sm:px-4 lg:px-6">
        <StudentSidebar />
        <main className="flex-1 p-3 sm:p-5 lg:p-6 min-w-0">
          {children}
        </main>
      </div>
      <MobileBottomNav />
      <RequiredProfileModal />
    </div>
  );
}
