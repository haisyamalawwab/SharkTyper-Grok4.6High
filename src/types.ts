export type View =
  | "splash"
  | "map"
  | "lesson"
  | "typer"
  | "tower"
  | "results"
  | "materi";

export type Track = "html" | "css" | "js";
export type MissionKind = "normal" | "uts" | "uas";
export type GameMode = "typer" | "tower";

export interface TowerQ {
  question: string;
  options: [string, string, string];
  correct: 0 | 1 | 2;
  explain: string;
}

export interface LessonCard {
  title: string;
  body: string;
  code?: string;
}

export interface Mission {
  id: number;
  title: string;
  subtitle: string;
  track: Track;
  kind: MissionKind;
  xp: number;
  description: string;
  lesson: LessonCard[];
  typer: string[];
  tower: TowerQ[];
}

export interface GameStats {
  missionsPlayed: number;
  totalTyped: number;
  totalCorrect: number;
  bestWpm: number;
  maxCombo: number;
  materialsRead: number;
}

export interface GameResult {
  mode: GameMode;
  missionId: number;
  xpGained: number;
  accuracy: number;
  wpm: number;
  combo: number;
  score: number;
  passed: boolean;
}

export interface SaveState {
  level: number;
  xp: number;
  completedMissions: number[];
  unlockedMissions: number[];
  readMaterials: number[];
  stats: GameStats;
  soundEnabled: boolean;
  highScores: Record<number, number>;
}

export interface Toast {
  id: number;
  text: string;
  kind: "info" | "success" | "warn" | "lock";
}
