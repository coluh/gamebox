import { useCallback, useEffect, useState } from "react";

export type Status = "checking" | "online" | "offline";
type Props = {
  url?: string;
  className?: string;
  onChecked?: (status: Status) => void;
};

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export default function ServerStatus({
  url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3600/api",
  className = "",
  onChecked = () => {},
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

  useEffect(() => {
    onChecked(status);
  }, [status]);

  const domain = getDomain(url);
  const text = status === "checking" ? "检测中..." : status === "online" ? "服务在线" : "- 离线 -";
  const color = status === "checking" ? "bg-zinc-600" : status === "online" ? "bg-emerald-600" : "bg-zinc-600";

  return (
    <div
      onClick={() => {
        if (status !== "checking") {
          checkStatus();
        }
      }}
      className={`flex h-fit w-fit cursor-pointer flex-row items-center gap-2 rounded-lg p-2 text-sm ${color} ${className}`}
    >
      <i className="font-medium">{domain}</i>
      <span className="font-bold">{text}</span>
    </div>
  );
}
