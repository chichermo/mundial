import { getPollaSession, getUserSession } from "@/lib/session";
import { SiteNav } from "./SiteNav";

export async function SiteNavShell() {
  const user = await getUserSession();
  const polla = await getPollaSession();
  return <SiteNav user={user} polla={polla} />;
}
