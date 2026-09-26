'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Printer, Award, ShieldCheck, Sparkles, Image as ImageIcon, 
  ExternalLink, CheckCircle2, QrCode, FileText
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { parseFullName } from '@/lib/profileValidation';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Allows manual override or custom mock data
  studentNameOverride?: string;
  issueDateOverride?: string;
  certificateCodeOverride?: string;
}

export default function CertificateModal({
  isOpen,
  onClose,
  studentNameOverride,
  issueDateOverride,
  certificateCodeOverride,
}: CertificateModalProps) {
  const { currentUser, lessons, progressMap } = useAppStore();

  // Background toggle: allows user to preview either the built-in royal frame or their custom background
  const [bgMode, setBgMode] = useState<'default' | 'custom'>('default');
  const [customBgLoaded, setCustomBgLoaded] = useState(false);

  // Check if custom background image exists in public folder
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const img = new Image();
      img.src = '/certificate-bg.png';
      img.onload = () => {
        setCustomBgLoaded(true);
      };
      img.onerror = () => {
        setCustomBgLoaded(false);
      };
    }
  }, []);

  if (!isOpen) return null;

  // Extract Student Full Name (Prefix + First + Last only, NO student ID as requested)
  const rawName = studentNameOverride || currentUser.fullName || currentUser.displayName || 'นายสมชาย ใจดี';
  const parsed = parseFullName(rawName);
  const formattedStudentName = `${parsed.prefix} ${parsed.first} ${parsed.last}`.trim();

  // Course Constants
  const courseCode = '30-401-001-204';
  const courseTitle = 'นวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้';
  const departmentName = 'สาขาวิชาครุศาสตร์อุตสาหกรรมอุตสาหการ คณะครุศาสตร์อุตสาหกรรม';
  const universityName = 'มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น';
  const instructorName = 'ผศ.ดร.เฉลิมพล บุญทศ';
  const instructorTitle = 'อาจารย์ผู้รับผิดชอบรายวิชา';

  // Thai Date Formatting
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const now = new Date();
  const day = now.getDate();
  const month = thaiMonths[now.getMonth()];
  const thaiYear = now.getFullYear() + 543;
  const formattedDate = issueDateOverride || `${day} ${month} พ.ศ. ${thaiYear}`;

  // Unique Certificate Reference Code
  const certIdSeed = (currentUser.id || 'RMUTI').slice(0, 6).toUpperCase();
  const certificateCode = certificateCodeOverride || `RMUTI-EDTECH-${now.getFullYear()}-${certIdSeed}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200 print:p-0 print:bg-white print:static print:overflow-visible">
      
      {/* Print Specific CSS to enforce A4 landscape and isolate certificate */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          header, nav, aside, footer, .print-hide {
            display: none !important;
          }
          .certificate-container {
            width: 297mm !important;
            height: 210mm !important;
            max-width: 297mm !important;
            max-height: 210mm !important;
            margin: 0 auto !important;
            padding: 12mm !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Outer Wrapper */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto print:border-none print:shadow-none print:w-full print:max-w-none print:m-0 print:rounded-none">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="print-hide px-4 sm:px-6 py-3.5 bg-slate-50 dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <span>ใบประกาศนียบัตรสำเร็จการศึกษา (E-Certificate)</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  มาตรฐานรายวิชา
                </span>
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                สัดส่วน A4 แนวนอน (Landscape) • สามารถสั่งพิมพ์หรือบันทึกเป็น PDF ได้ทันที
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Background Switcher Toggle */}
            <button
              onClick={() => setBgMode(bgMode === 'default' ? 'custom' : 'default')}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="สลับระหว่างแม่แบบมาตรฐานกับภาพพื้นหลังที่คุณออกแบบเอง"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{bgMode === 'default' ? 'โหมด: กรอบมาตรฐาน' : 'โหมด: พื้นหลังที่อัปโหลด'}</span>
            </button>

            {/* Print / Save as PDF Button */}
            <button
              onClick={handlePrint}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ / บันทึก PDF</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body (A4 Landscape aspect ratio: 1.414 / 1) */}
        <div className="p-3 sm:p-6 overflow-x-auto flex justify-center bg-slate-200/50 dark:bg-slate-950/70 print:p-0 print:bg-white">
          <div 
            className="certificate-container relative w-full aspect-[1.414/1] max-w-[940px] bg-white text-slate-900 shadow-xl overflow-hidden flex flex-col justify-between p-6 sm:p-10 select-none print:shadow-none print:m-0"
            style={{
              backgroundImage: bgMode === 'custom' && customBgLoaded 
                ? "url('/certificate-bg.png')" 
                : undefined,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Built-in Royal Navy & Gold Borders (Visible in 'default' mode) */}
            {bgMode === 'default' && (
              <>
                {/* Outer Double Gold/Navy Frame */}
                <div className="absolute inset-2 sm:inset-3 border-[3px] border-[#0F2A4A] pointer-events-none" />
                <div className="absolute inset-3 sm:inset-4 border border-[#B38728] pointer-events-none" />
                <div className="absolute inset-4 sm:inset-5 border-[2px] border-[#C5A059] border-dashed pointer-events-none opacity-40" />

                {/* Decorative Corner Ornaments */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#B38728] pointer-events-none" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#B38728] pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#B38728] pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#B38728] pointer-events-none" />

                {/* Subtle Guilloche / Watermark Pattern Center */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
                  <div className="w-80 h-80 rounded-full border-[16px] border-[#0F2A4A] flex items-center justify-center">
                    <Award className="w-48 h-48 text-[#0F2A4A]" />
                  </div>
                </div>
              </>
            )}

            {/* If in custom background mode but file is missing, show helpful hint */}
            {bgMode === 'custom' && !customBgLoaded && (
              <div className="print-hide absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-md">
                💡 วางไฟล์ภาพชื่อ "certificate-bg.png" ในโฟลเดอร์ public/ เพื่อแสดงพื้นหลังของคุณ
              </div>
            )}

            {/* 1. Header Section: University, Faculty & Logos */}
            <div className="relative z-10 text-center">
              
              {/* Emblem / Logo Row: 3 Slots (Major Logo slot, University Crest, Website Logo slot) */}
              <div className="flex items-center justify-between max-w-xl mx-auto mb-2 sm:mb-3 px-4">
                
                {/* SLOT 1: ตราสาขาวิชา (Major Emblem Slot) */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border-2 border-dashed border-amber-600/40 bg-amber-50/60 flex flex-col items-center justify-center p-1 shadow-2xs group hover:border-amber-600 transition">
                    <img 
                      src="/major-logo.png" 
                      alt="ตราสาขาวิชา"
                      className="w-full h-full object-contain hidden"
                      onLoad={(e) => (e.currentTarget.className = "w-full h-full object-contain block")}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <div className="text-center">
                      <Award className="w-5 h-5 text-amber-700 mx-auto" />
                      <span className="text-[7px] sm:text-[8px] font-bold text-amber-800 leading-tight block">
                        ตราสาขา
                      </span>
                    </div>
                  </div>
                  <span className="text-[8px] text-slate-500 font-medium mt-0.5">ครุศาสตร์อุตสาหการ</span>
                </div>

                {/* SLOT 2: ตรามหาวิทยาลัย (University Emblem) */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#0F2A4A] to-[#1E3A8A] flex flex-col items-center justify-center text-white shadow-md shadow-blue-900/20 border-2 border-[#C5A059] p-1.5">
                    <img 
                      src="/university-logo.png" 
                      alt="ตรามหาวิทยาลัย"
                      className="w-full h-full object-contain hidden"
                      onLoad={(e) => (e.currentTarget.className = "w-full h-full object-contain block")}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <div className="text-center">
                      <Sparkles className="w-6 h-6 text-amber-400 mx-auto" />
                      <span className="text-[8px] sm:text-[9px] font-black tracking-tight text-amber-300">
                        มทร.อีสาน
                      </span>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold text-slate-700 mt-0.5">RMUTI KKC</span>
                </div>

                {/* SLOT 3: ตราเว็บไซต์ (EDTech Platform Logo Slot) */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border-2 border-dashed border-blue-600/40 bg-blue-50/60 flex flex-col items-center justify-center p-1 shadow-2xs group hover:border-blue-600 transition">
                    <img 
                      src="/website-logo.png" 
                      alt="ตราเว็บไซต์"
                      className="w-full h-full object-contain hidden"
                      onLoad={(e) => (e.currentTarget.className = "w-full h-full object-contain block")}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <div className="text-center">
                      <FileText className="w-5 h-5 text-blue-700 mx-auto" />
                      <span className="text-[7px] sm:text-[8px] font-bold text-blue-800 leading-tight block">
                        ตราเว็บไซต์
                      </span>
                    </div>
                  </div>
                  <span className="text-[8px] text-slate-500 font-medium mt-0.5">EDTech Platform</span>
                </div>
              </div>

              {/* Institution Header Typography */}
              <div className="space-y-0.5">
                <h1 className="text-xs sm:text-base font-bold text-slate-900 tracking-tight">
                  {universityName}
                </h1>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-600">
                  {departmentName}
                </p>
                <div className="w-24 sm:w-32 h-0.5 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mx-auto my-1.5" />
                <h3 className="text-sm sm:text-lg font-black text-[#0F2A4A] uppercase tracking-wider">
                  เกียรติบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า
                </h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400 italic">
                  This Certificate of Completion is Proudly Presented to
                </p>
              </div>
            </div>

            {/* 2. Recipient Name Section (NO student ID, only Prefix + First + Last) */}
            <div className="relative z-10 text-center py-2 sm:py-3 my-auto">
              <div className="inline-block relative">
                {/* Large Elegant Recipient Name */}
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#0F2A4A] tracking-wide font-serif px-6 py-1">
                  {formattedStudentName}
                </h2>
                {/* Golden Underline flourish */}
                <div className="w-4/5 h-0.5 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mx-auto mt-1" />
              </div>
              
              <p className="text-[11px] sm:text-xs text-slate-700 font-medium mt-2 max-w-xl mx-auto leading-relaxed">
                ได้ผ่านการศึกษาและผ่านการประเมินผลตามเกณฑ์มาตรฐานในระบบการสอนออนไลน์
              </p>
              <div className="mt-1">
                <span className="text-xs sm:text-sm font-extrabold text-blue-900 bg-blue-50/70 px-3 py-1 rounded-full border border-blue-200">
                  รายวิชา {courseCode} {courseTitle}
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1.5">
                ภาคการศึกษาที่ 1 / ปีการศึกษา 2569 • หลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต (ค.อ.บ.)
              </p>
            </div>

            {/* 3. Footer Section: Issue Date, Verification Code, Gold Seal & Instructor Signature */}
            <div className="relative z-10 pt-2 sm:pt-4 border-t border-slate-200">
              <div className="grid grid-cols-3 items-end gap-2 text-center sm:text-left">
                
                {/* Left: Certificate Reference Code & QR Code */}
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center p-1 shrink-0">
                    <QrCode className="w-7 h-7 sm:w-8 sm:h-8 text-slate-800" />
                    <span className="text-[7px] text-slate-500 font-mono mt-0.5">VERIFY</span>
                  </div>
                  <div className="space-y-0.5 text-left">
                    <div className="text-[8px] sm:text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                      รหัสตรวจสอบเกียรติบัตร
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-800 tracking-tight">
                      {certificateCode}
                    </div>
                    <div className="text-[8px] text-emerald-700 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>รับรองผ่านระบบดิจิทัล</span>
                    </div>
                  </div>
                </div>

                {/* Center: Official Gold Seal & Date */}
                <div className="flex flex-col items-center justify-center text-center">
                  {/* Digital Gold Seal Badge */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#F5D061] via-[#E6B033] to-[#A37B1B] p-0.5 shadow-md flex items-center justify-center border-2 border-white">
                    <div className="w-full h-full rounded-full border border-dashed border-amber-900/40 flex flex-col items-center justify-center text-amber-950 font-bold">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-950" />
                      <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-widest leading-none mt-0.5">
                        OFFICIAL
                      </span>
                    </div>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-slate-600 font-semibold mt-1">
                    ให้ไว้ ณ วันที่ {formattedDate}
                  </p>
                </div>

                {/* Right: Course Instructor Digital Signature */}
                <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                  {/* Signature Slot */}
                  <div className="h-10 sm:h-12 flex items-end justify-center sm:justify-end mb-1">
                    <img 
                      src="/instructor-signature.png" 
                      alt="ลายเซ็นอาจารย์"
                      className="h-full object-contain hidden"
                      onLoad={(e) => (e.currentTarget.className = "h-full object-contain block")}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <span className="font-serif italic text-base sm:text-lg text-blue-950 font-bold tracking-tight">
                      Chalermphol B.
                    </span>
                  </div>
                  {/* Signature Line */}
                  <div className="w-36 sm:w-48 h-px bg-slate-400 mb-1" />
                  <div className="text-[10px] sm:text-xs font-bold text-slate-900">
                    ( {instructorName} )
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-medium text-slate-600">
                    {instructorTitle}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Bottom Helper Bar (Hidden on Print) */}
        <div className="print-hide px-4 sm:px-6 py-3 bg-slate-50 dark:bg-[#1e293b] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">💡 การปรับแต่งในอนาคต:</span>
            <span>
              นำรูปภาพพื้นหลังมาวางที่ <code className="text-blue-600 dark:text-blue-400 font-mono">public/certificate-bg.png</code> ระบบจะใช้พื้นหลังของคุณทันที
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
