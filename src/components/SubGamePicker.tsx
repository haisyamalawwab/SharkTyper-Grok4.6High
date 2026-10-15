import type { ReactNode } from "react";
import { Keyboard, Lightbulb, Undo2, ArrowUp } from "lucide-react";
import { useGame } from "../context/GameContext";
import { getMission } from "../data/missions";
import { sfx } from "../audio";

export default function SubGamePicker() {
  const { selectedId, save, startTyper, startTower, startLesson } = useGame();
  const m = getMission(selectedId);
  const unlocked = save.unlockedMissions.includes(selectedId);
  const done = save.completedMissions.includes(selectedId);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 p-3 sm:p-5">
      <div className="pointer-events-auto flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="glass max-w-xl rounded-2xl p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="font-orbitron text-[11px] font-bold tracking-[0.22em] text-cyan-200/80">
              PILIH SUB-GAME
            </h2>
            <button
              onClick={startLesson}
              disabled={!unlocked}
              onMouseEnter={() => sfx.hover()}
              className="btn-press rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold text-amber-200 disabled:opacity-40"
            >
              Baca materi
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <GameCard
              title="CodeShark"
              badge="Ada petunjuk & undo"
              badgeTone="amber"
              action="Main Shark Typer"
              actionTone="orange"
              hint="Keyboard fisik"
              icon={<Keyboard className="h-4 w-4" />}
              disabled={!unlocked}
              onPlay={startTyper}
              extras={
                <span className="flex items-center gap-1 text-[10px] text-cyan-200/70">
                  <Lightbulb className="h-3 w-3" /> <Undo2 className="h-3 w-3" /> petunjuk & undo
                </span>
              }
            />
            <GameCard
              title="Coding Tower"
              badge="Tanpa mengetik simbol"
              badgeTone="cyan"
              action="Main Tower"
              actionTone="cyan"
              hint="Menggunakan tombol arah"
              icon={<ArrowUp className="h-4 w-4" />}
              disabled={!unlocked}
              onPlay={startTower}
            />
          </div>
        </div>

        <div className="glass hidden max-w-sm rounded-2xl p-4 lg:block">
          <div className="font-orbitron text-[10px] tracking-[0.2em] text-amber-300">
            {m.kind === "uts" ? "UTS" : m.kind === "uas" ? "UAS" : "MISI"} {String(m.id).padStart(2, "0")} · {m.track.toUpperCase()}
          </div>
          <div className="mt-1 text-lg font-bold">{m.title}</div>
          <p className="mt-1 text-xs leading-relaxed text-cyan-100/70">{m.description}</p>
          <div className="mt-3 flex items-center gap-2 text-[11px]">
            <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 font-semibold text-emerald-300">+{m.xp} XP</span>
            {done && <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 font-semibold text-cyan-300">Selesai</span>}
            {!unlocked && <span className="rounded-full bg-fuchsia-400/15 px-2 py-0.5 font-semibold text-fuchsia-300">Terkunci</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function GameCard({
  title,
  badge,
  badgeTone,
  action,
  actionTone,
  hint,
  icon,
  disabled,
  onPlay,
  extras,
}: {
  title: string;
  badge: string;
  badgeTone: "amber" | "cyan";
  action: string;
  actionTone: "orange" | "cyan";
  hint: string;
  icon: React.ReactNode;
  disabled: boolean;
  onPlay: () => void;
  extras?: ReactNode;
}) {
  const badgeCls =
    badgeTone === "amber"
      ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
      : "border-cyan-400/40 bg-cyan-400/10 text-cyan-200";
  const btnCls =
    actionTone === "orange"
      ? "from-orange-500 to-amber-400 text-slate-900 shadow-[0_8px_24px_rgba(249,115,22,0.35)]"
      : "from-sky-500 to-cyan-400 text-slate-900 shadow-[0_8px_24px_rgba(34,211,238,0.35)]";

  return (
    <div className={`relative rounded-xl border border-white/10 bg-slate-950/40 p-3 ${disabled ? "opacity-50" : ""}`}>
      <span className={`absolute -top-2 right-3 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${badgeCls}`}>
        {badge}
      </span>
      <div className="mb-2 flex items-center gap-2 text-sm font-bold">
        {icon}
        {title}
      </div>
      <button
        disabled={disabled}
        onClick={onPlay}
        onMouseEnter={() => !disabled && sfx.hover()}
        className={`btn-press w-full rounded-lg bg-gradient-to-r py-2.5 text-sm font-extrabold ${btnCls} disabled:cursor-not-allowed`}
      >
        {action}
      </button>
      <div className="mt-1.5 text-center text-[11px] text-cyan-100/60">{hint}</div>
      {extras}
    </div>
  );
}
