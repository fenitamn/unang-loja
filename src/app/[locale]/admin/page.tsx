import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AdminDashboard from "@/components/AdminDashboard";
import { ADMIN_COOKIE, isAdminConfigured } from "@/lib/admin";
import { isDbConfigured } from "@/lib/supabase";
import { isNotifyConfigured } from "@/lib/notify";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin");
  const store = await cookies();
  const loggedIn = store.get(ADMIN_COOKIE)?.value === "granted";

  return (
    <AdminDashboard
      loggedIn={loggedIn}
      dbConfigured={isDbConfigured()}
      adminConfigured={isAdminConfigured()}
      notifyConfigured={isNotifyConfigured()}
      title={t("title")}
      subtitle={t("subtitle")}
    />
  );
}
