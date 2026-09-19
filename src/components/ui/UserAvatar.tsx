'use client';

import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: string;
  showGoogleBadge?: boolean;
  alt?: string;
}

// ชุดสีพื้นหลังสไตล์ Google Avatar ที่ดูนุ่มนวล ทันสมัย และอ่านง่าย
const GOOGLE_AVATAR_COLORS = [
  'bg-blue-600 text-white',
  'bg-emerald-600 text-white',
  'bg-indigo-600 text-white',
  'bg-violet-600 text-white',
  'bg-amber-600 text-white',
  'bg-rose-600 text-white',
  'bg-teal-600 text-white',
  'bg-sky-600 text-white',
];

function getAvatarColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GOOGLE_AVATAR_COLORS[Math.abs(hash) % GOOGLE_AVATAR_COLORS.length];
}

function getInitialLetter(name?: string | null, email?: string | null): string {
  const target = (name || email || 'U').trim();
  // ข้ามคำนำหน้าชื่อทางการของไทยเพื่อให้ได้ตัวอักษรแรกของชื่อจริงๆ
  const cleaned = target.replace(/^(นาย|นางสาว|นาง|ผศ\.ดร\.|รศ\.ดร\.|ศ\.ดร\.|ดร\.|อาจารย์|ผศ\.|รศ\.|ศ\.)\s*/gi, '').trim();
  return (cleaned.charAt(0) || 'U').toUpperCase();
}

export function UserAvatar({
  src,
  name,
  email,
  className = '',
  size = 'sm',
  rounded = 'rounded-xl',
  showGoogleBadge = false,
  alt,
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // เมื่อ src เปลี่ยนแปลง ให้รีเซ็ต error state เพื่อลองโหลดภาพใหม่
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // กำหนดขนาดมาตรฐานถ้าไม่มีการ override ใน className
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-24 h-24 sm:w-28 sm:h-28 text-2xl sm:text-3xl',
  }[size];

  const initial = getInitialLetter(name, email);
  const colorClass = getAvatarColor(name || email || 'default');
  const isGoogle = (src && src.includes('googleusercontent.com')) || (email && email.toLowerCase().endsWith('@gmail.com'));

  const hasValidImage = src && src.trim() !== '' && !hasError;

  return (
    <div className={`relative shrink-0 select-none overflow-hidden ${rounded} ${className || sizeClasses}`}>
      {hasValidImage ? (
        <img
          src={src}
          alt={alt || name || 'User Avatar'}
          // ป้องกันข้อผิดพลาด HTTP 403 Forbidden จาก Google CDN โดยการไม่ส่ง Referer ข้ามโดเมน
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover ${rounded}`}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center font-bold tracking-wider ${colorClass} ${rounded} shadow-2xs`}
        >
          {initial}
        </div>
      )}

      {/* Google Badge เล็กๆ ถ้าต้องการแสดง */}
      {showGoogleBadge && isGoogle && (
        <div
          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full p-0.5 shadow-xs flex items-center justify-center"
          title="บัญชี Google"
        >
          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
