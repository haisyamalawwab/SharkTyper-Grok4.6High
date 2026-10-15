import { ArrowLeft, Keyboard, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { useGame } from "../context/GameContext";
import { getMission } from "../data/missions";
import { sfx } from "../audio";
import Bubbles from "./Bubbles";

export default function ResultsScreen() {
  const { result, setView, startTyper, startTower, selectedId } = useGame();
  if (!result) return null;
  const m = getMission(result.missionId || selectedId);
  const acc = Math.round(result.accuracy * 100);
  const passed = result.passed;

  return (
    <div className="relative flex h-dvh min-h-dvh flex-col items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-[#031018]" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-45"
        style={{ backgroundImage: "url(/images/bg-ocean.jpg)" }}
      />
      <div className="caustics absolute inset-0" />
      <Bubbles count={passed ? 26 : 10} />

      <div className="relative z-10 w-full max-w-lg animate-pop">
        <div className="mb-4 flex justify-center">
          <div
            className={`grid h-20 w-20 place-items-center rounded-full border ${
              passed
                ? "border-amber-300 bg-gradient-to-b from-amber-300 to-orange-500 text-slate-900 shadow-[0_0_32px_rgba(251,191,36,0.55)]"
                : "border-rose-300/40 bg-slate-950 text-rose-300"
            }`}
          >
            {passed ? <Trophy className="h-9 w-9" /> : <RotateCcw className="h-8 w-8" />}
          </div>
        </div>
        <h1 className="text-center font-orbitron text-2xl font-black tracking-wide">
          {passed ? "MISI SELESAI" : "TENGGELAM DULU"}
        </h1>
        <p className="mt-1 text-center text-sm text-cyan-100/70">
          {m.title} · {result.mode === "typer" ? "Shark Typer" : "Coding Tower"}
        </p>

        <div className="glass mt-5 grid grid-cols-2 gap-2 rounded-2xl p-3 sm:grid-cols-4">
          <Cell label="SKOR" value={String(result.score)} />
          <Cell label="AKURASI" value={`${acc}%`} />
          <Cell label="WPM" value={String(result.wpm)} />
          <Cell label="COMBO" value={`x${result.combo}`} />
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 py-2 text-sm font-semibold text-emerald-200">
          <Sparkles className="h-4 w-4" /> +{result.xpGained} XP
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => {
              sfx.click();
              setView("map");
            }}
            className="btn-press flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-slate-950/60 py-3 text-sm font-bold"
          >
            <ArrowLeft className="h-4 w-4" /> Peta
          </button>
          <button
            onClick={() => {
              sfx.click();
              result.mode === "typer" ? startTyper() : startTower();
            }}
            className="btn-press flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 py-3 text-sm font-extrabold text-slate-900"
          >
            <Keyboard className="h-4 w-4" /> Main Lagi
          </button>
        </div>
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-950/40 px-2 py-2 text-center">
      <div className="font-orbitron text-[9px] tracking-widest text-cyan-200/60">{label}</div>
      <div className="hud-num gold-text text-lg">{value}</div>
    </div>
  );
}
