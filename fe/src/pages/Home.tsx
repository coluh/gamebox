import ServerStatus from "@/components/ServerStatus";

export function Home() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <h1>Home</h1>
      <ServerStatus />
    </div>
  );
}
