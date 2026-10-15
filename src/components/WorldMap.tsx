import { Lock } from "lucide-react";
import { useGame } from "../context/GameContext";
import { missions } from "../data/missions";
import { sfx } from "../audio";
import type { Mission } from "../types";

type NodePos = { id: number; x: number; y: number; lg?: boolean };

const NODES: NodePos[] = [
  { id: 1, x: 20.5, y: 52, lg: true },
  { id: 2, x: 28, y: 64 },
  { id: 3, x: 26.5, y: 76 },
  { id: 4, x: 36, y: 84 },
  { id: 5, x: 45.5, y: 89 },
  { id: 6, x: 55.5, y: 90 },
  { id: 7, x: 65, y: 85 },
  { id: 8, x: 74.5, y: 76, lg: true },
  { id: 9, x: 50, y: 68 },
  { id: 10, x: 46.5, y: 56 },
  { id: 11, x: 45.2, y: 44 },
  { id: 12, x: 48.5, y: 32 },
  { id: 13, x: 56.5, y: 24 },
  { id: 14, x: 66, y: 21 },
  { id: 15, x: 75.5, y: 27 },
  { id: 16, x: 88, y: 38, lg: true },
];

const PATH =
  "M 20.5 52 C 25 56 27 60 28 64 C 27 70 25.5 74 26.5 76 C 30 81 33 83 36 84 C 40 87 42 88.5 45.5 89 C 50 90.2 52 90.4 55.5 90 C 60 89 62.5 87 65 85 C 69 82 72 79 74.5 76 C 68 74 58 72 50 68 C 47.5 62 47 59 46.5 56 C 45.8 50 45.4 47 45.2 44 C 45 38 46 35 48.5 32 C 52 27 54 25 56.5 24 C 61 22 63.5 21 66 21 C 70.5 21 73 24 75.5 27 C 80 31 84 34 88 38";

export default function WorldMap() {
  const { save, selectedId, selectMission } = useGame();

  return (
    <div className="relative h-full min-h-[520px] w-full overflow-hidden">
      {/* Desktop illustrated map */}
      <div className="absolute inset-0 hidden md:block">
        <img
          src="/images/dome-html.png"
          alt=""
          className="landmark absolute animate-floaty mix-blend-lighten"
          style={{ left: "6%", top: "18%", width: "28%", maxWidth: 360 }}
        />
        <img
          src="/images/dome-css.png"
          alt=""
          className="landmark absolute animate-floaty mix-blend-lighten"
          style={{ left: "54%", top: "38%", width: "30%", maxWidth: 380, animationDelay: "-1.6s" }}
        />
        <img
          src="/images/station-js.png"
          alt=""
          className="landmark absolute animate-floaty mix-blend-lighten"
          style={{ left: "68%", top: "2%", width: "32%", maxWidth: 420, animationDelay: "-0.8s" }}
        />

        <img
          src="/images/whale-shark.png"
          alt=""
          className="pointer-events-none absolute w-36 opacity-90 mix-blend-lighten animate-swim-l sm:w-48"
          style={{ left: "28%", top: "10%" }}
        />
        <img
          src="/images/shark.png"
          alt=""
          className="pointer-events-none absolute w-28 opacity-90 mix-blend-lighten animate-swim-r sm:w-40"
          style={{ right: "6%", top: "48%" }}
        />

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="50%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path d={PATH} className="path-line" vectorEffect="non-scaling-stroke" />
          <path d={PATH} className="path-dash" vectorEffect="non-scaling-stroke" />
        </svg>

        {NODES.map((n) => {
          const m = missions[n.id - 1];
          return (
            <MapNode
              key={n.id}
              pos={n}
              mission={m}
              selected={selectedId === n.id}
              unlocked={save.unlockedMissions.includes(n.id)}
              completed={save.completedMissions.includes(n.id)}
              onSelect={() => selectMission(n.id)}
            />
          );
        })}

        {/* Big lock over JS station */}
        {!save.unlockedMissions.includes(16) && (
          <div className="pointer-events-none absolute right-[4%] top-[2%] hidden xl:block">
            <div className="relative">
              <Lock className="animate-lock h-24 w-24 text-fuchsia-300" strokeWidth={1.4} />
              <span className="absolute -top-3 right-6 rotate-6 rounded-md border border-fuchsia-300/40 bg-fuchsia-500/20 px-2 py-0.5 font-orbitron text-[10px] tracking-widest text-fuchsia-100">
                START GAME
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile / tablet vertical path */}
      <div className="scroll-thin absolute inset-0 overflow-y-auto px-4 pb-40 pt-4 md:hidden">
        <MobilePath />
      </div>
    </div>
  );
}

function MapNode({
  pos,
  mission,
  selected,
  unlocked,
  completed,
  onSelect,
}: {
  pos: NodePos;
  mission: Mission;
  selected: boolean;
  unlocked: boolean;
  completed: boolean;
  onSelect: () => void;
}) {
  const size = pos.lg ? 64 : 42;
  const isExam = mission.kind !== "normal";

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => unlocked && sfx.hover()}
      style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
      className={`node-core absolute grid place-items-center rounded-full font-orbitron text-sm font-extrabold ${
        selected && unlocked
          ? "animate-pulse-glow z-20 bg-gradient-to-b from-amber-300 to-orange-500 text-slate-900"
          : completed
            ? "z-10 border-2 border-cyan-300 bg-gradient-to-b from-cyan-300 to-teal-600 text-slate-900"
            : unlocked
              ? "z-10 border-2 border-cyan-200/70 bg-slate-900/80 text-cyan-100"
              : "z-[5] border border-white/15 bg-[#0b1524]/90 text-slate-400"
      } ${isExam && !selected ? "ring-2 ring-fuchsia-400/50" : ""}`}
    >
      {unlocked ? (
        pos.id
      ) : (
        <span className="flex flex-col items-center leading-none">
          <Lock className="mb-0.5 h-3 w-3 opacity-80" />
          <span className="text-[10px]">{pos.id}</span>
        </span>
      )}

      {selected && unlocked && (
        <span className="pointer-events-none absolute inset-[-7px] rounded-full border-2 border-amber-300/70" />
      )}

      {(selected || pos.lg) && unlocked && (
        <Label mission={mission} side={pos.x < 40 ? "left" : "right"} exam={isExam} />
      )}
      {pos.id === 16 && !unlocked && (
        <div className="pointer-events-none absolute top-1/2 left-[-12px] hidden -translate-x-full -translate-y-1/2 text-right xl:block">
          <div className="font-orbitron text-lg font-extrabold tracking-wide text-fuchsia-200">16</div>
          <div className="text-xs font-semibold text-fuchsia-100/90">UAS 03</div>
          <div className="text-sm font-bold text-white">Javascript</div>
          <div className="text-[11px] text-cyan-200/70">Interaksi DOM</div>
        </div>
      )}
    </button>
  );
}

function Label({
  mission,
  side,
  exam,
}: {
  mission: Mission;
  side: "left" | "right";
  exam: boolean;
}) {
  return (
    <div
      className={`pointer-events-none absolute top-1/2 z-30 hidden -translate-y-1/2 whitespace-nowrap xl:block ${
        side === "left" ? "right-[calc(100%+14px)] text-right" : "left-[calc(100%+14px)] text-left"
      }`}
    >
      <div className={`font-orbitron text-[11px] font-bold tracking-[0.18em] ${exam ? "text-fuchsia-300" : "text-amber-300"}`}>
        {mission.kind === "uts" ? "UTS" : mission.kind === "uas" ? "UAS" : "MISI"} {String(mission.id).padStart(2, "0")}
      </div>
      <div className="text-base font-extrabold text-white drop-shadow">{mission.title}</div>
      <div className="text-xs text-cyan-200/80">{mission.subtitle}</div>
    </div>
  );
}

function MobilePath() {
  const { save, selectedId, selectMission } = useGame();
  return (
    <div className="relative mx-auto max-w-md pb-8">
      <div className="absolute top-6 bottom-6 left-1/2 w-1 -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-400 via-teal-500 to-fuchsia-500 opacity-70" />
      <div className="flex flex-col gap-8">
        {missions.map((m, i) => {
          const unlocked = save.unlockedMissions.includes(m.id);
          const completed = save.completedMissions.includes(m.id);
          const selected = selectedId === m.id;
          const left = i % 2 === 0;
          return (
            <div key={m.id} className={`relative flex items-center ${left ? "flex-row" : "flex-row-reverse"}`}>
              <button
                onClick={() => selectMission(m.id)}
                className={`relative z-10 mx-auto grid h-14 w-14 shrink-0 place-items-center rounded-full font-orbitron text-lg font-extrabold ${
                  selected && unlocked
                    ? "animate-pulse-glow bg-gradient-to-b from-amber-300 to-orange-500 text-slate-900"
                    : completed
                      ? "border-2 border-cyan-300 bg-teal-600 text-white"
                      : unlocked
                        ? "border-2 border-cyan-200 bg-slate-900 text-cyan-100"
                        : "border border-white/20 bg-slate-950 text-slate-400"
                }`}
              >
                {unlocked ? m.id : <Lock className="h-4 w-4" />}
              </button>
              <div className={`w-[42%] ${left ? "pl-3 text-left" : "pr-3 text-right"}`}>
                <div className="text-[10px] font-bold tracking-widest text-amber-300">
                  {m.kind === "uts" ? "UTS" : m.kind === "uas" ? "UAS" : "MISI"} {String(m.id).padStart(2, "0")}
                </div>
                <div className="text-sm font-bold">{m.title}</div>
                <div className="text-[11px] text-cyan-200/70">{m.subtitle}</div>
              </div>
              {m.id === 1 && (
                <img src="/images/dome-html.png" alt="" className="absolute -left-2 top-10 w-24 opacity-80" />
              )}
              {m.id === 8 && (
                <img src="/images/dome-css.png" alt="" className="absolute -right-2 -top-6 w-28 opacity-90" />
              )}
              {m.id === 16 && (
                <img src="/images/station-js.png" alt="" className="absolute -right-4 -top-8 w-32 opacity-90" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
