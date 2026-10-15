let ctx: AudioContext | null = null;
let muted = false;
let master = 0.12;

function ac() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMuted(v: boolean) {
  muted = v;
}

export function isMuted() {
  return muted;
}

export function unlockAudio() {
  try {
    ac();
  } catch {
    /* ignore */
  }
}

function env(duration: number, peak = 1) {
  const c = ac();
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(peak * master, c.currentTime + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  g.connect(c.destination);
  return { c, g };
}

function osc(type: OscillatorType, freq: number, duration: number, peak = 1) {
  if (muted) return;
  try {
    const { c, g } = env(duration, peak);
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime);
    o.connect(g);
    o.start();
    o.stop(c.currentTime + duration + 0.02);
  } catch {
    /* ignore */
  }
}

export const sfx = {
  hover() {
    osc("sine", 880, 0.06, 0.35);
  },
  click() {
    osc("triangle", 420, 0.08, 0.5);
    osc("sine", 840, 0.05, 0.25);
  },
  type() {
    osc("square", 1400, 0.03, 0.18);
  },
  correct() {
    osc("sine", 523.25, 0.09, 0.5);
    setTimeout(() => osc("sine", 659.25, 0.09, 0.45), 70);
    setTimeout(() => osc("sine", 783.99, 0.14, 0.4), 140);
  },
  error() {
    osc("sawtooth", 140, 0.16, 0.4);
    osc("square", 90, 0.18, 0.25);
  },
  combo() {
    osc("sine", 660, 0.08, 0.45);
    setTimeout(() => osc("sine", 880, 0.08, 0.4), 60);
    setTimeout(() => osc("sine", 1320, 0.12, 0.35), 120);
  },
  lock() {
    osc("triangle", 180, 0.12, 0.4);
    setTimeout(() => osc("triangle", 140, 0.16, 0.35), 90);
  },
  unlock() {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => osc("sine", f, 0.16, 0.4), i * 80));
  },
  complete() {
    [392, 523, 659, 784, 1046].forEach((f, i) => setTimeout(() => osc("triangle", f, 0.22, 0.42), i * 110));
  },
  whoosh() {
    osc("sine", 220, 0.2, 0.2);
    osc("sine", 110, 0.28, 0.15);
  },
  levelup() {
    [523, 659, 784, 988, 1174].forEach((f, i) => setTimeout(() => osc("sine", f, 0.2, 0.45), i * 90));
  },
};
