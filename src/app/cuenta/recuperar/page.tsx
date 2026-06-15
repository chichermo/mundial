import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { getUserSession } from "@/lib/session";

export default async function RecuperarPage() {
  const user = await getUserSession();
  if (user) redirect("/polla/grupos");

  return (
    <div className="py-8">
      <ResetPasswordForm />
    </div>
  );
}
