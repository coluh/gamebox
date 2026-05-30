import { useCallback, useEffect, useState } from "react";

type Status = "checking" | "online" | "offline";
type Props = {
  url?: string;
};

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export default function ServerStatus({
  url = import.meta.env.VITE_SERVER_URL || "http://localhost:3600",
}: Props) {
  const [status, setStatus] = useState<Status>("checking");

  const checkStatus = useCallback(async () => {
    setStatus("checking");
    try {
      const response = await fetch(`${url}/health`, {
        cache: "no-cache",
      });
      if (response.ok) {
        setStatus("online");
      } else {
        setStatus("offline");
      }
    } catch (error) {
      setStatus("offline");
    }
  }, [url]);

  useEffect(() => {
    checkStatus();
    // const interval = setInterval(checkStatus, 30000); // 每30秒检查一次
    // return () => clearInterval(interval);
  }, [checkStatus]);

  const domain = getDomain(url);
  const text =
    status === "checking"
      ? "检测中..."
      : status === "online"
        ? "服务在线"
        : "- 离线 -";
  const color =
    status === "checking"
      ? "bg-blue-600"
      : status === "online"
        ? "bg-green-600"
        : "bg-gray-600";

  return (
    <div
      onClick={status !== "checking" ? () => void checkStatus() : undefined}
      className={`flex h-fit w-fit cursor-default flex-col items-center rounded-lg p-2 ${color}`}
    >
      <i className="text-xs font-medium">{domain}</i>
      <span className="text-sm font-bold">{text}</span>
    </div>
  );
}
