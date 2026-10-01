import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Users, FileText, Check, AlertCircle } from 'lucide-react';
import { Participant } from '../types';
import { AVATAR_OPTIONS, COLOR_OPTIONS } from '../utils/sampleData';

interface ManageParticipantsModalProps {
  participants: Participant[];
  onAddParticipant: (participant: Omit<Participant, 'id' | 'rank' | 'previousRank' | 'roundScores' | 'quizAnswers'>) => void;
  onUpdateParticipant: (id: string, updates: Partial<Participant>) => void;
  onDeleteParticipant: (id: string) => void;
  onBulkAdd: (names: string[], defaultGrade: string) => void;
  onResetAllScores: () => void;
  onClose: () => void;
}

export const ManageParticipantsModal: React.FC<ManageParticipantsModalProps> = ({
  participants,
  onAddParticipant,
  onUpdateParticipant,
  onDeleteParticipant,
  onBulkAdd,
  onResetAllScores,
  onClose,
}) => {
  const [tab, setTab] = useState<'list' | 'add' | 'bulk'>('list');

  // Form State for Single Add / Edit
  const [name, setName] = useState('');
  const [members, setMembers] = useState('');
  const [grade, setGrade] = useState('Kelas 5');
  const [avatar, setAvatar] = useState('🦅');
  const [score, setScore] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Bulk Add State
  const [bulkText, setBulkText] = useState('');
  const [bulkGrade, setBulkGrade] = useState('Kelas 5 SD');

  const handleSubmitSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      onUpdateParticipant(editingId, {
        name: name.trim(),
        members: members.trim() || undefined,
        grade: grade.trim(),
        avatar,
        totalScore: Number(score),
      });
      setEditingId(null);
    } else {
      onAddParticipant({
        name: name.trim(),
        members: members.trim() || undefined,
        grade: grade.trim(),
        avatar,
        color: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)].value,
        totalScore: Number(score),
        correctAnswers: 0,
        wrongAnswers: 0,
        status: 'active',
      });
    }

    // Reset form
    setName('');
    setMembers('');
    setScore(0);
    setTab('list');
  };

  const handleStartEdit = (p: Participant) => {
    setEditingId(p.id);
    setName(p.name);
    setMembers(p.members || '');
    setGrade(p.grade);
    setAvatar(p.avatar);
    setScore(p.totalScore);
    setTab('add');
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    onBulkAdd(lines, bulkGrade);
    setBulkText('');
    setTab('list');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg font-heading">Kelola Peserta & Regu Lomba</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center gap-2">
          <button
            onClick={() => {
              setEditingId(null);
              setTab('list');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Daftar Peserta ({participants.length})
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setName('');
              setMembers('');
              setScore(0);
              setTab('add');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              tab === 'add' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            {editingId ? 'Edit Peserta' : 'Tambah Peserta'}
          </button>
          <button
            onClick={() => setTab('bulk')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              tab === 'bulk' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Import Massal (Banyak Nama)
          </button>
        </div>

        {/* Tab 1: Participant List */}
        {tab === 'list' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-slate-500 font-medium">
                Klik ikon pensil untuk mengubah data, atau tempat sampah untuk menghapus.
              </p>
              <button
                onClick={() => {
                  if (confirm('Yakin ingin mereset skor semua peserta menjadi 0? Data peserta tidak akan dihapus.')) {
                    onResetAllScores();
                  }
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                Reset Semua Skor ke 0
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {participants.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Belum ada peserta. Silakan tambah peserta baru atau import daftar nama.
                </div>
              ) : (
                participants.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.avatar}</span>
                      <div>
                        <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                          <span>{p.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            {p.grade}
                          </span>
                        </div>
                        {p.members && (
                          <div className="text-xs text-slate-500">Anggota: {p.members}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-base font-black text-blue-700">{p.totalScore}</span>
                        <span className="text-[10px] text-slate-400 block">Poin</span>
                      </div>

                      <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus peserta "${p.name}"?`)) {
                              onDeleteParticipant(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Single Add / Edit */}
        {tab === 'add' && (
          <form onSubmit={handleSubmitSingle} className="p-6 space-y-4">
            <h4 className="font-bold text-base text-slate-800 font-heading">
              {editingId ? 'Edit Data Peserta / Regu' : 'Tambah Peserta / Regu Baru'}
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Nama Peserta atau Nama Regu: *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Regu A (Garuda) atau Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Nama Anggota (Opsional jika regu):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rian, Siti, Andi"
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Kelas / Kategori: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas 5B"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Pilih Karakter / Avatar:
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-transform hover:scale-110 ${
                      avatar === av ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Skor Awal:
              </label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-32 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTab('list')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md"
              >
                {editingId ? 'Simpan Perubahan' : 'Tambah Peserta'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Bulk Add */}
        {tab === 'bulk' && (
          <form onSubmit={handleBulkSubmit} className="p-6 space-y-4">
            <div>
              <h4 className="font-bold text-base text-slate-800 font-heading">
                Import Massal Banyak Peserta Sekaligus
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Paste daftar nama peserta dari Microsoft Excel, Word, atau Notepad. Setiap baris baru akan otomatis menjadi 1 peserta.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Kelas Default untuk Semua Peserta:
              </label>
              <input
                type="text"
                value={bulkGrade}
                onChange={(e) => setBulkGrade(e.target.value)}
                className="w-64 px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Daftar Nama (1 baris untuk 1 nama peserta):
              </label>
              <textarea
                rows={6}
                required
                placeholder="Regu Merah&#10;Regu Putih&#10;Regu Biru&#10;Regu Kuning"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTab('list')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Import Semua Nama Sekarang
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
