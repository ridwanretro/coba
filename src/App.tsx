/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Users, 
  Award, 
  Flame, 
  HelpCircle,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { Participant, Round, ScoreLogEntry, CompetitionConfig } from './types';
import { 
  DEFAULT_CONFIG, 
  DEFAULT_ROUNDS, 
  CERDAS_CERMAT_PARTICIPANTS, 
  RANKING_1_PARTICIPANTS 
} from './utils/sampleData';
import { Header } from './components/Header';
import { Podium } from './components/Podium';
import { AutoScoringPanel } from './components/AutoScoringPanel';
import { LeaderboardTable } from './components/LeaderboardTable';
import { FullscreenDisplay } from './components/FullscreenDisplay';
import { CertificateModal } from './components/CertificateModal';
import { ManageParticipantsModal } from './components/ManageParticipantsModal';
import { SettingsModal } from './components/SettingsModal';
import { triggerWinnerConfetti, triggerQuickConfetti } from './utils/confetti';
import { playWinnerSound, playCorrectSound, playWrongSound } from './utils/soundEffects';

const STORAGE_KEY_PARTICIPANTS = 'sang_juara_participants_v1';
const STORAGE_KEY_CONFIG = 'sang_juara_config_v1';
const STORAGE_KEY_ROUNDS = 'sang_juara_rounds_v1';
const STORAGE_KEY_LOGS = 'sang_juara_logs_v1';

export default function App() {
  // Load state from localStorage with fallback to default sample data
  const [config, setConfig] = useState<CompetitionConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [rounds, setRounds] = useState<Round[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROUNDS);
      return saved ? JSON.parse(saved) : DEFAULT_ROUNDS;
    } catch {
      return DEFAULT_ROUNDS;
    }
  });

  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PARTICIPANTS);
      return saved ? JSON.parse(saved) : CERDAS_CERMAT_PARTICIPANTS;
    } catch {
      return CERDAS_CERMAT_PARTICIPANTS;
    }
  });

  const [scoreLogs, setScoreLogs] = useState<ScoreLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeRoundId, setActiveRoundId] = useState<string>(rounds[0]?.id || 'round-1');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>(
    participants[0]?.id || ''
  );

  // Modals state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROUNDS, JSON.stringify(rounds));
    } catch (e) {
      console.error(e);
    }
  }, [rounds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(participants));
    } catch (e) {
      console.error(e);
    }
  }, [participants]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(scoreLogs));
    } catch (e) {
      console.error(e);
    }
  }, [scoreLogs]);

  // Set selected participant if empty or invalid
  useEffect(() => {
    if (!participants.some((p) => p.id === selectedParticipantId) && participants.length > 0) {
      setSelectedParticipantId(participants[0].id);
    }
  }, [participants, selectedParticipantId]);

  // Helper to re-calculate ranks across all participants
  const updateRanks = (list: Participant[]): Participant[] => {
    const sorted = [...list].sort((a, b) => b.totalScore - a.totalScore);
    const updated = sorted.map((p, index) => {
      const newRank = index + 1;
      return {
        ...p,
        previousRank: p.rank || newRank,
        rank: newRank,
      };
    });
    return updated;
  };

  // Sound toggle
  const handleToggleSound = () => {
    setConfig((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  // Add Score (Single touch quick action)
  const handleAddScore = (
    participantId: string,
    amount: number,
    reason: string,
    isCorrect?: boolean,
    isWrong?: boolean
  ) => {
    const p = participants.find((item) => item.id === participantId);
    if (!p) return;

    const newScore = p.totalScore + amount;
    const currentRoundScore = (p.roundScores[activeRoundId] || 0) + amount;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newLog: ScoreLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timeStr,
      participantId,
      participantName: p.name,
      amount,
      reason,
      roundId: activeRoundId,
    };

    const updatedList = participants.map((item) => {
      if (item.id === participantId) {
        return {
          ...item,
          totalScore: newScore,
          roundScores: {
            ...item.roundScores,
            [activeRoundId]: currentRoundScore,
          },
          correctAnswers: isCorrect ? item.correctAnswers + 1 : item.correctAnswers,
          wrongAnswers: isWrong ? item.wrongAnswers + 1 : item.wrongAnswers,
          lastChange: amount,
          lastUpdated: Date.now(),
        };
      }
      return item;
    });

    const ranked = updateRanks(updatedList);
    setParticipants(ranked);
    setScoreLogs((prev) => [newLog, ...prev]);

    // Check if new rank is #1 and score increased
    const afterRank = ranked.find((item) => item.id === participantId);
    if (afterRank && afterRank.rank === 1 && amount > 0) {
      triggerQuickConfetti();
    }
  };

  // Quick Inline Add from Table (+100, +50, -50)
  const handleQuickInlineAdd = (id: string, amount: number) => {
    if (amount > 0) {
      playCorrectSound(config.soundEnabled);
    } else {
      playWrongSound(config.soundEnabled);
    }
    handleAddScore(
      id,
      amount,
      amount > 0 ? `Tambah Poin (+${amount})` : `Kurang Poin (${amount})`,
      amount > 0,
      amount < 0
    );
  };

  // Apply Quiz Score (Auto-grading)
  const handleApplyQuizScore = (
    participantId: string,
    answers: Record<number, string>,
    totalPoints: number,
    correctCount: number,
    wrongCount: number
  ) => {
    const p = participants.find((item) => item.id === participantId);
    if (!p) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newLog: ScoreLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: timeStr,
      participantId,
      participantName: p.name,
      amount: totalPoints,
      reason: `Koreksi Lembar Jawaban Otomatis (${correctCount} Benar)`,
      roundId: activeRoundId,
    };

    const updatedList = participants.map((item) => {
      if (item.id === participantId) {
        return {
          ...item,
          totalScore: totalPoints,
          quizAnswers: answers,
          correctAnswers: correctCount,
          wrongAnswers: wrongCount,
          lastChange: totalPoints,
          lastUpdated: Date.now(),
        };
      }
      return item;
    });

    const ranked = updateRanks(updatedList);
    setParticipants(ranked);
    setScoreLogs((prev) => [newLog, ...prev]);
    triggerQuickConfetti();
  };

  // Undo Last Score Log
  const handleUndoLog = (logId: string) => {
    const targetLog = scoreLogs.find((l) => l.id === logId);
    if (!targetLog) return;

    const updatedList = participants.map((p) => {
      if (p.id === targetLog.participantId) {
        const revertedScore = p.totalScore - targetLog.amount;
        return {
          ...p,
          totalScore: revertedScore,
        };
      }
      return p;
    });

    setParticipants(updateRanks(updatedList));
    setScoreLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  // Toggle status (Active / Eliminated)
  const handleToggleStatus = (id: string) => {
    const updated = participants.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          status: p.status === 'active' ? ('eliminated' as const) : ('active' as const),
        };
      }
      return p;
    });
    setParticipants(updated);
  };

  // Add Single Participant
  const handleAddParticipant = (
    data: Omit<Participant, 'id' | 'rank' | 'previousRank' | 'roundScores' | 'quizAnswers'>
  ) => {
    const newParticipant: Participant = {
      ...data,
      id: `p-${Date.now()}`,
      rank: participants.length + 1,
      previousRank: participants.length + 1,
      roundScores: {},
      quizAnswers: {},
    };

    const ranked = updateRanks([...participants, newParticipant]);
    setParticipants(ranked);
    setSelectedParticipantId(newParticipant.id);
  };

  // Update Participant
  const handleUpdateParticipant = (id: string, updates: Partial<Participant>) => {
    const updated = participants.map((p) => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      return p;
    });
    setParticipants(updateRanks(updated));
  };

  // Delete Participant
  const handleDeleteParticipant = (id: string) => {
    const remaining = participants.filter((p) => p.id !== id);
    setParticipants(updateRanks(remaining));
  };

  // Bulk Add Participants
  const handleBulkAdd = (names: string[], defaultGrade: string) => {
    const emojis = ['🦅', '🦁', '⚡', '🕊️', '🦊', '🌟', '🌸', '🚀', '🦋', '🐯'];
    const newItems: Participant[] = names.map((n, idx) => ({
      id: `bulk-${Date.now()}-${idx}`,
      name: n,
      grade: defaultGrade,
      avatar: emojis[idx % emojis.length],
      color: 'from-blue-500 to-indigo-600',
      totalScore: 0,
      roundScores: {},
      rank: participants.length + idx + 1,
      previousRank: participants.length + idx + 1,
      correctAnswers: 0,
      wrongAnswers: 0,
      quizAnswers: {},
      status: 'active',
    }));

    setParticipants(updateRanks([...participants, ...newItems]));
  };

  // Reset All Scores to 0
  const handleResetAllScores = () => {
    const resetList = participants.map((p) => ({
      ...p,
      totalScore: 0,
      roundScores: {},
      quizAnswers: {},
      correctAnswers: 0,
      wrongAnswers: 0,
    }));
    setParticipants(updateRanks(resetList));
    setScoreLogs([]);
  };

  // Load Presets
  const handleLoadPreset = (preset: 'cerdas-cermat' | 'ranking-1') => {
    if (preset === 'cerdas-cermat') {
      setParticipants(CERDAS_CERMAT_PARTICIPANTS);
      setConfig({
        ...config,
        competitionTitle: 'LOMBA CERDAS CERMAT SANG JUARA SD 2026',
        competitionSubtitle: 'Ajang Cepat Tepat & Sportivitas Siswa Sekolah Dasar',
        theme: 'cerdas-cermat',
      });
      setSelectedParticipantId(CERDAS_CERMAT_PARTICIPANTS[0].id);
    } else {
      setParticipants(RANKING_1_PARTICIPANTS);
      setConfig({
        ...config,
        competitionTitle: 'LOMBA RANKING 1 SAINS & MATEMATIKA SD',
        competitionSubtitle: 'Satu Pertanyaan, Satu Jawaban, Siapa Bertahan Jadi Juara 1!',
        theme: 'ranking-1',
      });
      setSelectedParticipantId(RANKING_1_PARTICIPANTS[0].id);
    }
    setScoreLogs([]);
  };

  // Grand Celebration Button Action
  const handleCelebrateWinner = () => {
    playWinnerSound(config.soundEnabled);
    triggerWinnerConfetti();
  };

  // Stats calculation
  const totalScoreAll = participants.reduce((acc, p) => acc + p.totalScore, 0);
  const highestScore = participants.length > 0 ? Math.max(...participants.map((p) => p.totalScore)) : 0;
  const currentChampion = [...participants].sort((a, b) => b.totalScore - a.totalScore)[0];
  const activeRound = rounds.find((r) => r.id === activeRoundId) || rounds[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      
      {/* App Header */}
      <Header
        config={config}
        onToggleSound={handleToggleSound}
        onOpenFullscreen={() => setIsFullscreen(true)}
        onOpenCertificate={() => setIsCertificateOpen(true)}
        onOpenParticipants={() => setIsParticipantsModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onResetData={handleResetAllScores}
        onLoadPreset={handleLoadPreset}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-600 fill-amber-600" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Pemimpin Skor</span>
              <div className="text-xs sm:text-sm font-extrabold text-slate-800 line-clamp-1">
                {currentChampion ? currentChampion.name : '-'}
              </div>
              <span className="text-xs font-black text-amber-600">{highestScore} Poin</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Peserta</span>
              <div className="text-base sm:text-lg font-black text-slate-800">{participants.length}</div>
              <span className="text-[10px] text-slate-400">Regu / Siswa</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Babak Berjalan</span>
              <div className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">
                {activeRound?.name.split(':')[0] || 'Babak Lomba'}
              </div>
              <span className="text-[10px] text-indigo-600 font-semibold">{rounds.length} Babak Tersedia</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Flame className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Akumulasi Skor</span>
              <div className="text-base sm:text-lg font-black text-emerald-700">{totalScoreAll}</div>
              <span className="text-[10px] text-slate-400">Poin Terkumpul</span>
            </div>
          </div>

        </div>

        {/* Podium Tiga Besar (Visual Stage) */}
        <Podium
          participants={participants}
          onCelebrate={handleCelebrateWinner}
          onSelectParticipant={(p) => setSelectedParticipantId(p.id)}
        />

        {/* Two-Column Core Layout: Auto-Scoring Input & Real-Time Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Panel Input Nilai Otomatis (Dewan Juri / Guru) */}
          <div className="lg:col-span-6 space-y-6">
            <AutoScoringPanel
              participants={participants}
              selectedParticipantId={selectedParticipantId}
              onSelectParticipant={setSelectedParticipantId}
              rounds={rounds}
              activeRoundId={activeRoundId}
              onChangeRound={setActiveRoundId}
              onAddScore={handleAddScore}
              onApplyQuizScore={handleApplyQuizScore}
              scoreLogs={scoreLogs}
              onUndoLog={handleUndoLog}
              config={config}
            />
          </div>

          {/* Right Column: Papan Peringkat Real-Time */}
          <div className="lg:col-span-6 space-y-6">
            <LeaderboardTable
              participants={participants}
              selectedParticipantId={selectedParticipantId}
              onSelectParticipant={setSelectedParticipantId}
              onQuickAdd={handleQuickInlineAdd}
              onToggleStatus={handleToggleStatus}
              rounds={rounds}
              config={config}
            />
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Sang Juara SD &mdash; Aplikasi Penilaian Lomba Sekolah Dasar</span>
          </div>
          <p className="text-slate-400">
            {config.schoolName} &bull; Ramah Proyektor & Layar Sentuh &bull; Dilengkapi Suara & Piagam Otomatis
          </p>
        </div>
      </footer>

      {/* Modals & Fullscreen Overlays */}
      {isFullscreen && (
        <FullscreenDisplay
          participants={participants}
          config={config}
          onClose={() => setIsFullscreen(false)}
          onCelebrate={handleCelebrateWinner}
          onToggleSound={handleToggleSound}
        />
      )}

      {isCertificateOpen && (
        <CertificateModal
          participants={participants}
          config={config}
          onClose={() => setIsCertificateOpen(false)}
        />
      )}

      {isParticipantsModalOpen && (
        <ManageParticipantsModal
          participants={participants}
          onAddParticipant={handleAddParticipant}
          onUpdateParticipant={handleUpdateParticipant}
          onDeleteParticipant={handleDeleteParticipant}
          onBulkAdd={handleBulkAdd}
          onResetAllScores={handleResetAllScores}
          onClose={() => setIsParticipantsModalOpen(false)}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          config={config}
          onSaveConfig={setConfig}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}

    </div>
  );
}
