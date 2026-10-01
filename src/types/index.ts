export interface Participant {
  id: string;
  name: string;
  members?: string;
  grade: string;
  avatar: string;
  color: string;
  totalScore: number;
  roundScores: Record<string, number>;
  rank: number;
  previousRank: number;
  correctAnswers: number;
  wrongAnswers: number;
  quizAnswers: Record<number, string>;
  status: 'active' | 'eliminated';
  lastChange?: number;
  lastUpdated?: number;
}

export interface ScoreLogEntry {
  id: string;
  timestamp: string;
  participantId: string;
  participantName: string;
  amount: number;
  reason: string;
  roundId: string;
}

export interface Round {
  id: string;
  name: string;
  description: string;
  defaultCorrect: number;
  defaultWrong: number;
}

export interface CompetitionConfig {
  schoolName: string;
  competitionTitle: string;
  competitionSubtitle: string;
  theme: 'cerdas-cermat' | 'ranking-1' | 'olimpiade' | 'custom';
  headmasterName: string;
  judgeName: string;
  date: string;
  soundEnabled: boolean;
  quizAnswerKey: string[];
  quizPointPerQuestion: number;
}
