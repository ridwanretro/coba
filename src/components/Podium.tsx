import React from 'react';
import { Crown, Sparkles, Award, PartyPopper } from 'lucide-react';
import { Participant } from '../types';

interface PodiumProps {
  participants: Participant[];
  onCelebrate: () => void;
  onSelectParticipant?: (participant: Participant) => void;
}

export const Podium: React.FC<PodiumProps> = ({
  participants,
  onCelebrate,
  onSelectParticipant,
}) => {
  // Sort participants by totalScore descending
  const sorted = [...participants].sort((a, b) => b.totalScore - a.totalScore);
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  if (!first) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-slate-200">
        <p className="text-slate-400 font-medium">Belum ada data peserta lomba. Tambahkan peserta untuk melihat podium juara.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-800/50">
      
      {/* Background festive ambient stars */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-4 left-10 text-yellow-300 text-2xl animate-pulse">✨</div>
        <div className="absolute top-12 right-12 text-yellow-300 text-xl animate-bounce">⭐</div>
        <div className="absolute bottom-8 left-1/4 text-amber-200 text-lg">🌟</div>
        <div className="absolute top-1/3 right-1/4 text-yellow-300 text-2xl animate-pulse">✨</div>
      </div>

      {/* Header with Title & Celebration Button */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Panggung Kehormatan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-wide mt-1">
            Podium Tiga Besar Sang Juara
          </h2>
        </div>

        <button
          onClick={onCelebrate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-bold text-sm shadow-lg shadow-amber-500/30 transform hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <PartyPopper className="w-5 h-5 text-amber-950 animate-bounce" />
          <span>Rayakan Juara! 🎉</span>
        </button>
      </div>

      {/* 3D Podium Layout */}
      <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-6 items-end pt-8 pb-4 max-w-3xl mx-auto">
        
        {/* JUARA 2 (PERAK / SILVER) - KIRI */}
        <div 
          onClick={() => second && onSelectParticipant && onSelectParticipant(second)}
          className={`flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1.5 ${!second ? 'opacity-30' : ''}`}
        >
          {second ? (
            <>
              {/* Avatar & Info */}
              <div className="relative mb-3 flex flex-col items-center">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-400 p-1 shadow-lg ring-4 ring-slate-300/40 flex items-center justify-center text-2xl sm:text-4xl">
                  {second.avatar}
                </div>
                <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-slate-300 text-slate-900 text-[10px] sm:text-xs font-black shadow flex items-center gap-0.5">
                  🥈 Juara 2
                </div>
              </div>

              <div className="text-center mb-2 px-1">
                <div className="text-xs sm:text-base font-bold text-white line-clamp-1">
                  {second.name}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-300 line-clamp-1">
                  {second.grade}
                </div>
                <div className="text-sm sm:text-xl font-black text-slate-200 mt-0.5">
                  {second.totalScore} <span className="text-[10px] sm:text-xs font-semibold text-slate-400">Poin</span>
                </div>
              </div>

              {/* Podium Block Juara 2 */}
              <div className="w-full h-28 sm:h-36 rounded-t-2xl bg-gradient-to-b from-slate-400 via-slate-500 to-slate-700 p-2 sm:p-3 flex flex-col items-center justify-between border-t-2 border-slate-300 shadow-inner">
                <span className="text-xl sm:text-3xl font-black text-slate-200/90">2</span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300">Perak</span>
              </div>
            </>
          ) : (
            <div className="w-full h-24 rounded-t-2xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-xs text-slate-500">
              Kosong
            </div>
          )}
        </div>

        {/* JUARA 1 (EMAS / GOLD) - TENGAH (TERTINGGI) */}
        <div 
          onClick={() => onSelectParticipant && onSelectParticipant(first)}
          className="flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-2 z-20"
        >
          {/* Crown & Avatar */}
          <div className="relative mb-3 flex flex-col items-center">
            <div className="absolute -top-6 sm:-top-8 text-amber-400 animate-bounce">
              <Crown className="w-7 h-7 sm:w-10 sm:h-10 fill-amber-400 text-amber-300 drop-shadow-[0_4px_10px_rgba(251,191,36,0.8)]" />
            </div>

            <div className="w-18 h-18 sm:w-26 sm:h-26 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 p-1.5 shadow-2xl ring-4 sm:ring-8 ring-amber-400/40 flex items-center justify-center text-3xl sm:text-5xl animate-glow">
              {first.avatar}
            </div>

            <div className="absolute -bottom-2.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 text-xs sm:text-sm font-black shadow-md flex items-center gap-1 border border-yellow-200">
              👑 JUARA 1
            </div>
          </div>

          <div className="text-center mb-2 px-1">
            <div className="text-sm sm:text-lg font-black text-amber-300 line-clamp-1">
              {first.name}
            </div>
            <div className="text-[11px] sm:text-xs text-amber-200/80 line-clamp-1">
              {first.grade}
            </div>
            <div className="text-lg sm:text-3xl font-black text-white mt-0.5">
              {first.totalScore}{' '}
              <span className="text-xs sm:text-sm font-bold text-amber-300">Poin</span>
            </div>
          </div>

          {/* Podium Block Juara 1 */}
          <div className="w-full h-36 sm:h-48 rounded-t-3xl bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 p-3 sm:p-4 flex flex-col items-center justify-between border-t-4 border-yellow-200 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 opacity-30 skew-y-12"></div>
            <span className="text-3xl sm:text-5xl font-black text-amber-950 drop-shadow-sm">1</span>
            <div className="text-center">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-amber-950 block">
                EMAS
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-900 bg-amber-300/60 px-2 py-0.5 rounded-full">
                SANG JUARA
              </span>
            </div>
          </div>
        </div>

        {/* JUARA 3 (PERUNGGU / BRONZE) - KANAN */}
        <div 
          onClick={() => third && onSelectParticipant && onSelectParticipant(third)}
          className={`flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1.5 ${!third ? 'opacity-30' : ''}`}
        >
          {third ? (
            <>
              {/* Avatar & Info */}
              <div className="relative mb-3 flex flex-col items-center">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-800 p-1 shadow-lg ring-4 ring-amber-700/40 flex items-center justify-center text-2xl sm:text-4xl">
                  {third.avatar}
                </div>
                <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-amber-700 text-amber-100 text-[10px] sm:text-xs font-black shadow flex items-center gap-0.5">
                  🥉 Juara 3
                </div>
              </div>

              <div className="text-center mb-2 px-1">
                <div className="text-xs sm:text-base font-bold text-white line-clamp-1">
                  {third.name}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-300 line-clamp-1">
                  {third.grade}
                </div>
                <div className="text-sm sm:text-xl font-black text-amber-300 mt-0.5">
                  {third.totalScore} <span className="text-[10px] sm:text-xs font-semibold text-slate-400">Poin</span>
                </div>
              </div>

              {/* Podium Block Juara 3 */}
              <div className="w-full h-20 sm:h-28 rounded-t-2xl bg-gradient-to-b from-amber-700 via-orange-800 to-amber-950 p-2 sm:p-3 flex flex-col items-center justify-between border-t-2 border-amber-500 shadow-inner">
                <span className="text-xl sm:text-3xl font-black text-amber-200">3</span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-300">Perunggu</span>
              </div>
            </>
          ) : (
            <div className="w-full h-20 rounded-t-2xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-xs text-slate-500">
              Kosong
            </div>
          )}
        </div>

      </div>

      {/* Juara Harapan 1 & 2 Quick Pills */}
      {sorted.length > 3 && (
        <div className="mt-4 pt-4 border-t border-indigo-900/60 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="text-slate-400 font-medium">Peringkat Selanjutnya:</span>
          {sorted[3] && (
            <div 
              onClick={() => onSelectParticipant && onSelectParticipant(sorted[3])}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-bold">Harapan 1:</span> {sorted[3].name} ({sorted[3].totalScore} Poin)
            </div>
          )}
          {sorted[4] && (
            <div 
              onClick={() => onSelectParticipant && onSelectParticipant(sorted[4])}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-bold">Harapan 2:</span> {sorted[4].name} ({sorted[4].totalScore} Poin)
            </div>
          )}
        </div>
      )}

    </div>
  );
};
