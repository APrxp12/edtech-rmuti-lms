/**
 * In-Memory & LocalStorage Reactive Store for Client Execution
 * จัดการ State ทั้งหมดแบบรวมศูนย์ รองรับการรีเฟรชหน้าเว็บโดยข้อมูลไม่หาย
 */
'use client';

import { useState, useEffect } from 'react';
import {
  UserProfile,
  Lesson,
  Quiz,
  Announcement,
  AccessRule,
  UserLessonProgress,
  QuizAttempt,
  LearnerLessonStatus,
} from '../types';
import {
  initialCurrentUser,
  initialAdminUser,
  initialLessons,
  initialQuizzes,
  initialAnnouncements,
  initialAccessRules,
  mockUsersList,
} from './mock-data';
import { initialSystemSettings, SystemSettings } from '../config/system-settings';
import { defaultAccessControlConfig } from '../config/access-control';

const STORAGE_KEYS = {
  USER: 'edtech_current_user',
  USERS_LIST: 'edtech_users_list',
  LESSONS: 'edtech_lessons',
  QUIZZES: 'edtech_quizzes',
  ANNOUNCEMENTS: 'edtech_announcements',
  ACCESS_RULES: 'edtech_access_rules',
  SYSTEM_SETTINGS: 'edtech_settings',
  LEARNER_PROGRESS: 'edtech_learner_progress',
};

export function useAppStore() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialCurrentUser);
  const [usersList, setUsersList] = useState<UserProfile[]>(mockUsersList);
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [accessRules, setAccessRules] = useState<AccessRule[]>(initialAccessRules);
  const [settings, setSettings] = useState<SystemSettings>(initialSystemSettings);
  const [progressMap, setProgressMap] = useState<Record<string, UserLessonProgress>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // โหลดจาก LocalStorage เมื่อรันฝั่ง Client
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      const savedUsersList = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
      if (savedUsersList) setUsersList(JSON.parse(savedUsersList));

      const savedLessons = localStorage.getItem(STORAGE_KEYS.LESSONS);
      if (savedLessons) setLessons(JSON.parse(savedLessons));

      const savedQuizzes = localStorage.getItem(STORAGE_KEYS.QUIZZES);
      if (savedQuizzes) setQuizzes(JSON.parse(savedQuizzes));

      const savedAnnouncements = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (savedAnnouncements) setAnnouncements(JSON.parse(savedAnnouncements));

      const savedRules = localStorage.getItem(STORAGE_KEYS.ACCESS_RULES);
      if (savedRules) setAccessRules(JSON.parse(savedRules));

      const savedSettings = localStorage.getItem(STORAGE_KEYS.SYSTEM_SETTINGS);
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedProgress = localStorage.getItem(STORAGE_KEYS.LEARNER_PROGRESS);
      if (savedProgress) {
        setProgressMap(JSON.parse(savedProgress));
      } else {
        // Initial Mock Progress matching Visual Reference Page 3 & 5
        const defaultProgress: Record<string, UserLessonProgress> = {
          'RMUTI-001': {
            userId: initialCurrentUser.id,
            lessonId: 'lsn-001',
            assignedVersionId: 'ver-001-v1',
            status: 'passed',
            progressPercent: 100,
            isPreTestCompleted: true,
            preTestScore: { score: 8, max: 10, percent: 80 },
            isPostTestUnlocked: true,
            bestPostTestScorePercent: 90,
            postTestAttempts: [
              {
                id: 'att-1',
                quizId: 'quiz-post-001',
                quizVersionId: 'qv-post-001',
                quizType: 'post_test',
                attemptNumber: 1,
                scoreObtained: 7,
                maxScore: 10,
                scorePercent: 70,
                isPassed: true,
                isCountedInFinal: false,
                submittedAt: '2025-04-15T10:30:00Z',
                answers: [],
              },
              {
                id: 'att-2',
                quizId: 'quiz-post-001',
                quizVersionId: 'qv-post-001',
                quizType: 'post_test',
                attemptNumber: 2,
                scoreObtained: 9,
                maxScore: 10,
                scorePercent: 90,
                isPassed: true,
                isCountedInFinal: true,
                submittedAt: '2025-04-16T14:20:00Z',
                answers: [],
              },
            ],
            preTestAttempts: [],
            watchedVideos: {
              'vid-1-1': { progressPercent: 100, isCompleted: true, watchedSeconds: 735, lastPositionSeconds: 735 },
              'vid-1-2': { progressPercent: 100, isCompleted: true, watchedSeconds: 870, lastPositionSeconds: 870 },
            },
            lastAccessedAt: '2025-04-16T14:20:00Z',
          },
          'RMUTI-002': {
            userId: initialCurrentUser.id,
            lessonId: 'lsn-002',
            assignedVersionId: 'ver-002-v1',
            status: 'passed',
            progressPercent: 100,
            isPreTestCompleted: true,
            preTestScore: { score: 7, max: 10, percent: 70 },
            isPostTestUnlocked: true,
            bestPostTestScorePercent: 80,
            postTestAttempts: [],
            preTestAttempts: [],
            watchedVideos: {},
            lastAccessedAt: '2025-04-14T11:00:00Z',
          },
          'RMUTI-003': {
            userId: initialCurrentUser.id,
            lessonId: 'lsn-003',
            assignedVersionId: 'ver-003-v1',
            status: 'in_progress',
            progressPercent: 60, // 3 จาก 5 วิดีโอ
            isPreTestCompleted: true,
            preTestScore: { score: 8, max: 10, percent: 80 },
            isPostTestUnlocked: false,
            postTestAttempts: [],
            preTestAttempts: [],
            watchedVideos: {
              'vid-3-1': { progressPercent: 100, isCompleted: true, watchedSeconds: 755, lastPositionSeconds: 755 },
              'vid-3-2': { progressPercent: 100, isCompleted: true, watchedSeconds: 620, lastPositionSeconds: 620 },
              'vid-3-3': { progressPercent: 100, isCompleted: true, watchedSeconds: 910, lastPositionSeconds: 910 },
            },
            lastAccessedAt: '2025-04-18T10:00:00Z',
          },
          'RMUTI-005': {
            userId: initialCurrentUser.id,
            lessonId: 'lsn-005',
            assignedVersionId: 'ver-005-v1',
            status: 'passed',
            progressPercent: 100,
            isPreTestCompleted: true,
            isPostTestUnlocked: true,
            postTestAttempts: [],
            preTestAttempts: [],
            watchedVideos: {},
            lastAccessedAt: '2025-04-10T15:00:00Z',
          },
          'RMUTI-006': {
            userId: initialCurrentUser.id,
            lessonId: 'lsn-006',
            assignedVersionId: 'ver-006-v1',
            status: 'in_progress',
            progressPercent: 40,
            isPreTestCompleted: true,
            isPostTestUnlocked: false,
            postTestAttempts: [],
            preTestAttempts: [],
            watchedVideos: {},
            lastAccessedAt: '2025-04-12T09:30:00Z',
          },
          'RMUTI-007': {
            userId: initialCurrentUser.id,
            lessonId: 'lsn-007',
            assignedVersionId: 'ver-007-v1',
            status: 'content_completed', // ดูครบแล้ว รอทำแบบทดสอบ
            progressPercent: 100,
            isPreTestCompleted: true,
            isPostTestUnlocked: true,
            postTestAttempts: [],
            preTestAttempts: [],
            watchedVideos: {},
            lastAccessedAt: '2025-04-11T16:00:00Z',
          },
        };
        setProgressMap(defaultProgress);
      }
    } catch (e) {
      console.error('Error loading store from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // ฟังก์ชันเข้าสู่ระบบด้วย Google Account หรืออีเมลพร้อมตรวจสอบสิทธิ์ทางการ
  const loginUser = (params: {
    email: string;
    fullName?: string;
    displayName?: string;
    avatarUrl?: string;
    studentId?: string;
  }): { success: boolean; message?: string; role?: 'student' | 'admin'; user?: UserProfile } => {
    const cleanEmail = params.email.trim().toLowerCase();
    const domain = cleanEmail.split('@')[1];

    // 1. ตรวจสอบว่าโดเมนหรืออีเมลถูกบล็อกหรือไม่
    if (defaultAccessControlConfig.blockedEmails.includes(cleanEmail)) {
      return { success: false, message: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' };
    }

    // 2. ตรวจสอบ Whitelist อีเมลก่อนเสมอ (Precedence)
    const whitelisted = defaultAccessControlConfig.emailWhitelist.find(
      (w) => w.email.toLowerCase() === cleanEmail
    );

    let role: 'student' | 'admin' = 'student';
    let name = params.fullName || params.displayName || cleanEmail.split('@')[0];

    if (whitelisted) {
      role = whitelisted.role;
      if (whitelisted.name && !params.fullName) {
        name = whitelisted.name;
      }
    } else if (domain && defaultAccessControlConfig.allowedDomains.includes(domain)) {
      role = 'student';
    } else {
      return {
        success: false,
        message: `บัญชี "${cleanEmail}" ไม่ได้รับอนุญาตให้เข้าใช้งาน กรุณาใช้บัญชี @rmuti.ac.th หรือติดต่ออาจารย์ผู้สอนเพื่อเพิ่มใน Whitelist`,
      };
    }

    // สกัดรหัสนักศึกษาถ้ามี
    const extractedStudentId = params.studentId || (role === 'admin' ? '-' : (/^\d+$/.test(cleanEmail.split('@')[0]) ? cleanEmail.split('@')[0] : '65123456789'));

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      fullName: name,
      displayName: params.displayName || name,
      studentId: extractedStudentId,
      role,
      status: 'active',
      isProfileCompleted: true,
      firstLoginAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      avatarUrl: params.avatarUrl || (role === 'admin' ? initialAdminUser.avatarUrl : initialCurrentUser.avatarUrl),
    };

    setCurrentUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    } catch (e) {
      console.error('Error saving user to localStorage:', e);
    }

    return { success: true, role, user: newUser };
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (e) {
      console.error('Error removing user from localStorage:', e);
    }
  };

  // ฟังก์ชันสลับ Role (คงไว้สำหรับกรณีจำเป็นในการทดสอบหลังบ้าน)
  const switchRole = (role: 'student' | 'admin') => {
    const updatedUser = {
      ...currentUser,
      role,
      fullName: role === 'admin' ? 'นายสมชาย ใจดี' : 'น.ส.ทพรรณ ใจดี',
      displayName: role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'น.ส.ทพรรณ ใจดี',
      studentId: role === 'admin' ? '-' : '65123456789',
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  };

  // บันทึกโปรไฟล์ที่จำเป็น (Required Profile)
  const saveRequiredProfile = (fullName: string, studentId: string) => {
    const updatedUser = {
      ...currentUser,
      fullName,
      studentId,
      isProfileCompleted: true,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  };

  // อัปเดตข้อมูลโปรไฟล์ผู้เรียน (ชื่อ-นามสกุล, รหัสนักศึกษา)
  const updateUserProfile = (data: { fullName?: string; studentId?: string; displayName?: string }) => {
    const updatedUser: UserProfile = {
      ...currentUser,
      fullName: data.fullName !== undefined ? data.fullName.trim() : currentUser.fullName,
      displayName: data.displayName !== undefined ? data.displayName.trim() : (data.fullName ? data.fullName.trim() : currentUser.displayName),
      studentId: data.studentId !== undefined ? data.studentId.trim() : currentUser.studentId,
      isProfileCompleted: true,
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Error saving updated user to localStorage:', e);
    }
    return updatedUser;
  };

  // บันทึกความคืบหน้าวิดีโอ (Progress ห้ามถอยหลัง)
  const updateVideoProgress = (
    lessonCode: string,
    videoId: string,
    percent: number,
    watchedSec: number
  ) => {
    setProgressMap((prev) => {
      const currentLesson = prev[lessonCode] || {
        userId: currentUser.id,
        lessonId: lessonCode,
        assignedVersionId: 'v1',
        status: 'in_progress',
        progressPercent: 0,
        isPreTestCompleted: false,
        isPostTestUnlocked: false,
        postTestAttempts: [],
        preTestAttempts: [],
        watchedVideos: {},
        lastAccessedAt: new Date().toISOString(),
      };

      const existingVideo = currentLesson.watchedVideos[videoId] || {
        progressPercent: 0,
        isCompleted: false,
        watchedSeconds: 0,
        lastPositionSeconds: 0,
      };

      // เกณฑ์สมบูรณ์ตาม Settings (เช่น 60% หรือ 90%)
      const isNowCompleted = percent >= settings.videoThresholdPercent || existingVideo.isCompleted;

      const updatedVideos = {
        ...currentLesson.watchedVideos,
        [videoId]: {
          progressPercent: Math.max(existingVideo.progressPercent, percent),
          isCompleted: isNowCompleted,
          watchedSeconds: Math.max(existingVideo.watchedSeconds, watchedSec),
          lastPositionSeconds: watchedSec,
          completedAt: isNowCompleted ? (existingVideo.completedAt || new Date().toISOString()) : undefined,
        },
      };

      // คำนวณ Progress รวมของบทเรียน
      // รวม Pre-test (1) + Required Videos (N) + Post-test (1)
      const targetLesson = lessons.find((l) => l.code === lessonCode);
      const activeVersion = targetLesson?.versions[0];
      const requiredVideos = activeVersion?.videos.filter((v) => v.isRequired) || [];
      const totalActivities = 1 + requiredVideos.length + 1; // Pre + Videos + Post

      let completedActivities = currentLesson.isPreTestCompleted ? 1 : 0;
      requiredVideos.forEach((v) => {
        if (updatedVideos[v.id]?.isCompleted) completedActivities++;
      });
      if (currentLesson.status === 'passed' || currentLesson.status === 'completed_not_passed') {
        completedActivities++;
      }

      const calculatedPercent = Math.min(100, Math.round((completedActivities / totalActivities) * 100));
      const allVideosDone = requiredVideos.every((v) => updatedVideos[v.id]?.isCompleted);

      const nextStatus: LearnerLessonStatus = currentLesson.status === 'passed'
        ? 'passed'
        : currentLesson.status === 'completed_not_passed'
        ? 'completed_not_passed'
        : allVideosDone
        ? 'content_completed'
        : 'in_progress';

      const updatedProgress = {
        ...prev,
        [lessonCode]: {
          ...currentLesson,
          watchedVideos: updatedVideos,
          progressPercent: Math.max(currentLesson.progressPercent, calculatedPercent),
          isPostTestUnlocked: currentLesson.isPreTestCompleted && allVideosDone,
          status: nextStatus,
          lastAccessedAt: new Date().toISOString(),
        },
      };

      localStorage.setItem(STORAGE_KEYS.LEARNER_PROGRESS, JSON.stringify(updatedProgress));
      return updatedProgress;
    });
  };

  return {
    isLoaded,
    currentUser,
    usersList,
    lessons,
    quizzes,
    announcements,
    accessRules,
    settings,
    progressMap,
    loginUser,
    logout,
    switchRole,
    saveRequiredProfile,
    updateUserProfile,
    updateVideoProgress,
    setCurrentUser,
    setLessons,
    setQuizzes,
    setAnnouncements,
    setAccessRules,
    setSettings,
  };
}
