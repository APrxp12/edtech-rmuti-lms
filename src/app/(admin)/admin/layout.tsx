'use client';

import React from 'react';
import Navbar from '@/components/navigation/Navbar';
import AdminSidebar from '@/components/navigation/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
