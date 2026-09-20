'use client';

import React, { useState } from 'react';
import { BookOpen, Sparkles, Code, Cpu, Compass, Layers } from 'lucide-react';

interface LessonCoverPosterProps {
  lesson: {
    id?: string;
    code: string;
    title: string;
    sortOrder?: number;
    coverImageUrl?: string;
  };
  className?: string;
  compact?: boolean;
  showWatermark?: boolean;
}

// ชุดสี Gradient และสไตล์ Abstract สำหรับแต่ละบทเรียน เพื่อความสดใส สวยงาม มีระดับ
const THEMES = [
  {
    bg: 'from-blue-600 via-indigo-600 to-slate-900',
    accentPill: 'bg-blue-400/20 border-blue-300/30 text-blue-100',
    glow: 'bg-blue-400/20',
    icon: BookOpen,
  },
  {
    bg: 'from-indigo-600 via-purple-600 to-slate-900',
    accentPill: 'bg-purple-400/20 border-purple-300/30 text-purple-100',
    glow: 'bg-purple-400/20',
    icon: Sparkles,
  },
  {
    bg: 'from-teal-600 via-cyan-700 to-slate-900',
    accentPill: 'bg-cyan-400/20 border-cyan-300/30 text-cyan-100',
    glow: 'bg-cyan-400/20',
    icon: Compass,
  },
  {
    bg: 'from-emerald-600 via-teal-700 to-slate-900',
    accentPill: 'bg-emerald-400/20 border-emerald-300/30 text-emerald-100',
    glow: 'bg-emerald-400/20',
    icon: Layers,
  },
  {
    bg: 'from-amber-600 via-rose-600 to-slate-900',
    accentPill: 'bg-amber-400/20 border-amber-300/30 text-amber-100',
    glow: 'bg-rose-400/20',
    icon: Cpu,
  },
  {
    bg: 'from-pink-600 via-purple-700 to-slate-900',
    accentPill: 'bg-pink-400/20 border-pink-300/30 text-pink-100',
    glow: 'bg-pink-400/20',
    icon: Code,
  },
];

export default function LessonCoverPoster({
  lesson,
  className = 'w-full h-full',
  compact = false,
  showWatermark = true,
}: LessonCoverPosterProps) {
  const [imageError, setImageError] = useState(false);

  const order = Math.max(1, lesson.sortOrder ?? 1);
  const theme = THEMES[(order - 1) % THEMES.length];
  const IconComponent = theme.icon;
  const formattedOrder = String(order).padStart(2, '0');

  // หากมีรูปภาพหน้าปกที่ถูกต้องและไม่เกิด error ให้แสดงรูปภาพจริง
  if (lesson.coverImageUrl && !imageError) {
    return (
      <div className={`relative overflow-hidden bg-slate-900 ${className}`}>
        <img
          src={lesson.coverImageUrl}
          alt={lesson.title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover group-hover:scale-105 group-hover:brightness-105 transition-all duration-500 ease-out"
        />
        {/* Subtle gradient overlay at bottom for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  // หากไม่มีรูปภาพ หรือโหลดรูปภาพไม่สำเร็จ ให้แสดง Dynamic Abstract Gradient Poster
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${theme.bg} select-none ${className}`}
    >
      {/* Background Decorative Mesh & Glow */}
      <div
        className={`absolute -top-12 -left-12 w-36 h-36 rounded-full blur-2xl pointer-events-none ${theme.glow}`}
      />
      <div
        className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-2xl pointer-events-none ${theme.glow}`}
      />

      {/* SVG Geometric Abstract Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <defs>
          <pattern
            id={`pattern-${lesson.code || order}`}
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill="#FFFFFF" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#pattern-${lesson.code || order})`} />
        {/* Abstract curve rings */}
        <circle cx="85%" cy="35%" r="70" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="4 6" />
        <circle cx="85%" cy="35%" r="100" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 5" />
      </svg>

      {/* Chapter Watermark Number */}
      {showWatermark && (
        <div className="absolute right-2 -bottom-3 text-6xl sm:text-7xl font-black text-white/10 tracking-tighter leading-none pointer-events-none font-mono">
          {formattedOrder}
        </div>
      )}

      {/* Center/Foreground Themed Badge */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
        {/* Top bar placeholder area (reserved for external badges if any) */}
        <div />

        {/* Content Badge / Title preview */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md border text-[11px] font-semibold tracking-wide shadow-xs ${theme.accentPill}`}
            >
              <IconComponent className="w-3.5 h-3.5 shrink-0" />
              <span>บทที่ {order}</span>
            </div>

            {!compact && (
              <p className="text-white font-extrabold text-sm sm:text-base line-clamp-1 drop-shadow-sm tracking-tight pr-10">
                {lesson.title}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LessonCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs animate-pulse flex flex-col justify-between transition-colors">
      <div className="h-44 bg-slate-200 dark:bg-slate-800" />
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-5 w-4/5 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
          <div className="h-9 w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

