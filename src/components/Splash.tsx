import { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import { unlockAudio, sfx } from "../audio";
import Bubbles from "./Bubbles";

export default function Splash() {
  const { setView } = useGame();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  function enter() {
    unlockAudio();
    sfx.whoosh();
    setView("map");
  }

  return (
    <button
      onClick={enter}
      className="relative flex h-dvh min-h-dvh w-full flex-col items-center justify-center overflow-hidden text-center"
    >
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/bg-ocean.jpg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#031018]/40 via-[#031018]/55 to-[#031018]" />
      <div className="caustics absolute inset-0" />
      <div className="godrays absolute inset-0" />
      <Bubbles count={28} />

      <img
        src="/images/whale-shark.png"
        alt=""
        className="pointer-events-none absolute top-[18%] left-[8%] w-40 opacity-80 animate-swim-l md:w-64"
      />
      <img
        src="/images/shark.png"
        alt=""
        className="pointer-events-none absolute right-[6%] bottom-[22%] w-32 opacity-90 animate-swim-r md:w-52"
      />

      <div className="relative z-10 animate-splash px-6">
        <div className="mx-auto mb-5 grid h-24 w-24 place-items-center overflow-hidden rounded-3xl border border-cyan-300/40 shadow-[0_0_40px_rgba(34,211,238,0.45)]">
          <img src="/images/logo-shark.png" alt="" className="h-full w-full object-cover" />
        </div>
        <h1 className="animate-title font-orbitron text-3xl font-black tracking-[0.18em] text-white sm:text-5xl">
          CODESHARK
        </h1>
        <p className="mt-1 font-orbitron text-sm font-semibold tracking-[0.42em] text-cyan-300 sm:text-lg">
          ACADEMY
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm text-cyan-100/75 sm:text-base">
          Selamat datang, kadet. Selami HTML, CSS, dan JavaScript lewat misi di dasar laut.
        </p>
        <div
          className={`mt-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-6 py-3 font-orbitron text-xs font-bold tracking-[0.25em] text-cyan-50 ${
            ready ? "animate-pulse-cyan" : "opacity-0"
          }`}
        >
          KETUK UNTUK MENYELAM
        </div>
      </div>
    </button>
  );
}
