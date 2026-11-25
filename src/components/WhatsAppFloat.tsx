"use client";

import { useTranslations } from "next-intl";

export default function WhatsAppFloat() {
  const t = useTranslations("common");
  return (
    <a
      href="https://wa.me/6281268008622?text=Halo%20UNANG%20LOJA"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsapp")}
      className="fixed bottom-4 right-4 z-50 flex items-center justify-center gap-2 rounded-full bg-[#25d366] p-3 text-sm font-semibold text-white shadow-lg hover:brightness-95 md:px-4 md:py-3"
    >
      <svg width="22" height="22" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M16 3C9.4 3 4 8.3 4 14.9c0 2.6.8 5 2.3 7L4.5 29l7.4-1.9c1.9 1 4 1.6 6.2 1.6h.1c6.6 0 12-5.3 12-11.9S22.6 3 16 3zm0 21.8c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.1 1.1 1.1-4-.3-.4c-1.2-1.7-1.8-3.7-1.8-5.8C5.1 8.9 10 5.1 16 5.1S26.9 9.9 26.9 15.9s-4.9 8.9-10.9 8.9zm6-7.4c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.2-.7.1-1.9-.9-3.2-1.6-4.5-3.7-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6L11.4 9c-.2-.5-.4-.5-.6-.5h-.7c-.2 0-.6.1-.9.4-1.2 1.2-1.5 2.4-1.2 3.6.6 2.3 2.5 5.2 5.3 7 2.7 1.7 3.9 1.9 5.4 1.6.9-.2 1.9-.8 2.4-1.6.4-.7.4-1.3.3-1.4 0-.1-.2-.2-.4-.3z" />
      </svg>
      <span className="hidden md:inline">WhatsApp</span>
    </a>
  );
}
