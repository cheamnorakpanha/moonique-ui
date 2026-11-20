"use client";

import { ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { cartLines, formatMoney, lineTotal, maxQuantity, productName, subtotal, type Currency, type Language } from "@/lib/shop";
import { useCart } from "@/stores/cart";
import { Dialog } from "../ui/dialog";
import { Quantity } from "../ui/quantity";
import { Checkout } from "../checkout/checkout";

export function CartDrawer({ open, onOpenChange, t, language, currency, online }: {
  open: boolean; onOpenChange: (open: boolean) => void; t: Dictionary; language: Language; currency: Currency; online: boolean;
}) {
  const [checkout, setCheckout] = useState(false);
  const { items, setQuantity, clear } = useCart();
  const lines = cartLines(items);
  const totals = subtotal(lines, currency);
  const price = (amount: number | null) => amount === null ? t.priceUnknown : formatMoney(amount, currency, language);

  return <Dialog open={open} onOpenChange={(next) => { if (!next) setCheckout(false); onOpenChange(next); }}
    title={checkout ? t.checkout : t.cart} description={t.priceNote} close={t.close} variant="drawer">
    <div className="dialog-body drawer-body">
      {!lines.length ? <div className="cart-empty">
        <ShoppingBag size={46} strokeWidth={1.2} aria-hidden /><p>{t.emptyCart}</p>
        <a className="button button--primary" href="#menu" onClick={() => onOpenChange(false)}>{t.explore}</a>
      </div> : checkout ? <>
        <button className="text-button mb-4" onClick={() => setCheckout(false)}>{t.back}</button>
        <Checkout items={items} t={t} currency={currency} online={online} />
      </> : <>
        <ul className="cart-items">
          {lines.map(({ product, quantity }) => <li key={product.id}>
            <div>
              <h3>{productName(product, language)}</h3>
              <p>{price(lineTotal(product, quantity, currency))}</p>
            </div>
            <div className="cart-actions">
              <Quantity value={quantity} min={1} max={maxQuantity} t={t} change={(next) => setQuantity(product.id, next)} />
              <button className="icon-button" aria-label={`${t.remove} · ${productName(product, language)}`} onClick={() => setQuantity(product.id, 0)}><Trash2 size={17} /></button>
            </div>
          </li>)}
        </ul>
        <button className="text-button" onClick={clear}>{t.clear}</button>
        <div className="cart-total">
          <div><strong>{totals.hasPrice && totals.hasUnknown ? t.pricedOnly : t.subtotal}</strong><span>{price(totals.hasPrice ? totals.amount : null)}</span></div>
          <p>{t.priceNote}</p>
          <button className="button button--primary w-full" onClick={() => setCheckout(true)}>{t.checkout}</button>
        </div>
      </>}
    </div>
  </Dialog>;
}
