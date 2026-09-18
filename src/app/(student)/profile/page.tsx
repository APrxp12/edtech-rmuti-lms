'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, GraduationCap, Calendar, Clock, ShieldCheck, 
  Award, BookOpen, CheckCircle2, ArrowLeft, LogOut, ExternalLink,
  Sparkles, RefreshCw
} from 'lucide-react';
import { useAppStore } from '@/data/store';

export default function StudentProfilePage() {
  const router = useRouter();
  const { currentUser, lessons, progressMap, settings } = useAppStore();

  // Compute course statistics
  const completedCount = Object.values(progressMap).filter((p) => p.status === 'passed').length;
  const inProgressCount = Object.values(progressMap).filter((p) => p.status === 'in_progress').length;
  const totalLessons = lessons.length;
  const overallPercent = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าหลัก
        </Link>
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          ข้อมูลส่วนตัวของฉัน
        </span>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          
          {/* Avatar with Google badge */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-1 shadow-md">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                  className="w-full h-full object-cover rounded-[22px]"
                />
              ) : (
                <div className="w-full h-full rounded-[22px] bg-blue-50 flex items-center justify-center text-blue-600">
                  <User className="w-12 h-12" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full ring-4 ring-white shadow-xs" title="บัญชีปกติ">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {currentUser.fullName || currentUser.displayName}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {currentUser.role === 'student' ? 'นักศึกษา' : 'ผู้ดูแลระบบ'}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                สถานะ: ใช้งานได้
              </span>
            </div>

            <p className="text-sm text-slate-600 flex items-center justify-center sm:justify-start gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>รหัสนักศึกษา: <strong className="text-slate-800 font-mono font-bold">{currentUser.studentId || '-'}</strong></span>
            </p>

            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>อีเมล Google: {currentUser.email}</span>
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                เข้าสู่ระบบครั้งแรก: {new Date(currentUser.firstLoginAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                เซสชันระบบ: <strong>{settings.sessionTimeoutMinutes || 120} นาที</strong>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="shrink-0 flex flex-col gap-2 w-full sm:w-auto">
            <button
              onClick={() => router.push('/login')}
              className="py-2.5 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              ออกจากระบบ
            </button>
          </div>

        </div>
      </div>

      {/* Learning Statistics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold">บทเรียนที่ผ่านเกณฑ์</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {completedCount} <span className="text-sm font-normal text-slate-500">/ {totalLessons} บท</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${overallPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold">บทเรียนที่กำลังเรียน</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {inProgressCount} <span className="text-sm font-normal text-slate-500">บท</span>
          </div>
          <p className="text-[11px] text-slate-500">กำลังศึกษาเนื้อหาหรือทำข้อสอบ</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold">เกณฑ์ผ่านการประเมิน</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {settings.defaultPassScorePercent}%
          </div>
          <p className="text-[11px] text-slate-500">ทำแบบทดสอบ Post-test ให้ผ่านเกณฑ์</p>
        </div>

      </div>

      {/* Account Info Details Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            ข้อมูลการลงทะเบียนและสิทธิ์เข้าใช้งาน
          </h3>
          <span className="text-xs text-slate-500">ซิงค์อัตโนมัติจาก Google Workspace</span>
        </div>

        <div className="p-6 divide-y divide-slate-100 text-sm">
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">สถาบันการศึกษา</span>
            <span className="font-bold text-slate-900">มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น</span>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">รายวิชาที่ลงทะเบียน</span>
            <span className="font-bold text-blue-900">EDTech: การเรียนรู้ด้วยตนเองในยุคดิจิทัล (รายวิชาเดี่ยว)</span>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">โดเมนที่ได้รับอนุญาต</span>
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              @rmuti.ac.th (Google Workspace for Education)
            </span>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">การเข้าถึงระบบ</span>
            <span className="text-slate-700">ยืนยันตัวตนผ่าน Google Single Sign-In สำเร็จ</span>
          </div>
        </div>
      </div>

    </div>
  );
}
