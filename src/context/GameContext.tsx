import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { missions, xpToNext } from "../data/missions";
import { setMuted, sfx, unlockAudio } from "../audio";
import type {
  GameResult,
  GameStats,
  SaveState,
  Toast,
  View,
} from "../types";

const SAVE_KEY = "codeshark-academy-v1";

const defaultStats: GameStats = {
  missionsPlayed: 0,
  totalTyped: 0,
  totalCorrect: 0,
  bestWpm: 0,
  maxCombo: 0,
  materialsRead: 0,
};

const defaultSave: SaveState = {
  level: 1,
  xp: 0,
  completedMissions: [],
  unlockedMissions: [1],
  readMaterials: [],
  stats: defaultStats,
  soundEnabled: true,
  highScores: {},
};

function loadSave(): SaveState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave;
    return { ...defaultSave, ...JSON.parse(raw) };
  } catch {
    return defaultSave;
  }
}

interface GameCtx {
  save: SaveState;
  view: View;
  setView: (v: View) => void;
  selectedId: number;
  selectMission: (id: number) => void;
  result: GameResult | null;
  toasts: Toast[];
  pushToast: (text: string, kind?: Toast["kind"]) => void;
  toggleSound: () => void;
  startLesson: () => void;
  startTyper: () => void;
  startTower: () => void;
  finishGame: (r: Omit<GameResult, "xpGained" | "passed"> & { passed: boolean }) => void;
  markMaterialRead: (missionId: number) => void;
  resetSave: () => void;
  accuracy: number;
  xpNeed: number;
}

const Ctx = createContext<GameCtx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [save, setSave] = useState<SaveState>(() => loadSave());
  const [view, setView] = useState<View>("splash");
  const [selectedId, setSelectedId] = useState(1);
  const [result, setResult] = useState<GameResult | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    setMuted(!save.soundEnabled);
  }, [save]);

  const pushToast = useCallback((text: string, kind: Toast["kind"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const selectMission = useCallback(
    (id: number) => {
      const unlocked = save.unlockedMissions.includes(id);
      if (!unlocked) {
        sfx.lock();
        pushToast("Misi terkunci. Selesaikan misi sebelumnya dulu.", "lock");
        return;
      }
      sfx.click();
      setSelectedId(id);
    },
    [save.unlockedMissions, pushToast],
  );

  const toggleSound = useCallback(() => {
    setSave((s) => {
      const next = !s.soundEnabled;
      setMuted(!next);
      if (next) sfx.click();
      return { ...s, soundEnabled: next };
    });
  }, []);

  const startLesson = useCallback(() => {
    unlockAudio();
    sfx.whoosh();
    setView("lesson");
  }, []);

  const startTyper = useCallback(() => {
    unlockAudio();
    sfx.whoosh();
    setView("typer");
  }, []);

  const startTower = useCallback(() => {
    unlockAudio();
    sfx.whoosh();
    setView("tower");
  }, []);

  const finishGame = useCallback(
    (r: Omit<GameResult, "xpGained" | "passed"> & { passed: boolean }) => {
      const mission = missions.find((m) => m.id === r.missionId)!;
      const xpGained = r.passed ? Math.round(mission.xp * (0.6 + r.accuracy * 0.4)) : Math.round(mission.xp * 0.15);
      const full: GameResult = { ...r, xpGained };

      setSave((s) => {
        let xp = s.xp + xpGained;
        let level = s.level;
        let need = xpToNext(level);
        let leveled = false;
        while (xp >= need) {
          xp -= need;
          level += 1;
          need = xpToNext(level);
          leveled = true;
        }

        const completed = r.passed && !s.completedMissions.includes(r.missionId)
          ? [...s.completedMissions, r.missionId]
          : s.completedMissions;

        const unlocked = new Set(s.unlockedMissions);
        if (r.passed) {
          const nxt = r.missionId + 1;
          if (nxt <= 16) unlocked.add(nxt);
        }

        const totalTyped = s.stats.totalTyped + 100;
        const totalCorrect = s.stats.totalCorrect + Math.round(100 * r.accuracy);

        const stats: GameStats = {
          missionsPlayed: s.stats.missionsPlayed + 1,
          totalTyped,
          totalCorrect,
          bestWpm: Math.max(s.stats.bestWpm, r.wpm),
          maxCombo: Math.max(s.stats.maxCombo, r.combo),
          materialsRead: s.stats.materialsRead,
        };

        const highScores = {
          ...s.highScores,
          [r.missionId]: Math.max(s.highScores[r.missionId] || 0, r.score),
        };

        if (leveled) setTimeout(() => sfx.levelup(), 400);
        if (r.passed && !s.completedMissions.includes(r.missionId) && r.missionId < 16) {
          setTimeout(() => {
            sfx.unlock();
            pushToast(`Misi ${r.missionId + 1} terbuka!`, "success");
          }, 700);
        }

        return {
          ...s,
          xp,
          level,
          completedMissions: completed,
          unlockedMissions: Array.from(unlocked).sort((a, b) => a - b),
          stats,
          highScores,
        };
      });

      if (r.passed) sfx.complete();
      else sfx.error();
      setResult(full);
      setView("results");
    },
    [pushToast],
  );

  const markMaterialRead = useCallback((missionId: number) => {
    setSave((s) => {
      if (s.readMaterials.includes(missionId)) return s;
      return {
        ...s,
        readMaterials: [...s.readMaterials, missionId],
        stats: { ...s.stats, materialsRead: s.stats.materialsRead + 1 },
      };
    });
  }, []);

  const resetSave = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
    setSave(defaultSave);
    setSelectedId(1);
    setView("map");
    sfx.whoosh();
    pushToast("Progress direset. Selamat menyelam lagi!", "info");
  }, [pushToast]);

  const accuracy =
    save.stats.totalTyped === 0
      ? 0
      : Math.round((save.stats.totalCorrect / save.stats.totalTyped) * 100);

  const value = useMemo<GameCtx>(
    () => ({
      save,
      view,
      setView,
      selectedId,
      selectMission,
      result,
      toasts,
      pushToast,
      toggleSound,
      startLesson,
      startTyper,
      startTower,
      finishGame,
      markMaterialRead,
      resetSave,
      accuracy,
      xpNeed: xpToNext(save.level),
    }),
    [
      save,
      view,
      selectedId,
      selectMission,
      result,
      toasts,
      pushToast,
      toggleSound,
      startLesson,
      startTyper,
      startTower,
      finishGame,
      markMaterialRead,
      resetSave,
      accuracy,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGame() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useGame outside provider");
  return v;
}
