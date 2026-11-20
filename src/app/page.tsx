import { Storefront } from "@/components/sections/storefront";
import { publicSiteUrl, site } from "@/config/site";

export default function Home() {
  const url = publicSiteUrl();
  const structured = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    description: "Homemade Cambodian foods, snacks and desserts.",
    ...(url ? { url, logo: `${url}/icons/icon-512.png` } : {}),
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />
    <Storefront />
  </>;
}
