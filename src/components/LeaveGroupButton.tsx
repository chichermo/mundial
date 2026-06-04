"use client";

import { useRouter } from "next/navigation";

export function LeaveGroupButton() {
  const router = useRouter();

  async function leave() {
    await fetch("/api/polla/logout", { method: "POST" });
    router.push("/polla/grupos");
    router.refresh();
  }

  return (
    <button type="button" onClick={leave} className="btn-ghost text-sm">
      Cambiar grupo
    </button>
  );
}
