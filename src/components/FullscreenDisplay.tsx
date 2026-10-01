import React, { useEffect } from 'react';
import { 
  Minimize2, 
  Crown, 
  Trophy, 
  Sparkles, 
  PartyPopper, 
  Bell, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { Participant, CompetitionConfig } from '../types';
import { playBellSound } from '../utils/soundEffects';

interface FullscreenDisplayProps {
  participants: Participant[];
  config: CompetitionConfig;
  onClose: () => void;
  onCelebrate: () => void;
  onToggleSound: () => void;
}

export const FullscreenDisplay: React.FC<FullscreenDisplayProps> = ({
  participants,
  config,
  onClose,
  onCelebrate,
  onToggleSound,
}) => {
  // Sort participants by score descending
  const sorted = [...participants].sort((a, b) => b.totalScore - a.totalScore);
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  // Handle ESC key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white overflow-y-auto p-4 sm:p-8 flex flex-col justify-between">
      
      {/* Background Decorative Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[140px]"></div>
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-amber-500 rounded-full blur-[160px]"></div>
      </div>

      {/* Top Bar for Projector Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-indigo-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-lg">
            <Trophy className="w-7 h-7 fill-amber-950" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-black font-heading tracking-wide text-white drop-shadow">
              {config.competitionTitle}
            </h1>
            <p className="text-xs sm:text-sm text-amber-300 font-bold tracking-wide">
              {config.schoolName} &bull; Papan Skor Resmi Layar Penuh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Bell button */}
          <button
            onClick={() => playBellSound(config.soundEnabled)}
            className="px-3.5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-1.5"
            title="Bunyikan Bel"
          >
            <Bell className="w-4 h-4 animate-bounce" />
            <span className="hidden sm:inline">Bel Lomba</span>
          </button>

          {/* Celebrate */}
          <button
            onClick={onCelebrate}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-sm shadow-lg transition-all flex items-center gap-1.5"
          >
            <PartyPopper className="w-4 h-4" />
            <span>Rayakan Juara! 🎉</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all"
            title="Toggle Suara"
          >
            {config.soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
          </button>

          {/* Exit Fullscreen */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-rose-600/80 text-white transition-all flex items-center gap-1"
            title="Keluar Layar Penuh (ESC)"
          >
            <Minimize2 className="w-5 h-5" />
            <span className="text-xs font-bold hidden sm:inline">Tutup</span>
          </button>
        </div>
      </div>

      {/* Main Stage: Podium 3 Besar */}
      <div className="relative z-10 my-auto py-6 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-3 gap-3 sm:gap-8 items-end">
          
          {/* Juara 2 */}
          <div className="flex flex-col items-center">
            {second ? (
              <>
                <div className="text-4xl sm:text-6xl mb-2">{second.avatar}</div>
                <div className="text-center mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-300 text-slate-900 text-xs font-black uppercase">
                    🥈 Juara 2
                  </span>
                  <h3 className="text-base sm:text-2xl font-black text-white mt-1 line-clamp-1">{second.name}</h3>
                  <p className="text-xs text-slate-300 line-clamp-1">{second.grade}</p>
                </div>
                <div className="w-full h-32 sm:h-44 rounded-t-3xl bg-gradient-to-b from-slate-400 to-slate-600 flex flex-col items-center justify-center border-t-4 border-slate-200 shadow-2xl">
                  <span className="text-2xl sm:text-5xl font-black text-white">{second.totalScore}</span>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">Poin</span>
                </div>
              </>
            ) : null}
          </div>

          {/* Juara 1 */}
          <div className="flex flex-col items-center z-20">
            {first ? (
              <>
                <div className="relative flex flex-col items-center mb-2">
                  <Crown className="w-12 h-12 sm:w-16 sm:h-16 text-amber-300 fill-amber-300 animate-bounce drop-shadow-[0_0_15px_rgba(251,191,36,0.9)]" />
                  <div className="text-6xl sm:text-8xl mt-1 animate-glow">{first.avatar}</div>
                </div>
                <div className="text-center mb-3">
                  <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 text-xs sm:text-sm font-black uppercase shadow-lg border border-yellow-200">
                    👑 SANG JUARA 1
                  </span>
                  <h2 className="text-lg sm:text-3xl font-black text-amber-300 mt-1 line-clamp-1">{first.name}</h2>
                  <p className="text-xs sm:text-base text-amber-100 line-clamp-1">{first.grade}</p>
                </div>
                <div className="w-full h-44 sm:h-60 rounded-t-3xl bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 flex flex-col items-center justify-center border-t-4 border-yellow-200 shadow-[0_0_40px_rgba(234,179,8,0.5)]">
                  <span className="text-4xl sm:text-7xl font-black text-amber-950">{first.totalScore}</span>
                  <span className="text-xs sm:text-base font-extrabold uppercase tracking-widest text-amber-950">
                    Poin Teratas
                  </span>
                </div>
              </>
            ) : null}
          </div>

          {/* Juara 3 */}
          <div className="flex flex-col items-center">
            {third ? (
              <>
                <div className="text-4xl sm:text-6xl mb-2">{third.avatar}</div>
                <div className="text-center mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-700 text-amber-100 text-xs font-black uppercase">
                    🥉 Juara 3
                  </span>
                  <h3 className="text-base sm:text-2xl font-black text-white mt-1 line-clamp-1">{third.name}</h3>
                  <p className="text-xs text-slate-300 line-clamp-1">{third.grade}</p>
                </div>
                <div className="w-full h-24 sm:h-36 rounded-t-3xl bg-gradient-to-b from-amber-700 to-amber-900 flex flex-col items-center justify-center border-t-4 border-amber-500 shadow-2xl">
                  <span className="text-2xl sm:text-5xl font-black text-amber-200">{third.totalScore}</span>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300">Poin</span>
                </div>
              </>
            ) : null}
          </div>

        </div>

        {/* Other Participants Horizontal Ticker */}
        {sorted.length > 3 && (
          <div className="mt-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
              Peringkat Peserta Lainnya:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {sorted.slice(3).map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-[10px]">
                    {idx + 4}
                  </span>
                  <span>{p.avatar}</span>
                  <span className="font-bold text-slate-200">{p.name}:</span>
                  <span className="font-black text-amber-400">{p.totalScore} Poin</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="relative z-10 text-center text-xs text-slate-400 pt-2 border-t border-indigo-900/50">
        Tekan tombol <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[10px]">ESC</kbd> pada keyboard untuk kembali ke mode juri.
      </div>

    </div>
  );
};
