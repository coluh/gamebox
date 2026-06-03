import { Home } from "@/pages/Home";
import { useState } from "react";
import Modal from "@/components/Modal";
import LoginForm from "@/components/LoginForm";

function App() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="h-full w-full bg-zinc-900 text-zinc-200">
      <Modal
        open={showLogin}
        onClose={() => {
          setShowLogin(false);
        }}
      >
        <LoginForm onSuccess={() => setShowLogin(false)} />
      </Modal>

      <Home onShowLogin={() => setShowLogin(true)} />
    </div>
  );
}

export default App;
