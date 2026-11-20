"use client";

import Image from "next/image";
import { ChevronDown, Globe2, Menu, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog } from "../ui/dialog";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Currency, Language } from "@/lib/shop";

export function Brand() {
  return <a href="#home" className="brand" aria-label="Moonique Shop">
    <Image src="/icons/icon-192.png" width={44} height={44} alt="" />
    <span>Moonique <span>Shop</span></span>
  </a>;
}

export const navKeys = ["home", "menu", "about", "how", "contact"] as const;

export function Header({ t, language, setLanguage, currency, setCurrency, count, openCart }: {
  t: Dictionary; language: Language; setLanguage: (language: Language) => void;
  currency: Currency; setCurrency: (currency: Currency) => void; count: number; openCart: () => void;
}) {
  const [mobile, setMobile] = useState(false);
  const [active, setActive] = useState<string>("home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 8);
      const current = [...navKeys].reverse().find((key) => {
        const section = document.getElementById(key);
        return section && section.getBoundingClientRect().top < 170;
      });
      setActive(current ?? "home");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const links = navKeys.map((key) => (
    <a key={key} href={`#${key}`} aria-current={active === key ? "location" : undefined}
      onClick={() => { setActive(key); setMobile(false); }}>{t[key]}</a>
  ));

  return (
    <>
      <a className="skip-link" href="#main">{t.skip}</a>
      <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
        <div className="wrap header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label={t.navigation}>{links}</nav>
          <div className="header-actions">
            <label className="preference preference--currency">
              <span className="sr-only">{t.currency}</span>
              <select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}><option>USD</option><option>KHR</option></select>
              <ChevronDown size={12} aria-hidden />
            </label>
            <label className="preference preference--language">
              <Globe2 size={15} aria-hidden />
              <span className="sr-only">{t.language}</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
                <option value="en">EN</option><option value="km" lang="km">ខ្មែរ</option>
              </select>
              <ChevronDown size={12} aria-hidden />
            </label>
            <button className="icon-button cart-trigger" data-cart-trigger onClick={openCart} aria-label={`${t.cart} (${count})`}>
              <ShoppingBag size={19} aria-hidden /><span aria-hidden>{count}</span>
            </button>
            <button className="icon-button mobile-toggle" onClick={() => setMobile(true)} aria-label={t.navigation} aria-expanded={mobile}>
              <Menu size={23} />
            </button>
          </div>
        </div>
      </header>
      <Dialog open={mobile} onOpenChange={setMobile} title={t.navigation} description={t.navigation} close={t.close} variant="drawer">
        <nav className="mobile-nav" aria-label={t.navigation}>{links}</nav>
        <label className="field mobile-currency">{t.currency}
          <select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}>
            <option>USD</option><option>KHR</option>
          </select>
        </label>
      </Dialog>
    </>
  );
}
