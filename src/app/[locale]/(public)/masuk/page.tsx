import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import AuthForm from "@/components/AuthForm";
import { getSession, safeNextPath } from "@/lib/auth";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { locale } = await params;
  const { next } = await searchParams;
  setRequestLocale(locale);

  const target = safeNextPath(next);
  const fallback = `/${locale}/akun`;
  const user = await getSession();
  if (user) {
    redirect(target ?? (user.role === "admin" ? `/${locale}/admin/dashboard` : fallback));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-14">
      <AuthForm mode="login" next={target} />
    </div>
  );
}
