import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Plus, 
  Minus, 
  Bell, 
  Clock, 
  Play, 
  Pause, 
  CheckCheck,
  FileSpreadsheet,
  HelpCircle,
  Undo2
} from 'lucide-react';
import { Participant, Round, ScoreLogEntry, CompetitionConfig } from '../types';
import { playCorrectSound, playWrongSound, playBellSound, playTickSound } from '../utils/soundEffects';

interface AutoScoringPanelProps {
  participants: Participant[];
  selectedParticipantId: string;
  onSelectParticipant: (id: string) => void;
  rounds: Round[];
  activeRoundId: string;
  onChangeRound: (roundId: string) => void;
  onAddScore: (participantId: string, amount: number, reason: string, isCorrect?: boolean, isWrong?: boolean) => void;
  onApplyQuizScore: (participantId: string, answers: Record<number, string>, totalPoints: number, correctCount: number, wrongCount: number) => void;
  scoreLogs: ScoreLogEntry[];
  onUndoLog: (logId: string) => void;
  config: CompetitionConfig;
}

export const AutoScoringPanel: React.FC<AutoScoringPanelProps> = ({
  participants,
  selectedParticipantId,
  onSelectParticipant,
  rounds,
  activeRoundId,
  onChangeRound,
  onAddScore,
  onApplyQuizScore,
  scoreLogs,
  onUndoLog,
  config,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'quiz' | 'timer'>('quick');
  const [customPoints, setCustomPoints] = useState<number>(20);
  const [customReason, setCustomReason] = useState<string>('Bonus Nilai Tambahan');

  // Quiz Grading State
  const currentParticipant = participants.find((p) => p.id === selectedParticipantId) || participants[0];
  const [participantQuizAnswers, setParticipantQuizAnswers] = useState<Record<number, string>>(
    currentParticipant?.quizAnswers || {}
  );

  // Sync quiz answers when selected participant changes
  useEffect(() => {
    if (currentParticipant) {
      setParticipantQuizAnswers(currentParticipant.quizAnswers || {});
    }
  }, [selectedParticipantId, currentParticipant]);

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(10);
  const [initialTimer, setInitialTimer] = useState<number>(10);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [speedBonusEnabled, setSpeedBonusEnabled] = useState<boolean>(true);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            playBellSound(config.soundEnabled);
            setIsTimerRunning(false);
            return 0;
          }
          if (prev <= 4) {
            playTickSound(config.soundEnabled);
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds, config.soundEnabled]);

  const startPresetTimer = (seconds: number) => {
    setInitialTimer(seconds);
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
    playBellSound(config.soundEnabled);
  };

  const toggleTimer = () => {
    if (timerSeconds === 0) {
      setTimerSeconds(initialTimer);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(initialTimer);
  };

  // Quiz auto calculation
  const answerKey = config.quizAnswerKey || ['A', 'B', 'C', 'D'];
  const pointPerQuestion = config.quizPointPerQuestion || 10;

  const calculateQuizResults = () => {
    let correct = 0;
    let wrong = 0;
    answerKey.forEach((correctAnswer, idx) => {
      const chosen = participantQuizAnswers[idx];
      if (chosen) {
        if (chosen.toUpperCase() === correctAnswer.toUpperCase()) {
          correct++;
        } else {
          wrong++;
        }
      }
    });
    const calculatedScore = correct * pointPerQuestion;
    return { correct, wrong, calculatedScore };
  };

  const { correct: calculatedCorrect, wrong: calculatedWrong, calculatedScore } = calculateQuizResults();

  const handleSelectAnswer = (qIndex: number, option: string) => {
    const updated = { ...participantQuizAnswers, [qIndex]: option };
    setParticipantQuizAnswers(updated);
  };

  const handleApplyAutoGrading = () => {
    if (!currentParticipant) return;
    onApplyQuizScore(currentParticipant.id, participantQuizAnswers, calculatedScore, calculatedCorrect, calculatedWrong);
    playCorrectSound(config.soundEnabled);
  };

  const handleQuickGradeAllCorrect = () => {
    const allCorrect: Record<number, string> = {};
    answerKey.forEach((ans, idx) => {
      allCorrect[idx] = ans;
    });
    setParticipantQuizAnswers(allCorrect);
  };

  const activeRound = rounds.find((r) => r.id === activeRoundId) || rounds[0];

  // Helper for quick scoring
  const handleQuickScore = (amount: number, reason: string, isCorrect?: boolean, isWrong?: boolean) => {
    if (!currentParticipant) return;

    let finalAmount = amount;
    let finalReason = reason;

    // Apply speed bonus if timer is running and more than 40% time remains
    if (speedBonusEnabled && isTimerRunning && timerSeconds > initialTimer * 0.4 && amount > 0) {
      finalAmount += 10;
      finalReason += ' (+10 Bonus Cepat)';
    }

    if (isCorrect) {
      playCorrectSound(config.soundEnabled);
    } else if (isWrong) {
      playWrongSound(config.soundEnabled);
    } else if (amount > 0) {
      playCorrectSound(config.soundEnabled);
    } else {
      playWrongSound(config.soundEnabled);
    }

    onAddScore(currentParticipant.id, finalAmount, finalReason, isCorrect, isWrong);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200">
      
      {/* Top Banner: Feature Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shadow-inner">
            <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-800 flex items-center gap-2">
              Panel Input Nilai Otomatis
            </h3>
            <p className="text-xs text-slate-500">
              Sistem kalkulasi instan untuk Dewan Juri & Guru Penguji
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'quick'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Poin Kilat</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Koreksi Lembar Jawaban</span>
          </button>

          <button
            onClick={() => setActiveTab('timer')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'timer'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timer & Bel</span>
          </button>
        </div>
      </div>

      {/* Target Participant Picker */}
      <div className="mb-5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Pilih Peserta / Regu yang Dinilai:
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {participants.map((p) => {
            const isSelected = p.id === selectedParticipantId;
            return (
              <button
                key={p.id}
                onClick={() => onSelectParticipant(p.id)}
                className={`flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all border-2 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                }`}
              >
                <span className="text-2xl">{p.avatar}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 truncate">{p.name}</div>
                  <div className="text-[11px] font-extrabold text-blue-600">
                    {p.totalScore} <span className="text-[9px] font-normal text-slate-400">Poin</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Participant Status Strip */}
      {currentParticipant && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl p-3.5 mb-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow">
              {currentParticipant.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg">{currentParticipant.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950">
                  Peringkat #{currentParticipant.rank}
                </span>
              </div>
              <div className="text-xs text-blue-100 font-medium">
                {currentParticipant.grade} {currentParticipant.members ? `(${currentParticipant.members})` : ''}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 px-4 py-1.5 rounded-xl backdrop-blur-sm">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-blue-200 block">Total Skor</span>
              <span className="text-2xl font-black text-amber-300">{currentParticipant.totalScore}</span>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">Benar</span>
              <span className="text-base font-bold text-white">{currentParticipant.correctAnswers}</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-rose-200 block">Salah</span>
              <span className="text-base font-bold text-white">{currentParticipant.wrongAnswers}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: QUICK 1-TOUCH SCORING */}
      {activeTab === 'quick' && (
        <div className="space-y-4">
          
          {/* Round Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <span>Babak Penilaian:</span>
              <select
                value={activeRoundId}
                onChange={(e) => onChangeRound(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {rounds.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[11px] text-slate-500 italic">
              {activeRound.description}
            </div>
          </div>

          {/* Quick Point Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            
            {/* Benar Wajib */}
            <button
              onClick={() => handleQuickScore(100, `Benar (${activeRound.name})`, true, false)}
              className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-800 font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center text-center group"
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-lg font-black text-emerald-700">+100</span>
              <span className="text-xs font-semibold text-emerald-800">Jawaban Benar</span>
              <span className="text-[10px] text-emerald-600/80">Babak Wajib / Umum</span>
            </button>

            {/* Benar Rebutan (+100) */}
            <button
              onClick={() => handleQuickScore(100, 'Benar Babak Rebutan', true, false)}
              className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-900 font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center text-center group"
            >
              <Zap className="w-6 h-6 text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-lg font-black text-amber-700">+100</span>
              <span className="text-xs font-semibold text-amber-900">Benar Rebutan</span>
              <span className="text-[10px] text-amber-700/80">Adu Cepat Bel</span>
            </button>

            {/* Salah Rebutan (-50) */}
            <button
              onClick={() => handleQuickScore(-50, 'Salah Babak Rebutan (-50)', false, true)}
              className="p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 text-rose-800 font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center text-center group"
            >
              <XCircle className="w-6 h-6 text-rose-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-lg font-black text-rose-700">-50</span>
              <span className="text-xs font-semibold text-rose-800">Salah Rebutan</span>
              <span className="text-[10px] text-rose-600/80">Pengurangan Otomatis</span>
            </button>

            {/* Benar Lemparan (+50) */}
            <button
              onClick={() => handleQuickScore(50, 'Benar Soal Lemparan', true, false)}
              className="p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 text-blue-800 font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center text-center group"
            >
              <CheckCheck className="w-6 h-6 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-lg font-black text-blue-700">+50</span>
              <span className="text-xs font-semibold text-blue-800">Benar Lemparan</span>
              <span className="text-[10px] text-blue-600/80">Operan dari regu lain</span>
            </button>

          </div>

          {/* Secondary Quick Increments & Custom Score */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 mr-1">Bonus Cepat:</span>
              <button
                onClick={() => handleQuickScore(10, 'Bonus Kecepatan (+10)')}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                +10 Cepat
              </button>
              <button
                onClick={() => handleQuickScore(20, 'Bonus Tambahan (+20)')}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                +20 Poin
              </button>
              <button
                onClick={() => handleQuickScore(-10, 'Koreksi Nilai (-10)')}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                -10 Poin
              </button>
            </div>

            {/* Custom Input */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Alasan..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="text-xs border border-slate-300 rounded-xl px-2 py-1.5 w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="number"
                value={customPoints}
                onChange={(e) => setCustomPoints(Number(e.target.value))}
                className="text-xs font-bold border border-slate-300 rounded-xl px-2 py-1.5 w-16 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => handleQuickScore(customPoints, customReason || 'Penilaian Manual')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Terapkan
              </button>
            </div>
          </div>

          {/* Score History Log with Undo Feature */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Riwayat Penilaian Terakhir
              </span>
              {scoreLogs.length > 0 && (
                <button
                  onClick={() => onUndoLog(scoreLogs[0].id)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
                >
                  <Undo2 className="w-3.5 h-3.5" /> Batalkan Penilaian Terakhir (Undo)
                </button>
              )}
            </div>

            <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
              {scoreLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Belum ada riwayat penilaian.</p>
              ) : (
                scoreLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between text-xs py-1 px-2.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[10px]">{log.timestamp}</span>
                      <span className="font-bold text-slate-700">{log.participantName}:</span>
                      <span className="text-slate-600">{log.reason}</span>
                    </div>
                    <span
                      className={`font-black ${
                        log.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {log.amount >= 0 ? `+${log.amount}` : log.amount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: AUTO-GRADING ANSWER SHEET (KOREKSI LEMBAR JAWABAN) */}
      {activeTab === 'quiz' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                Koreksi Otomatis Lembar Jawaban ({answerKey.length} Soal)
              </h4>
              <p className="text-xs text-amber-800">
                Pilih jawaban murid untuk tiap soal. Sistem langsung mengoreksi kecocokan dengan Kunci Jawaban dan menghitung total skor!
              </p>
            </div>

            <button
              onClick={handleQuickGradeAllCorrect}
              className="px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow-sm transition-all whitespace-nowrap"
            >
              Isi Cepat Semua Benar
            </button>
          </div>

          {/* Matrix of Questions */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {answerKey.map((correctKey, qIdx) => {
              const selectedOption = participantQuizAnswers[qIdx] || '';
              const isFilled = selectedOption !== '';
              const isMatch = isFilled && selectedOption.toUpperCase() === correctKey.toUpperCase();

              return (
                <div
                  key={qIdx}
                  className={`p-3 rounded-2xl border-2 transition-all ${
                    !isFilled
                      ? 'border-slate-200 bg-slate-50'
                      : isMatch
                      ? 'border-emerald-400 bg-emerald-50/60'
                      : 'border-rose-400 bg-rose-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-700">Soal #{qIdx + 1}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700" title="Kunci Jawaban">
                      Kunci: {correctKey}
                    </span>
                  </div>

                  {/* Options A, B, C, D */}
                  <div className="grid grid-cols-4 gap-1">
                    {['A', 'B', 'C', 'D'].map((opt) => {
                      const isOptionSelected = selectedOption.toUpperCase() === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => handleSelectAnswer(qIdx, opt)}
                          className={`h-8 rounded-lg font-black text-xs transition-all ${
                            isOptionSelected
                              ? opt === correctKey
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-rose-600 text-white shadow-sm'
                              : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Auto-Grading Calculation Summary */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Hasil Otomatis:</span>
                <div className="flex items-center gap-3 text-sm font-bold mt-0.5">
                  <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> {calculatedCorrect} Benar
                  </span>
                  <span className="text-rose-400 font-extrabold flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> {calculatedWrong} Salah
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-white/20 hidden sm:block"></div>

              <div>
                <span className="text-xs text-amber-300 block font-bold">Kalkulasi Nilai Otomatis:</span>
                <span className="text-2xl font-black text-white">
                  {calculatedScore} <span className="text-xs font-normal text-slate-300">({calculatedCorrect} x {pointPerQuestion} poin)</span>
                </span>
              </div>
            </div>

            <button
              onClick={handleApplyAutoGrading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/30 transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCheck className="w-5 h-5" />
              <span>Simpan & Update Papan Peringkat</span>
            </button>
          </div>

        </div>
      )}

      {/* TAB 3: TIMER & BEL CERDAS CERMAT */}
      {activeTab === 'timer' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100">
            
            {/* Big Countdown Display */}
            <div className="flex items-center gap-4">
              <div className={`w-24 h-24 rounded-3xl flex flex-col items-center justify-center font-mono font-black text-3xl shadow-lg border-4 transition-colors ${
                timerSeconds <= 3 && timerSeconds > 0
                  ? 'bg-rose-500 text-white border-rose-300 animate-bounce'
                  : timerSeconds === 0
                  ? 'bg-rose-600 text-white border-rose-400'
                  : 'bg-indigo-600 text-white border-indigo-400'
              }`}>
                <span>{timerSeconds}s</span>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider opacity-80">
                  {timerSeconds === 0 ? 'Habis!' : 'Detik'}
                </span>
              </div>

              <div>
                <div className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Timer Cerdas Cermat SD
                </div>
                <p className="text-xs text-indigo-800 max-w-xs mt-0.5">
                  Gunakan untuk membatasi waktu berpikir dan memicu adrenalin peserta!
                </p>

                {/* Speed bonus checkbox */}
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={speedBonusEnabled}
                    onChange={(e) => setSpeedBonusEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-indigo-900">
                    Auto-Bonus Kecepatan (+10 jika jawab cepat)
                  </span>
                </label>
              </div>
            </div>

            {/* Timer Controls & Buzzer */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={toggleTimer}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-sm shadow-sm transition-all flex items-center gap-2 ${
                  isTimerRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-amber-950'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isTimerRunning ? 'Jeda' : 'Mulai'}</span>
              </button>

              <button
                onClick={resetTimer}
                className="p-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => playBellSound(config.soundEnabled)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2"
                title="Bunyikan Bel Cerdas Cermat"
              >
                <Bell className="w-4 h-4 animate-wiggle" />
                <span>Bunyikan Bel!</span>
              </button>
            </div>

          </div>

          {/* Quick Preset Timer Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-400 mr-1">Preset Waktu:</span>
            <button
              onClick={() => startPresetTimer(5)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 font-bold text-xs text-slate-700 transition-colors"
            >
              5 Detik (Rebutan Cepat)
            </button>
            <button
              onClick={() => startPresetTimer(10)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 font-bold text-xs text-slate-700 transition-colors"
            >
              10 Detik (Standar Rebutan)
            </button>
            <button
              onClick={() => startPresetTimer(30)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 font-bold text-xs text-slate-700 transition-colors"
            >
              30 Detik (Soal Wajib)
            </button>
            <button
              onClick={() => startPresetTimer(60)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 font-bold text-xs text-slate-700 transition-colors"
            >
              60 Detik (Diskusi Regu)
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
