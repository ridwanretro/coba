import React, { useState } from 'react';
import { X, Printer, Award, Download, Check } from 'lucide-react';
import { Participant, CompetitionConfig } from '../types';

interface CertificateModalProps {
  participants: Participant[];
  config: CompetitionConfig;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  participants,
  config,
  onClose,
}) => {
  const sorted = [...participants].sort((a, b) => b.totalScore - a.totalScore);
  const [selectedId, setSelectedId] = useState<string>(sorted[0]?.id || '');
  const [customAwardTitle, setCustomAwardTitle] = useState<string>('');

  const current = sorted.find((p) => p.id === selectedId) || sorted[0];
  const rankIndex = sorted.findIndex((p) => p.id === selectedId);

  const getRankTitle = (idx: number) => {
    if (customAwardTitle) return customAwardTitle;
    if (idx === 0) return 'JUARA I (PERTAMA)';
    if (idx === 1) return 'JUARA II (KEDUA)';
    if (idx === 2) return 'JUARA III (KETIGA)';
    if (idx === 3) return 'JUARA HARAPAN I';
    if (idx === 4) return 'JUARA HARAPAN II';
    return 'PESERTA TERBAIK';
  };

  const handlePrint = () => {
    window.print();
  };

  if (!current) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 text-center">
          <p className="text-slate-600 mb-4">Belum ada peserta untuk dicetak piagamnya.</p>
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-xl">
            Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg font-heading">Piagam Penghargaan Sang Juara SD</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Pilih Penerima:</span>
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setCustomAwardTitle('');
              }}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sorted.map((p, idx) => (
                <option key={p.id} value={p.id}>
                  #{idx + 1} - {p.name} ({p.totalScore} Poin)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-extrabold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Certificate Preview Container */}
        <div className="p-4 sm:p-8 bg-slate-100 flex justify-center">
          
          {/* PRINTABLE CERTIFICATE */}
          <div
            id="printable-certificate"
            className="bg-white text-slate-900 w-full max-w-2xl rounded-2xl p-8 sm:p-12 border-8 border-double border-amber-500 shadow-xl relative overflow-hidden text-center"
            style={{ minHeight: '520px' }}
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 text-amber-500 text-lg">✦</div>
            <div className="absolute top-2 right-2 text-amber-500 text-lg">✦</div>
            <div className="absolute bottom-2 left-2 text-amber-500 text-lg">✦</div>
            <div className="absolute bottom-2 right-2 text-amber-500 text-lg">✦</div>

            {/* School Header */}
            <div className="mb-4">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-500">
                {config.schoolName}
              </h4>
              <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-1 mb-2"></div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-amber-600 tracking-wider uppercase">
                PIAGAM PENGHARGAAN
              </h1>
              <p className="text-xs text-slate-500 italic mt-0.5">
                Nomor: 421.2 / {String(rankIndex + 1).padStart(3, '0')} / SD / {new Date().getFullYear()}
              </p>
            </div>

            {/* Certificate Body Text */}
            <p className="text-xs sm:text-sm text-slate-600 mb-2">
              Diberikan dengan penuh rasa bangga dan apresiasi setinggi-tingginya kepada:
            </p>

            {/* Participant Name */}
            <div className="my-4 py-2 border-b-2 border-slate-300 max-w-md mx-auto">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                {current.name}
              </h2>
              {current.members && (
                <p className="text-xs text-slate-600 mt-1 font-medium">({current.members})</p>
              )}
              <p className="text-xs text-blue-700 font-bold mt-0.5">{current.grade}</p>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 max-w-lg mx-auto mb-3">
              Atas prestasinya yang gemilang dan berhasil meraih predikat:
            </p>

            {/* Award Badge / Predikat */}
            <div className="inline-block bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-amber-950 font-black text-base sm:text-xl px-6 py-2 rounded-xl shadow-md uppercase tracking-wider mb-4 border border-yellow-200">
              {getRankTitle(rankIndex)}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mb-6">
              Dalam kegiatan <strong className="text-slate-900">{config.competitionTitle}</strong> dengan perolehan skor akhir{' '}
              <strong className="text-amber-700 font-black">{current.totalScore} Poin</strong>. Semoga prestasi ini menjadi motivasi untuk terus berprestasi.
            </p>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 text-xs text-slate-700 pt-4 mt-4 border-t border-slate-200">
              <div>
                <p className="text-[11px] text-slate-500 mb-12">Ketua Dewan Juri / Penguji,</p>
                <p className="font-bold underline text-slate-900">{config.judgeName}</p>
                <p className="text-[10px] text-slate-500">Guru Pembimbing</p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500 mb-12">
                  Ditetapkan pada {config.date}<br />
                  Kepala Sekolah,
                </p>
                <p className="font-bold underline text-slate-900">{config.headmasterName}</p>
                <p className="text-[10px] text-slate-500">NIP. 19780512 200501 2 004</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
