import { NextResponse } from "next/server";
import { clearSession, sameOrigin } from "@/lib/auth";

/** POST /api/auth/logout — hapus sesi. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });
  }
  await clearSession();
  return NextResponse.json({ ok: true });
}
