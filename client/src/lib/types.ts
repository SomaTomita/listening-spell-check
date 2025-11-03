export type Word = {
  en: string;
  ja: string;
  tags?: string[];
  variants?: string[];
  spellingMap?: Record<string, string>;
};

export type MistakeEntry = {
  seen: number;
  correct: number;
  streakWrong: number;
  lastTs?: number;
};

export type MistakesMap = Record<string, MistakeEntry>;

export type MotivationStats = {
  todayCount: number;
  streakDays: number;
  weekTotal: number;
  lastUpdated: string | null;
};

export type Settings = {
  voice: string | null;
  volume: number;
  darkMode: boolean;
};
