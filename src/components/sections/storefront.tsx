"use client";

import Image from "next/image";
import { ArrowUp, CookingPot, Heart, Leaf, Menu as MenuIcon, Send, ShoppingBag, Sparkles, Users, Phone, MapPin, Copy } from "lucide-react";
import { LazyMotion, MotionConfig, domAnimation, m, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import type { Product } from "@/data/products";
import { usePwa } from "@/hooks/pwa";
import { usePreference } from "@/hooks/preferences";
import { dictionaries, type Dictionary } from "@/i18n/dictionaries";
import { canAdd, maxQuantity, safeWebUrl, telegramUrl, type Currency, type Language } from "@/lib/shop";
import { useCart } from "@/stores/cart";
import { CartDrawer } from "../cart/cart-drawer";
import { Brand, Header, navKeys } from "../layout/header";
import { Catalog } from "../products/catalog";

const values = [CookingPot, Heart, Leaf, Users];
const stepIcons = [MenuIcon, ShoppingBag, Send];
const languages = ["en", "km"] as const;
const currencies = ["USD", "KHR"] as const;

function ContactLinks({ t, online, notify, footer = false }: { t: Dictionary; online: boolean; notify: (message: string) => void; footer?: boolean }) {
  const { contact } = site;
  const telegram = online ? telegramUrl(contact.telegram) : undefined;
  const facebook = online ? safeWebUrl(contact.facebook) : undefined;
  const map = online ? safeWebUrl(contact.map) : undefined;
  const phone = contact.phone?.match(/^\+?[0-9 ()-]{7,24}$/) ? contact.phone : undefined;
  const external = { target: "_blank", rel: "noopener noreferrer" };
  const className = footer ? "footer-link" : "button button--secondary";
  const fields = ["address", "hours", "pickup", "delivery"] as const;
  if (!telegram && !facebook && !map && !phone && !fields.some((key) => contact[key])) {
    return footer ? null : <p className="contact-note">{t.contactUnavailable}</p>;
  }

  return <>
    {fields.some((key) => contact[key]) && <dl className="contact-details">{fields.map((key) => contact[key] && <div key={key}><dt>{t[key]}</dt><dd>{contact[key]}</dd></div>)}</dl>}
    <div className="contact-links">
      {telegram && <a className={className} href={telegram} {...external}><Send size={17} />Telegram</a>}
      {facebook && <a className={className} href={facebook} {...external}>Facebook</a>}
      {map && <a className={className} href={map} {...external}><MapPin size={17} />{t.map}</a>}
      {phone && <a className={className} href={`tel:${phone.replace(/[^+\d]/g, "")}`}><Phone size={17} />{phone}</a>}
      {phone && !footer && <button className={className} onClick={async () => {
        try { await navigator.clipboard.writeText(phone); notify(t.phoneCopied); }
        catch { notify(t.copyError); }
      }}><Copy size={17} />{t.copyPhone}</button>}
    </div>
  </>;
}

export function Storefront() {
  const [language, setLanguage] = usePreference<Language>("moonique-language", "en", languages);
  const [currency, setCurrency] = usePreference<Currency>("moonique-currency", "USD", currencies);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState({ message: "", sequence: 0 });
  const [installHelp, setInstallHelp] = useState(false);
  const { items, add } = useCart();
  const pwa = usePwa();
  const reducedMotion = useReducedMotion();
  const t = dictionaries[language];
  const telegram = telegramUrl(site.contact.telegram);
  const count = Object.values(items).reduce((sum, quantity) => sum + quantity, 0);

  useEffect(() => { void useCart.persist?.rehydrate(); }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  useEffect(() => {
    if (!toast.message) return;
    const timeout = window.setTimeout(() => setToast({ message: "", sequence: toast.sequence }), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function notify(message: string) {
    setToast((previous) => ({ message, sequence: previous.sequence + 1 }));
  }

  function addItem(product: Product, quantity: number) {
    if (!canAdd(product)) return;
    if ((useCart.getState().items[product.id] ?? 0) + quantity > maxQuantity) {
      notify(t.limit);
      return;
    }
    add(product.id, quantity);
    notify(t.added);
  }

  return <MotionConfig reducedMotion="user"><LazyMotion features={domAnimation} strict>
    <Header {...{ t, language, setLanguage, currency, setCurrency, count }} openCart={() => setCartOpen(true)} />
    {!pwa.online && <div className="network-banner" role="status">{t.offline}</div>}
    {pwa.waiting && <div className="network-banner" role="status">{t.update}<button className="text-button" onClick={pwa.update}>{t.reload}</button></div>}
    <main id="main">
      <section id="home" className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="hero-inner hero-enter">
            <p className="eyebrow hero-kicker"><span />{t.heroLabel}</p>
            <h1 id="hero-title">{t.heroTitle}<em>{t.heroAccent}</em></h1>
            <p className="hero-description">{t.heroBody}</p>
            <div className="hero-actions">
              <a className="button button--gold" href="#menu">{t.explore}</a>
              {count ? <button className="button button--hero-outline" onClick={() => setCartOpen(true)}>{t.order}</button> :
                <a className="button button--hero-outline" href="#menu">{t.order}</a>}
            </div>
          </div>
          <div className="hero-pattern" aria-hidden />
        </div>
        <figure className="hero-picture">
          <Image src="/images/branding/hero.webp" alt={t.heroAlt} fill sizes="(max-width: 767px) 100vw, 50vw" preload />
          <figcaption className="image-label">{t.illustration}</figcaption>
        </figure>
      </section>

      <section className="values" aria-label={t.heroLabel}>
        <div className="wrap values-inner">
          {t.values.map(([title, body], index) => {
            const Icon = values[index];
            return <div className="value" key={index}><Icon size={26} strokeWidth={1.55} aria-hidden /><div><h2>{title}</h2><p>{body}</p></div></div>;
          })}
        </div>
      </section>

      <Catalog t={t} language={language} currency={currency} add={addItem} />

      <section id="about" className="story section-pad">
        <div className="wrap story-inner">
          <figure className="story-picture">
            <Image src="/images/branding/story.webp" alt={t.storyAlt} fill sizes="(max-width: 767px) 92vw, 48vw" />
            <figcaption className="image-label">{t.illustration}</figcaption>
          </figure>
          <div className="story-copy">
            <p className="eyebrow">{t.about}</p>
            <h2>{t.storyTitle}</h2>
            <p>{t.storyBody}</p><p>{t.storyBody2}</p>
          </div>
        </div>
      </section>

      <section id="how" className="section-pad how">
        <div className="wrap">
          <div className="section-heading centered"><p className="eyebrow ornamental"><span />{t.order}<span /></p><h2>{t.how}</h2></div>
          <ol className="step-grid">
            {[...t.steps, telegram ? t.telegramStep : t.summaryStep].map(([title, body], index) => {
              const Icon = stepIcons[index];
              return <m.li key={index} initial={false} whileInView={reducedMotion ? undefined : { y: [6, 0] }} viewport={{ once: true }} transition={{ duration: 0.25 }}>
                <span className="step-icon"><Icon size={24} strokeWidth={1.6} aria-hidden /><span>{index + 1}</span></span>
                <h3>{title}</h3><p>{body}</p>
              </m.li>;
            })}
          </ol>
          <div className="how-action">
            {count ? <button className="button button--primary" onClick={() => setCartOpen(true)}>{t.cart}</button> : <a href="#menu" className="button button--primary">{t.explore}</a>}
          </div>
        </div>
      </section>

      <section className="occasions">
        <div className="wrap occasions-inner">
          <Sparkles size={29} strokeWidth={1.45} aria-hidden />
          <p className="eyebrow">{t.occasions}</p>
          <h2>{t.occasionsTitle}</h2><p>{t.occasionsBody}</p>
          <a className="button button--hero-outline" href={pwa.online && telegram ? telegram : "#contact"}>{t.inquire}</a>
        </div>
      </section>

      {site.reviews.length > 0 && <section className="section-pad">
        <div className="wrap">
          <div className="section-heading centered"><h2>{t.reviews}</h2></div>
          <div className="review-grid">{site.reviews.map((review) => <figure key={review.name}>
            {review.photo && <Image src={review.photo} alt="" width={56} height={56} />}
            <p aria-label={`${review.rating}/5`}>{"★".repeat(review.rating)}</p>
            <blockquote>{review.quote}</blockquote><figcaption>{review.name}</figcaption>
          </figure>)}</div>
        </div>
      </section>}

      <section id="contact" className="section-pad contact">
        <div className="wrap">
          <div className="section-heading centered"><p className="eyebrow ornamental"><span />{t.contact}<span /></p><h2>{t.contactTitle}</h2><p>{t.contactBody}</p></div>
          <ContactLinks t={t} online={pwa.online} notify={notify} />
        </div>
      </section>
    </main>

    <footer className="footer">
      <div className="wrap footer-main">
        <div><Brand /><p>{t.footerTagline}</p><ContactLinks t={t} online={pwa.online} notify={notify} footer /></div>
        <div><h2>{t.footerNav}</h2><nav aria-label={t.footerNav}>{navKeys.map((key) => <a href={`#${key}`} key={key}>{t[key]}</a>)}</nav></div>
        <div className="footer-actions">
          {!pwa.standalone && <><button className="text-button" aria-expanded={pwa.canPrompt ? undefined : installHelp} onClick={() => {
            if (pwa.canPrompt) void pwa.install();
            else setInstallHelp(!installHelp);
          }}>{t.install}</button>{installHelp && <p>{t.installHelp}</p>}</>}
          <a className="footer-link" href="#home"><ArrowUp size={17} />{t.top}</a>
        </div>
      </div>
      <div className="wrap footer-bottom">© {new Date().getFullYear()} Moonique Shop. {t.copyright}</div>
    </footer>

    <div className="toast-region" role="status" aria-live="polite">
      {toast.message && <div className="toast" key={toast.sequence}>{toast.message}</div>}
    </div>
    <CartDrawer open={cartOpen} onOpenChange={setCartOpen} t={t} language={language} currency={currency} online={pwa.online} />
  </LazyMotion></MotionConfig>;
}
