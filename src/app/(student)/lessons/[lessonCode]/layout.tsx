'use client';

import React from 'react';
import { LessonAccessGuard } from '@/components/shared/LessonAccessGuard';

export default function LessonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LessonAccessGuard>{children}</LessonAccessGuard>;
}
