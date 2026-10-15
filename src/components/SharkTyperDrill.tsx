/**
 * ============================================================================
 * SharkTyperDrill — komponen React portable untuk "Drill" challenge.
 * ----------------------------------------------------------------------------
 * SATU FILE, tanpa dependensi selain `react`. Bisa di-copy ke project React
 * manapun (Vite / CRA / Next.js). Tidak butuh Tailwind, lucide, atau context.
 *
 * CARA PAKAI (di website React lain):
 *
 *   import SharkTyperDrill from "./components/SharkTyperDrill";
 *
 *   <SharkTyperDrill
 *     missionId={3}
 *     onFinish={(r) => {
 *       // r: { missionId, score, wpm, accuracy (0-1), maxCombo, passed }
 *       saveScoreToBackend(r);
 *     }}
 *     onExit={() => navigate("/drills")}
 *   />
 *
 * PROPS:
 *   missionId?: number   1-16, default 1 (menentukan bank kata + judul)
 *   words?: string[]     override bank kata (mis. drill custom)
 *   title?: string       override judul header
 *   speed?: number       pengali kecepatan ikan, default 1
 *   lives?: number       nyawa, default 3
 *   waves?: number       jumlah gelombang, default 3
 *   waveSize?: number    ikan per gelombang, default 6
 *   sound?: boolean      suara WebAudio, default true
 *   autoStart?: boolean  langsung mulai tanpa overlay, default false
 *   compact?: boolean    sembunyikan tombol keluar (mode embed), default false
 *   onFinish?: (r: DrillResult) => void  dipanggil SEKALI saat run berakhir
 *   onExit?: () => void  tombol kembali ditekan
 * ============================================================================
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as RKey,
} from "react";

export interface DrillResult {
  missionId: number;
  score: number;
  wpm: number;
  accuracy: number; // 0 - 1
  maxCombo: number;
  passed: boolean;
}

export interface SharkTyperDrillProps {
  missionId?: number;
  words?: string[];
  title?: string;
  speed?: number;
  lives?: number;
  waves?: number;
  waveSize?: number;
  sound?: boolean;
  autoStart?: boolean;
  compact?: boolean;
  onFinish?: (r: DrillResult) => void;
  onExit?: () => void;
}

interface Fish {
  id: number;
  text: string;
  y: number;
  born: number;
  speed: number;
  typed: number;
}

const WORD_BANK: Record<number, { title: string; sub: string; words: string[] }> = {
  1: { title: "HTML Dasar", sub: "Misi Abjad", words: ["html", "head", "body", "h1", "h2", "p", "div", "span", "<html>", "</html>", "<head>", "<body>", "<p>", "</p>", "<h1>", "class", "id", "tag"] },
  2: { title: "Teks & Heading", sub: "Suara Ombak", words: ["<h1>", "<h2>", "<h3>", "<p>", "</p>", "<br>", "<hr>", "<strong>", "<em>", "heading", "paragraph", "text"] },
  3: { title: "Tautan & Gambar", sub: "Arus Navigasi", words: ["<a>", "href", "<img>", "src", "alt", "target", "_blank", "link", "image", 'alt="hiu"', "noopener"] },
  4: { title: "Daftar HTML", sub: "Kawanan Ikan", words: ["<ul>", "<ol>", "<li>", "</li>", "<dl>", "<dt>", "<dd>", "list", "item", "unordered"] },
  5: { title: "Tabel & Form", sub: "Jaring Data", words: ["<table>", "<tr>", "<td>", "<th>", "<form>", "<input>", "<label>", "<button>", "submit", 'type="text"', "checkbox"] },
  6: { title: "HTML Semantik", sub: "Tulang Karang", words: ["<header>", "<nav>", "<main>", "<article>", "<section>", "<aside>", "<footer>", "semantic", "landmark"] },
  7: { title: "Media HTML5", sub: "Echo Sonar", words: ["<audio>", "<video>", "<source>", "controls", "autoplay", "muted", "<iframe>", "poster", "loop"] },
  8: { title: "CSS3", sub: "Seni Gaya Web", words: ["color", "background", "font-size", "margin", "padding", "border", "display", "css", "selector", "stylesheet"] },
  9: { title: "Selector CSS", sub: "Radar Target", words: [".class", "#id", ":hover", ":focus", "::before", "nth-child", "selector", "nav a", ">", "+"] },
  10: { title: "Box Model", sub: "Kapsul Tekanan", words: ["margin", "padding", "border", "width", "height", "box-sizing", "border-box", "content-box", "outline"] },
  11: { title: "Flexbox", sub: "Arus Laut", words: ["display: flex", "justify-content", "align-items", "flex-direction", "gap", "flex-wrap", "flex: 1", "space-between", "center"] },
  12: { title: "CSS Grid", sub: "Peta Terumbu", words: ["display: grid", "grid-template-columns", "1fr", "repeat(3, 1fr)", "gap", "grid-column", "minmax", "auto-fit", "span 2"] },
  13: { title: "Transisi & Animasi", sub: "Arus Cahaya", words: ["transition", "transform", "opacity", "@keyframes", "animation", "ease-in-out", "translateY", "scale", "duration"] },
  14: { title: "Responsive", sub: "Pasang Surut", words: ["viewport", "@media", "min-width", "max-width", "clamp", "rem", "mobile-first", "768px", "100%"] },
  15: { title: "Review Frontend", sub: "Kedalaman Penuh", words: ["<!DOCTYPE html>", "semantic", "flexbox", "grid", "responsive", "accessibility", "focus-visible", "border-box", "viewport"] },
  16: { title: "JavaScript", sub: "Interaksi DOM", words: ["const", "let", "function", "return", "addEventListener", "querySelector", "classList", "textContent", "() => {}", "document", "console.log", "if (true)", "array.map"] },
};

const CSS = `
.stdrill{position:relative;display:flex;flex-direction:column;height:100%;min-height:560px;overflow:hidden;background:#031820;color:#e8fbff;font-family:ui-sans-serif,system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;border-radius:16px}
.stdrill-ocean{position:absolute;inset:0;background:radial-gradient(ellipse 90% 55% at 20% -10%,rgba(56,189,248,.22),transparent 60%),radial-gradient(ellipse 60% 40% at 85% 0%,rgba(167,139,250,.14),transparent 55%),linear-gradient(180deg,#07273d 0%,#062033 34%,#041422 70%,#020b12 100%)}
.stdrill-bub{position:absolute;border-radius:50%;bottom:-40px;pointer-events:none;opacity:0;background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.55),rgba(125,211,252,.08) 45%,transparent 70%);border:1px solid rgba(186,230,253,.2);animation:stdrill-rise var(--dur,12s) linear infinite;animation-delay:var(--delay,0s);left:var(--x,50%);width:var(--sz,10px);height:var(--sz,10px)}
@keyframes stdrill-rise{0%{transform:translate3d(0,0,0);opacity:0}8%{opacity:.7}100%{transform:translate3d(20px,-112vh,0);opacity:0}}
.stdrill-head{position:relative;z-index:20;display:flex;align-items:center;gap:10px;padding:10px 12px}
.stdrill-back{width:38px;height:38px;display:grid;place-items:center;border-radius:12px;cursor:pointer;border:1px solid rgba(103,232,249,.25);background:rgba(2,12,20,.55);color:#fff;font-size:18px}
.stdrill-brand small{display:block;font-size:10px;letter-spacing:.22em;color:#fb923c;font-weight:800}
.stdrill-brand b{font-size:15px}
.stdrill-lives{margin-left:auto;font-size:20px;letter-spacing:2px}
.stdrill-lives .off{filter:grayscale(1);opacity:.28}
.stdrill-stats{position:relative;z-index:20;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0 12px 8px}
.stdrill-stat{background:rgba(6,28,44,.78);border:1px solid rgba(103,232,249,.18);border-radius:12px;padding:6px 4px;text-align:center}
.stdrill-stat i{display:block;font-style:normal;font-size:9px;letter-spacing:.14em;color:rgba(207,250,254,.62)}
.stdrill-stat b{font-family:ui-monospace,Consolas,monospace;font-size:14px}
.stdrill-stat.hot b{color:#fbbf24}
.stdrill-arena{position:relative;z-index:10;flex:1;min-height:0;overflow:hidden}
.stdrill-arena.shake{animation:stdrill-shake .4s ease}
@keyframes stdrill-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
.stdrill-fish{position:absolute;display:flex;align-items:center;gap:8px;transform:translateX(-50%);will-change:left}
.stdrill-fish .em{font-size:32px;line-height:1;transform:scaleX(-1);filter:drop-shadow(0 6px 12px rgba(0,0,0,.5))}
.stdrill-word{font-family:ui-monospace,Consolas,monospace;font-weight:700;font-size:15px;padding:5px 10px;border-radius:10px;white-space:nowrap;background:rgba(2,12,20,.85);color:#f0fdff;border:1px solid rgba(103,232,249,.32)}
.stdrill-word .ok{color:#67e8f9}
.stdrill-word .nx{text-decoration:underline;text-decoration-color:#fbbf24;text-underline-offset:3px}
.stdrill-fish.on .stdrill-word{background:#fbbf24;color:#0f172a;border-color:#fff;box-shadow:0 0 0 2px #fff}
.stdrill-fish.on .stdrill-word .ok{color:#0f766e}
.stdrill-fish.pop{opacity:0;scale:1.25}
.stdrill-combo{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:25;pointer-events:none;font-family:ui-monospace,Consolas,monospace;font-weight:900;font-size:22px;color:#fbbf24;text-shadow:0 2px 14px rgba(0,0,0,.6)}
.stdrill-ov{position:absolute;inset:0;z-index:40;display:grid;place-items:center;padding:20px;background:rgba(2,10,17,.55)}
.stdrill-card{width:100%;max-width:420px;text-align:center;border-radius:22px;padding:26px 22px;background:linear-gradient(180deg,rgba(8,32,52,.94),rgba(4,18,32,.96));border:1px solid rgba(103,232,249,.22)}
.stdrill-card .big{font-size:60px}
.stdrill-card h2{margin:6px 0 4px;font-size:21px}
.stdrill-card p{margin:6px 0;color:rgba(207,250,254,.7);font-size:13.5px;line-height:1.6}
.stdrill-start{margin-top:14px;width:100%;padding:13px;border:0;border-radius:13px;cursor:pointer;font-weight:900;font-size:15px;color:#0f172a;background:linear-gradient(90deg,#fb923c,#fbbf24)}
.stdrill-ghost{margin-top:8px;width:100%;padding:10px;border-radius:13px;cursor:pointer;background:transparent;color:#67e8f9;border:1px solid rgba(103,232,249,.3)}
.stdrill-res{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0}
.stdrill-res div{background:rgba(2,12,20,.55);border:1px solid rgba(103,232,249,.18);border-radius:12px;padding:10px}
.stdrill-res i{display:block;font-style:normal;font-size:10px;color:rgba(207,250,254,.6)}
.stdrill-res b{font-family:ui-monospace,Consolas,monospace;font-size:18px}
.stdrill-foot{position:relative;z-index:20;border-top:1px solid rgba(103,232,249,.12);background:rgba(4,20,34,.88);padding:10px 12px}
.stdrill-disp{position:relative;min-height:52px;border-radius:12px;padding:8px 14px;background:rgba(8,32,52,.72);border:1px solid rgba(103,232,249,.18);font-family:ui-monospace,Consolas,monospace;font-size:18px;display:flex;align-items:center;max-width:720px;margin:0 auto}
.stdrill-disp .ph{font-size:13px;color:rgba(207,250,254,.4);font-family:ui-sans-serif,system-ui,sans-serif}
.stdrill-caret{border-bottom:2px solid #fbbf24;color:#fde68a;animation:stdrill-blink 1s step-end infinite}
@keyframes stdrill-blink{50%{opacity:.2}}
.stdrill-kbd{position:absolute;inset:0;width:100%;height:100%;opacity:0;border:0;background:transparent;color:transparent;font-size:16px}
.stdrill-tip{text-align:center;font-size:11px;color:rgba(207,250,254,.55);margin-top:6px}
`;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function useSfx(enabled: boolean) {
  const ctx = useRef<AudioContext | null>(null);
  const on = useRef(enabled);
  on.current = enabled;
  const tone = useCallback((type: OscillatorType, freq: number, dur: number, peak = 1) => {
    if (!on.current) return;
    try {
      if (!ctx.current) ctx.current = new AudioContext();
      const c = ctx.current;
      if (c.state === "suspended") void c.resume();
      const g = c.createGain();
      const t = c.currentTime;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.12 * peak), t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      g.connect(c.destination);
      const o = c.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      o.connect(g);
      o.start();
      o.stop(t + dur + 0.02);
    } catch {
      /* audio tidak tersedia — main tetap jalan */
    }
  }, []);
  return useMemo(
    () => ({
      unlock() {
        try {
          if (!ctx.current) ctx.current = new AudioContext();
          if (ctx.current.state === "suspended") void ctx.current.resume();
        } catch {
          /* abaikan */
        }
      },
      click() { tone("triangle", 420, 0.08, 0.6); },
      type() { tone("square", 1400, 0.03, 0.2); },
      ok() { tone("sine", 523, 0.09, 0.6); setTimeout(() => tone("sine", 784, 0.14, 0.45), 120); },
      err() { tone("sawtooth", 140, 0.16, 0.45); },
      combo() { tone("sine", 660, 0.08, 0.5); setTimeout(() => tone("sine", 1320, 0.12, 0.4), 110); },
      win() { [392, 523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone("triangle", f, 0.22, 0.5), i * 110)); },
    }),
    [tone],
  );
}

export default function SharkTyperDrill({
  missionId = 1,
  words,
  title,
  speed = 1,
  lives: maxLives = 3,
  waves: maxWave = 3,
  waveSize = 6,
  sound = true,
  autoStart = false,
  compact = false,
  onFinish,
  onExit,
}: SharkTyperDrillProps) {
  const bank = WORD_BANK[missionId] ?? WORD_BANK[1];
  const bankWords = useMemo(() => shuffle([...(words ?? bank.words), ...(words ?? bank.words)]), [words, bank.words]);
  const sfx = useSfx(sound);

  const [started, setStarted] = useState(autoStart);
  const [fish, setFish] = useState<Fish[]>([]);
  const [lives, setLives] = useState(maxLives);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [typedCount, setTypedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wave, setWave] = useState(1);
  const [done, setDone] = useState(false);
  const [passed, setPassed] = useState(false);
  const [shake, setShake] = useState(false);

  const activeId = useRef<number | null>(null);
  const nextId = useRef(1);
  const cursor = useRef(0);
  const startAt = useRef(autoStart ? performance.now() : 0);
  const finished = useRef(false);
  const fishRef = useRef<Fish[]>([]);
  const stats = useRef({ typed: 0, correct: 0, score: 0, maxCombo: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const finishCb = useRef(onFinish);
  finishCb.current = onFinish;

  useEffect(() => { fishRef.current = fish; }, [fish]);
  useEffect(() => { if (started && !done) inputRef.current?.focus(); }, [started, done, fish.length]);

  const spawn = useCallback(
    (n: number) => {
      const batch: Fish[] = [];
      for (let i = 0; i < n; i++) {
        const text = bankWords[cursor.current % bankWords.length];
        cursor.current++;
        batch.push({
          id: nextId.current++,
          text,
          y: 16 + ((i * 37 + Math.random() * 20) % 64),
          born: performance.now() + i * 480,
          speed: (11 + wave * 1.4 + Math.random() * 3) * speed,
          typed: 0,
        });
      }
      setFish((f) => [...f, ...batch]);
    },
    [bankWords, wave, speed],
  );

  const endRun = useCallback(
    (ok: boolean) => {
      if (finished.current) return;
      finished.current = true;
      setDone(true);
      setPassed(ok);
      const elapsed = Math.max(1, (performance.now() - startAt.current) / 1000 / 60);
      const wpm = Math.round(stats.current.correct / 5 / elapsed) || 0;
      const acc = stats.current.typed === 0 ? 0 : stats.current.correct / stats.current.typed;
      if (ok) sfx.win();
      else sfx.err();
      const result: DrillResult = {
        missionId,
        accuracy: acc,
        wpm,
        maxCombo: stats.current.maxCombo,
        score: stats.current.score,
        passed: ok,
      };
      setTimeout(() => finishCb.current?.(result), 500);
    },
    [missionId, sfx],
  );

  const reset = useCallback(() => {
    activeId.current = null;
    cursor.current = 0;
    nextId.current = 1;
    finished.current = false;
    stats.current = { typed: 0, correct: 0, score: 0, maxCombo: 0 };
    setFish([]);
    setLives(maxLives);
    setCombo(0);
    setScore(0);
    setTypedCount(0);
    setCorrectCount(0);
    setWave(1);
    setDone(false);
    setPassed(false);
  }, [maxLives]);

  const begin = useCallback(() => {
    reset();
    sfx.unlock();
    sfx.click();
    setStarted(true);
    startAt.current = performance.now();
  }, [reset, sfx]);

  useEffect(() => {
    if (!started || done) return;
    spawn(waveSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  useEffect(() => {
    if (!started || done) return;
    let raf = 0;
    const loop = (now: number) => {
      setFish((prev) => {
        const next: Fish[] = [];
        let missed = 0;
        for (const f of prev) {
          const t = (now - f.born) / 1000;
          if (t < 0) { next.push(f); continue; }
          if (100 - t * f.speed < -8) {
            missed++;
            if (activeId.current === f.id) activeId.current = null;
          } else next.push(f);
        }
        if (missed) {
          sfx.err();
          setShake(true);
          setTimeout(() => setShake(false), 400);
          setCombo(0);
          setLives((l) => {
            const nl = Math.max(0, l - missed);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, done]);

  useEffect(() => {
    if (!started || done) return;
    if (fish.length === 0 && cursor.current > 0) {
      if (wave >= maxWave || cursor.current >= bankWords.length) endRun(true);
      else {
        setWave((w) => w + 1);
        setTimeout(() => spawn(waveSize + wave), 500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fish.length, started, done, wave]);

  const onKey = (e: RKey<HTMLInputElement> | KeyboardEvent) => {
    if (e.key === "Escape") {
      if (started && !done) { reset(); setStarted(false); }
      return;
    }
    if (!started || done) {
      if (e.key === "Enter" && !started) begin();
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
      sfx.err();
      setCombo(0);
      return;
    }
    if (ch === target.text[target.typed]) {
      sfx.type();
      stats.current.correct++;
      setCorrectCount((n) => n + 1);
      const typed = target.typed + 1;
      if (typed >= target.text.length) {
        const nc = combo + 1;
        setCombo(nc);
        stats.current.maxCombo = Math.max(stats.current.maxCombo, nc);
        const gain = 80 + nc * 12;
        stats.current.score += gain;
        setScore((s) => s + gain);
        if (nc > 0 && nc % 5 === 0) sfx.combo();
        else sfx.ok();
        activeId.current = null;
        setFish((prev) => prev.filter((f) => f.id !== target!.id));
      } else {
        setFish((prev) => prev.map((f) => (f.id === target!.id ? { ...f, typed } : f)));
      }
    } else {
      sfx.err();
      setCombo(0);
    }
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA") && t !== inputRef.current) return;
      onKey(e);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, done, combo, bankWords]);

  const acc = typedCount === 0 ? 100 : Math.round((correctCount / typedCount) * 100);
  const activeFish = fish.find((f) => f.id === activeId.current);

  return (
    <div className="stdrill">
      <style>{CSS}</style>
      <div className="stdrill-ocean" />
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="stdrill-bub"
          style={
            {
              "--sz": `${4 + ((i * 17) % 14)}px`,
              "--x": `${(i * 37 + 11) % 100}%`,
              "--dur": `${8 + ((i * 13) % 12)}s`,
              "--delay": `${-((i * 1.7) % 10)}s`,
            } as CSSProperties
          }
        />
      ))}

      <div className="stdrill-head">
        {!compact && (
          <button className="stdrill-back" onClick={() => { sfx.click(); onExit?.(); }} aria-label="Kembali">←</button>
        )}
        <div className="stdrill-brand">
          <small>SHARK TYPER · DRILL</small>
          <b>{title ?? bank.title}</b>
        </div>
        <div className="stdrill-lives" aria-label="Nyawa">
          {Array.from({ length: maxLives }).map((_, i) => (
            <span key={i} className={i < lives ? "" : "off"}>❤️</span>
          ))}
        </div>
      </div>

      <div className="stdrill-stats">
        <div className="stdrill-stat"><i>SKOR</i><b>{score}</b></div>
        <div className={`stdrill-stat${combo >= 5 ? " hot" : ""}`}><i>COMBO</i><b>x{combo}</b></div>
        <div className="stdrill-stat"><i>AKURASI</i><b>{acc}%</b></div>
        <div className="stdrill-stat"><i>GELOMBANG</i><b>{wave}/{maxWave}</b></div>
      </div>

      <div className={`stdrill-arena${shake ? " shake" : ""}`}>
        {combo >= 5 && <div className="stdrill-combo">COMBO x{combo}</div>}
        {!started && !done && (
          <div className="stdrill-ov">
            <div className="stdrill-card">
              <div className="big">🦈</div>
              <h2>Shark Typer Drill</h2>
              <p>Ketik kata yang berenang sebelum lolos ke kiri. Backspace untuk undo, Esc untuk ulang.</p>
              <button className="stdrill-start" onClick={begin}>Mulai Drill ▶</button>
            </div>
          </div>
        )}
        {fish.map((f) => (
          <FishWord key={f.id} fish={f} active={f.id === activeId.current} />
        ))}
        {done && (
          <div className="stdrill-ov">
            <div className="stdrill-card">
              <div className="big">{passed ? "🏆" : "💥"}</div>
              <h2>{passed ? "Drill Selesai!" : "Nyawa Habis!"}</h2>
              <div className="stdrill-res">
                <div><i>SKOR</i><b>{score}</b></div>
                <div><i>AKURASI</i><b>{acc}%</b></div>
                <div><i>MAX COMBO</i><b>x{stats.current.maxCombo}</b></div>
                <div><i>STATUS</i><b>{passed ? "LULUS" : "GAGAL"}</b></div>
              </div>
              <button className="stdrill-start" onClick={begin}>Ulangi ↻</button>
              {!compact && onExit && <button className="stdrill-ghost" onClick={onExit}>Kembali</button>}
            </div>
          </div>
        )}
      </div>

      <div className="stdrill-foot">
        <div className="stdrill-disp" onClick={() => inputRef.current?.focus()}>
          {activeFish ? (
            <span>
              <span style={{ color: "#67e8f9" }}>{activeFish.text.slice(0, activeFish.typed)}</span>
              <span className="stdrill-caret">{activeFish.text[activeFish.typed] ?? ""}</span>
              <span style={{ color: "rgba(255,255,255,.4)" }}>{activeFish.text.slice(activeFish.typed + 1)}</span>
            </span>
          ) : (
            <span className="ph">Ketik huruf pertama untuk mengunci target…</span>
          )}
          {started && !done && (
            <input
              ref={inputRef}
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Ketik target"
              className="stdrill-kbd"
              onKeyDown={onKey}
              onBlur={() => inputRef.current?.focus()}
            />
          )}
        </div>
        <div className="stdrill-tip">Ketik langsung · Backspace undo · Esc ulang</div>
      </div>
    </div>
  );
}

function FishWord({ fish, active }: { fish: Fish; active: boolean }) {
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
    <div className={`stdrill-fish${active ? " on" : ""}`} style={{ top: `${fish.y}%`, left: `${x}%` }}>
      <span className="em">🦈</span>
      <span className="stdrill-word">
        <span className="ok">{fish.text.slice(0, fish.typed)}</span>
        <span className={active ? "nx" : ""}>{fish.text.slice(fish.typed)}</span>
      </span>
    </div>
  );
}
