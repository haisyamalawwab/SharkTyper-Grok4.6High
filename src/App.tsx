import { GameProvider, useGame } from "./context/GameContext";
import Bubbles from "./components/Bubbles";
import Header from "./components/Header";
import StatsBar from "./components/StatsBar";
import WorldMap from "./components/WorldMap";
import SubGamePicker from "./components/SubGamePicker";
import Splash from "./components/Splash";
import LessonPanel from "./components/LessonPanel";
import SharkTyper from "./components/SharkTyper";
import CodingTower from "./components/CodingTower";
import ResultsScreen from "./components/ResultsScreen";
import MateriPanel from "./components/MateriPanel";
import Toasts from "./components/Toasts";

export default function App() {
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  );
}

function Shell() {
  const { view } = useGame();

  return (
    <>
      {view === "splash" && <Splash />}
      {view === "lesson" && <LessonPanel />}
      {view === "typer" && <SharkTyper />}
      {view === "tower" && <CodingTower />}
      {view === "results" && <ResultsScreen />}
      {view === "materi" && <MateriPanel />}
      {view === "map" && <MapHud />}
      <Toasts />
    </>
  );
}

function MapHud() {
  return (
    <div className="relative flex h-dvh min-h-screen flex-col overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/bg-ocean.jpg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#031018]/70 via-[#041422]/55 to-[#031018]/90" />
      <div className="caustics absolute inset-0" />
      <div className="godrays absolute inset-0 opacity-70" />
      <CoralSilhouettes />
      <Bubbles count={20} />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <Header />
        <StatsBar />
        <div className="relative min-h-0 flex-1">
          <WorldMap />
          <SubGamePicker />
        </div>
      </div>
    </div>
  );
}

function CoralSilhouettes() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] w-full text-cyan-950/80"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M0,288 L40,250 C80,210 70,160 110,170 C150,180 140,90 180,110 C210,122 200,200 240,210 C280,220 270,140 320,150 C360,158 350,240 400,250 C450,260 430,180 490,190 C540,200 530,260 580,270 C630,280 620,200 680,210 C730,220 720,280 780,286 C840,292 830,230 890,240 C940,248 930,290 980,296 C1040,304 1020,240 1080,250 C1140,260 1120,300 1180,306 C1240,312 1220,250 1280,260 C1340,270 1320,300 1380,308 L1440,320 L1440,320 L0,320 Z"
      />
      <path
        fill="#020b12"
        opacity="0.85"
        d="M0,300 C60,280 80,240 130,250 C180,260 170,220 220,230 C270,240 260,280 320,286 C380,292 370,250 430,258 C490,266 480,300 540,306 C600,312 590,270 650,278 C720,288 710,310 780,314 C860,318 840,280 920,288 C1000,296 980,318 1060,318 C1140,318 1120,290 1200,298 C1280,306 1260,318 1340,318 L1440,320 L0,320 Z"
      />
    </svg>
  );
}
