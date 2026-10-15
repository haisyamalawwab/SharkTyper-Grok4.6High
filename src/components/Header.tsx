import type { ReactNode } from "react";
import { Bell, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useGame } from "../context/GameContext";
import { sfx } from "../audio";

export default function Header() {
  const { save, xpNeed, toggleSound, resetSave, setView } = useGame();
  const pct = Math.min(100, Math.round((save.xp / xpNeed) * 100));

  return (
    <header className="relative z-30 flex items-center gap-3 px-3 py-2.5 sm:px-5">
      <button
        onClick={() => {
          sfx.click();
          setView("map");
        }}
        className="btn-press group flex items-center gap-2.5"
      >
        <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400/20 to-sky-900/40 shadow-[0_0_18px_rgba(34,211,238,0.35)]">
          <img src="/images/logo-shark.png" alt="" className="h-10 w-10 object-cover" />
        </span>
        <span className="hidden text-left sm:block">
          <span className="block font-orbitron text-[11px] font-extrabold tracking-[0.22em] text-cyan-50 sm:text-sm">
            CODESHARK
          </span>
          <span className="block font-orbitron text-[10px] font-semibold tracking-[0.32em] text-cyan-300/80">
            ACADEMY
          </span>
        </span>
      </button>

      <span className="rounded-full bg-gradient-to-b from-amber-300 to-orange-500 px-2.5 py-1 font-orbitron text-[10px] font-extrabold text-slate-900 shadow-[0_0_16px_rgba(251,146,60,0.55)] sm:text-xs">
        LV {save.level}
      </span>

      <div className="relative mx-1 flex min-w-0 flex-1 items-center">
        <div className="relative h-3 w-full max-w-md overflow-hidden rounded-full border border-emerald-300/30 bg-slate-950/70 sm:h-3.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-300 to-cyan-300 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{ animation: "xpShine 2.8s ease infinite" }} />
          </div>
        </div>
        <span className="ml-2 hidden shrink-0 font-orbitron text-[10px] font-bold tracking-wider text-white drop-shadow sm:inline">
          {save.xp} / {xpNeed} XP
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <HudIcon label="Notifikasi">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-orange-400 px-1 font-orbitron text-[9px] font-bold text-slate-900">
            0
          </span>
        </HudIcon>
        <HudIcon
          label={save.soundEnabled ? "Matikan suara" : "Nyalakan suara"}
          onClick={toggleSound}
        >
          {save.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </HudIcon>
        <HudIcon
          label="Reset progress"
          onClick={() => {
            if (confirm("Reset semua progress CodeShark Academy?")) resetSave();
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </HudIcon>
      </div>
    </header>
  );
}

function HudIcon({
  children,
  onClick,
  label,
}: {
  children: ReactNode;
  onClick?: () => void;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      onMouseEnter={() => sfx.hover()}
      className="btn-press relative grid h-9 w-9 place-items-center rounded-xl border border-cyan-300/25 bg-slate-950/40 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.15)] hover:border-cyan-200/50"
    >
      {children}
    </button>
  );
}
