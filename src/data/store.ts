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
import { isSupabaseConfigured } from '../lib/supabaseClient';
import {
  dbFetchUsers,
  dbUpsertUser,
  dbFetchAccessRules,
  dbFetchAnnouncements,
  dbFetchSystemSettings,
  dbUpsertSystemSettings,
  dbFetchUserProgress,
  dbUpsertUserProgress,
  dbFetchLessons,
  dbUpsertLesson,
  dbSaveAllLessons,
  dbFetchQuizzes,
  dbUpsertQuiz,
  dbSaveAllQuizzes,
} from '../lib/dbService';

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
      if (savedUser) {
        const parsedUser: UserProfile = JSON.parse(savedUser);
        if (parsedUser.avatarUrl && parsedUser.avatarUrl.includes('images.unsplash.com') && parsedUser.email?.toLowerCase() === 'bugzonvazan@gmail.com') {
          parsedUser.avatarUrl = '';
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(parsedUser));
        }
        setCurrentUser(parsedUser);
      }

      const savedUsersList = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
      if (savedUsersList) {
        const parsedList: UserProfile[] = JSON.parse(savedUsersList);
        const cleanedList = parsedList.map((u) => {
          if (u.avatarUrl && u.avatarUrl.includes('images.unsplash.com') && u.email?.toLowerCase() === 'bugzonvazan@gmail.com') {
            return { ...u, avatarUrl: '' };
          }
          return u;
        });
        setUsersList(cleanedList);
      }

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

  // ซิงค์ข้อมูลกับ Supabase ฐานข้อมูลกลาง (ถ้าเชื่อมต่อไว้)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;

    async function syncFromCloud() {
      try {
        const results = await Promise.allSettled([
          dbFetchUsers(),
          dbFetchAccessRules(),
          dbFetchAnnouncements(),
          dbFetchSystemSettings(),
          dbFetchLessons(),
          dbFetchQuizzes(),
        ]);

        if (!isMounted) return;

        const cloudUsers = results[0].status === 'fulfilled' ? results[0].value : null;
        const cloudRules = results[1].status === 'fulfilled' ? results[1].value : null;
        const cloudAnnouncements = results[2].status === 'fulfilled' ? results[2].value : null;
        const cloudSettings = results[3].status === 'fulfilled' ? results[3].value : null;
        const cloudLessons = results[4].status === 'fulfilled' ? results[4].value : null;
        const cloudQuizzes = results[5].status === 'fulfilled' ? results[5].value : null;

        if (cloudUsers !== null && Array.isArray(cloudUsers)) {
          setUsersList(cloudUsers);
          try {
            localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(cloudUsers));
          } catch (e) {}
        }

        if (cloudRules !== null && Array.isArray(cloudRules)) {
          setAccessRules(cloudRules);
          try {
            localStorage.setItem(STORAGE_KEYS.ACCESS_RULES, JSON.stringify(cloudRules));
          } catch (e) {}
        }

        if (cloudAnnouncements !== null && Array.isArray(cloudAnnouncements)) {
          setAnnouncements(cloudAnnouncements);
          try {
            localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(cloudAnnouncements));
          } catch (e) {}
        }

        if (cloudSettings) {
          setSettings(cloudSettings);
          try {
            localStorage.setItem(STORAGE_KEYS.SYSTEM_SETTINGS, JSON.stringify(cloudSettings));
          } catch (e) {}
        }

        if (cloudLessons !== null && Array.isArray(cloudLessons) && cloudLessons.length > 0) {
          setLessons(cloudLessons);
          try {
            localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(cloudLessons));
          } catch (e) {}
        }

        if (cloudQuizzes !== null && Array.isArray(cloudQuizzes) && cloudQuizzes.length > 0) {
          setQuizzes(cloudQuizzes);
          try {
            localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(cloudQuizzes));
          } catch (e) {}
        }
      } catch (err) {
        console.warn('[Supabase Sync Error]:', err);
      }
    }

    syncFromCloud();

    return () => {
      isMounted = false;
    };
  }, []);

  // ฟังก์ชันรีเฟรชข้อมูลสดจาก Cloud ด้วยตนเอง (Manual Sync)
  const refreshFromCloud = async (): Promise<boolean> => {
    if (!isSupabaseConfigured()) return false;
    try {
      const [cloudUsers, cloudRules, cloudAnnouncements, cloudSettings, cloudLessons, cloudQuizzes] = await Promise.all([
        dbFetchUsers(),
        dbFetchAccessRules(),
        dbFetchAnnouncements(),
        dbFetchSystemSettings(),
        dbFetchLessons(),
        dbFetchQuizzes(),
      ]);

      if (cloudUsers !== null && Array.isArray(cloudUsers)) {
        setUsersList(cloudUsers);
        try {
          localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(cloudUsers));
        } catch (e) {}
      }
      if (cloudRules !== null && Array.isArray(cloudRules)) {
        setAccessRules(cloudRules);
        try {
          localStorage.setItem(STORAGE_KEYS.ACCESS_RULES, JSON.stringify(cloudRules));
        } catch (e) {}
      }
      if (cloudAnnouncements !== null && Array.isArray(cloudAnnouncements)) {
        setAnnouncements(cloudAnnouncements);
        try {
          localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(cloudAnnouncements));
        } catch (e) {}
      }
      if (cloudSettings) {
        setSettings(cloudSettings);
        try {
          localStorage.setItem(STORAGE_KEYS.SYSTEM_SETTINGS, JSON.stringify(cloudSettings));
        } catch (e) {}
      }
      if (cloudLessons !== null && Array.isArray(cloudLessons) && cloudLessons.length > 0) {
        setLessons(cloudLessons);
        try {
          localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(cloudLessons));
        } catch (e) {}
      }
      if (cloudQuizzes !== null && Array.isArray(cloudQuizzes) && cloudQuizzes.length > 0) {
        setQuizzes(cloudQuizzes);
        try {
          localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(cloudQuizzes));
        } catch (e) {}
      }
      return true;
    } catch (err) {
      console.warn('Manual cloud refresh failed:', err);
      return false;
    }
  };

  // ฟังก์ชันเข้าสู่ระบบด้วย Google Account หรืออีเมลพร้อมตรวจสอบสิทธิ์ทางการ
  const loginUser = async (params: {
    email: string;
    fullName?: string;
    displayName?: string;
    avatarUrl?: string;
    studentId?: string;
  }): Promise<{ success: boolean; message?: string; role?: 'student' | 'admin'; user?: UserProfile }> => {
    const cleanEmail = params.email.trim().toLowerCase();
    const domain = cleanEmail.split('@')[1];

    // 0. ดึงกฎ Access Rules ล่าสุดสดๆ จาก Supabase Cloud หรือ LocalStorage ทันที
    let activeRules: AccessRule[] = accessRules;
    if (isSupabaseConfigured()) {
      try {
        const cloudRules = await dbFetchAccessRules();
        if (cloudRules && Array.isArray(cloudRules)) {
          activeRules = cloudRules;
          setAccessRules(cloudRules);
          try {
            localStorage.setItem(STORAGE_KEYS.ACCESS_RULES, JSON.stringify(cloudRules));
          } catch (e) {}
        }
      } catch (err) {
        console.warn('[loginUser] Failed to fetch live access rules:', err);
      }
    }

    if ((!activeRules || activeRules.length === 0) && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.ACCESS_RULES);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) activeRules = parsed;
        }
      } catch (e) {}
    }

    let role: 'student' | 'admin' = 'student';
    let name = params.fullName || params.displayName || cleanEmail.split('@')[0];

    // 1. บัญชีผู้พัฒนาหลัก (Master Admin) ได้รับอนุญาตสูงสุดเสมอ เพื่อป้องกันระบบล็อกตัวเอง
    const isMasterDev = cleanEmail === 'bugzonvazan@gmail.com';
    if (isMasterDev) {
      role = 'admin';
      name = 'Lamut (ผู้พัฒนา)';
    } else {
      // ฟังก์ชันช่วยเปรียบเทียบโดเมน (รองรับทั้งตรงกันเป๊ะ และ subdomain เช่น kkc.rmuti.ac.th กับ rmuti.ac.th)
      const matchDomainRule = (ruleVal: string, targetDomain: string) => {
        const cleanRule = ruleVal.toLowerCase().replace(/^@/, '').trim();
        const cleanTarget = targetDomain.toLowerCase().replace(/^@/, '').trim();
        return cleanTarget === cleanRule || cleanTarget.endsWith('.' + cleanRule);
      };

      // 2. ตรวจสอบกฎการปฏิเสธระดับอีเมล (Specific Email Deny)
      const dynamicDenyEmail = activeRules.find(
        (r) => r.isActive && r.type === 'email' && r.value.toLowerCase().trim() === cleanEmail && r.decision === 'deny'
      );
      if (dynamicDenyEmail || defaultAccessControlConfig.blockedEmails.map((e) => e.toLowerCase()).includes(cleanEmail)) {
        return { success: false, message: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' };
      }

      // 3. ตรวจสอบกฎการอนุญาตระดับอีเมล (Specific Email Allow / Whitelist)
      const dynamicAllowEmail = activeRules.find(
        (r) => r.isActive && r.type === 'email' && r.value.toLowerCase().trim() === cleanEmail && r.decision === 'allow'
      );

      // 4. ตรวจสอบกฎการปฏิเสธระดับโดเมน (Domain Deny)
      const dynamicDenyDomain = domain
        ? activeRules.find(
            (r) => r.isActive && r.type === 'domain' && matchDomainRule(r.value, domain) && r.decision === 'deny'
          )
        : null;

      // ถ้าโดเมนถูกระบุให้ปฏิเสธ (Deny) และไม่มีกฎอนุญาตรายอีเมล (Email Whitelist) ยกเว้นไว้ -> ต้องปฏิเสธทันที!
      if (dynamicDenyDomain && !dynamicAllowEmail) {
        return { 
          success: false, 
          message: `โดเมน "@${domain}" ถูกระงับการเข้าใช้งานตามนโยบายของระบบ กรุณาติดต่อผู้ดูแลระบบ` 
        };
      }

      // 5. ตรวจสอบสิทธิ์อนุญาต (Allow Evaluation)
      if (dynamicAllowEmail) {
        role = dynamicAllowEmail.defaultRole;
      } else {
        // ตรวจสอบกฎอนุญาตระดับโดเมน (Domain Allow)
        const dynamicAllowDomain = domain
          ? activeRules.find(
              (r) => r.isActive && r.type === 'domain' && matchDomainRule(r.value, domain) && r.decision === 'allow'
            )
          : null;

        if (dynamicAllowDomain) {
          role = dynamicAllowDomain.defaultRole || 'student';
        } else {
          // ถ้าไม่มีกฎอนุญาตใดๆ ตรงกับอีเมลหรือโดเมนนี้เลย
          return {
            success: false,
            message: `บัญชี "${cleanEmail}" ไม่ได้รับอนุญาตให้เข้าใช้งาน กรุณาติดต่อผู้ดูแลระบบเพื่อขอรับสิทธิ์เข้าใช้งาน`,
          };
        }
      }
    }

    // ค้นหาผู้ใช้เดิมใน usersList ถ้ามี หรือค้นหาจาก Supabase
    let existingUser = usersList.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!existingUser && isSupabaseConfigured()) {
      try {
        const cloudUsers = await dbFetchUsers();
        if (cloudUsers && Array.isArray(cloudUsers)) {
          existingUser = cloudUsers.find((u) => u.email.toLowerCase() === cleanEmail);
        }
      } catch (e) {}
    }

    // กำหนดรูปโปรไฟล์: ใช้รูปจริงจาก Google (params.avatarUrl) เป็นอันดับแรกสุดเสมอ
    const resolvedAvatar = params.avatarUrl
      ? params.avatarUrl
      : (existingUser?.avatarUrl && !existingUser.avatarUrl.includes('images.unsplash.com') ? existingUser.avatarUrl : '');

    let userFullName = '';
    let userDisplayName = '';
    let userStudentId = '';
    let isProfileCompleted = false;

    if (role === 'admin' || isMasterDev) {
      role = 'admin';
      userFullName = cleanEmail === 'bugzonvazan@gmail.com' ? 'Lamut (ผู้พัฒนา)' : (existingUser?.fullName || 'ผู้ดูแลระบบ');
      userDisplayName = cleanEmail === 'bugzonvazan@gmail.com' ? 'Lamut (ผู้พัฒนา)' : (existingUser?.displayName || 'ผู้ดูแลระบบ');
      userStudentId = '-';
      isProfileCompleted = true;
    } else {
      // สำหรับนักศึกษา:
      // ต้องมีรหัสนักศึกษาจริง (ไม่ใช่ '-', ไม่ใช่ '65123456789') และมีชื่อจริง (ไม่ใช่ค่าว่าง หรือชื่ออีเมล)
      const hasValidStudentId = Boolean(
        existingUser?.studentId &&
        existingUser.studentId.trim() !== '' &&
        existingUser.studentId !== '-' &&
        existingUser.studentId !== '65123456789'
      );
      const hasValidFullName = Boolean(
        existingUser?.fullName &&
        existingUser.fullName.trim() !== '' &&
        !existingUser.fullName.includes('@')
      );

      if (hasValidStudentId && hasValidFullName && existingUser?.isProfileCompleted) {
        userFullName = existingUser.fullName.trim();
        userDisplayName = existingUser.displayName?.trim() || userFullName;
        userStudentId = existingUser.studentId.trim();
        isProfileCompleted = true;
      } else {
        // บัญชีใหม่ หรือบัญชีที่ยังไม่กรอก: ให้เว้นว่างไว้ ไม่สุ่ม ไม่ใช้ชื่ออีเมล
        userFullName = '';
        userDisplayName = '';
        userStudentId = '';
        isProfileCompleted = false;
      }
    }

    const newUser: UserProfile = {
      id: existingUser ? existingUser.id : `usr-${Date.now()}`,
      email: cleanEmail,
      fullName: userFullName,
      displayName: userDisplayName,
      studentId: userStudentId,
      role,
      status: 'active',
      isProfileCompleted,
      firstLoginAt: existingUser ? existingUser.firstLoginAt : new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      avatarUrl: resolvedAvatar,
    };

    setCurrentUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    } catch (e) {
      console.error('Error saving user to localStorage:', e);
    }

    // ซิงค์เข้า usersList ทันที เพื่อให้ /admin/users แสดงรูปโปรไฟล์ Google จริง
    setUsersList((prevList) => {
      const exists = prevList.some((u) => u.email.toLowerCase() === cleanEmail);
      const updated = exists
        ? prevList.map((u) => (u.email.toLowerCase() === cleanEmail ? { ...u, ...newUser } : u))
        : [newUser, ...prevList];
      try {
        localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving usersList to localStorage:', e);
      }
      return updated;
    });

    // บันทึกลงฐานข้อมูลกลาง Supabase ทันทีเมื่อเข้าใช้งาน
    if (isSupabaseConfigured()) {
      dbUpsertUser(newUser).catch((err) => {
        console.warn('[Supabase] Failed to upsert user on login:', err);
      });

      // ดึงประวัติการเรียนของผู้ใช้จาก Supabase
      if (newUser.id) {
        dbFetchUserProgress(newUser.id).then((cloudProgress) => {
          if (cloudProgress && Object.keys(cloudProgress).length > 0) {
            setProgressMap((prev) => {
              const merged = { ...prev, ...cloudProgress };
              try {
                localStorage.setItem(STORAGE_KEYS.LEARNER_PROGRESS, JSON.stringify(merged));
              } catch (e) {}
              return merged;
            });
          }
        }).catch((err) => console.warn('[Supabase] Fetch user progress error:', err));
      }
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
      fullName: role === 'admin' ? 'ผู้ดูแลระบบ' : (currentUser.fullName || ''),
      displayName: role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : (currentUser.displayName || ''),
      studentId: role === 'admin' ? '-' : (currentUser.studentId && currentUser.studentId !== '-' ? currentUser.studentId : ''),
      isProfileCompleted: role === 'admin' ? true : Boolean(currentUser.fullName && currentUser.studentId),
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  };

  // บันทึกโปรไฟล์ที่จำเป็น (Required Profile)
  const saveRequiredProfile = async (fullName: string, studentId: string): Promise<boolean> => {
    const cleanName = fullName.trim();
    const cleanStudentId = studentId.trim();

    const updatedUser: UserProfile = {
      ...currentUser,
      fullName: cleanName,
      displayName: cleanName,
      studentId: cleanStudentId,
      isProfileCompleted: true,
      lastLoginAt: new Date().toISOString(),
    };

    setCurrentUser(updatedUser);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Error saving user to localStorage:', e);
    }

    setUsersList((prevList) => {
      const exists = prevList.some((u) => u.email.toLowerCase() === updatedUser.email.toLowerCase());
      const updated = exists
        ? prevList.map((u) => (u.email.toLowerCase() === updatedUser.email.toLowerCase() ? { ...u, ...updatedUser } : u))
        : [updatedUser, ...prevList];
      try {
        localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isSupabaseConfigured()) {
      try {
        await dbUpsertUser(updatedUser);
      } catch (err) {
        console.warn('[Supabase] Failed to upsert user on saveRequiredProfile:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('edtech_profile_saved', { detail: updatedUser }));
    }

    return true;
  };

  // อัปเดตข้อมูลโปรไฟล์ผู้เรียน (ชื่อ-นามสกุล, รหัสนักศึกษา)
  const updateUserProfile = async (data: { fullName?: string; studentId?: string; displayName?: string }) => {
    const cleanName = data.fullName !== undefined ? data.fullName.trim() : currentUser.fullName;
    const cleanStudentId = data.studentId !== undefined ? data.studentId.trim() : currentUser.studentId;
    const cleanDisplayName = data.displayName !== undefined ? data.displayName.trim() : (cleanName || currentUser.displayName);

    const isComplete = Boolean(
      currentUser.role === 'admin' ||
      (cleanName && cleanStudentId && cleanStudentId !== '-' && cleanStudentId !== '65123456789')
    );

    const updatedUser: UserProfile = {
      ...currentUser,
      fullName: cleanName,
      displayName: cleanDisplayName,
      studentId: cleanStudentId,
      isProfileCompleted: isComplete,
    };

    setCurrentUser(updatedUser);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Error saving updated user to localStorage:', e);
    }

    setUsersList((prevList) => {
      const exists = prevList.some((u) => u.email.toLowerCase() === updatedUser.email.toLowerCase());
      const updated = exists
        ? prevList.map((u) => (u.email.toLowerCase() === updatedUser.email.toLowerCase() ? { ...u, ...updatedUser } : u))
        : [updatedUser, ...prevList];
      try {
        localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isSupabaseConfigured()) {
      try {
        await dbUpsertUser(updatedUser);
      } catch (err) {}
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('edtech_profile_saved', { detail: updatedUser }));
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

      try {
        localStorage.setItem(STORAGE_KEYS.LEARNER_PROGRESS, JSON.stringify(updatedProgress));
      } catch (e) {}

      // ซิงค์ความก้าวหน้าขึ้น Supabase Cloud DB
      if (isSupabaseConfigured() && currentUser?.id) {
        dbUpsertUserProgress(updatedProgress[lessonCode]).catch((err) => {
          console.warn('[Supabase] Progress sync failed:', err);
        });
      }

      return updatedProgress;
    });
  };

  // ฟังก์ชันบันทึกความก้าวหน้า/ผลสอบของผู้เรียนลงทั้ง LocalStorage และ Supabase
  const saveUserLessonProgress = (lessonCode: string, progress: UserLessonProgress) => {
    setProgressMap((prev) => {
      const next = { ...prev, [lessonCode]: progress };
      try {
        localStorage.setItem(STORAGE_KEYS.LEARNER_PROGRESS, JSON.stringify(next));
      } catch (e) {}

      if (isSupabaseConfigured() && progress.userId) {
        dbUpsertUserProgress(progress).catch((err) => {
          console.warn('[Supabase] Failed to save user progress:', err);
        });
      }

      return next;
    });
  };

  // ฟังก์ชันบันทึกบทเรียนเดี่ยวและซิงก์ Cloud
  const saveLesson = (lesson: Lesson) => {
    setLessons((prev) => {
      const next = prev.map((l) => (l.id === lesson.id ? lesson : l));
      try {
        localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(next));
      } catch (e) {}
      if (isSupabaseConfigured()) {
        dbUpsertLesson(lesson).catch((err) => {
          console.warn('[Supabase] Failed to save lesson:', err);
        });
      }
      return next;
    });
  };

  // ฟังก์ชันบันทึกบทเรียนทั้งหมดและซิงก์ Cloud
  const saveAllLessons = async (allLessons: Lesson[]): Promise<boolean> => {
    setLessons(allLessons);
    try {
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(allLessons));
    } catch (e) {}
    if (isSupabaseConfigured()) {
      return await dbSaveAllLessons(allLessons);
    }
    return true;
  };

  // ฟังก์ชันบันทึกแบบทดสอบเดี่ยวและซิงก์ Cloud
  const saveQuiz = (quiz: Quiz) => {
    setQuizzes((prev) => {
      const idx = prev.findIndex((q) => q.id === quiz.id);
      const next = idx >= 0 ? prev.map((q) => (q.id === quiz.id ? quiz : q)) : [...prev, quiz];
      try {
        localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(next));
      } catch (e) {}
      if (isSupabaseConfigured()) {
        dbUpsertQuiz(quiz).catch((err) => {
          console.warn('[Supabase] Failed to save quiz:', err);
        });
      }
      return next;
    });
  };

  // ฟังก์ชันบันทึกแบบทดสอบทั้งหมดและซิงก์ Cloud
  const saveAllQuizzes = async (allQuizzes: Quiz[]): Promise<boolean> => {
    setQuizzes(allQuizzes);
    try {
      localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(allQuizzes));
    } catch (e) {}
    if (isSupabaseConfigured()) {
      return await dbSaveAllQuizzes(allQuizzes);
    }
    return true;
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
    setUsersList,
    setLessons,
    setQuizzes,
    setAnnouncements,
    setAccessRules,
    setSettings,
    isSupabaseLive: isSupabaseConfigured(),
    refreshFromCloud,
    saveUserLessonProgress,
    saveLesson,
    saveAllLessons,
    saveQuiz,
    saveAllQuizzes,
  };
}

