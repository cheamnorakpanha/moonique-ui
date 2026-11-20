"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, CookingPot, Plus, Search, ShoppingBag } from "lucide-react";
import { useRef, useState } from "react";
import { site } from "@/config/site";
import { categories, productById, type Category, type Product } from "@/data/products";
import type { Dictionary } from "@/i18n/dictionaries";
import { canAdd, filterProducts, formatMoney, lineTotal, maxQuantity, productName, type Currency, type Language } from "@/lib/shop";
import { Dialog } from "../ui/dialog";
import { Quantity } from "../ui/quantity";

type CatalogProps = {
  t: Dictionary; language: Language; currency: Currency;
  add: (product: Product, quantity: number) => void;
};

export function ProductImage({ product, t, language, source = product.image }: {
  product: Product; t: Dictionary; language: Language; source?: string;
}) {
  const [failedSource, setFailedSource] = useState<string>();
  return <div className="product-image">
    {source && failedSource !== source ? <>
      <Image src={source} alt={product.imageIsIllustrative ? `${t.illustration} · ${productName(product, language)}` : productName(product, language)}
        fill sizes="(max-width: 640px) 92vw, (max-width: 1023px) 45vw, 380px" onError={() => setFailedSource(source)} />
      {product.imageIsIllustrative && <span className="image-label">{t.illustration}</span>}
    </> : <div className="product-placeholder"><CookingPot strokeWidth={1.15} size={42} aria-hidden /><span>{t.imageMissing}</span></div>}
  </div>;
}

function Price({ product, t, currency, language, quantity = 1 }: Omit<CatalogProps, "add"> & { product: Product; quantity?: number }) {
  const price = lineTotal(product, quantity, currency);
  return <span>{price === null ? t.priceUnknown : formatMoney(price, currency, language)}</span>;
}

function ProductCard({ product, select, ...props }: CatalogProps & { product: Product; select: () => void }) {
  const { t, language, add } = props;
  return <article className="product-card">
    <button type="button" className="product-open" onClick={select} aria-label={`${t.details} · ${productName(product, language)}`}>
      <ProductImage product={product} t={t} language={language} />
    </button>
    <div className="product-content">
      <p className="product-category">{t[product.category]}</p>
      <h3><button type="button" onClick={select}>{productName(product, language)}</button></h3>
      <div className="product-status"><span>{t[product.availability]}</span>{product.bestSeller && <span>{t.bestSeller}</span>}{product.preorder && <span>{t.preorder}</span>}</div>
      <div className="product-bottom">
        <strong><Price product={product} {...props} /></strong>
        <button type="button" className="product-add" disabled={!canAdd(productById.get(product.id))}
          title={t.add} aria-label={`${t.add} · ${productName(product, language)}`} onClick={() => add(product, 1)}>
          <Plus size={19} aria-hidden />
        </button>
      </div>
    </div>
  </article>;
}

function ProductDetail({ product, close, ...props }: CatalogProps & { product: Product; close: () => void }) {
  const { t, language, add } = props;
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState(product.image);
  const description = language === "km" ? product.descriptionKm || product.description : product.description;
  const images = [product.image, ...(product.additionalImages ?? [])].filter((source): source is string => Boolean(source));
  return <Dialog open onOpenChange={(open) => { if (!open) close(); }} title={productName(product, language)} description={t.details} close={t.close}>
    <div className="dialog-body detail">
      <ProductImage product={product} t={t} language={language} source={image} />
      {images.length > 1 && <div className="flex flex-wrap gap-2 mt-3">
        {images.map((source, index) => <button key={source} className="image-thumb" onClick={() => setImage(source)} aria-pressed={source === image} aria-label={`${t.details} ${index + 1}`}><Image src={source} alt="" width={58} height={58} /></button>)}
      </div>}
      <div className="detail-copy">
        <p className="product-category">{t[product.category]} · {t[product.availability]}</p>
        <strong><Price product={product} quantity={quantity} {...props} /></strong>
        {description && <p>{description}</p>}
        {product.portion && <p>{product.portion}</p>}
        {product.ingredients?.length ? <p>{t.ingredients} · {product.ingredients.join(", ")}</p> : null}
        {product.bestSeller && <span className="pill">{t.bestSeller}</span>}
        {product.preorder && <span className="pill">{t.preorder}</span>}
        {product.availability !== "sold-out" &&
          <div className="detail-actions">
            <Quantity value={quantity} change={setQuantity} min={1} max={maxQuantity} t={t} />
            <button className="button button--primary" onClick={() => { add(product, quantity); close(); }}><ShoppingBag size={17} />{t.add}</button>
          </div>}
      </div>
    </div>
  </Dialog>;
}

export function Catalog(props: CatalogProps) {
  const { t, language } = props;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [selected, setSelected] = useState<Product>();
  const featuredRail = useRef<HTMLDivElement>(null);
  const results = filterProducts(query, category);
  const featured = site.featured.flatMap((id) => productById.get(id) ?? []);

  const move = (direction: number) => {
    const rail = featuredRail.current;
    const card = rail?.firstElementChild;
    if (rail && card) rail.scrollBy({ left: direction * (card.clientWidth + 20) });
  };

  return <>
    <section id="menu" className="menu-section section-pad" aria-labelledby="menu-title">
      <div className="wrap">
        <div className="section-heading centered">
          <div className="eyebrow ornamental"><span />{t.menu}<span /></div>
          <h2 id="menu-title">{t.menuTitle}</h2>
          <p>{t.menuBody}</p>
        </div>
        <div className="catalog-toolbar">
          <div className="filters" role="group" aria-label={t.menu}>
            {(["all", ...categories] as const).map((key) => <button type="button" className="pill"
              key={key} aria-pressed={key === category} onClick={() => setCategory(key)}>{t[key]}</button>)}
          </div>
          <label className="search"><Search size={19} aria-hidden /><span className="sr-only">{t.search}</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} />
          </label>
        </div>
        {results.length ? <div className="product-grid">
          {results.map((product) => <ProductCard key={product.id} product={product} select={() => setSelected(product)} {...props} />)}
        </div> : <p className="empty-panel" role="status">{t.noResults}</p>}
      </div>
    </section>
    {featured.length > 0 && <section className="featured section-pad" aria-labelledby="featured-title">
      <div className="wrap">
        <div className="featured-head">
          <h2 id="featured-title">{t.featured}</h2>
          {featured.length > 1 && <div className="rail-controls">
            <button className="icon-button icon-button--outline" aria-label={t.previous} onClick={() => move(-1)}><ArrowLeft size={20} /></button>
            <button className="icon-button icon-button--outline" aria-label={t.next} onClick={() => move(1)}><ArrowRight size={20} /></button>
          </div>}
        </div>
        <div className="featured-rail" ref={featuredRail}>
          {featured.map((product) => <button className="featured-card" key={product.id} onClick={() => setSelected(product)}>
            <ProductImage product={product} t={t} language={language} />
            <span>{productName(product, language)}</span>
          </button>)}
        </div>
      </div>
    </section>}
    {selected && <ProductDetail key={selected.id} product={selected} close={() => setSelected(undefined)} {...props} />}
  </>;
}
