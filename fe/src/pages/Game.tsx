import { joinGame } from "@/api";
import { gameSocket } from "@/api/ws";
import { getAccessToken } from "@/utils/auth";
import { useEffect, useRef, useState } from "react";

type Props = {
  onExit: () => void;
};

type Player = {
  id: string;
  pos: { x: number; y: number };
  vel: { x: number; y: number };
};

export function Game({ onExit }: Props) {
  const initialized = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  const syncHandler = (payload: { list: Player[] }) => {
    setPlayers(payload.list);
  };

  const init = () => {
    const token = getAccessToken();
    if (!token) return; // TODO: nav module, notice module
    gameSocket.connect(token);
    gameSocket.on("sync", syncHandler);
    // TODO: loading
    joinGame().then((res) => console.log(`room ${res.roomId}, count ${res.count}`));
  };

  const deinit = () => {
    gameSocket.off("sync", syncHandler);
    gameSocket.disconnect();
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    init();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "green";
    ctx.lineWidth = 4;
    players.forEach((p) => {
      ctx.strokeRect(p.pos.x - 10, p.pos.y - 20, 20, 40);
    });
  }, [players]);

  return (
    <div className="size-full bg-emerald-950">
      <canvas
        ref={canvasRef}
        onClick={(ev) => {
          // const rect = canvasRef.current!.getBoundingClientRect();
          gameSocket.send("teleport", { pos: { x: ev.clientX, y: ev.clientY } });
        }}
      />
      <button
        onClick={() => {
          deinit();
          onExit();
        }}
        className="fixed top-8 left-8 size-fit rounded-lg bg-black/20 px-4 py-2 text-lg ring-2 ring-emerald-600 hover:bg-white/10"
      >
        Exit
      </button>
    </div>
  );
}
