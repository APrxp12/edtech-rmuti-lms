'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { 
  BookOpen, GraduationCap, User, Users, ChevronRight, ShieldCheck, 
  MapPin, Phone, Mail, Globe, Sparkles, CheckCircle2, AlertCircle,
  LogIn, ArrowRight, Shield, X
} from 'lucide-react';
import { siteBranding } from '@/config/site-branding';
import { defaultAccessControlConfig } from '@/config/access-control';
import { useAppStore } from '@/data/store';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDirectEmailModal, setShowDirectEmailModal] = useState(false);
  const [inputEmail, setInputEmail] = useState('');
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
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'filled_blue',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            width: 340,
            locale: 'th',
            logo_alignment: 'left',
          });
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
    return () => clearInterval(timer);
  }, [googleClientId]);

  // จัดการ Credential ตอบกลับจาก Google OAuth (JWT)
  const handleGoogleCredentialResponse = (response: any) => {
    setIsLoading(true);
    setErrorMessage(null);

    const payload = parseJwt(response.credential);
    if (!payload || !payload.email) {
      setIsLoading(false);
      setErrorMessage('ไม่สามารถอ่านข้อมูลจาก Google Token ได้ กรุณาลองใหม่อีกครั้ง');
      return;
    }

    const result = loginUser({
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

  // จัดการการเข้าสู่ระบบด้วยอีเมลทางการ
  const handleDirectEmailSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputEmail.trim()) {
      setErrorMessage('กรุณาระบุอีเมล');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const result = loginUser({
        email: inputEmail.trim(),
      });

      setIsLoading(false);
      if (result.success) {
        setShowDirectEmailModal(false);
        router.push(result.role === 'admin' ? '/admin/lessons' : '/dashboard');
      } else {
        setErrorMessage(result.message || 'บัญชีนี้ไม่ได้รับอนุญาตให้เข้าใช้งาน');
      }
    }, 450);
  };

  const handleGoogleButtonClick = () => {
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setShowDirectEmailModal(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-blue-50/60 via-white to-slate-50">
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive" 
        onLoad={initGoogleSignIn} 
      />

      {/* Top Navbar matching Page 1 */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white font-bold shadow-md">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase">
                {siteBranding.universityName}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-blue-900">EDTech</span>
                <span className="text-[9px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-medium">
                  {siteBranding.platformTagline}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#about" className="hover:text-blue-600 transition">หน้าแรก</a>
            <a href="#courses" className="hover:text-blue-600 transition">รายวิชา</a>
            <a href="#lessons" className="hover:text-blue-600 transition">บทเรียน</a>
            <a href="#news" className="hover:text-blue-600 transition">ข่าวประกาศ</a>
            <a href="#contact" className="hover:text-blue-600 transition">ติดต่อ</a>
          </div>
        </div>
      </nav>

      {/* Hero Section matching Page 1 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading & Google Sign-in */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              ยินดีต้อนรับสู่ระบบการเรียนรู้ดิจิทัล
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                ยินดีต้อนรับสู่ <span className="text-blue-600">EDTech</span>
              </h1>
              <p className="text-lg sm:text-xl font-bold text-slate-700">
                {siteBranding.slogan}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {siteBranding.subSlogan}
              </p>
            </div>

            {/* Official Google Sign-In Container */}
            <div className="pt-2 max-w-md mx-auto lg:mx-0 space-y-4">
              
              {/* Google Native GSI Button Container (rendered if client ID configured) */}
              <div 
                ref={googleBtnContainerRef} 
                className={`flex justify-center lg:justify-start ${!hasGoogleClientId ? 'hidden' : ''}`}
              />

              {/* Direct Google Action Button */}
              {!hasGoogleClientId && (
                <button
                  onClick={handleGoogleButtonClick}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-[0.98] cursor-pointer"
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

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>สำหรับบัญชี <span className="font-bold text-blue-700">@rmuti.ac.th</span></span>
                <button
                  onClick={() => setShowDirectEmailModal(true)}
                  className="font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Mail className="w-3 h-3" />
                  กรอกอีเมลมหาวิทยาลัย
                </button>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 text-left animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <div className="space-y-0.5">
                    <span className="font-bold">ปฏิเสธการเข้าถึง</span>
                    <p className="text-[11px] text-red-600 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Visual Mascot & Illustration matching Page 1 */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm">
              <div className="rounded-3xl bg-gradient-to-b from-blue-600/10 to-indigo-600/20 p-6 sm:p-8 text-center border border-blue-100 shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600"
                  alt="Student illustration"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-cover rounded-2xl mx-auto shadow-md border-4 border-white"
                />
                <div className="mt-4">
                  <div className="text-xs font-bold text-blue-950">
                    “{siteBranding.motto}”
                  </div>
                  <div className="text-[10px] font-semibold text-blue-600 mt-0.5 uppercase tracking-wide">
                    {siteBranding.subMotto}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 3 Guidance Info Cards matching Page 1 */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="text-center mb-6">
            <h3 className="text-sm font-bold text-slate-800">บัญชีที่สามารถเข้าสู่ระบบได้</h3>
            <p className="text-xs text-slate-500">กรุณาใช้บัญชีของมหาวิทยาลัยหรือบัญชีที่ได้รับอนุญาตเท่านั้น</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: นักศึกษา */}
            <div 
              onClick={() => { setInputEmail('anun.j@rmuti.ac.th'); setShowDirectEmailModal(true); }}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4 hover:border-blue-300 transition cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800">นักศึกษา</div>
                <div className="text-[11px] text-blue-600 font-mono truncate">เช่น 65123456789@rmuti.ac.th</div>
                <div className="text-[10px] text-slate-400">บัญชีนักศึกษาของมหาวิทยาลัย</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition" />
            </div>

            {/* Card 2: อาจารย์และบุคลากร */}
            <div 
              onClick={() => { setInputEmail('somchai@rmuti.ac.th'); setShowDirectEmailModal(true); }}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4 hover:border-blue-300 transition cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800">อาจารย์และบุคลากร</div>
                <div className="text-[11px] text-indigo-600 font-mono truncate">เช่น somchai@rmuti.ac.th</div>
                <div className="text-[10px] text-slate-400">บัญชีบุคลากรของมหาวิทยาลัย</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition" />
            </div>

            {/* Card 3: บัญชีที่ได้รับอนุญาต */}
            <div 
              onClick={() => { setInputEmail('special.student@gmail.com'); setShowDirectEmailModal(true); }}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4 hover:border-blue-300 transition cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800">บัญชีที่ได้รับอนุญาต (Whitelist)</div>
                <div className="text-[11px] text-emerald-600 font-mono truncate">เช่น special.student@gmail.com</div>
                <div className="text-[10px] text-slate-400">บัญชีที่มหาวิทยาลัยอนุญาตให้ใช้งาน</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition" />
            </div>

          </div>
        </div>
      </main>

      {/* Official Sign-In Modal */}
      {showDirectEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">เข้าสู่ระบบด้วยอีเมลทางการ</h3>
                  <p className="text-[11px] text-slate-500">มทร.อีสาน วิทยาเขตขอนแก่น</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowDirectEmailModal(false); setErrorMessage(null); }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDirectEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ระบุอีเมล Google หรืออีเมลมหาวิทยาลัย
                </label>
                <input
                  type="email"
                  placeholder="เช่น anun.j@rmuti.ac.th"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  autoFocus
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  ต้องเป็นโดเมน @rmuti.ac.th หรืออีเมลที่อยู่ในรายชื่อ Whitelist
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowDirectEmailModal(false); setErrorMessage(null); }}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <LogIn className="w-3.5 h-3.5" />
                      <span>ยืนยันเข้าสู่ระบบ</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer matching Page 1 */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <div className="font-bold text-slate-200 text-xs">{siteBranding.universityName}</div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {siteBranding.address}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-500" /> {siteBranding.phone}</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-500" /> {siteBranding.email}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400">
            {siteBranding.taglineFooter}
          </div>
        </div>
      </footer>

    </div>
  );
}
