import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getUserSession } from "@/lib/session";

export default async function LoginPage() {
  const user = await getUserSession();
  if (user) redirect("/polla/grupos");

  return (
    <div className="py-8">
      <Suspense fallback={<p className="text-center text-muted">Cargando…</p>}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
