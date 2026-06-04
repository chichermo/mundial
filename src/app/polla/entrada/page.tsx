import { redirect } from "next/navigation";

export default function PollaEntradaPage() {
  redirect("/cuenta/login?next=/polla/grupos");
}
