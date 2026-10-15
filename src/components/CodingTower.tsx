import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, Heart, Lightbulb } from "lucide-react";
import { useGame } from "../context/GameContext";
import { getMission } from "../data/missions";
import { sfx } from "../audio";
import Bubbles from "./Bubbles";

const LIVES = 3;

export default function CodingTower() {
  const { selectedId, setView, finishGame } = useGame();
  const mission = getMission(selectedId);
  const qs = mission.tower;

  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<0 | 1 | 2>(1);
  const [lives, setLives] = useState(LIVES);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [correctN, setCorrectN] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "bad" | null>(null);
  const [explain, setExplain] = useState<string | null>(null);
  const [hintOn, setHintOn] = useState(false);
  const [shake, setShake] = useState(false);
  const locked = useRef(false);
  const startTime = useRef(0);
  const finished = useRef(false);

  const q = qs[idx];
  const total = qs.length;

  useEffect(() => {
    if (!started) return;
    startTime.current = performance.now();
  }, [started]);

  function endRun(passed: boolean, cN: number, ans: number, sc: number, mc: number) {
    if (finished.current) return;
    finished.current = true;
    const elapsed = Math.max(1, (performance.now() - startTime.current) / 1000 / 60);
    const wpm = Math.round((cN * 8) / elapsed);
    const acc = ans === 0 ? 0 : cN / ans;
    setTimeout(() => {
      finishGame({
        mode: "tower",
        missionId: selectedId,
        accuracy: acc,
        wpm,
        combo: mc,
        score: sc,
        passed,
      });
    }, 650);
  }

  function choose(i: 0 | 1 | 2) {
    if (!started || locked.current || !q) return;
    locked.current = true;
    const ok = i === q.correct;
    setAnswered((n) => n + 1);
    setFeedback(ok ? "ok" : "bad");
    setExplain(q.explain);

    if (ok) {
      sfx.correct();
      const nc = combo + 1;
      setCombo(nc);
      setMaxCombo((m) => Math.max(m, nc));
      setCorrectN((n) => n + 1);
      setScore((s) => s + 120 + nc * 20);
      if (nc % 3 === 0) sfx.combo();
    } else {
      sfx.error();
      setCombo(0);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      const nl = lives - 1;
      setLives(nl);
      if (nl <= 0) {
        setTimeout(() => endRun(false, correctN, answered + 1, score, maxCombo), 900);
        return;
      }
    }

    setTimeout(() => {
      setFeedback(null);
      setExplain(null);
      setHintOn(false);
      locked.current = false;
      if (idx + 1 >= total) {
        const cN = correctN + (ok ? 1 : 0);
        const passed = cN / total >= 0.6 && lives - (ok ? 0 : 1) > 0;
        endRun(passed, cN, answered + 1, score + (ok ? 120 : 0), ok ? Math.max(maxCombo, combo + 1) : maxCombo);
      } else {
        setIdx((n) => n + 1);
        setSel(1);
      }
    }, 1100);
  }

  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setView("map");
        return;
      }
      if (locked.current) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSel((s) => (s === 0 ? 0 : ((s - 1) as 0 | 1 | 2)));
        sfx.hover();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSel((s) => (s === 2 ? 2 : ((s + 1) as 0 | 1 | 2)));
        sfx.hover();
      } else if (e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        choose(sel);
      } else if (e.key === "1") choose(0);
      else if (e.key === "2") choose(1);
      else if (e.key === "3") choose(2);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, sel, idx, lives]); // eslint-disable-line

  return (
    <div className={`relative flex h-dvh min-h-dvh flex-col overflow-hidden ${shake ? "animate-shake" : ""}`}>
      <div className="absolute inset-0 bg-[#031018]" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url(/images/bg-ocean.jpg)" }}
      />
      <div className="caustics absolute inset-0" />
      <Bubbles count={16} />
      <img
        src="/images/tower.png"
        alt=""
        className="pointer-events-none absolute bottom-0 left-1/2 w-[min(520px,70vw)] -translate-x-1/2 opacity-50"
      />

      <div className="relative z-20 flex items-center gap-2 px-3 py-2 sm:px-4">
        <button
          onClick={() => {
            sfx.click();
            setView("map");
          }}
          className="btn-press grid h-9 w-9 place-items-center rounded-xl border border-cyan-300/25 bg-slate-950/50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <div className="font-orbitron text-[10px] tracking-[0.2em] text-cyan-300">CODING TOWER</div>
          <div className="truncate text-sm font-bold">{mission.title}</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {Array.from({ length: LIVES }).map((_, i) => (
            <Heart key={i} className={`h-5 w-5 ${i < lives ? "fill-rose-400 text-rose-400" : "text-slate-600"}`} />
          ))}
        </div>
      </div>

      <div className="relative z-20 mx-3 mb-2 h-2 overflow-hidden rounded-full bg-slate-950/70 sm:mx-4">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 transition-all duration-500"
          style={{ width: `${(idx / total) * 100}%` }}
        />
      </div>

      {!started ? (
        <div className="relative z-20 grid flex-1 place-items-center px-6">
          <div className="glass animate-pop max-w-md rounded-3xl p-6 text-center">
            <img src="/images/tower.png" alt="" className="mx-auto mb-3 h-28 w-auto object-contain" />
            <h2 className="font-orbitron text-lg font-bold">Coding Tower</h2>
            <p className="mt-2 text-sm text-cyan-100/75">
              Tanpa mengetik simbol. Geser hiu dengan tombol kiri/kanan, konfirmasi dengan atas atau Enter.
            </p>
            <div className="mt-3 flex justify-center gap-2 text-cyan-100">
              <K>←</K>
              <K>→</K>
              <K>↑</K>
              <K>Enter</K>
            </div>
            <button
              onClick={() => {
                sfx.click();
                setStarted(true);
              }}
              className="btn-press mt-5 w-full rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 py-3 font-extrabold text-slate-900"
            >
              Naik Tower
            </button>
          </div>
        </div>
      ) : (
        q && (
          <div className="relative z-20 mx-auto flex w-full max-w-4xl flex-1 flex-col px-3 pb-6 sm:px-6">
            <div className="glass mb-4 rounded-2xl p-4 sm:p-5">
              <div className="mb-1 flex items-center justify-between text-[11px] text-cyan-200/70">
                <span>
                  Lantai {idx + 1} / {total}
                </span>
                <span className="font-orbitron text-amber-300">COMBO x{combo}</span>
              </div>
              <h2 className="text-base font-semibold leading-snug sm:text-lg">{q.question}</h2>
              {explain && (
                <p className={`mt-2 text-sm ${feedback === "ok" ? "text-emerald-300" : "text-rose-300"}`}>{explain}</p>
              )}
            </div>

            <div className="mt-auto grid grid-cols-3 gap-2 sm:gap-4">
              {q.options.map((opt, i) => {
                const active = sel === i;
                const isCorrect = feedback && i === q.correct;
                const isWrong = feedback === "bad" && i === sel;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      setSel(i as 0 | 1 | 2);
                      choose(i as 0 | 1 | 2);
                    }}
                    className={`relative min-h-[92px] rounded-2xl border px-2 py-3 text-center font-mono text-xs leading-snug transition sm:min-h-[120px] sm:text-sm ${
                      isCorrect
                        ? "border-emerald-400 bg-emerald-400/25 text-emerald-100"
                        : isWrong
                          ? "border-rose-400 bg-rose-400/20 text-rose-100"
                          : active
                            ? "border-cyan-300 bg-cyan-300/20 text-white shadow-[0_0_24px_rgba(34,211,238,0.35)]"
                            : "border-white/10 bg-slate-950/50 text-cyan-50/80"
                    } ${hintOn && i === q.correct && !feedback ? "ring-2 ring-amber-300" : ""}`}
                  >
                    <div className="mb-2 font-orbitron text-[10px] tracking-widest text-cyan-300/70">{i + 1}</div>
                    {opt}
                    {active && (
                      <img
                        src="/images/shark.png"
                        alt=""
                        className="pointer-events-none absolute -top-10 left-1/2 h-12 w-auto -translate-x-1/2 animate-bob drop-shadow-lg"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-center gap-2">
              <Pad onClick={() => setSel((s) => (s === 0 ? 0 : ((s - 1) as 0 | 1 | 2)))}>
                <ArrowLeft className="h-5 w-5" />
              </Pad>
              <Pad onClick={() => choose(sel)} wide>
                <ArrowUp className="h-5 w-5" />
                <span className="text-[10px] font-bold">PILIH</span>
              </Pad>
              <Pad onClick={() => setSel((s) => (s === 2 ? 2 : ((s + 1) as 0 | 1 | 2)))}>
                <ArrowRight className="h-5 w-5" />
              </Pad>
              <Pad
                onClick={() => {
                  sfx.click();
                  setHintOn(true);
                }}
              >
                <Lightbulb className="h-5 w-5" />
              </Pad>
            </div>
            <p className="mt-2 text-center text-[11px] text-cyan-200/50">
              Keyboard: panah kiri/kanan, atas atau Enter untuk memilih
            </p>
          </div>
        )
      )}
    </div>
  );
}

function K({ children }: { children: ReactNode }) {
  return <span className="keycap">{children}</span>;
}

function Pad({
  children,
  onClick,
  wide,
}: {
  children: ReactNode;
  onClick: () => void;
  wide?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`btn-press grid h-12 place-items-center rounded-xl border border-cyan-300/25 bg-slate-950/60 ${
        wide ? "w-28 flex-row gap-1" : "w-12"
      } flex`}
    >
      {children}
    </button>
  );
}
