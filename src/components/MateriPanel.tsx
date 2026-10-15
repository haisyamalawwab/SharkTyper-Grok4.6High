import { ArrowLeft, BookMarked, Lock } from "lucide-react";
import { useGame } from "../context/GameContext";
import { materiLibrary, missions } from "../data/missions";
import { sfx } from "../audio";
import Bubbles from "./Bubbles";

export default function MateriPanel() {
  const { save, setView, selectMission, startLesson } = useGame();

  return (
    <div className="relative flex h-dvh min-h-dvh flex-col overflow-hidden">
      <div className="absolute inset-0 bg-[#041422]" />
      <div className="caustics absolute inset-0" />
      <Bubbles count={10} />
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
          <div className="font-orbitron text-[10px] tracking-[0.22em] text-amber-300">PERPUSTAKAAN</div>
          <h1 className="text-lg font-bold">Materi Akademi</h1>
        </div>
      </div>
      <div className="relative z-10 mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 gap-3 overflow-y-auto scroll-thin px-4 pb-8 sm:grid-cols-2 lg:grid-cols-3">
        {materiLibrary.map((mat, i) => {
          const unlocked = save.unlockedMissions.includes(mat.missionId) || save.readMaterials.includes(mat.missionId);
          const read = save.readMaterials.includes(mat.missionId);
          return (
            <button
              key={mat.id}
              disabled={!unlocked}
              onClick={() => {
                if (!unlocked) return;
                selectMission(mat.missionId);
                startLesson();
              }}
              className="glass animate-slide-up rounded-2xl p-4 text-left disabled:opacity-45"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 font-orbitron text-[10px] font-bold tracking-wider text-cyan-300">
                  {mat.tag}
                </span>
                {unlocked ? (
                  <BookMarked className={`h-4 w-4 ${read ? "text-emerald-300" : "text-cyan-400/50"}`} />
                ) : (
                  <Lock className="h-4 w-4 text-fuchsia-300/70" />
                )}
              </div>
              <h2 className="font-bold">{mat.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-cyan-100/70">{mat.blurb}</p>
              <p className="mt-2 text-[11px] text-amber-200/80">
                Misi {mat.missionId}: {missions[mat.missionId - 1].title}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
