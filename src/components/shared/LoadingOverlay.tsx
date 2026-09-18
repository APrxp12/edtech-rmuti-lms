'use client';

import React from 'react';
import { BookOpen, Sparkles, RefreshCw } from 'lucide-react';

interface LoadingOverlayProps {
  isOpen: boolean;
  message?: string;
  subMessage?: string;
}

export function LoadingOverlay({
  isOpen,
  message = 'กำลังโหลดข้อมูล...',
  subMessage = 'กรุณารอสักครู่ ระบบกำลังประมวลผล',
}: LoadingOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full mx-4 shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
        
        {/* Animated University Logo Icon with Glowing Ring */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <BookOpen className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          {/* Spinning decorative ring */}
          <div className="absolute -inset-1.5 rounded-2xl border-2 border-blue-500 border-t-transparent animate-spin"></div>
        </div>

        {/* Text Details */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 flex items-center justify-center gap-1.5">
            <span>{message}</span>
            <span className="flex gap-0.5">
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </span>
          </h3>
          <p className="text-xs text-slate-500">{subMessage}</p>
        </div>

        {/* Brand footer tag */}
        <div className="pt-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>EDTech • RMUTI Khon Kaen</span>
        </div>

      </div>
    </div>
  );
}

export function InlineLoadingSpinner({ text = 'กำลังโหลด...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 p-4 text-xs font-semibold text-slate-500">
      <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
      <span>{text}</span>
    </div>
  );
}
