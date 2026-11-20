type Review = { name: string; rating: 1 | 2 | 3 | 4 | 5; quote: string; photo?: string };
type Contact = {
  phone?: string; telegram?: string; facebook?: string; address?: string;
  hours?: string; pickup?: string; delivery?: string; map?: string;
};

const contact: Contact = { telegram: process.env.NEXT_PUBLIC_TELEGRAM_USERNAME };

export const site = {
  name: "Moonique Shop",
  url: process.env.NEXT_PUBLIC_SITE_URL || "",
  khrPerUsd: 4000,
  contact,
  featured: ["fried-spring-roll", "meatball", "sausage"] as readonly string[],
  reviews: [] as readonly Review[],
};

export function publicSiteUrl() {
  try {
    const url = new URL(site.url);
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : undefined;
  } catch {
    return undefined;
  }
}
