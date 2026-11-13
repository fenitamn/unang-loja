/**
 * Foto asli Pulau Samosir & Danau Toba (Wikimedia Commons, lisensi bebas).
 * File fisik ada di /public/images — lihat public/images/CREDITS.md untuk atribusi.
 */
export const PHOTOS = {
  hero: "/images/hero.jpg", // Panorama Danau Toba & Pulau Samosir
  rumahBolon: "/images/rumah-bolon.jpg", // Rumah adat Batak Toba
  tuktuk: "/images/tuktuk.jpg", // Pemandangan dari hotel, Tuk Tuk (Carolina Hotel)
  tuktukLake: "/images/tuktuk-lake.jpg", // Tuk Tuk dilihat dari danau
  koper: "/images/koper-aman.jpg", // Koper/bagasi tertata (penitipan)
  tomok: "/images/tomok.jpg", // Dermaga/wilayah Tomok
  sigaleGale: "/images/sigale-gale.jpg", // Tari Sigale-gale Samosir
  tortor: "/images/tortor.jpg", // Tari tor-tor Batak Toba
} as const;

/** Foto sampul per layanan (kunci = ServiceKey di data.ts) */
export const SERVICE_PHOTO: Record<string, string> = {
  pemanduan: PHOTOS.tortor,
  penitipan: PHOTOS.koper,
  antarDekat: "/images/zona-dekat.jpg",
  antarLintas: PHOTOS.tuktuk,
  fleksibel: PHOTOS.hero,
  mystery: PHOTOS.sigaleGale,
};

/** Foto sampul per pemandu (g1..g6) */
export const GUIDE_PHOTO: Record<string, string> = {
  g1: PHOTOS.rumahBolon,
  g2: PHOTOS.sigaleGale,
  g3: PHOTOS.tomok,
  g4: PHOTOS.tuktukLake,
  g5: PHOTOS.tortor,
  g6: PHOTOS.tuktuk,
};
