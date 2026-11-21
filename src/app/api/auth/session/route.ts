import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/** GET /api/auth/session — info sesi aktif (aman untuk client). */
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
