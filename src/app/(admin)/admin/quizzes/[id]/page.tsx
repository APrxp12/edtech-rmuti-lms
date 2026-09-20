'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Plus, HelpCircle, Save, AlertTriangle, CheckCircle2, 
  Trash2, MoveUp, MoveDown, Shield, Eye, ExternalLink, Sparkles,
  Building2, User, Clock, Check, X, Edit3, ArrowRight, ArrowLeftRight,
  ListChecks, Award, Settings, Shuffle, FileText, ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { Quiz, QuizVersion, QuizQuestion, QuizOption, QuizType, ScorePolicy } from '@/types';
import { dbUpsertQuiz } from '@/lib/dbService';

export default function AdminQuizBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const quizParamId = params.id as string;
  const { lessons, quizzes, setQuizzes, isSupabaseLive } = useAppStore();

  // Course Information Constants matching the official syllabus
  const courseInfo = {
    code: '30-401-001-204',
    title: 'นวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้',
    instructor: 'ผศ.ดร.เฉลิมพล บุญทศ',
    semester: 'ภาคการศึกษาที่ 1 / ปีการศึกษา 2569',
    curriculum: 'หลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต (ค.อ.บ.)',
    department: 'สาขาวิชาครุศาสตร์อุตสาหกรรมอุตสาหการ คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น',
  };

  // 1. Resolve target lesson accurately from route param (which can be lesson code like RMUTI-001, lesson id like lsn-001, or quiz id)
  const lesson = useMemo(() => {
    // Check by code (e.g. RMUTI-001)
    const byCode = lessons.find((l) => l.code.toLowerCase() === quizParamId.toLowerCase());
    if (byCode) return byCode;

    // Check by id (e.g. lsn-001)
    const byId = lessons.find((l) => l.id.toLowerCase() === quizParamId.toLowerCase());
    if (byId) return byId;

    // Check by quiz id if a direct quiz id was passed
    const matchedQuiz = quizzes.find((q) => q.id.toLowerCase() === quizParamId.toLowerCase());
    if (matchedQuiz) {
      const byQuizLesson = lessons.find((l) => l.id === matchedQuiz.lessonId);
      if (byQuizLesson) return byQuizLesson;
    }

    return undefined;
  }, [lessons, quizParamId, quizzes]);

  // Tab switcher state: 'pre_test' or 'post_test'
  const [activeQuizType, setActiveQuizType] = useState<QuizType>('pre_test');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Find or create quiz definition for this lesson and current active type
  const targetQuiz = useMemo(() => {
    if (!lesson) return null;
    const existing = quizzes.find((q) => q.lessonId === lesson.id && q.type === activeQuizType);
    if (existing) return existing;

    // Fallback default structure for this lesson and quiz type
    const isPre = activeQuizType === 'pre_test';
    return {
      id: `quiz-${isPre ? 'pre' : 'post'}-${lesson.code.toLowerCase()}`,
      lessonId: lesson.id,
      type: activeQuizType,
      title: isPre 
        ? `แบบทดสอบก่อนเรียน (Pre-test) บทที่ ${lesson.sortOrder} ${lesson.title}`
        : `แบบทดสอบหลังเรียน (Post-test) บทที่ ${lesson.sortOrder} ${lesson.title}`,
      currentPublishedVersionId: `qv-${isPre ? 'pre' : 'post'}-${lesson.id}-v1`,
      versions: [
        {
          id: `qv-${isPre ? 'pre' : 'post'}-${lesson.id}-v1`,
          quizId: `quiz-${isPre ? 'pre' : 'post'}-${lesson.code.toLowerCase()}`,
          versionTag: 'v1.0',
          passScorePercent: isPre ? 0 : 60,
          maxAttempts: isPre ? 1 : 3,
          scorePolicy: 'highest' as ScorePolicy,
          shuffleQuestions: false,
          shuffleOptions: false,
          showExplanation: !isPre,
          status: 'published' as const,
          learnerCount: 0,
          updatedAt: new Date().toISOString(),
          questions: [],
        },
      ],
    };
  }, [quizzes, lesson, activeQuizType]);

  const activeVer = targetQuiz?.versions?.[0];

  // Form states for Quiz Settings
  const [passScore, setPassScore] = useState<number>(activeVer?.passScorePercent ?? (activeQuizType === 'pre_test' ? 0 : 60));
  const [maxAttempts, setMaxAttempts] = useState<number>(activeVer?.maxAttempts ?? (activeQuizType === 'pre_test' ? 1 : 3));
  const [scorePolicy, setScorePolicy] = useState<ScorePolicy>(activeVer?.scorePolicy || 'highest');
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(activeVer?.shuffleQuestions ?? false);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(activeVer?.shuffleOptions ?? false);
  const [showExplanation, setShowExplanation] = useState<boolean>(activeVer?.showExplanation ?? (activeQuizType === 'post_test'));
  
  // Questions list state
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => activeVer?.questions || []);

  // Synchronize states whenever switching between Pre-test and Post-test or when lesson changes
  useEffect(() => {
    if (activeVer) {
      setPassScore(activeVer.passScorePercent ?? (activeQuizType === 'pre_test' ? 0 : 60));
      setMaxAttempts(activeVer.maxAttempts ?? (activeQuizType === 'pre_test' ? 1 : 3));
      setScorePolicy(activeVer.scorePolicy || 'highest');
      setShuffleQuestions(activeVer.shuffleQuestions ?? false);
      setShuffleOptions(activeVer.shuffleOptions ?? false);
      setShowExplanation(activeVer.showExplanation ?? (activeQuizType === 'post_test'));
      setQuestions(activeVer.questions || []);
    }
  }, [activeQuizType, targetQuiz?.id]);

  // Question counts for tab badges
  const preTestQuiz = lesson ? quizzes.find((q) => q.lessonId === lesson.id && q.type === 'pre_test') : undefined;
  const postTestQuiz = lesson ? quizzes.find((q) => q.lessonId === lesson.id && q.type === 'post_test') : undefined;
  const preTestCount = preTestQuiz?.versions[0]?.questions?.length || (activeQuizType === 'pre_test' ? questions.length : 0);
  const postTestCount = postTestQuiz?.versions[0]?.questions?.length || (activeQuizType === 'post_test' ? questions.length : 0);

  // Total points calculation
  const totalPoints = useMemo(() => {
    return questions.reduce((sum, q) => sum + (q.points || 1), 0);
  }, [questions]);

  // --- QUESTION MODAL (Add & Edit) ---
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [modalQuestionText, setModalQuestionText] = useState('');
  const [modalPoints, setModalPoints] = useState(1);
  const [modalExplanation, setModalExplanation] = useState('');
  const [modalOptions, setModalOptions] = useState<QuizOption[]>([
    { id: 'opt-1', optionText: '', isCorrect: true, sortOrder: 1 },
    { id: 'opt-2', optionText: '', isCorrect: false, sortOrder: 2 },
    { id: 'opt-3', optionText: '', isCorrect: false, sortOrder: 3 },
    { id: 'opt-4', optionText: '', isCorrect: false, sortOrder: 4 },
  ]);

  // Open modal to add a new question
  const handleOpenAddModal = () => {
    setEditingQuestionId(null);
    setModalQuestionText('');
    setModalPoints(1);
    setModalExplanation('');
    setModalOptions([
      { id: `opt-${Date.now()}-1`, optionText: '', isCorrect: true, sortOrder: 1 },
      { id: `opt-${Date.now()}-2`, optionText: '', isCorrect: false, sortOrder: 2 },
      { id: `opt-${Date.now()}-3`, optionText: '', isCorrect: false, sortOrder: 3 },
      { id: `opt-${Date.now()}-4`, optionText: '', isCorrect: false, sortOrder: 4 },
    ]);
    setIsQuestionModalOpen(true);
  };

  // Open modal to edit existing question
  const handleOpenEditModal = (q: QuizQuestion) => {
    setEditingQuestionId(q.id);
    setModalQuestionText(q.questionText);
    setModalPoints(q.points || 1);
    setModalExplanation(q.explanation || '');
    setModalOptions(q.options.map((opt) => ({ ...opt })));
    setIsQuestionModalOpen(true);
  };

  // Select correct option in modal
  const handleSelectCorrectOption = (index: number) => {
    setModalOptions((prev) =>
      prev.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === index,
      }))
    );
  };

  // Update option text in modal
  const handleOptionTextChange = (index: number, text: string) => {
    setModalOptions((prev) =>
      prev.map((opt, idx) => (idx === index ? { ...opt, optionText: text } : opt))
    );
  };

  // Save question from modal
  const handleSaveQuestionModal = () => {
    if (!modalQuestionText.trim()) return;

    if (editingQuestionId) {
      // Update existing question
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestionId
            ? {
                ...q,
                questionText: modalQuestionText.trim(),
                points: modalPoints,
                explanation: modalExplanation.trim() || undefined,
                options: modalOptions,
              }
            : q
        )
      );
    } else {
      // Create new question
      const newQuestion: QuizQuestion = {
        id: `q-${Date.now()}`,
        questionText: modalQuestionText.trim(),
        questionType: 'single_choice',
        points: modalPoints,
        explanation: modalExplanation.trim() || undefined,
        sortOrder: questions.length + 1,
        options: modalOptions,
        status: 'active',
      };
      setQuestions((prev) => [...prev, newQuestion]);
    }

    setIsQuestionModalOpen(false);
  };

  // Move question position up/down
  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const nextList = [...questions];
    const temp = nextList[index];
    nextList[index] = nextList[targetIndex];
    nextList[targetIndex] = temp;
    setQuestions(nextList.map((q, idx) => ({ ...q, sortOrder: idx + 1 })));
  };

  // Delete question
  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id).map((q, idx) => ({ ...q, sortOrder: idx + 1 })));
  };

  // Save all Quiz Settings and Questions into store, localStorage, & Supabase Cloud
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAllQuiz = async () => {
    if (!lesson) return;
    setIsSaving(true);
    const versionId = activeVer?.id || `qv-${activeQuizType === 'pre_test' ? 'pre' : 'post'}-${lesson.id}-v1`;
    const quizId = targetQuiz?.id || `quiz-${activeQuizType === 'pre_test' ? 'pre' : 'post'}-${lesson.code.toLowerCase()}`;
    const updatedQuizVersion: QuizVersion = {
      id: versionId,
      quizId: quizId,
      versionTag: activeVer?.versionTag || 'v1.0',
      passScorePercent: Number(passScore),
      maxAttempts: Number(maxAttempts),
      scorePolicy,
      shuffleQuestions,
      shuffleOptions,
      showExplanation,
      status: 'published',
      learnerCount: activeVer?.learnerCount ?? 0,
      questions,
      updatedAt: new Date().toISOString(),
    };

    const existingQuizIndex = quizzes.findIndex(
      (q) => q.lessonId === lesson.id && q.type === activeQuizType
    );

    let updatedQuizzes: Quiz[];
    let quizToSave: Quiz;
    if (existingQuizIndex >= 0) {
      quizToSave = {
        ...quizzes[existingQuizIndex],
        title: activeQuizType === 'pre_test'
          ? `แบบทดสอบก่อนเรียน (Pre-test) บทที่ ${lesson.sortOrder} ${lesson.title}`
          : `แบบทดสอบหลังเรียน (Post-test) บทที่ ${lesson.sortOrder} ${lesson.title}`,
        versions: [updatedQuizVersion, ...(quizzes[existingQuizIndex].versions.slice(1))],
      };
      updatedQuizzes = quizzes.map((q, idx) => (idx === existingQuizIndex ? quizToSave : q));
    } else {
      quizToSave = {
        id: `quiz-${activeQuizType === 'pre_test' ? 'pre' : 'post'}-${lesson.code.toLowerCase()}`,
        lessonId: lesson.id,
        type: activeQuizType,
        title: activeQuizType === 'pre_test'
          ? `แบบทดสอบก่อนเรียน (Pre-test) บทที่ ${lesson.sortOrder} ${lesson.title}`
          : `แบบทดสอบหลังเรียน (Post-test) บทที่ ${lesson.sortOrder} ${lesson.title}`,
        currentPublishedVersionId: updatedQuizVersion.id,
        versions: [updatedQuizVersion],
      };
      updatedQuizzes = [...quizzes, quizToSave];
    }

    setQuizzes(updatedQuizzes);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('edtech_quizzes', JSON.stringify(updatedQuizzes));
      } catch (e) {}
    }

    if (isSupabaseLive) {
      try {
        await dbUpsertQuiz(quizToSave);
      } catch (e) {
        console.warn('[Supabase] Failed to upsert quiz:', e);
      }
    }

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  if (!lesson) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">ไม่พบบทเรียนที่ต้องการจัดการข้อสอบ</h2>
        <p className="text-sm text-slate-500">
          ไม่พบบทเรียนรหัส &ldquo;{quizParamId}&rdquo; ในระบบ อาจเนื่องจากยังไม่ได้สร้างบทเรียน หรือบทเรียนถูกลบไปแล้ว
        </p>
        <Link
          href="/admin/lessons"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปยังหน้ารายการบทเรียน</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-2 sm:px-4">
      
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <Link
            href="/admin/lessons"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับสู่รายการบทเรียนทั้งหมด</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              Quiz CMS Management
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono font-bold text-slate-600">
              {lesson.code}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            จัดการแบบทดสอบ: บทที่ {lesson.sortOrder} {lesson.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            สร้างและแก้ไขแบบทดสอบก่อนเรียน (Pre-test) และแบบทดสอบหลังเรียน (Post-test) พร้อมระบบประเมินผลอิสระ
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Database Status Indicator */}
          {isSupabaseLive ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>ฐานข้อมูล Cloud (Live)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>หน่วยความจำเครื่อง</span>
            </div>
          )}

          <Link
            href={`/lessons/${lesson.code}/${activeQuizType === 'pre_test' ? 'pre-test' : 'post-test'}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
            title="เปิดดูในมุมมองผู้เรียนในแท็บใหม่"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>มุมมองผู้เรียน ({activeQuizType === 'pre_test' ? 'Pre-test' : 'Post-test'})</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            disabled={isSaving}
            onClick={handleSaveAllQuiz}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-200 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกแบบทดสอบ'}</span>
          </button>
        </div>
      </div>

      {/* Compact Single-Row Segmented Tab Switcher (Pre-test vs Post-test) */}
      <div className="flex items-center">
        <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/90 gap-1.5 shadow-2xs">
          
          {/* Tab 1: Pre-test */}
          <button
            type="button"
            onClick={() => setActiveQuizType('pre_test')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeQuizType === 'pre_test'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white hover:bg-blue-50/80 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-400 shadow-2xs'
            }`}
          >
            <HelpCircle className={`w-3.5 h-3.5 ${activeQuizType === 'pre_test' ? 'text-white' : 'text-blue-600'}`} />
            <span>แบบทดสอบก่อนเรียน (Pre-test)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeQuizType === 'pre_test' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {preTestCount} ข้อ
            </span>
          </button>

          {/* Tab 2: Post-test */}
          <button
            type="button"
            onClick={() => setActiveQuizType('post_test')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeQuizType === 'post_test'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white hover:bg-blue-50/80 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-400 shadow-2xs'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeQuizType === 'post_test' ? 'text-white' : 'text-emerald-600'}`} />
            <span>แบบทดสอบหลังเรียน (Post-test)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeQuizType === 'post_test' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {postTestCount} ข้อ
            </span>
          </button>

        </div>
      </div>

      {/* Save Success Toast Alert */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-950">บันทึกแบบทดสอบและข้อคำถามสำเร็จเรียบร้อย!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                การเปลี่ยนแปลงชุดข้อสอบ ({activeQuizType === 'pre_test' ? 'Pre-test' : 'Post-test'}) มีผลต่อผู้เรียนทันที
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSaveSuccess(false)}
            className="p-1 text-emerald-700 hover:text-emerald-900 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Course Hero Banner (Soft Luminous Pastel Theme) */}
      <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-sky-50/60 rounded-3xl p-6 sm:p-7 border border-blue-100/90 shadow-sm relative overflow-hidden">
        {/* Ambient soft pastel orbs */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-44 h-44 bg-amber-200/25 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-10 -top-10 w-44 h-44 bg-indigo-200/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          
          {/* Top Row: Meta Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold bg-white/95 text-blue-800 px-3.5 py-1 rounded-full flex items-center gap-1.5 border border-blue-200/80 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>บทที่ {lesson.sortOrder} • {lesson.code}</span>
              </span>
              <span className="text-xs sm:text-sm text-slate-600 font-medium">
                • {courseInfo.code}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-white/95 px-3 py-1 rounded-full border border-blue-200/80 text-blue-900 shadow-2xs">
                {activeQuizType === 'pre_test' ? 'แบบทดสอบก่อนเรียน' : 'แบบทดสอบหลังเรียน'}
              </span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                เวอร์ชัน v1.0
              </span>
            </div>
          </div>

          {/* Lesson Title */}
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              {activeQuizType === 'pre_test' ? 'แบบทดสอบก่อนเรียน (Pre-test)' : 'แบบทดสอบหลังเรียน (Post-test)'}: {lesson.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 font-medium">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{courseInfo.title} ({courseInfo.department})</span>
            </p>
          </div>

          {/* Bottom Row: Instructor & Live Quiz KPI Highlights */}
          <div className="pt-3.5 border-t border-blue-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
              <div className="w-9 h-9 rounded-2xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">อาจารย์ผู้รับผิดชอบรายวิชา</span>
                <span className="text-sm sm:text-base font-bold text-slate-900">{courseInfo.instructor}</span>
              </div>
            </div>

            {/* Live Highlights */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-blue-200/80 shadow-2xs flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-700">{questions.length} ข้อคำถาม</span>
              </div>
              <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-amber-200/80 shadow-2xs flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-semibold text-slate-700">{totalPoints} คะแนนเต็ม</span>
              </div>
              <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-emerald-200/80 shadow-2xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-slate-700">
                  {activeQuizType === 'pre_test' ? 'ไม่มีเกณฑ์ล็อก (0%)' : `เกณฑ์ผ่าน ${passScore}%`}
                </span>
              </div>
              <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-indigo-200/80 shadow-2xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold text-slate-700">ทำได้สูงสุด {maxAttempts} ครั้ง</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* QUIZ SETTINGS CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-2xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                การตั้งค่าเกณฑ์แบบทดสอบ ({activeQuizType === 'pre_test' ? 'Pre-test Settings' : 'Post-test Settings'})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeQuizType === 'pre_test'
                  ? 'แบบทดสอบก่อนเรียนใช้วัดระดับความรู้พื้นฐานก่อนเริ่มเรียน (มักไม่จำกัดเกณฑ์ผ่าน และให้ทำเพียง 1 ครั้ง)'
                  : 'แบบทดสอบหลังเรียนใช้วัดผลสัมฤทธิ์การเรียนรู้ นำคะแนนไปคิดในเกรด และปลดล็อกความคืบหน้าของบทเรียน'}
              </p>
            </div>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Pass Score % */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              คะแนนผ่านเกณฑ์ (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              max={100}
              disabled={activeQuizType === 'pre_test'}
              value={passScore}
              onChange={(e) => setPassScore(Number(e.target.value))}
              className={`w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 font-bold ${
                activeQuizType === 'pre_test' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-900'
              }`}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {activeQuizType === 'pre_test' ? 'Pre-test ไม่มีเกณฑ์ขั้นต่ำ' : 'เกณฑ์แนะนำ 60% หรือ 70%'}
            </p>
          </div>

          {/* Max Attempts */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              จำนวนครั้งสูงสุดที่ทำได้ (Max Attempts) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 font-bold text-slate-900"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {activeQuizType === 'pre_test' ? 'แนะนำ 1 ครั้ง' : 'กำหนด 1-5 ครั้งตามความเหมาะสม'}
            </p>
          </div>

          {/* Score Policy */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              นโยบายการคิดคะแนน (Score Policy)
            </label>
            <select
              value={scorePolicy}
              onChange={(e) => setScorePolicy(e.target.value as ScorePolicy)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 font-bold text-slate-800"
            >
              <option value="highest">คะแนนสูงสุด (Best Score)</option>
              <option value="latest">คะแนนครั้งล่าสุด (Latest Score)</option>
              <option value="first">คะแนนครั้งแรก (First Attempt)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              สูตรการคำนวณคะแนนสุทธิเพื่อบันทึกลงในระบบ
            </p>
          </div>

        </div>

        {/* Toggles */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-6 text-xs text-slate-700">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={shuffleQuestions}
              onChange={(e) => setShuffleQuestions(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="font-semibold">สลับลำดับข้อคำถาม (Shuffle Questions)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={shuffleOptions}
              onChange={(e) => setShuffleOptions(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="font-semibold">สลับลำดับตัวเลือก (Shuffle Options)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showExplanation}
              onChange={(e) => setShowExplanation(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="font-semibold">แสดงเฉลยและคำอธิบายหลังส่งข้อสอบ (Show Explanation)</span>
          </label>
        </div>

      </div>

      {/* QUESTIONS MANAGEMENT SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
        
        {/* Header & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-2xs">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  รายการข้อคำถาม ({questions.length} ข้อ)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  รวม {totalPoints} คะแนน
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                เพิ่ม แก้ไข จัดเรียงลำดับคำถาม และกำหนดเฉลยที่ถูกต้อง
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-200 flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มคำถามใหม่</span>
          </button>
        </div>

        {/* Questions Table (No Horizontal Scroll) */}
        {questions.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-3">
            <ListChecks className="w-10 h-10 text-slate-300 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-slate-700">ยังไม่มีข้อคำถามในแบบทดสอบชุดนี้</p>
              <p className="text-xs text-slate-400 mt-0.5">กดปุ่ม "+ เพิ่มคำถามใหม่" ด้านบนเพื่อเริ่มสร้างข้อสอบ</p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มคำถามข้อแรก</span>
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 text-center w-14">#</th>
                  <th className="py-3 px-3">คำถาม และ ตัวเลือก</th>
                  <th className="py-3 px-3 w-48 hidden sm:table-cell">คำตอบที่ถูกต้อง</th>
                  <th className="py-3 px-3 text-center w-24 hidden md:table-cell">คะแนน</th>
                  <th className="py-3 px-3 text-right pr-4 w-28">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {questions.map((q, idx) => {
                  const correctOption = q.options.find((o) => o.isCorrect) || q.options[0];
                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition group">
                      
                      {/* Index & Reorder */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <span className="font-bold text-slate-700 text-xs">{idx + 1}</span>
                          <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition">
                            <button
                              type="button"
                              onClick={() => handleMoveQuestion(idx, 'up')}
                              disabled={idx === 0}
                              className="p-0.5 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                              title="เลื่อนขึ้น"
                            >
                              <MoveUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveQuestion(idx, 'down')}
                              disabled={idx === questions.length - 1}
                              className="p-0.5 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                              title="เลื่อนลง"
                            >
                              <MoveDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Question Text & Options Preview */}
                      <td className="py-3 px-3">
                        <div className="space-y-1 min-w-0">
                          <p className="font-bold text-slate-900 leading-snug break-words">
                            {q.questionText}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] pt-1">
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={opt.id || oIdx}
                                className={`px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1.5 ${
                                  opt.isCorrect
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                                    : 'bg-slate-50 text-slate-600 border-slate-200/80'
                                }`}
                              >
                                {opt.isCorrect && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                                <span className="truncate">{opt.optionText}</span>
                              </div>
                            ))}
                          </div>
                          {q.explanation && (
                            <p className="text-[11px] text-amber-700 bg-amber-50/70 p-1.5 rounded-lg border border-amber-200/70 mt-1">
                              💡 <strong>เฉลย:</strong> {q.explanation}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Correct Option Badge */}
                      <td className="py-3 px-3 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200 text-[11px] max-w-[180px] truncate" title={correctOption?.optionText}>
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{correctOption?.optionText || 'ตัวเลือก ก'}</span>
                        </span>
                      </td>

                      {/* Points */}
                      <td className="py-3 px-3 text-center font-bold text-slate-700 whitespace-nowrap hidden md:table-cell">
                        {q.points || 1} คะแนน
                      </td>

                      {/* Action buttons: Edit & Delete */}
                      <td className="py-3 px-3 text-right pr-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(q)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                            title="แก้ไขคำถามข้อนี้"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                            title="ลบคำถามข้อนี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* QUESTION MODAL (Add / Edit) */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {editingQuestionId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingQuestionId ? 'แก้ไขข้อคำถาม' : 'เพิ่มข้อคำถามใหม่'} ({activeQuizType === 'pre_test' ? 'Pre-test' : 'Post-test'})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    ระบุคำถาม ตัวเลือก และเลือกคำตอบที่ถูกต้อง
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ข้อความคำถาม *
              </label>
              <textarea
                rows={3}
                value={modalQuestionText}
                onChange={(e) => setModalQuestionText(e.target.value)}
                placeholder="พิมพ์โจทย์คำถามที่ต้องการถาม เช่น ความหมายของนวัตกรรมการศึกษา..."
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium text-slate-900 leading-relaxed"
              ></textarea>
            </div>

            {/* Points */}
            <div className="w-40">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                คะแนนสำหรับข้อนี้
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={modalPoints}
                onChange={(e) => setModalPoints(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold"
              />
            </div>

            {/* Options List with Radio selection for correct answer */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800">
                ตัวเลือกคำตอบ (เลือกวงกลมสีเขียวที่ตัวเลือกที่เป็นคำตอบที่ถูกต้อง) *
              </label>

              {modalOptions.map((opt, idx) => (
                <div
                  key={opt.id || idx}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border transition ${
                    opt.isCorrect
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <label className="flex items-center gap-1.5 cursor-pointer pl-1">
                    <input
                      type="radio"
                      name="correct-option"
                      checked={opt.isCorrect}
                      onChange={() => handleSelectCorrectOption(idx)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      {idx === 0 ? 'A.' : idx === 1 ? 'B.' : idx === 2 ? 'C.' : 'D.'}
                    </span>
                  </label>

                  <input
                    type="text"
                    value={opt.optionText}
                    onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                    placeholder={`พิมพ์ข้อความตัวเลือก ${idx === 0 ? 'ก' : idx === 1 ? 'ข' : idx === 2 ? 'ค' : 'ง'}`}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />

                  {opt.isCorrect && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                      เฉลยถูกต้อง
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                คำอธิบายเฉลย (แสดงให้นักศึกษาเห็นหลังการสอบ Post-test)
              </label>
              <textarea
                rows={2}
                value={modalExplanation}
                onChange={(e) => setModalExplanation(e.target.value)}
                placeholder="ระบุเหตุผลหรือคำอธิบายเพิ่มเติม เช่น ข้อนี้ถูกต้องเนื่องจาก..."
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700"
              ></textarea>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveQuestionModal}
                disabled={!modalQuestionText.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                {editingQuestionId ? 'บันทึกการแก้ไข' : 'เพิ่มคำถาม'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
