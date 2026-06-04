import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export default async function PerfilPage() {
  const session = await getUserSession();
  if (!session) redirect("/cuenta/login?next=/cuenta/perfil");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  if (!user) redirect("/cuenta/login");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cuenta"
        title="Mi perfil"
        description="Nombre visible en el ranking, alertas de pronósticos y contraseña."
      />
      <ProfileForm
        email={user.email}
        displayName={user.displayName}
        notifyMatchReminders={user.notifyMatchReminders}
      />
    </div>
  );
}
