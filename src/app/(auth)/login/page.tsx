'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { 
  BookOpen, GraduationCap, User, 
  MapPin, Phone, Mail, Sparkles, AlertCircle
} from 'lucide-react';
import { siteBranding } from '@/config/site-branding';
import { useAppStore } from '@/data/store';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTheme } from '@/components/providers/ThemeProvider';

declare global {
  interface Window {
    google?: any;
  }
}

// ถอดรหัส Google JWT Token (ID Token)
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT token', e);
    return null;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useAppStore();
  const { resolvedTheme } = useTheme();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGoogleClientId, setHasGoogleClientId] = useState(false);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '673577931640-pte3gf8lh69ttmamh0gcsahohir9aq42.apps.googleusercontent.com';

  const initGoogleSignIn = () => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';

          // คำนวณความกว้างปุ่มให้พอดีกับหน้าจอ ไม่ล้นขอบในจอมือถือ (200 - 400 px)
          const screenWidth = window.innerWidth;
          let btnWidth = 400;
          if (screenWidth < 360) {
            btnWidth = 280;
          } else if (screenWidth < 480) {
            btnWidth = 320;
          } else if (screenWidth < 768) {
            btnWidth = 360;
          } else {
            btnWidth = 400;
          }

          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'filled_blue',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            width: btnWidth,
            locale: 'th',
            logo_alignment: 'left',
          });

          // ป้องกันและลบกรอบสีขาวรอบปุ่ม Google ในโหมด Dark Mode
          const fixIframeStyles = () => {
            if (googleBtnContainerRef.current) {
              const iframes = googleBtnContainerRef.current.querySelectorAll('iframe');
              iframes.forEach((iframe) => {
                iframe.style.backgroundColor = 'transparent';
                iframe.style.colorScheme = 'light';
                iframe.style.borderRadius = '9999px';
                iframe.style.overflow = 'hidden';
              });
              const divs = googleBtnContainerRef.current.querySelectorAll('div');
              divs.forEach((div) => {
                div.style.backgroundColor = 'transparent';
                div.style.colorScheme = 'light';
              });
            }
          };

          fixIframeStyles();
          setTimeout(fixIframeStyles, 50);
          setTimeout(fixIframeStyles, 200);
          setTimeout(fixIframeStyles, 600);

          const observer = new MutationObserver(() => {
            fixIframeStyles();
          });
          observer.observe(googleBtnContainerRef.current, { childList: true, subtree: true });

          setHasGoogleClientId(true);
        }
      } catch (err) {
        console.error('Error initializing Google Sign-In:', err);
      }
    }
  };

  useEffect(() => {
    if (window.google?.accounts?.id) {
      initGoogleSignIn();
    }
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        initGoogleSignIn();
        clearInterval(timer);
      }
    }, 300);

    const handleResize = () => {
      initGoogleSignIn();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [googleClientId, resolvedTheme]);

  // จัดการ Credential ตอบกลับจาก Google OAuth (JWT)
  const handleGoogleCredentialResponse = async (response: any) => {
    setIsLoading(true);
    setErrorMessage(null);

    const payload = parseJwt(response.credential);
    if (!payload || !payload.email) {
      setIsLoading(false);
      setErrorMessage('ไม่สามารถอ่านข้อมูลจาก Google Token ได้ กรุณาลองใหม่อีกครั้ง');
      return;
    }

    const result = await loginUser({
      email: payload.email,
      fullName: payload.name || payload.email.split('@')[0],
      displayName: payload.name || payload.email.split('@')[0],
      avatarUrl: payload.picture,
    });

    setIsLoading(false);
    if (result.success) {
      router.push(result.role === 'admin' ? '/admin/lessons' : '/dashboard');
    } else {
      setErrorMessage(result.message || 'บัญชีนี้ไม่ได้รับอนุญาตให้เข้าใช้งาน');
    }
  };

  const handleManualGoogleClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-blue-50/70 via-white to-slate-50 dark:from-slate-950 dark:via-[#0B0F19] dark:to-slate-950 text-slate-900 dark:text-slate-100">
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive" 
        onLoad={initGoogleSignIn} 
      />

      {/* Top Navbar */}
      <nav className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white font-bold shadow-md shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate max-w-[180px] xs:max-w-[280px] sm:max-w-none">
                <span className="xs:hidden">มทร.อีสาน ขอนแก่น</span>
                <span className="hidden xs:inline sm:hidden">มทร.อีสาน วิทยาเขตขอนแก่น</span>
                <span className="hidden sm:inline">{siteBranding.universityName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-xl font-black text-blue-900 dark:text-blue-400 tracking-tight">EDTech</span>
              </div>
            </div>
          </div>
          <div className="shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Heading & Google Sign-in */}
          <div className="lg:col-span-7 flex flex-col items-center text-center space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-[11px] sm:text-sm font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              ยินดีต้อนรับสู่ระบบการเรียนรู้ดิจิทัล
            </div>

            <div className="space-y-2 sm:space-y-3.5 max-w-2xl">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                ยินดีต้อนรับสู่ <span className="text-blue-600 dark:text-blue-400">EDTech</span>
              </h1>
              <p className="text-base sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-200 leading-snug">
                {siteBranding.slogan}
              </p>
              <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                {siteBranding.subSlogan}
              </p>
            </div>

            {/* Official Google Sign-In Container */}
            <div className="pt-1 sm:pt-3 w-full max-w-md flex flex-col items-center space-y-3 sm:space-y-4">
              
              {/* Google Native GSI Button Container */}
              <div 
                className="gsi-button-wrapper flex justify-center items-center w-full max-w-[420px] rounded-full overflow-hidden transition"
                style={{ colorScheme: 'light', backgroundColor: 'transparent' }}
              >
                <div 
                  ref={googleBtnContainerRef} 
                  id="googleBtnContainer"
                  className="flex justify-center items-center w-full rounded-full overflow-hidden transition"
                  style={{ colorScheme: 'light', backgroundColor: 'transparent' }}
                />
              </div>

              {/* Fallback button while GSI script initializes */}
              {!hasGoogleClientId && (
                <button
                  onClick={handleManualGoogleClick}
                  disabled={isLoading}
                  className="w-full max-w-[320px] sm:max-w-[420px] flex items-center justify-center gap-3 py-3 sm:py-4 px-5 sm:px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-lg shadow-lg shadow-blue-200 dark:shadow-none hover:shadow-xl transition-all active:scale-[0.98] cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 bg-white p-0.5 rounded-full" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>เข้าสู่ระบบด้วย Google</span>
                    </>
                  )}
                </button>
              )}

              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 text-center font-medium">
                สำหรับบัญชี Google <span className="font-bold text-blue-700 dark:text-blue-400">@rmuti.ac.th</span> และบัญชีที่ได้รับอนุญาต
              </p>

              {errorMessage && (
                <div className="w-full max-w-[380px] p-3 sm:p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5 sm:gap-3 text-left animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 text-red-500" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs sm:text-sm">ปฏิเสธการเข้าถึง</span>
                    <p className="text-[11px] sm:text-xs text-red-600 dark:text-red-400 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Visual Mascot & Illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md">
              <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-b from-blue-600/10 to-indigo-600/20 dark:from-blue-900/20 dark:to-indigo-900/30 p-5 sm:p-8 lg:p-10 text-center border border-blue-100 dark:border-blue-900/40 shadow-md sm:shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=700"
                  alt="Student illustration"
                  className="w-36 h-36 sm:w-56 sm:h-56 lg:w-64 lg:h-64 object-cover rounded-2xl sm:rounded-3xl mx-auto shadow-md sm:shadow-lg border-2 sm:border-4 border-white dark:border-slate-800"
                />
                <div className="mt-4 sm:mt-6 space-y-1">
                  <div className="text-xs sm:text-base font-bold text-blue-950 dark:text-blue-200">
                    “{siteBranding.motto}”
                  </div>
                  <div className="text-[10px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {siteBranding.subMotto}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Guidance Info Announcement Cards */}
        <div className="mt-8 sm:mt-14 pt-6 sm:pt-10 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center mb-5 sm:mb-8 space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">บัญชีที่สามารถเข้าสู่ระบบได้</h3>
            <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400">กรุณาใช้บัญชี Google ของมหาวิทยาลัยหรือบัญชีที่ได้รับอนุญาตเท่านั้น</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-6 max-w-3xl mx-auto">
            
            {/* Card 1: นักศึกษา */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5 sm:gap-4 select-none">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">นักศึกษา</div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono truncate">เช่น 65123456789@rmuti.ac.th</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">บัญชีนักศึกษาของมหาวิทยาลัย</div>
              </div>
            </div>

            {/* Card 2: อาจารย์และบุคลากร */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5 sm:gap-4 select-none">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">อาจารย์และบุคลากร</div>
                <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono truncate">เช่น somchai@rmuti.ac.th</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">บัญชีบุคลากรของมหาวิทยาลัย</div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 sm:py-6 border-t border-slate-800 mt-8 sm:mt-12">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-center md:text-left">
          <div className="space-y-1">
            <div className="font-bold text-slate-200 text-xs">{siteBranding.universityName}</div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-4 text-[10px] sm:text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {siteBranding.address}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-500" /> {siteBranding.phone}</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-500" /> {siteBranding.email}</span>
            </div>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400">
            {siteBranding.taglineFooter}
          </div>
        </div>
      </footer>

    </div>
  );
}
