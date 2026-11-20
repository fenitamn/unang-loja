import { setRequestLocale } from "next-intl/server";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/auth";
import { listOrders, storageMode } from "@/lib/store";

// Panel admin selalu membaca sesi admin dari cookie.
export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireAdminPage(locale);

  let pendingPayments = 0;
  try {
    pendingPayments = (await listOrders({ paymentStatus: "PENDING" })).length;
  } catch {
    pendingPayments = 0;
  }

  return (
    <AdminShell
      user={{ name: user.name, email: user.email }}
      pendingPayments={pendingPayments}
      dataMode={storageMode()}
    >
      {children}
    </AdminShell>
  );
}
