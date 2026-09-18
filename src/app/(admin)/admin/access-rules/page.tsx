'use client';

import React, { useState } from 'react';
import { 
  Shield, Plus, Trash2, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import { AccessRule, UserRole } from '@/types';

export default function AdminAccessRulesPage() {
  const { accessRules, setAccessRules } = useAppStore();
  const [rules, setRules] = useState<AccessRule[]>(accessRules);

  const [type, setType] = useState<'domain' | 'email'>('domain');
  const [value, setValue] = useState('');
  const [decision, setDecision] = useState<'allow' | 'deny'>('allow');
  const [defaultRole, setDefaultRole] = useState<UserRole>('student');
  const [note, setNote] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVal = value.trim().toLowerCase();
    if (!cleanVal) return;

    // ตรวจสอบ Duplicate Check ตามสเปกข้อ 35
    const isDup = rules.some((r) => r.type === type && r.value.toLowerCase() === cleanVal);
    if (isDup) {
      setErrorMessage(`ไม่สามารถเพิ่ม Rule นี้ได้: พบข้อมูลซ้ำ (${cleanVal} มีอยู่ในระบบแล้ว)`);
      return;
    }

    setErrorMessage(null);
    const newRule: AccessRule = {
      id: `ar-${Date.now()}`,
      type,
      value: cleanVal,
      decision,
      defaultRole,
      isActive: true,
      note: note || (type === 'domain' ? 'โดเมนที่อนุญาต' : 'บัญชีพิเศษ'),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...rules, newRule];
    setRules(updated);
    setAccessRules(updated);
    setValue('');
    setNote('');
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  const handleDelete = (id: string) => {
    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);
    setAccessRules(updated);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header matching Page 20 */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Access Rules (กำหนดสิทธิ์การใช้งาน)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          กำหนดโดเมนหรืออีเมลที่อนุญาตหรือปฏิเสธการเข้าสู่ระบบ พร้อมกำหนดบทบาทเริ่มต้นของผู้ใช้งาน
        </p>
      </div>

      {/* Validation Feedback Banners matching Page 20 */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          บันทึก Access Rule แล้ว ระบบได้ทำการบันทึกข้อมูลเรียบร้อย
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          {errorMessage}
        </div>
      )}

      {/* Rules Table matching Page 20 */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800">รายการ Access Rules ({rules.length} กฎ)</h3>
          <span className="text-[10px] text-slate-400">กฎประเภท Email จะมีความสำคัญกว่ากฎ Domain เสมอ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">ประเภท</th>
                <th className="py-3 px-4">โดเมน / อีเมล</th>
                <th className="py-3 px-4">อนุญาต/ปฏิเสธ</th>
                <th className="py-3 px-4">บทบาทเริ่มต้น</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4">หมายเหตุ</th>
                <th className="py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-bold text-slate-600 capitalize">{rule.type}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{rule.value}</td>
                  <td className="py-3 px-4">
                    {rule.decision === 'allow' ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ อนุญาต
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        ✕ ปฏิเสธ
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {rule.defaultRole === 'admin' ? 'ผู้ดูแลระบบ' : 'นักศึกษา'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold text-emerald-600">● ใช้งาน</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">{rule.note}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Rule Form matching Page 20 */}
      <form onSubmit={handleAddRule} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          เพิ่ม / แก้ไข Access Rule
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ประเภท</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="domain">Domain (ทั้งโดเมน)</option>
              <option value="email">Email (เฉพาะบุคคล)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {type === 'domain' ? 'ชื่อโดเมน (เช่น rmuti.ac.th)' : 'ที่อยู่อีเมล (เช่น user@gmail.com)'}
            </label>
            <input
              type="text"
              placeholder={type === 'domain' ? 'rmuti.ac.th' : 'student@example.com'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">การอนุญาต</label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value as any)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="allow">อนุญาต (Allow)</option>
              <option value="deny">ปฏิเสธ (Deny)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">บทบาทเริ่มต้น (Role)</label>
            <select
              value={defaultRole}
              onChange={(e) => setDefaultRole(e.target.value as any)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="student">นักศึกษา (Student)</option>
              <option value="admin">ผู้ดูแลระบบ (Admin)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">หมายเหตุ</label>
            <input
              type="text"
              placeholder="ระบุเหตุผล เช่น โดเมนหลัก หรือโครงการพิเศษ"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            + บันทึก Access Rule
          </button>
        </div>
      </form>

    </div>
  );
}
