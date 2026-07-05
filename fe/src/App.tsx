import { useState } from "react";
import { Lobby } from "./pages/Lobby";
import { Game } from "./pages/Game";

type Page = "lobby" | "game";

function App() {
  const [page, setPage] = useState<Page>("lobby");

  return (
    <div className="h-full w-full bg-conic-[at_0_0] from-emerald-600 to-emerald-950 text-zinc-200">
      {page === "lobby" && <Lobby onStart={() => setPage("game")} />}
      {page === "game" && <Game onExit={() => setPage("lobby")} />}
    </div>
  );
}

export default App;
