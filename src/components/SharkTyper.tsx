import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as RKey } from "react";
import { ArrowLeft, Heart, Lightbulb, RotateCcw, Zap } from "lucide-react";
import { useGame } from "../context/GameContext";
import { getMission } from "../data/missions";
import { sfx } from "../audio";
import Bubbles from "./Bubbles";

interface Fish {
  id: number;
  text: string;
  y: number;
  born: number;
  speed: number;
  typed: number;
}

const LIVES = 3;
const WAVE_SIZE = 6;

export default function SharkTyper() {
  const { selectedId, setView, finishGame } = useGame();
  const mission = getMission(selectedId);
  const words = useMemo(() => shuffle([...mission.typer, ...mission.typer]), [mission]);

  const [started, setStarted] = useState(false);
  const [fish, setFish] = useState<Fish[]>([]);
  const [lives, setLives] = useState(LIVES);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [typedCount, setTypedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [hint, setHint] = useState(false);
  const [shake, setShake] = useState(false);
  const [pop, setPop] = useState<number | null>(null);
  const [wave, setWave] = useState(1);
  const [done, setDone] = useState(false);

  const activeId = useRef<number | null>(null);
  const nextId = useRef(1);
  const cursor = useRef(0);
  const startTime = useRef(0);
  const livesRef = useRef(LIVES);
  const comboRef = useRef(0);
  const finished = useRef(false);
  const fishRef = useRef<Fish[]>([]);
  const stats = useRef({ typed: 0, correct: 0, score: 0, maxCombo: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);
  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);
  useEffect(() => {
    fishRef.current = fish;
  }, [fish]);
  useEffect(() => {
    if (started && !done) inputRef.current?.focus();
  }, [started, done, fish.length]);

  const spawn = useCallback(
    (n: number) => {
      const batch: Fish[] = [];
      for (let i = 0; i < n; i++) {
        const text = words[cursor.current % words.length];
        cursor.current++;
        batch.push({
          id: nextId.current++,
          text,
          y: 18 + ((i * 37 + Math.random() * 20) % 62),
          born: performance.now() + i * 480,
          speed: 11 + wave * 1.4 + Math.random() * 3,
          typed: 0,
        });
      }
      setFish((f) => [...f, ...batch]);
    },
    [words, wave],
  );

  function endRun(passed: boolean) {
    if (finished.current) return;
    finished.current = true;
    setDone(true);
    const elapsed = Math.max(1, (performance.now() - startTime.current) / 1000 / 60);
    const wpm = Math.round(stats.current.correct / 5 / elapsed) || 0;
    const acc = stats.current.typed === 0 ? 0 : stats.current.correct / stats.current.typed;
    setTimeout(() => {
      finishGame({
        mode: "typer",
        missionId: selectedId,
        accuracy: acc,
        wpm,
        combo: stats.current.maxCombo,
        score: stats.current.score,
        passed,
      });
    }, 700);
  }

  useEffect(() => {
    if (!started || done) return;
    spawn(WAVE_SIZE);
    startTime.current = performance.now();
  }, [started]); // eslint-disable-line

  useEffect(() => {
    if (!started || done) return;
    let raf = 0;
    const loop = (now: number) => {
      setFish((prev) => {
        const next: Fish[] = [];
        let missed = 0;
        for (const f of prev) {
          const t = (now - f.born) / 1000;
          if (t < 0) {
            next.push(f);
            continue;
          }
          const x = 100 - t * f.speed;
          if (x < -8) {
            missed++;
            if (activeId.current === f.id) activeId.current = null;
          } else next.push(f);
        }
        if (missed) {
          sfx.error();
          setShake(true);
          setTimeout(() => setShake(false), 400);
          setCombo(0);
          comboRef.current = 0;
          setLives((l) => {
            const nl = Math.max(0, l - missed);
            livesRef.current = nl;
            if (nl <= 0) endRun(false);
            return nl;
          });
        }
        return next;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [started, done]); // eslint-disable-line

  useEffect(() => {
    if (!started || done) return;
    if (fish.length === 0 && cursor.current > 0) {
      if (wave >= 3 || cursor.current >= words.length) {
        endRun(true);
      } else {
        setWave((w) => w + 1);
        setTimeout(() => spawn(WAVE_SIZE + wave), 500);
      }
    }
  }, [fish.length, started, done, wave]); // eslint-disable-line

  const onKey = (e: RKey<HTMLInputElement> | KeyboardEvent) => {
    if (e.key === "Escape") {
      setView("map");
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      setFish((prev) =>
        prev.map((f) => (f.id === activeId.current ? { ...f, typed: Math.max(0, f.typed - 1) } : f)),
      );
      sfx.type();
      return;
    }
    if (e.key.length !== 1) return;
    e.preventDefault();

    stats.current.typed++;
    setTypedCount((n) => n + 1);

    const ch = e.key;
    const list = fishRef.current;
    let target = list.find((f) => f.id === activeId.current);
    if (!target) {
      target = list.find((f) => f.typed === 0 && f.text[0] === ch && performance.now() >= f.born);
      if (target) activeId.current = target.id;
    }
    if (!target) {
      sfx.error();
      setCombo(0);
      comboRef.current = 0;
      return;
    }
    const expect = target.text[target.typed];
    if (ch === expect) {
      sfx.type();
      stats.current.correct++;
      setCorrectCount((n) => n + 1);
      const typed = target.typed + 1;
      if (typed >= target.text.length) {
        const nc = comboRef.current + 1;
        comboRef.current = nc;
        setCombo(nc);
        stats.current.maxCombo = Math.max(stats.current.maxCombo, nc);
        const gain = 80 + nc * 12;
        stats.current.score += gain;
        setScore((s) => s + gain);
        setPop(target.id);
        if (nc > 0 && nc % 5 === 0) sfx.combo();
        else sfx.correct();
        activeId.current = null;
        setFish((prev) => prev.filter((f) => f.id !== target!.id));
        setTimeout(() => setPop(null), 300);
      } else {
        setFish((prev) => prev.map((f) => (f.id === target!.id ? { ...f, typed } : f)));
      }
    } else {
      sfx.error();
      setCombo(0);
      comboRef.current = 0;
    }
  };

  const acc = typedCount === 0 ? 100 : Math.round((correctCount / typedCount) * 100);
  const activeFish = fish.find((f) => f.id === activeId.current);

  return (
    <div className={`relative flex h-dvh min-h-dvh flex-col overflow-hidden ${shake ? "animate-shake" : ""}`}>
      <div className="absolute inset-0 bg-[#031820]" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: "url(/images/bg-ocean.jpg)" }}
      />
      <div className="caustics absolute inset-0" />
      <div className="godrays absolute inset-0" />
      <Bubbles count={18} />

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
          <div className="font-orbitron text-[10px] tracking-[0.2em] text-orange-300">SHARK TYPER</div>
          <div className="truncate text-sm font-bold">{mission.title}</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {Array.from({ length: LIVES }).map((_, i) => (
            <Heart
              key={i}
              className={`h-5 w-5 ${i < lives ? "fill-rose-400 text-rose-400" : "text-slate-600"}`}
            />
          ))}
        </div>
      </div>

      <div className="relative z-20 mx-3 mb-2 grid grid-cols-4 gap-2 sm:mx-4">
        <Stat label="SKOR" value={String(score)} />
        <Stat label="COMBO" value={`x${combo}`} hot={combo >= 5} />
        <Stat label="AKURASI" value={`${acc}%`} />
        <Stat label="GELOMBANG" value={String(wave)} />
      </div>

      <div className="relative z-10 min-h-0 flex-1">
        {!started && (
          <div className="absolute inset-0 z-30 grid place-items-center px-6">
            <div className="glass animate-pop max-w-md rounded-3xl p-6 text-center">
              <img src="/images/shark.png" alt="" className="mx-auto mb-3 h-24 w-auto animate-bob" />
              <h2 className="font-orbitron text-lg font-bold">Shark Typer</h2>
              <p className="mt-2 text-sm text-cyan-100/75">
                Ketik kata yang berenang sebelum mereka lolos ke kiri. Backspace untuk undo. Petunjuk menampilkan huruf berikutnya.
              </p>
              <p className="mt-2 text-xs text-cyan-200/60">Fokus jendela ini, lalu ketik langsung — tanpa kotak input.</p>
              <button
                onClick={() => {
                  sfx.click();
                  setStarted(true);
                }}
                className="btn-press mt-5 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 py-3 font-extrabold text-slate-900"
              >
                Mulai Misi
              </button>
            </div>
          </div>
        )}

        {fish.map((f) => (
          <FishWord key={f.id} fish={f} active={f.id === activeId.current} popping={pop === f.id} hint={hint} />
        ))}

        {combo >= 5 && (
          <div className="pointer-events-none absolute top-4 left-1/2 z-20 -translate-x-1/2 animate-combo font-orbitron text-2xl font-black text-amber-300">
            COMBO x{combo}
          </div>
        )}
      </div>

      <div className="relative z-20 border-t border-cyan-400/10 bg-[#041422]/80 px-3 py-3 backdrop-blur-md sm:px-5">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="glass relative min-h-[52px] flex-1 overflow-hidden rounded-xl px-4 py-2 font-mono text-lg">
            <div className="pointer-events-none">
              {activeFish ? (
                <span>
                  <span className="text-cyan-300">{activeFish.text.slice(0, activeFish.typed)}</span>
                  <span className="caret-blink border-b-2 border-amber-300 text-amber-200">
                    {activeFish.text[activeFish.typed] ?? ""}
                  </span>
                  <span className="text-white/40">{activeFish.text.slice(activeFish.typed + 1)}</span>
                </span>
              ) : (
                <span className="text-sm text-cyan-100/40">Ketik huruf pertama untuk mengunci target…</span>
              )}
            </div>
            {started && !done && (
              <input
                ref={inputRef}
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Ketik target"
                className="absolute inset-0 cursor-text bg-transparent text-transparent caret-transparent outline-none"
                onKeyDown={onKey}
                onBlur={() => inputRef.current?.focus()}
              />
            )}
          </div>
          <button
            onClick={() => {
              sfx.click();
              setHint((h) => !h);
            }}
            className={`btn-press grid h-12 w-12 place-items-center rounded-xl border ${
              hint ? "border-amber-300 bg-amber-400/20 text-amber-200" : "border-cyan-300/25 bg-slate-950/50"
            }`}
            title="Petunjuk"
          >
            <Lightbulb className="h-5 w-5" />
          </button>
          <div className="hidden items-center gap-1 text-[11px] text-cyan-200/60 sm:flex">
            <RotateCcw className="h-3 w-3" /> Backspace undo
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hot }: { label: string; value: string; hot?: boolean }) {
  return (
    <div className="glass rounded-xl px-2 py-1.5 text-center">
      <div className="font-orbitron text-[9px] tracking-widest text-cyan-200/60">{label}</div>
      <div className={`hud-num text-sm sm:text-base ${hot ? "text-amber-300" : "text-white"}`}>{value}</div>
    </div>
  );
}

function FishWord({
  fish,
  active,
  popping,
  hint,
}: {
  fish: Fish;
  active: boolean;
  popping: boolean;
  hint: boolean;
}) {
  const [x, setX] = useState(110);
  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      const t = (now - fish.born) / 1000;
      setX(t < 0 ? 110 : 100 - t * fish.speed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fish.born, fish.speed]);

  return (
    <div
      className={`absolute z-10 flex items-center gap-2 transition-transform ${popping ? "scale-125 opacity-0" : ""}`}
      style={{ top: `${fish.y}%`, left: `${x}%`, transform: "translateX(-50%)" }}
    >
      <img src="/images/shark.png" alt="" className="h-8 w-auto drop-shadow-lg sm:h-10" style={{ transform: "scaleX(-1)" }} />
      <div
        className={`rounded-lg px-2.5 py-1 font-mono text-sm font-semibold shadow-lg sm:text-base ${
          active
            ? "bg-amber-400 text-slate-900 ring-2 ring-white"
            : "bg-slate-950/80 text-cyan-50 ring-1 ring-cyan-300/30"
        }`}
      >
        <span className={active ? "text-teal-800" : "text-cyan-300"}>{fish.text.slice(0, fish.typed)}</span>
        <span className={hint || active ? "underline decoration-amber-300" : ""}>
          {fish.text.slice(fish.typed)}
        </span>
      </div>
      {active && <Zap className="h-4 w-4 text-amber-300" />}
    </div>
  );
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
