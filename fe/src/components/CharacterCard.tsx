import { useEffect, useRef } from "react";

export default function CharacterCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "forestgreen";
    ctx.fillRect(canvas.width / 4, 0, canvas.width / 2, canvas.height);
  });

  return <canvas ref={canvasRef} width={320} height={320} />;
}
