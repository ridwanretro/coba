import React, { useState } from 'react';
import { X, Settings, KeyRound, School, Check, Plus, Trash2 } from 'lucide-react';
import { CompetitionConfig } from '../types';

interface SettingsModalProps {
  config: CompetitionConfig;
  onSaveConfig: (newConfig: CompetitionConfig) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  onSaveConfig,
  onClose,
}) => {
  const [formData, setFormData] = useState<CompetitionConfig>({ ...config });
  const [activeTab, setActiveTab] = useState<'general' | 'quiz'>('general');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  const handleUpdateKey = (index: number, val: string) => {
    const updated = [...formData.quizAnswerKey];
    updated[index] = val;
    setFormData({ ...formData, quizAnswerKey: updated });
  };

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      quizAnswerKey: [...formData.quizAnswerKey, 'A'],
    });
  };

  const handleRemoveQuestion = (index: number) => {
    if (formData.quizAnswerKey.length <= 1) return;
    const updated = formData.quizAnswerKey.filter((_, idx) => idx !== index);
    setFormData({ ...formData, quizAnswerKey: updated });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-lg font-heading">Pengaturan Lomba & Kunci Jawaban</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'general' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            Identitas Sekolah & Juri
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'quiz' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Kunci Jawaban Soal ({formData.quizAnswerKey.length} Butir)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Nama Sekolah Dasar (SD):
                </label>
                <input
                  type="text"
                  required
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Judul Acara / Lomba:
                </label>
                <input
                  type="text"
                  required
                  value={formData.competitionTitle}
                  onChange={(e) => setFormData({ ...formData, competitionTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Nama Kepala Sekolah:
                  </label>
                  <input
                    type="text"
                    value={formData.headmasterName}
                    onChange={(e) => setFormData({ ...formData, headmasterName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Nama Ketua Dewan Juri:
                  </label>
                  <input
                    type="text"
                    value={formData.judgeName}
                    onChange={(e) => setFormData({ ...formData, judgeName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Tanggal Lomba (Untuk Piagam):
                </label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* QUIZ ANSWER KEY TAB */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Kunci Jawaban Soal Ujian / Cerdas Cermat
                  </h4>
                  <p className="text-xs text-slate-500">
                    Digunakan fitur Auto-Grading untuk menghitung nilai otomatis secara instan.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Poin/Soal:</span>
                  <input
                    type="number"
                    value={formData.quizPointPerQuestion}
                    onChange={(e) => setFormData({ ...formData, quizPointPerQuestion: Number(e.target.value) })}
                    className="w-16 px-2 py-1 border border-slate-300 rounded-lg text-xs font-bold text-center"
                  />
                </div>
              </div>

              {/* Grid of keys */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 max-h-60 overflow-y-auto p-1">
                {formData.quizAnswerKey.map((key, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <span className="text-xs font-black text-slate-700">#{idx + 1}</span>
                    <select
                      value={key}
                      onChange={(e) => handleUpdateKey(idx, e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-black text-blue-700"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-slate-400 hover:text-rose-500 text-xs p-1"
                      title="Hapus soal ini"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Butir Soal Baru
                </button>
              </div>
            </div>
          )}

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Simpan Pengaturan
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
