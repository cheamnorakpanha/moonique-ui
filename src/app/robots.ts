import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const url = publicSiteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/offline", "/offline.html"] }],
    ...(url ? { sitemap: `${url}/sitemap.xml` } : {}),
  };
}
