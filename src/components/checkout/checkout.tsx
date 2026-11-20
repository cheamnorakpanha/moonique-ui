"use client";

import { Clipboard, Send, Share2 } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { site } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries";
import { orderSummary, telegramUrl, validateCustomer, type Currency, type Customer, type Quantities } from "@/lib/shop";

export function Checkout({ t, items, currency, online }: { t: Dictionary; items: Quantities; currency: Currency; online: boolean }) {
  const [customer, setCustomer] = useState<Customer>({ name: "", phone: "", fulfillment: "pickup", address: "", notes: "" });
  const [errors, setErrors] = useState<ReturnType<typeof validateCustomer>>({});
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("");
  const summaryField = useRef<HTMLTextAreaElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const telegram = telegramUrl(site.contact.telegram);

  function update<K extends keyof Customer>(key: K, value: Customer[K]) {
    setCustomer({ ...customer, [key]: value });
    setErrors({ ...errors, [key]: undefined });
    setSummary("");
    setStatus("");
  }

  function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateCustomer(customer);
    setErrors(nextErrors);
    const field = Object.keys(nextErrors)[0];
    if (field) {
      (form.current?.elements.namedItem(field) as HTMLElement | null)?.focus();
      return;
    }
    setSummary(orderSummary(customer, items, currency));
    requestAnimationFrame(() => summaryField.current?.focus());
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(summary);
      setStatus(t.copied);
    } catch {
      summaryField.current?.focus();
      summaryField.current?.select();
      setStatus(t.copyError);
    }
  }

  async function share() {
    try { await navigator.share({ text: summary }); }
    catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) await copy(); }
  }

  return <div className="checkout">
    {site.telegramEnabled && !telegram && <p className="notice">{t.telegramMissing}</p>}
    <form ref={form} className="checkout-form" onSubmit={generate} noValidate>
      <label className="field">{t.customer}
        <input name="name" autoComplete="name" required maxLength={80} value={customer.name}
          aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "customer-error" : undefined}
          onChange={(event) => update("name", event.target.value)} />
        {errors.name && <span id="customer-error" className="field-error" role="alert">{t[errors.name]}</span>}
      </label>
      <label className="field">{t.phone}
        <input name="phone" type="tel" autoComplete="tel" required maxLength={24} value={customer.phone}
          aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : undefined}
          onChange={(event) => update("phone", event.target.value)} />
        {errors.phone && <span id="phone-error" className="field-error" role="alert">{t[errors.phone]}</span>}
      </label>
      <label className="field">{t.fulfillment}
        <select name="fulfillment" value={customer.fulfillment} onChange={(event) => update("fulfillment", event.target.value as Customer["fulfillment"])}>
          <option value="pickup">{t.pickup}</option><option value="delivery">{t.delivery}</option>
        </select>
        {errors.fulfillment && <span className="field-error" role="alert">{t[errors.fulfillment]}</span>}
      </label>
      {customer.fulfillment === "delivery" && <label className="field">{t.deliveryAddress}
        <input name="address" autoComplete="street-address" maxLength={200} value={customer.address} onChange={(event) => update("address", event.target.value)} />
      </label>}
      <label className="field">{t.notes}
        <textarea rows={2} maxLength={400} value={customer.notes} onChange={(event) => update("notes", event.target.value)} />
      </label>
      <button type="submit" className="button button--primary">{t.generate}</button>
    </form>
    {summary && <div className="checkout-summary">
      <label className="field">{t.summary}<textarea ref={summaryField} readOnly value={summary} lang="en" rows={8} /></label>
      {telegram && <p>{online ? t.summaryHelp : t.offline}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="button button--secondary" onClick={copy}><Clipboard size={17} />{t.copy}</button>
        {online && typeof navigator !== "undefined" && typeof navigator.share === "function" &&
          <button type="button" className="button button--secondary" onClick={share}><Share2 size={17} />{t.share}</button>}
        {telegram && online && <a className="button button--primary" href={telegram} target="_blank" rel="noopener noreferrer"><Send size={17} />{t.telegram}</a>}
      </div>
      <p role="status">{status}</p>
    </div>}
  </div>;
}
