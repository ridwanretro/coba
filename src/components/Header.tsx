import React from 'react';
import { 
  Trophy, 
  Maximize2, 
  Award, 
  Users, 
  Settings, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { CompetitionConfig } from '../types';

interface HeaderProps {
  config: CompetitionConfig;
  onToggleSound: () => void;
  onOpenFullscreen: () => void;
  onOpenCertificate: () => void;
  onOpenParticipants: () => void;
  onOpenSettings: () => void;
  onResetData: () => void;
  onLoadPreset: (preset: 'cerdas-cermat' | 'ranking-1') => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onToggleSound,
  onOpenFullscreen,
  onOpenCertificate,
  onOpenParticipants,
  onOpenSettings,
  onResetData,
  onLoadPreset,
}) => {
  return (
    <header className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-lg sticky top-0 z-40">
      {/* Decorative top pattern */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3.5 text-center md:text-left">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center shadow-md transform hover:rotate-6 transition-transform">
                <Trophy className="w-7 h-7 text-amber-950 fill-amber-950" />
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white rounded-full border border-white">
                SD
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-heading tracking-wide text-white drop-shadow-sm flex items-center gap-1.5">
                  Sang Juara SD
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                    <Sparkles className="w-3 h-3 mr-1 text-amber-300" /> Real-Time
                  </span>
                </h1>
              </div>
              <p className="text-xs text-blue-100 font-medium line-clamp-1">
                {config.schoolName} &bull; <span className="text-amber-300 font-semibold">{config.competitionTitle}</span>
              </p>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            
            {/* Projector Fullscreen Mode */}
            <button
              onClick={onOpenFullscreen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-105 active:scale-95"
              title="Tampilkan di Proyektor / Layar Penuh untuk Aula & Kelas"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Layar Proyektor</span>
            </button>

            {/* Certificate Modal */}
            <button
              onClick={onOpenCertificate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm backdrop-blur-sm transition-all"
              title="Cetak Piagam Juara SD"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Piagam Juara</span>
            </button>

            {/* Manage Participants */}
            <button
              onClick={onOpenParticipants}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm backdrop-blur-sm transition-all"
              title="Kelola Peserta & Regu"
            >
              <Users className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">Peserta</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl transition-all ${
                config.soundEnabled
                  ? 'bg-emerald-500/30 text-emerald-300 hover:bg-emerald-500/40 border border-emerald-400/40'
                  : 'bg-white/10 text-white/50 hover:bg-white/20'
              }`}
              title={config.soundEnabled ? 'Suara Aktif (Klik untuk Matikan)' : 'Suara Bisu (Klik untuk Aktifkan)'}
            >
              {config.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Pengaturan Lomba & Kunci Jawaban"
            >
              <Settings className="w-4 h-4 text-blue-200" />
            </button>

            {/* Reset / Preset Menu */}
            <div className="relative group">
              <button
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center"
                title="Pilihan Contoh & Reset Data"
              >
                <RotateCcw className="w-4 h-4 text-rose-300" />
              </button>

              <div className="absolute right-0 mt-2 w-52 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 py-2 hidden group-hover:block hover:block z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Muat Contoh Lomba SD
                </div>
                <button
                  onClick={() => onLoadPreset('cerdas-cermat')}
                  className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-blue-50 text-slate-700 hover:text-blue-700 flex items-center gap-2"
                >
                  <span className="text-base">🦅</span> Lomba Cerdas Cermat Regu
                </button>
                <button
                  onClick={() => onLoadPreset('ranking-1')}
                  className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-blue-50 text-slate-700 hover:text-blue-700 flex items-center gap-2"
                >
                  <span className="text-base">🌟</span> Lomba Ranking 1 Perorangan
                </button>
                <div className="my-1 border-t border-slate-100"></div>
                <button
                  onClick={onResetData}
                  className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Kosongkan Semua Skor
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
