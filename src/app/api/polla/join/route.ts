import { NextResponse } from "next/server";

/** Redirigido al flujo con cuenta de usuario */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Crea una cuenta e inicia sesión. Luego crea o únete a un grupo desde Mis grupos.",
    },
    { status: 410 },
  );
}
