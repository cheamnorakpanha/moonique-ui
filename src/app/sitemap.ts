import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = publicSiteUrl();
  return url ? [{ url: `${url}/` }] : [];
}
