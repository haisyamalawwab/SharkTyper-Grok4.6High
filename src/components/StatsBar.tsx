import { useGame } from "../context/GameContext";
import { materiLibrary } from "../data/missions";
import { sfx } from "../audio";

export default function StatsBar() {
  const { save, accuracy, setView } = useGame();
  const items = [
    { label: "MISI", value: String(save.stats.missionsPlayed), gold: true },
    { label: "AKURASI", value: `${accuracy}%`, gold: false },
    { label: "WPM TERBAIK", value: String(save.stats.bestWpm), gold: true },
    { label: "COMBO MAKS", value: String(save.stats.maxCombo), gold: true },
    {
      label: "MATERI",
      value: `${Math.min(save.readMaterials.length, materiLibrary.length)}/${materiLibrary.length}`,
      gold: true,
      action: () => {
        sfx.click();
        setView("materi");
      },
    },
  ];

  return (
    <div className="relative z-20 mx-3 mt-1 sm:mx-5">
      <div className="glass flex overflow-x-auto scroll-thin rounded-2xl px-2 py-2 sm:px-4">
        {items.map((it, i) => (
          <button
            key={it.label}
            onClick={it.action}
            className={`flex min-w-[4.8rem] flex-1 flex-col items-center px-2 py-1 ${
              i < items.length - 1 ? "border-r border-cyan-400/10" : ""
            } ${it.action ? "cursor-pointer hover:bg-white/5" : "cursor-default"}`}
          >
            <span className="font-orbitron text-[9px] font-semibold tracking-[0.18em] text-cyan-200/70 sm:text-[10px]">
              {it.label}
            </span>
            <span className={`hud-num mt-0.5 text-xl sm:text-2xl ${it.gold ? "gold-text" : "text-amber-300"}`}>
              {it.value}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
