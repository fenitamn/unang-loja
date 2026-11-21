import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import AuthForm from "@/components/AuthForm";
import { getSession } from "@/lib/auth";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  const { next } = await searchParams;
  setRequestLocale(locale);

  const user = await getSession();
  if (user) redirect(user.role === "admin" ? `/${locale}/admin/dashboard` : `/${locale}/akun`);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-14">
      <AuthForm mode="register" next={next ?? null} />
    </div>
  );
}
