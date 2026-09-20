'use client';

import React from 'react';
import { 
  AlertTriangle, CheckCircle2, Clock, Ban, FileWarning, 
  HelpCircle, RefreshCw, X, ArrowRight, ShieldAlert
} from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  isLoading?: boolean;
}

// 1. ยืนยันเริ่มทำแบบทดสอบ (Confirm Quiz Dialog)
export function ConfirmQuizDialog({ isOpen, onClose, onConfirm, isLoading }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">ยืนยันเริ่มทำแบบทดสอบ?</h3>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          เมื่อเริ่มทำแบบทดสอบแล้ว คุณจะไม่สามารถออกจากระบบหรือเปลี่ยนบทเรียนได้ จนกว่าจะส่งคำตอบ
        </p>
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm shadow-blue-200"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'เริ่มทำแบบทดสอบ'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. คำเตือนการแก้ไขโครงสร้าง (Structural Edit Warning)
export function StructuralWarningDialog({ isOpen, onClose, onConfirm }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 mx-auto flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">คำเตือน: การแก้ไขโครงสร้างบทเรียน</h3>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          การเปลี่ยนแปลงโครงสร้างอาจส่งผลต่อข้อมูลการเรียนรู้ของนักเรียนที่กำลังศึกษาอยู่ คุณต้องการดำเนินการต่อหรือไม่?
        </p>
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
          >
            ดำเนินการต่อ
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. เซสชันหมดอายุ (Session Expired Dialog)
export function SessionExpiredDialog({ isOpen, onConfirm }: { isOpen: boolean; onConfirm: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">หมดเวลาการใช้งานระบบ</h3>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          เพื่อความปลอดภัยของข้อมูล ระบบได้ออกจากระบบอัตโนมัติ กรุณาเข้าสู่ระบบใหม่อีกครั้ง
        </p>
        <button
          onClick={onConfirm}
          className="w-full mt-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
        >
          เข้าสู่ระบบ
        </button>
      </div>
    </div>
  );
}

// 4. สิทธิ์ไม่เพียงพอ (Access Denied Dialog)
export function AccessDeniedDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-4">
          <Ban className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">ไม่มีสิทธิ์เข้าถึงหน้านี้</h3>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          คุณไม่มีสิทธิ์ในการเข้าถึงเนื้อหานี้ กรุณาติดต่อผู้ดูแลระบบหากคุณคิดว่านี่คือข้อผิดพลาด
        </p>
        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition shadow-sm"
        >
          ตกลง / กลับหน้าหลัก
        </button>
      </div>
    </div>
  );
}

// 5. กล่องแจ้งเตือนข้อผิดพลาดพร้อมปุ่มลองใหม่อีกครั้ง (Error Retry Banner)
export function ErrorRetryBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 my-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-red-900">ไม่สามารถโหลดข้อมูลได้ในขณะนี้</h4>
          <p className="text-[11px] text-red-700">{message}</p>
        </div>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        ลองใหม่อีกครั้ง
      </button>
    </div>
  );
}

// 6. Empty State Card
export function EmptyStateCard({ 
  title, 
  description,
  actionLabel,
  onAction,
}: { 
  title: string; 
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-center my-4 transition-colors">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-500 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// 7. Skeleton Loading Placeholder
export function SkeletonCard() {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
      <div className="w-1/3 h-4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
      <div className="w-full h-8 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
      <div className="w-2/3 h-4 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
    </div>
  );
}
