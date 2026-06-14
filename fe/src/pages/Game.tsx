import { gameSocket } from "@/api/ws";
import { useEffect, useState } from "react";

type Props = {
  onExit: () => void;
};

export function Game({ onExit }: Props) {
  const [messages, setMessages] = useState<string[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const handler = (payload: { msg: string }) => {
      setMessages((prev) => [...prev, payload.msg]);
    };
    gameSocket.on("chat", handler);
    return () => {
      gameSocket.off("chat", handler);
    };
  }, []);

  const send = (text) => {
    if (text.trim() === "") return;
    gameSocket.send("chat", { msg: text });
    setText("");
  };

  return (
    <div className="size-full pt-16">
      <div className="mx-auto flex w-3xl flex-col gap-8 rounded-lg bg-black/20 p-16 ring-2 ring-emerald-600">
        <button
          onClick={onExit}
          className="size-fit rounded-lg bg-black/20 px-4 py-2 text-lg ring-2 ring-emerald-600 transition duration-150 hover:-translate-y-0.5 hover:scale-110 hover:bg-white/10"
        >
          Exit
        </button>
        <div className="flex flex-col bg-black/50 px-4 py-2">
          {messages.map((m, i) => (
            <p key={i}>{m}</p>
          ))}
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(text)}
          className="border-b border-emerald-600 bg-black/50 px-4 py-2 outline-none focus:border-emerald-400"
        />
        <button
          disabled={text.trim() === ""}
          onClick={() => send(text)}
          className="mx-auto size-fit rounded-lg bg-black/20 px-4 py-2 text-lg shadow ring-2 shadow-emerald-400 ring-emerald-600 duration-100 hover:shadow-lg active:shadow-inner disabled:text-zinc-500"
        >
          Send
        </button>
      </div>
    </div>
  );
}
