import type { CSSProperties } from "react";

export default function Bubbles({ count = 22 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => {
    const sz = 4 + ((i * 17) % 16);
    const x = (i * 37 + 11) % 100;
    const dur = 8 + ((i * 13) % 14);
    const delay = -((i * 1.7) % dur);
    const drift = ((i % 2 === 0 ? 1 : -1) * (12 + (i % 18))) + "px";
    return { sz, x, dur, delay, drift, i };
  });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {items.map((b) => (
        <span
          key={b.i}
          className="bubble"
          style={
            {
              "--sz": `${b.sz}px`,
              "--x": `${b.x}%`,
              "--dur": `${b.dur}s`,
              "--delay": `${b.delay}s`,
              "--drift": b.drift,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
