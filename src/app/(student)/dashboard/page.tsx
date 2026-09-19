'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Play, BookOpen, CheckCircle2, Award, Search, ArrowRight, 
  Clock, Lock, Megaphone, FileText, Calendar, RefreshCw, AlertTriangle, Eye
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { EmptyStateCard } from '@/components/shared/SharedDialogs';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { currentUser, lessons, announcements, progressMap } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('order');
  
  // Filter lessons
  const filteredLessons = lessons.filter((lesson) => 
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full max-w-[1440px] mx-auto">
      {/* Top Banner & Overall Progress Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Greeting Hero matching Page 3 */}
            <div className="lg:col-span-5 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg flex flex-col justify-between">
              <div className="relative z-10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full text-blue-50">
                  ยินดีต้อนรับกลับเข้าสู่ระบบ
                </span>
                <h1 className="text-xl sm:text-2xl font-black leading-snug">
                  สวัสดีวัน {currentUser.fullName || 'น.ส.ทพรรณ ใจดี'}
                </h1>
                <p className="text-xs text-blue-100 italic">
                  “เรียนรู้วันนี้ เพื่ออนาคตที่ดีกว่า”
                </p>
              </div>

              <div className="relative z-10 pt-6">
                <p className="text-[11px] font-medium text-blue-200">
                  “การเรียนรู้สร้างโอกาสใหม่ ให้กับตัวคุณ”
                </p>
              </div>

              <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Overall Progress matching Page 3 */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700">ความก้าวหน้าโดยรวม</h3>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  5 จาก 8 บทเรียน
                </span>
              </div>

              <div className="flex items-center gap-4 my-3">
                {/* Circular Ring Simulation 62% */}
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500"
                      strokeDasharray="62, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-slate-800">62%</span>
                </div>

                <div className="space-y-1">
                  <div className="w-36 sm:w-44 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '62%' }}></div>
                  </div>
                  <p className="text-[11px] font-bold text-slate-800">คุณกำลังไปได้ดี!</p>
                  <p className="text-[10px] text-slate-400">ทำต่ออีก 3 บทเรียน เพื่อให้ครบทั้งหมด</p>
                </div>
              </div>
            </div>

            {/* Quick Stats Counters matching Page 3 */}
            <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <h3 className="text-xs font-bold text-slate-700">สรุปกิจกรรมของฉัน</h3>
              
              <div className="space-y-3 my-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-600">
                    <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                    วิดีโอที่รับชมแล้ว
                  </span>
                  <span className="font-bold text-slate-800">28 / 36 คลิป</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    แบบทดสอบที่ทำแล้ว
                  </span>
                  <span className="font-bold text-slate-800">9 / 16 ครั้ง</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-600">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    บทเรียนที่ผ่านเกณฑ์
                  </span>
                  <span className="font-bold text-slate-800">4 / 8 บทเรียน</span>
                </div>
              </div>
            </div>

          </div>

          {/* Section 1: ข่าวประกาศล่าสุด (Announcements) matching Page 3 */}
          <section id="announcements" className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">ข่าวประกาศล่าสุด</h2>
              </div>
              <a href="#announcements" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                ดูทั้งหมด <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {announcements.length === 0 ? (
              <EmptyStateCard
                title="ขณะนี้ยังไม่มีข่าวประกาศ"
                description="เมื่อมีข่าวประกาศใหม่จากอาจารย์ผู้สอน จะแสดงที่นี่ทันที"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition flex flex-col justify-between space-y-2"
                  >
                    {ann.imageUrl && (
                      <div className="w-full h-32 rounded-xl overflow-hidden mb-1 border border-slate-100">
                        <img src={ann.imageUrl} alt={ann.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ann.category === 'announcement'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : ann.category === 'update'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {ann.category === 'announcement' ? 'ประกาศ' : ann.category === 'update' ? 'อัปเดต' : 'กิจกรรม'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(ann.publishedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-2">{ann.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{ann.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 2: บทเรียนทั้งหมด (All Lessons Grid) matching Page 3 */}
          <section id="lessons" className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">บทเรียนทั้งหมด (8 บทเรียน)</h2>
              </div>

              {/* Search & Sort Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ค้นหาบทเรียน..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 w-48"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="order">เรียงตามลำดับบทเรียน</option>
                  <option value="progress">เรียงตามความก้าวหน้า</option>
                </select>
              </div>
            </div>

            {filteredLessons.length === 0 ? (
              <EmptyStateCard
                title="ยังไม่มีบทเรียนให้เรียนในขณะนี้"
                description="เมื่อมีบทเรียนที่เปิดให้เรียน จะแสดงที่นี่ทันที"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredLessons.map((lesson) => {
                  const progress = progressMap[lesson.code] || {
                    progressPercent: 0,
                    status: 'not_started',
                  };

                  const isCompleted = progress.progressPercent === 100 && progress.status === 'passed';
                  const isInProgress = progress.progressPercent > 0 && progress.progressPercent < 100;
                  const isReadyForPostTest = progress.status === 'content_completed' || (progress.progressPercent === 100 && progress.status !== 'passed');
                  const isNotStarted = progress.progressPercent === 0 && lesson.status === 'published';
                  const isLocked = lesson.status === 'draft';

                  const destinationUrl = isLocked
                    ? '#'
                    : isCompleted
                    ? `/lessons/${lesson.code}/intro?mode=review`
                    : isInProgress
                    ? `/lessons/${lesson.code}/learn`
                    : isReadyForPostTest
                    ? `/lessons/${lesson.code}/post-test`
                    : `/lessons/${lesson.code}/intro`;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => !isLocked && router.push(destinationUrl)}
                      className={`bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-400 transition-all flex flex-col justify-between group ${
                        isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                      }`}
                    >
                      {/* Card Thumbnail / Header */}
                      <div className="relative h-36 bg-slate-100 overflow-hidden">
                        {lesson.coverImageUrl ? (
                          <img
                            src={lesson.coverImageUrl}
                            alt={lesson.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-300">
                            <BookOpen className="w-8 h-8" />
                          </div>
                        )}

                        {/* Number Badge */}
                        <div className="absolute top-2.5 left-2.5 w-7 h-7 rounded-xl bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-md">
                          {lesson.sortOrder}
                        </div>

                        {/* Status Tag Pill matching Page 3 */}
                        <div className="absolute top-2.5 right-2.5">
                          {isCompleted ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-xs">
                              เสร็จสิ้น
                            </span>
                          ) : isInProgress ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-xs">
                              กำลังเรียน
                            </span>
                          ) : isReadyForPostTest ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-xs">
                              รอทำแบบทดสอบ
                            </span>
                          ) : isLocked ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-400 text-white shadow-xs">
                              ยังไม่เปิดเรียน
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                              ยังไม่ได้เริ่ม
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition">
                            {lesson.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                            {lesson.description}
                          </p>

                          {/* Media Badges */}
                          <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500 font-medium">
                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                              <Play className="w-3 h-3 text-blue-600" />
                              {lesson.versions[0]?.videos?.length || 2} คลิป
                            </span>
                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                              <FileText className="w-3 h-3 text-emerald-600" />
                              {lesson.versions[0]?.resources?.length || 1} สื่อ
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar matching Page 3 */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>ความก้าวหน้า</span>
                            <span className="font-bold text-slate-800">{isLocked ? '-' : `${progress.progressPercent}%`}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isCompleted ? 'bg-emerald-500' : isReadyForPostTest ? 'bg-amber-500' : 'bg-blue-600'
                              }`}
                              style={{ width: isLocked ? '0%' : `${progress.progressPercent}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Dynamic Action Buttons matching Page 3 */}
                        <div className="pt-2">
                          {isCompleted ? (
                            <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                              <Link
                                href={`/lessons/${lesson.code}/intro?mode=review`}
                                className="py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1 border border-emerald-200 transition"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                ทบทวน
                              </Link>
                              <Link
                                href={`/lessons/${lesson.code}/result`}
                                className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition"
                              >
                                <Award className="w-3.5 h-3.5 text-blue-600" />
                                ดูผล
                              </Link>
                            </div>
                          ) : isInProgress ? (
                            <Link
                              href={`/lessons/${lesson.code}/learn`}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              เรียนต่อ
                            </Link>
                          ) : isReadyForPostTest ? (
                            <Link
                              href={`/lessons/${lesson.code}/post-test`}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              ทำแบบทดสอบหลังเรียน
                            </Link>
                          ) : isLocked ? (
                            <button
                              disabled
                              className="w-full py-2 px-3 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              ยังไม่เปิดเรียน
                            </button>
                          ) : (
                            <Link
                              href={`/lessons/${lesson.code}/intro`}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full py-2 px-3 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                            >
                              <Play className="w-3.5 h-3.5 fill-blue-600" />
                              เริ่มเรียน
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
  );
}
