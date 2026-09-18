'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, FileText, Image as ImageIcon, CheckCircle2, 
  X, AlertCircle, Link as LinkIcon, Paperclip
} from 'lucide-react';
import { LessonResource } from '@/types';

interface FileUploadBoxProps {
  onAddResource: (resource: Omit<LessonResource, 'id' | 'sortOrder' | 'status'>) => void;
  defaultLocation?: 'intro' | 'content' | 'both';
}

export function FileUploadBox({ onAddResource, defaultLocation = 'content' }: FileUploadBoxProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  
  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [resType, setResType] = useState<'pdf' | 'infographic' | 'pptx' | 'canva' | 'link'>('pdf');
  const [displayLocation, setDisplayLocation] = useState<'intro' | 'content' | 'both'>(defaultLocation);
  const [fileSizeText, setFileSizeText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleProcessFile = (file: File) => {
    setSelectedFile(file);
    setFileSizeText(formatFileSize(file.size));

    // Auto title from filename without extension
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setTitle(nameWithoutExt);

    // Auto detect type
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.pdf')) {
      setResType('pdf');
      const blobUrl = URL.createObjectURL(file);
      setFilePreview(blobUrl);
    } else if (lowerName.match(/\.(png|jpg|jpeg|webp|gif|svg)$/)) {
      setResType('infographic');
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (lowerName.match(/\.(pptx|ppt)$/)) {
      setResType('pptx');
      setFilePreview(null);
    } else {
      setResType('pdf');
      setFilePreview(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleResetFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setTitle('');
    setFileSizeText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (tab === 'upload') {
      if (!selectedFile && !filePreview) return;
      onAddResource({
        title: title.trim(),
        type: resType,
        fileUrl: filePreview || (selectedFile ? URL.createObjectURL(selectedFile) : '#'),
        fileSize: fileSizeText || '2.0 MB',
        displayLocation: displayLocation,
      });
      handleResetFile();
    } else {
      if (!urlInput.trim()) return;
      onAddResource({
        title: title.trim(),
        type: resType,
        fileUrl: urlInput.trim(),
        fileSize: fileSizeText || 'Online / Cloud',
        displayLocation: displayLocation,
      });
      setTitle('');
      setUrlInput('');
    }
  };

  return (
    <div className="bg-slate-50/80 rounded-2xl border-2 border-dashed border-slate-300 p-5 space-y-4">
      {/* Tab switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              tab === 'upload'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            📁 แนบไฟล์จากคอมพิวเตอร์ (PDF / Infographic)
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              tab === 'url'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            🔗 ระบุลิงก์ Canva / URL
          </button>
        </div>
        <span className="text-[11px] text-slate-400">
          {tab === 'upload' ? 'รองรับ PDF, PNG, JPG, PPTX สูงสุด 50MB' : 'รองรับ Canva, Google Drive, OneDrive'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {tab === 'upload' ? (
          <div>
            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-2xl p-6 text-center border-2 border-dashed transition flex flex-col items-center justify-center gap-2 bg-white ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp,image/jpg,.pptx,.ppt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    แนบไฟล์ PDF, ภาพ Infographic (.png/.jpg) หรือ สไลด์ PPTX
                  </p>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg mt-1">
                  เลือกไฟล์จากเครื่องคอมพิวเตอร์
                </span>
              </div>
            ) : (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {resType === 'infographic' && filePreview ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {resType === 'pdf' ? 'PDF' : 'PPTX'}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>{selectedFile.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                        {resType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      ขนาดไฟล์: <span className="font-semibold text-slate-700">{fileSizeText}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                  >
                    เปลี่ยนไฟล์
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFile}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    title="ยกเลิกไฟล์นี้"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">ประเภทสื่อ</label>
              <select
                value={resType}
                onChange={(e: any) => setResType(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="canva">🎨 ลิงก์สไลด์ Canva</option>
                <option value="pdf">📄 ลิงก์ไฟล์ PDF ภายนอก</option>
                <option value="infographic">📊 ลิงก์ภาพ Infographic</option>
                <option value="link">🔗 ลิงก์เว็บไซต์การเรียนรู้</option>
              </select>
            </div>
            <div className="sm:col-span-8">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">URL สื่อ / สไลด์</label>
              <input
                type="url"
                placeholder="เช่น https://canva.com/design/... หรือ https://drive.google.com/..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>
        )}

        {/* Common inputs: Title & Display Location & Add button */}
        {(selectedFile || tab === 'url') && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200 pt-3">
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                ชื่อเอกสาร / สื่อที่จะแสดงให้นักศึกษาเห็น *
              </label>
              <input
                type="text"
                placeholder="เช่น เอกสารประกอบการสอนบทที่ 1 (PDF)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                required
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                แสดงในตำแหน่งไหนของระบบ?
              </label>
              <select
                value={displayLocation}
                onChange={(e: any) => setDisplayLocation(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="content">📺 ห้องเรียนวิดีโอ (Learn Room)</option>
                <option value="intro">📖 หน้าแนะนำบทเรียน (Intro Page)</option>
                <option value="both">🌟 ทั้งสองหน้า (Intro & Learn)</option>
              </select>
            </div>

            <div className="sm:col-span-3 flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                + แนบสื่อนี้เข้าระบบ
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

// Dedicated Image / Infographic Uploader
interface ImageUploadFieldProps {
  label: string;
  sublabel?: string;
  currentUrl?: string;
  onImageSelected: (url: string) => void;
}

export function ImageUploadField({ label, sublabel, currentUrl, onImageSelected }: ImageUploadFieldProps) {
  const [preview, setPreview] = useState(currentUrl || '');
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [urlValue, setUrlValue] = useState(currentUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreview(result);
        onImageSelected(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlApply = () => {
    if (urlValue.trim()) {
      setPreview(urlValue.trim());
      onImageSelected(urlValue.trim());
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-700">{label}</label>
          {sublabel && <p className="text-[11px] text-slate-400">{sublabel}</p>}
        </div>
        <button
          type="button"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
        >
          {isUrlMode ? '📁 สลับเป็นแนบไฟล์รูปภาพ' : '🔗 หรือใส่ลิงก์ URL'}
        </button>
      </div>

      {!isUrlMode ? (
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-200 transition cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-blue-600" />
            เลือกไฟล์รูปภาพจากเครื่อง
          </button>
          {preview && (
            <div className="flex items-center gap-2">
              <img
                src={preview}
                alt="Preview"
                className="w-14 h-14 object-cover rounded-xl border border-slate-200 shadow-xs"
              />
              <span className="text-[11px] font-bold text-emerald-600">✓ เลือกรูปภาพแล้ว</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="url"
            placeholder="https://..."
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            className="flex-1 p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
          />
          <button
            type="button"
            onClick={handleUrlApply}
            className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
          >
            ใช้รูปนี้
          </button>
        </div>
      )}
    </div>
  );
}
