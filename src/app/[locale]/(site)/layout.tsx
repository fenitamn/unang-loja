import { headers } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { requireUserPage, safeNextPath } from "@/lib/auth";

// Header dan guard sesi membaca cookie, jadi seluruh halaman situs dirender
// dinamis. Guard di layout ini melindungi semua halaman pelanggan sekaligus.
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Proxy meneruskan pathname asli agar pengguna kembali ke halaman yang
  // dituju setelah berhasil masuk.
  const requestedPath = (await headers()).get("x-ul-pathname");
  const nextPath = safeNextPath(requestedPath) ?? `/${locale}`;
  const user = await requireUserPage(locale, nextPath);

  return (
    <>
      <Header user={{ name: user.name, role: user.role }} />
      <main className="flex-1">{children}</main>
      <WhatsAppFloat />
      <Footer />
    </>
  );
}
