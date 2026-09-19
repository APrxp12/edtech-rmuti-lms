'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, Search, ArrowLeft, ChevronDown, Sparkles, Building2, 
  User, Mail, Phone, Clock, CheckCircle2, AlertCircle, BookOpen, 
  Award, ShieldAlert, Laptop, MessageCircle, FileText, ThumbsUp, X
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'course' | 'quiz' | 'criteria' | 'technical';
  categoryLabel: string;
  question: string;
  answer: string;
  steps?: string[];
  tips?: string;
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'course' | 'quiz' | 'criteria' | 'technical'>('all');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'faq-1': true, // default open the first one
  });
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, boolean>>({});

  // Course Information Constants
  const courseInfo = {
    code: '30-401-001-204',
    title: 'นวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้',
    instructor: 'ผศ.ดร.เฉลิมพล บุญทศ',
    semester: 'ภาคการศึกษาที่ 1 / ปีการศึกษา 2569',
    curriculum: 'หลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต (ค.อ.บ.)',
    department: 'สาขาวิชาครุศาสตร์อุตสาหกรรมอุตสาหการ คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น',
    office: 'ห้องพักอาจารย์สาขาวิชาครุศาสตร์อุตสาหกรรมอุตสาหการ อาคาร 18 ชั้น 3',
    email: 'chalermpol.bo@rmuti.ac.th',
    officeHours: 'วันจันทร์ - วันศุกร์ เวลา 09:00 - 16:30 น.',
  };

  // FAQ Database
  const faqList: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'course',
      categoryLabel: 'การเข้าเรียนและบทเรียน',
      question: 'ระบบการเรียนรู้แบบกำกับตนเอง (Self-Directed Learning) มีขั้นตอนการเรียนอย่างไร?',
      answer: 'ระบบการเรียนรู้นี้ออกแบบให้ผู้เรียนสามารถจัดการเวลาและกำกับตนเองได้ตามลำดับขั้นตอน เพื่อผลสัมฤทธิ์ทางการเรียนสูงสุด:',
      steps: [
        'ขั้นตอนที่ 1: ทำแบบทดสอบก่อนเรียน (Pre-test) ประจำบทเรียนเพื่อวัดความรู้พื้นฐานเดิม',
        'ขั้นตอนที่ 2: ศึกษาเนื้อหาวิดีโอบรรยาย สื่อมัลติมีเดีย และดาวน์โหลดเอกสารประกอบการเรียน',
        'ขั้นตอนที่ 3: ทำแบบฝึกหัดหรือกิจกรรมระหว่างบทเรียนตามคำแนะนำของผู้สอน',
        'ขั้นตอนที่ 4: ทำแบบทดสอบหลังเรียน (Post-test) เพื่อวัดผลสัมฤทธิ์ โดยต้องผ่านเกณฑ์ 80% ขึ้นไป',
      ],
      tips: 'ผู้เรียนสามารถย้อนกลับมาทบทวนวิดีโอและเอกสารประกอบได้ตลอดภาคการศึกษา',
    },
    {
      id: 'faq-2',
      category: 'course',
      categoryLabel: 'การเข้าเรียนและบทเรียน',
      question: 'ทำไมบทเรียนถัดไปถึงยังถูกล็อก (Locked) และจะปลดล็อกได้อย่างไร?',
      answer: 'ระบบจัดการเรียนรู้ถูกออกแบบตามลำดับขั้นความรู้ (Sequential Learning) เพื่อให้ผู้เรียนมีความรู้พื้นฐานเพียงพอก่อนเข้าสู่บทเรียนถัดไป บทเรียนถัดไปจะปลดล็อกโดยอัตโนมัติเมื่อผู้เรียนผ่านเกณฑ์แบบทดสอบหลังเรียน (Post-test) ของบทเรียนก่อนหน้าตั้งแต่ 80% ขึ้นไป',
      tips: 'หากท่านเป็นผู้ดูแลระบบ (Admin) หรือต้องการทดสอบเนื้อหา สามารถเข้าสู่ระบบด้วยสิทธิ์ผู้ดูแลระบบเพื่อเข้าถึงทุกบทเรียนได้ทันที',
    },
    {
      id: 'faq-3',
      category: 'quiz',
      categoryLabel: 'แบบทดสอบและการประเมินผล',
      question: 'แบบทดสอบก่อนเรียน (Pre-test) มีผลต่อเกรดรายวิชาหรือไม่?',
      answer: 'แบบทดสอบก่อนเรียน (Pre-test) มีจุดประสงค์เพื่อประเมินระดับความรู้พื้นฐานเดิมของผู้เรียนก่อนเริ่มศึกษาเนื้อหา โดยคะแนนในส่วนนี้จะไม่มีผลต่อเกรดเฉลี่ยหรือการตัดคะแนนสะสม แต่จะถูกนำไปวิเคราะห์เปรียบเทียบกับแบบทดสอบหลังเรียน (Post-test) เพื่อดูพัฒนาการการเรียนรู้ (Learning Gain) ของผู้เรียน',
    },
    {
      id: 'faq-4',
      category: 'quiz',
      categoryLabel: 'แบบทดสอบและการประเมินผล',
      question: 'แบบทดสอบหลังเรียน (Post-test) ต้องได้คะแนนเท่าใดจึงจะผ่าน และสอบซ้ำได้กี่ครั้ง?',
      answer: 'เกณฑ์การผ่านแบบทดสอบหลังเรียนคือ 80% ขึ้นไป (เช่น 8 ข้อจากทั้งหมด 10 ข้อ)',
      steps: [
        'หากสอบผ่านตั้งแต่ 80% ขึ้นไป: ระบบจะบันทึกสถานะบทเรียนเป็น "ผ่านเกณฑ์แล้ว" และปลดล็อกบทเรียนถัดไปให้ทันที',
        'หากได้คะแนนน้อยกว่า 80%: ผู้เรียนสามารถคลิก "ทบทวนบทเรียน" แล้วกลับมาทำแบบทดสอบหลังเรียนใหม่ได้จนกว่าจะผ่านเกณฑ์',
        'การทำซ้ำ: ระบบอนุญาตให้ทำแบบทดสอบใหม่ได้ และจะบันทึกคะแนนสูงสุด (Best Score) ไว้ในประวัติการเรียนของผู้เรียนเสมอ',
      ],
    },
    {
      id: 'faq-5',
      category: 'criteria',
      categoryLabel: 'เกณฑ์การผ่านรายวิชา',
      question: 'เกณฑ์การผ่านรายวิชาและสำเร็จการศึกษาในระบบ มีเงื่อนไขอะไรบ้าง?',
      answer: 'การประเมินผลความสำเร็จในรายวิชานวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้ มีเกณฑ์ดังต่อไปนี้:',
      steps: [
        '1. ศึกษาเนื้อหาและคลิปวิดีโอบทเรียนครบทั้ง 8 บทเรียน คิดเป็นความก้าวหน้า 100%',
        '2. ผ่านแบบทดสอบหลังเรียน (Post-test) ของทุกบทเรียนด้วยคะแนนไม่ต่ำกว่า 80%',
        '3. ทำแบบทดสอบวัดผลสัมฤทธิ์ปลายภาค (ถ้ามี) ตามกำหนดการของมหาวิทยาลัย',
        '4. ส่งมอบชิ้นงานนวัตกรรมการเรียนรู้ตามที่ได้รับมอบหมายจากอาจารย์ผู้สอน',
      ],
    },
    {
      id: 'faq-6',
      category: 'technical',
      categoryLabel: 'ปัญหาเทคนิคและอุปกรณ์',
      question: 'หากดูวิดีโอจบแล้ว แต่ระบบไม่บันทึกเปอร์เซ็นต์ความก้าวหน้า ต้องแก้ไขอย่างไร?',
      answer: 'หากพบว่าเปอร์เซ็นต์ความก้าวหน้ายังไม่อัปเดต ให้ปฏิบัติตามคำแนะนำดังนี้:',
      steps: [
        '1. ตรวจสอบว่าสัญญาณอินเทอร์เน็ตมีความเสถียรขณะเรียน',
        '2. เลื่อนแถบวิดีโอจนจบ แล้วรอให้ระบบส่งสัญญาณบันทึกสถานะประมาณ 2-3 วินาที',
        '3. ลองกดปุ่มรีเฟรชหน้าจอ (F5 หรือ Ctrl+R) อีกครั้ง',
        '4. หากใช้ฟังก์ชันบล็อกโฆษณา (Ad Blocker) หรือเบราว์เซอร์โหมดไม่ระบุตัวตน (Incognito) แนะนำให้ปิดใช้งานชั่วคราวเพื่อให้ระบบสามารถบันทึกคุกกี้และแคชของสถานะการเรียนได้สมบูรณ์',
      ],
    },
    {
      id: 'faq-7',
      category: 'technical',
      categoryLabel: 'ปัญหาเทคนิคและอุปกรณ์',
      question: 'สามารถเรียนผ่านสมาร์ตโฟน แท็บเล็ต หรือ iPad ได้หรือไม่?',
      answer: 'ระบบ EDTech ได้รับการออกแบบให้รองรับ Responsive Web Design อย่างเต็มรูปแบบ ผู้เรียนสามารถใช้งานผ่านอุปกรณ์ใดก็ได้ ไม่ว่าจะเป็น คอมพิวเตอร์ตั้งโต๊ะ (PC), โน้ตบุ๊ก (Laptop), แท็บเล็ต (iPad/Android Tablet), หรือสมาร์ตโฟน โดยแนะนำให้เปิดใช้งานผ่าน Google Chrome, Safari หรือ Microsoft Edge เวอร์ชันล่าสุดเพื่อประสิทธิภาพสูงสุด',
    },
    {
      id: 'faq-8',
      category: 'technical',
      categoryLabel: 'ปัญหาเทคนิคและอุปกรณ์',
      question: 'เอกสารประกอบบทเรียน (PDF/Slide) สามารถดาวน์โหลดเก็บไว้ได้หรือไม่?',
      answer: 'ผู้เรียนสามารถดาวน์โหลดเอกสารประกอบการเรียน สไลด์บรรยาย และไฟล์ตัวอย่างทั้งหมดได้ฟรี โดยคลิกที่แท็บ "สื่อและเอกสารประกอบ" ภายในแต่ละบทเรียน ไฟล์ทั้งหมดจะถูกเปิดหรือบันทึกเป็นไฟล์ PDF ลงในอุปกรณ์ของท่าน',
    },
    {
      id: 'faq-9',
      category: 'course',
      categoryLabel: 'การเข้าเรียนและบทเรียน',
      question: 'หากต้องการติดต่อสอบถามเนื้อหากับอาจารย์ผู้สอน สามารถติดต่อผ่านช่องทางใด?',
      answer: 'ผู้เรียนสามารถติดต่ออาจารย์ผู้สอน (ผศ.ดร.เฉลิมพล บุญทศ) ได้ผ่านช่องทางดังนี้: ทางอีเมลอาจารย์ผู้สอน หรือเข้ามาพบที่ห้องพักอาจารย์สาขาวิชาครุศาสตร์อุตสาหกรรมอุตสาหการ ในวันและเวลาราชการ',
    },
  ];

  // Category counts
  const categoryStats = useMemo(() => {
    const total = faqList.length;
    let course = 0;
    let quiz = 0;
    let criteria = 0;
    let technical = 0;

    faqList.forEach((item) => {
      if (item.category === 'course') course++;
      else if (item.category === 'quiz') quiz++;
      else if (item.category === 'criteria') criteria++;
      else if (item.category === 'technical') technical++;
    });

    return { total, course, quiz, criteria, technical };
  }, []);

  // Filtered FAQ List
  const filteredFAQs = useMemo(() => {
    let result = [...faqList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          item.categoryLabel.toLowerCase().includes(q) ||
          (item.tips && item.tips.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    return result;
  }, [searchQuery, selectedCategory]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleHelpful = (id: string) => {
    setHelpfulFeedback((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  return (
    <div className="space-y-6 w-full max-w-[1500px] mx-auto pb-16">
      
      {/* Top Breadcrumb & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition flex items-center justify-center shadow-2xs"
            title="กลับหน้าหลัก"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              ศูนย์ช่วยเหลือและคำถามที่พบบ่อย (Help Center & FAQ)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              คำแนะนำการใช้งานระบบ เกณฑ์การประเมินผล และการแก้ไขปัญหาเบื้องต้น
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200 shadow-2xs font-mono">
            {courseInfo.code}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
            {faqList.length} ข้อคำถาม
          </span>
        </div>
      </div>

      {/* Official Course & Help Hero Banner (Soft Luminous Pastel Theme - Matching my-lessons Sizing) */}
      <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-sky-50/60 rounded-3xl p-6 sm:p-8 border border-blue-100/90 shadow-sm relative overflow-hidden">
        {/* Ambient soft pastel orbs */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-44 h-44 bg-amber-200/25 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-10 -top-10 w-44 h-44 bg-indigo-200/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-5">
          
          {/* Top Row: Meta Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold bg-white/95 text-blue-800 px-3.5 py-1 rounded-full flex items-center gap-1.5 border border-blue-200/80 shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{courseInfo.curriculum}</span>
              </span>
              <span className="text-xs sm:text-sm text-slate-600 font-medium">
                • {courseInfo.semester}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-mono font-bold bg-white/95 px-3.5 py-1 rounded-full border border-blue-200/80 text-blue-900 shadow-2xs">
              ศูนย์ช่วยเหลือนักศึกษา
            </span>
          </div>

          {/* Course Title - Matching exact size and line behavior of my-lessons */}
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[30px] font-bold tracking-tight text-slate-900 break-keep whitespace-normal xl:whitespace-nowrap">
              {courseInfo.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 font-medium">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{courseInfo.department}</span>
            </p>
          </div>

          {/* Bottom Row: Instructor & Fast Summary */}
          <div className="pt-4 border-t border-blue-100/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
              <div className="w-9 h-9 rounded-2xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">อาจารย์ผู้สอนประจำวิชา</span>
                <span className="text-sm sm:text-base font-bold text-slate-900">{courseInfo.instructor}</span>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 bg-white/95 px-3.5 py-2 rounded-2xl border border-blue-200/80 shadow-2xs text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-700">ระบบพร้อมให้บริการตลอด 24 ชม.</span>
            </div>
          </div>

        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>ทั้งหมด</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {categoryStats.total}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('course')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                selectedCategory === 'course'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>การเข้าเรียนและบทเรียน</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                selectedCategory === 'course' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'
              }`}>
                {categoryStats.course}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('quiz')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                selectedCategory === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>แบบทดสอบและคะแนน</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                selectedCategory === 'quiz' ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {categoryStats.quiz}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('criteria')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                selectedCategory === 'criteria'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>เกณฑ์การผ่านวิชา</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                selectedCategory === 'criteria' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {categoryStats.criteria}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('technical')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                selectedCategory === 'technical'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-amber-50 hover:text-amber-700'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>ปัญหาเทคนิคและอุปกรณ์</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                selectedCategory === 'technical' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'
              }`}>
                {categoryStats.technical}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <input
              type="text"
              placeholder="ค้นหาคำถาม, ปัญหาที่พบ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-2xs transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                title="ล้างคำค้น"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Accordion Questions List */}
      <div className="space-y-3.5">
        {filteredFAQs.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">ไม่พบคำถามที่ตรงกับคำค้นหา</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อดูคำถาม-คำตอบเพิ่มเติม หรือติดต่ออาจารย์ผู้สอนโดยตรงผ่านแบบฟอร์มด้านล่าง
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
            >
              แสดงคำถามทั้งหมด
            </button>
          </div>
        ) : (
          filteredFAQs.map((item) => {
            const isOpen = !!openItems[item.id];
            const isHelpful = !!helpfulFeedback[item.id];

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-blue-300 shadow-md ring-1 ring-blue-100'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Accordion Header Button */}
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center transition ${
                      isOpen
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                          {item.categoryLabel}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {item.question}
                      </h3>
                    </div>
                  </div>

                  <div className={`p-1.5 rounded-full text-slate-400 hover:text-slate-600 transition shrink-0 transform ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-3 sm:ml-12">
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {item.answer}
                    </p>

                    {item.steps && (
                      <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 space-y-2">
                        {item.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {item.tips && (
                      <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50/80 p-3 rounded-xl border border-amber-200/80">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item.tips}</span>
                      </div>
                    )}

                    {/* Helpful Feedback Interaction */}
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>คำตอบนี้มีประโยชน์สำหรับท่านหรือไม่?</span>
                      {isHelpful ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ขอบคุณสำหรับความคิดเห็น</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleHelpful(item.id)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>มีประโยชน์</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Support & Contact Card */}
      <div className="bg-gradient-to-br from-white to-blue-50/40 rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>ต้องการความช่วยเหลือเพิ่มเติม?</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              ติดต่ออาจารย์ผู้สอนประจำรายวิชา
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              หากท่านมีข้อสงสัยเกี่ยวกับเนื้อหาบทเรียน กิจกรรมการเรียนรู้ หรือพบปัญหาทางเทคนิค สามารถติดต่ออาจารย์ผู้สอนได้ตามรายละเอียดด้านล่าง:
            </p>

            <div className="pt-2 space-y-1.5 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-800">อาจารย์ผู้สอน:</span>
                <span>{courseInfo.instructor}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-800">อีเมลติดต่อ:</span>
                <span className="font-mono text-blue-700">{courseInfo.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-800">สถานที่ติดต่อ:</span>
                <span>{courseInfo.office}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-800">ช่วงเวลาให้คำปรึกษา:</span>
                <span>{courseInfo.officeHours}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <a
              href={`mailto:${courseInfo.email}?subject=สอบถามรายวิชานวัตกรรมและเทคโนโลยีดิจิทัล`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition active:scale-95"
            >
              <Mail className="w-4 h-4" />
              <span>ส่งอีเมลถึงอาจารย์ผู้สอน</span>
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold shadow-2xs transition"
            >
              <span>กลับสู่หน้าหลัก Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
