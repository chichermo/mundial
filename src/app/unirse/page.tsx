import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/session";

export default async function UnirsePage() {
  const user = await getUserSession();
  if (!user) redirect("/cuenta/registro?next=/polla/grupos");
  redirect("/polla/grupos");
}
