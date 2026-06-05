import Link from "next/link";
import { ExportRankingButton } from "@/components/ExportRankingButton";
import { LiveStandingsTable } from "@/components/LiveStandingsTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPollaSession, getUserSession } from "@/lib/session";

export default async function TablaPage() {
  const user = await getUserSession();
  const polla = await getPollaSession();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ranking en vivo"
        title="Tabla Balsuos"
        description={
          user && polla
            ? "Se actualiza sola cada 12 segundos."
            : "Inicia sesión y únete a Balsuos para ver la tabla completa."
        }
        actions={
          <>
            <ExportRankingButton targetId="live-standings-export" />
            <Link href="/polla" className="btn-ghost text-sm">
              Ir a polla
            </Link>
          </>
        }
      />
      {user && polla ? (
        <div id="live-standings-export">
          <LiveStandingsTable highlightId={polla.memberId} />
        </div>
      ) : (
        <div className="card-pitch p-8 text-center">
          <Link href="/cuenta/login?next=/polla/tabla" className="btn-primary">
            Entrar para ver la tabla
          </Link>
        </div>
      )}
    </div>
  );
}
