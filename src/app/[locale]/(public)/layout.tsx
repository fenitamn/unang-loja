import { setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { getSession } from "@/lib/auth";

// Halaman masuk/daftar tetap publik, tetapi Header menampilkan sesi aktif.
export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getSession();

  return (
    <>
      <Header user={user ? { name: user.name, role: user.role } : null} />
      <main className="flex-1">{children}</main>
      <WhatsAppFloat />
      <Footer />
    </>
  );
}
