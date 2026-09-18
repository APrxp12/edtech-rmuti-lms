'use client';

import React, { useState } from 'react';
import { 
  Megaphone, Plus, Trash2, Edit, CheckCircle2, Calendar, AlertTriangle, Image as ImageIcon
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { Announcement } from '@/types';
import { ImageUploadField } from '@/components/shared/FileUploadBox';

export default function AdminAnnouncementsPage() {
  const { announcements, setAnnouncements } = useAppStore();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [publishDate, setPublishDate] = useState('2025-04-15');
  const [expireDate, setExpireDate] = useState('2025-05-31');
  const [dateError, setDateError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    if (new Date(expireDate) <= new Date(publishDate)) {
      setDateError('วันหมดอายุต้องมากกว่าวันที่เผยแพร่');
      return;
    }

    setDateError(null);
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title,
      body,
      imageUrl: imageUrl.trim() || undefined,
      category: 'announcement',
      status: 'published',
      publishedAt: new Date(publishDate).toISOString(),
      expiresAt: new Date(expireDate).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAnnouncements([newAnn, ...announcements]);
    setTitle('');
    setBody('');
    setImageUrl('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header matching Page 22 */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-blue-600" />
          จัดการข่าวประกาศ (Announcements)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          สร้าง แก้ไข และจัดการข่าวประกาศสำหรับนักศึกษาในระบบ
        </p>
      </div>

      {/* Announcements Table matching Page 22 */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800">รายการข่าวประกาศ ({announcements.length} รายการ)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-xs">
              <tr>
                <th className="py-3.5 px-4 min-w-[240px]">หัวข้อข่าวประกาศ</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px]">สถานะ</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">วันที่เผยแพร่</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">วันหมดอายุ</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[80px]">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {announcements.map((ann) => (
                <tr key={ann.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-3">
                      {ann.imageUrl && (
                        <img
                          src={ann.imageUrl}
                          alt={ann.title}
                          className="w-12 h-12 object-cover rounded-xl shrink-0 border border-slate-200"
                        />
                      )}
                      <div>
                        <div className="font-bold text-slate-900">{ann.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{ann.body}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 whitespace-nowrap">
                      เผยแพร่แล้ว
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap text-xs">
                    {new Date(ann.publishedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap text-xs">
                    {new Date(ann.expiresAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => setAnnouncements(announcements.filter((a) => a.id !== ann.id))}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="ลบประกาศ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Announcement Form matching Page 22 */}
      <form onSubmit={handleCreate} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          สร้าง / แก้ไขข่าวประกาศ
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">หัวข้อข่าวประกาศ *</label>
          <input
            type="text"
            placeholder="เช่น เปิดภาคการศึกษา รายวิชานวัตกรรม..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียด *</label>
          <textarea
            rows={4}
            placeholder="กรอกรายละเอียดข่าวประกาศ..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            required
          ></textarea>
        </div>

        <div>
          <ImageUploadField
            label="รูปภาพประกอบข่าวประกาศ (แนบไฟล์จากเครื่อง หรือระบุ URL)"
            sublabel="อัปโหลดภาพจากเครื่อง หรือใส่ URL ภาพ (จะแสดงบนการ์ดข่าวสารในหน้า Dashboard ของผู้เรียน)"
            currentUrl={imageUrl}
            onImageSelected={(url) => setImageUrl(url)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">วันที่เผยแพร่</label>
            <input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">วันหมดอายุ</label>
            <input
              type="date"
              value={expireDate}
              onChange={(e) => setExpireDate(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {dateError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>{dateError}</span>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            + บันทึกและเผยแพร่ข่าวประกาศ
          </button>
        </div>
      </form>

    </div>
  );
}
