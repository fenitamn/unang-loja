import type { NextConfig } from "next";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";
import { routing } from "./src/i18n/routing";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(),
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: `/${routing.defaultLocale}`,
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
