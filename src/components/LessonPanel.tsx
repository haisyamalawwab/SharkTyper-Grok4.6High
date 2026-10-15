import { ArrowLeft, BookOpenCheck, Keyboard, ArrowUp } from "lucide-react";
import { useEffect } from "react";
import { useGame } from "../context/GameContext";
import { getMission } from "../data/missions";
import { sfx } from "../audio";
import Bubbles from "./Bubbles";

export default function LessonPanel() {
  const { selectedId, setView, startTyper, startTower, markMaterialRead } = useGame();
  const m = getMission(selectedId);

  useEffect(() => {
    markMaterialRead(selectedId);
  }, [selectedId, markMaterialRead]);

  return (
    <div className="relative flex h-dvh min-h-dvh flex-col overflow-hidden">
      <div className="absolute inset-0 bg-[#041422]" />
      <div className="caustics absolute inset-0" />
      <Bubbles count={12} />

      <div className="relative z-10 flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => {
            sfx.click();
            setView("map");
          }}
          className="btn-press grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/25 bg-slate-950/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="font-orbitron text-[10px] tracking-[0.22em] text-amber-300">
            MATERI · MISI {String(m.id).padStart(2, "0")}
          </div>
          <h1 className="text-lg font-bold sm:text-xl">
            {m.title} <span className="text-cyan-300/70">— {m.subtitle}</span>
          </h1>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl flex-1 overflow-y-auto scroll-thin px-4 pb-36">
        <p className="mb-5 text-sm leading-relaxed text-cyan-100/80">{m.description}</p>
        <div className="space-y-4">
          {m.lesson.map((card, i) => (
            <article
              key={card.title}
              className="glass animate-slide-up rounded-2xl p-4 sm:p-5"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-400/15 font-orbitron text-xs font-bold text-cyan-300">
                  {i + 1}
                </span>
                <h2 className="font-bold">{card.title}</h2>
              </div>
              <p className="text-sm leading-relaxed text-cyan-50/80">{card.body}</p>
              {card.code && (
                <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950/80 p-3 font-mono text-[12px] leading-relaxed text-emerald-200 ring-1 ring-cyan-400/15">
                  {card.code}
                </pre>
              )}
            </article>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
          <BookOpenCheck className="h-4 w-4" /> Materi ini tercatat di perpustakaan akademi.
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-cyan-400/10 bg-[#041422]/80 p-3 backdrop-blur-md sm:p-4">
        <div className="mx-auto flex max-w-3xl gap-2">
          <button
            onClick={startTyper}
            className="btn-press flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 py-3 text-sm font-extrabold text-slate-900"
          >
            <Keyboard className="h-4 w-4" /> Shark Typer
          </button>
          <button
            onClick={startTower}
            className="btn-press flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 py-3 text-sm font-extrabold text-slate-900"
          >
            <ArrowUp className="h-4 w-4" /> Coding Tower
          </button>
        </div>
      </div>
    </div>
  );
}
