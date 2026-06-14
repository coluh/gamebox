import { useState } from "react";
import Modal from "@/components/Modal";
import LoginForm from "@/components/LoginForm";
import { Home } from "@/pages/Home";
import { Game } from "./pages/Game";

type Page = "home" | "game";

function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [page, setPage] = useState<Page>("home");

  return (
    <div className="h-full w-full bg-linear-to-b from-zinc-900 to-emerald-900 text-zinc-200">
      <Modal
        open={showLogin}
        onClose={() => {
          setShowLogin(false);
        }}
      >
        <LoginForm onSuccess={() => setShowLogin(false)} />
      </Modal>

      {page === "home" && (
        <Home onShowLogin={() => setShowLogin(true)} onStart={() => setPage("game")} />
      )}
      {page === "game" && <Game onExit={() => setPage("home")} />}
    </div>
  );
}

export default App;
