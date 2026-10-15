import { Lock, Sparkles, TriangleAlert, Waves } from "lucide-react";
import { useGame } from "../context/GameContext";

const icon = {
  info: Waves,
  success: Sparkles,
  warn: TriangleAlert,
  lock: Lock,
};

const tone = {
  info: "border-cyan-400/30 text-cyan-100",
  success: "border-emerald-400/40 text-emerald-100",
  warn: "border-amber-400/40 text-amber-100",
  lock: "border-fuchsia-400/40 text-fuchsia-100",
};

export default function Toasts() {
  const { toasts } = useGame();
  return (
    <div className="pointer-events-none fixed top-20 right-4 z-[80] flex w-[min(92vw,320px)] flex-col gap-2">
      {toasts.map((t) => {
        const Icon = icon[t.kind];
        return (
          <div
            key={t.id}
            className={`glass animate-slide-up flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm ${tone[t.kind]}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="leading-snug">{t.text}</span>
          </div>
        );
      })}
    </div>
  );
}
