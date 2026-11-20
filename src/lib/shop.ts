import { site } from "../config/site";
import { productById, products, type Category, type Product } from "../data/products";

export type Language = "en" | "km";
export type Currency = "USD" | "KHR";
export type Quantities = Record<string, number>;
export const maxQuantity = 99;

export function productName(product: Product, language: Language) {
  return language === "km" ? product.nameKm || product.name : product.name;
}

export function filterProducts(query: string, category: Category | "all") {
  const term = query.normalize("NFC").trim().toLowerCase();
  return products.filter((product) => (category === "all" || product.category === category)
    && [product.name, product.nameKm, product.description, product.descriptionKm]
      .some((value) => value?.normalize("NFC").toLowerCase().includes(term)));
}

export function canAdd(product: Product | undefined): product is Product {
  return Boolean(product && product.availability !== "sold-out");
}

export function cleanQuantities(value: unknown): Quantities {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(Object.entries(value).filter(([id, quantity]) =>
    canAdd(productById.get(id)) && Number.isInteger(quantity) && quantity > 0 && quantity <= maxQuantity));
}

export function updateQuantity(items: Quantities, id: string, quantity: number): Quantities {
  if (!canAdd(productById.get(id)) || !Number.isInteger(quantity) || quantity < 0 || quantity > maxQuantity) return items;
  if (quantity > 0) return { ...items, [id]: quantity };
  return Object.fromEntries(Object.entries(items).filter(([key]) => key !== id));
}

export function cartLines(items: Quantities) {
  return Object.entries(cleanQuantities(items)).flatMap(([id, quantity]) => {
    const product = productById.get(id);
    return product ? [{ product, quantity }] : [];
  });
}

export function convert(usdCents: number, currency: Currency) {
  return currency === "USD" ? usdCents : Math.round(usdCents * site.khrPerUsd / 100);
}

export function formatMoney(amount: number, currency: Currency, language: Language) {
  return new Intl.NumberFormat(language === "km" ? "km-KH" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
    minimumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(currency === "USD" ? amount / 100 : amount);
}

export function lineTotal(product: Product, quantity: number, currency: Currency) {
  const price = product.priceUsdCents;
  return price !== null && Number.isSafeInteger(price) && price >= 0 ? convert(price * quantity, currency) : null;
}

export function subtotal(lines: ReturnType<typeof cartLines>, currency: Currency) {
  const totals = lines.map(({ product, quantity }) => lineTotal(product, quantity, currency));
  return {
    hasPrice: totals.some((total) => total !== null),
    hasUnknown: totals.includes(null),
    amount: totals.reduce<number>((sum, total) => sum + (total ?? 0), 0),
  };
}

export type Customer = { name: string; phone: string; fulfillment: "pickup" | "delivery"; address: string; notes: string };

export function validateCustomer(customer: Customer) {
  const errors: Partial<Record<keyof Customer, "nameError" | "phoneError" | "fulfillmentError">> = {};
  if (!customer.name.trim() || customer.name.trim().length > 80 || /[\r\n]/.test(customer.name)) errors.name = "nameError";
  const digits = customer.phone.replace(/\D/g, "");
  if (!/^\+?[0-9 ()-]+$/.test(customer.phone.trim()) || customer.phone.length > 24 || digits.length < 7 || digits.length > 15) errors.phone = "phoneError";
  if (customer.fulfillment !== "pickup" && customer.fulfillment !== "delivery") errors.fulfillment = "fulfillmentError";
  return errors;
}

export function telegramUrl(contact?: string) {
  const handle = contact?.trim().replace(/^(?:@|https:\/\/t\.me\/)/i, "").replace(/\/$/, "");
  return handle && /^[a-z][a-z0-9_]{4,31}$/i.test(handle) ? `https://t.me/${handle}` : undefined;
}

export function safeWebUrl(value?: string) {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function orderSummary(customer: Customer, items: Quantities, currency: Currency) {
  const lines = cartLines(items);
  if (!lines.length || Object.keys(validateCustomer(customer)).length) return "";
  const totals = subtotal(lines, currency);
  const money = (amount: number) => formatMoney(amount, currency, "en");
  const singleLine = (value: string, limit: number) => value.replace(/\s+/g, " ").trim().slice(0, limit);
  const address = singleLine(customer.address, 200);
  const notes = singleLine(customer.notes, 400);
  const pricing = totals.hasPrice
    ? money(totals.amount) + (totals.hasUnknown ? " (priced items only)" : "")
    : "Contact for Price";
  return [
    "Hello Moonique Shop!", "", "I would like to place an order.", "",
    `Customer: ${customer.name.trim()}`, `Phone: ${customer.phone.trim()}`, "", "Order:",
    ...lines.map(({ product, quantity }, index) => {
      const total = lineTotal(product, quantity, currency);
      return `${index + 1}. ${product.name} × ${quantity} — ${total === null ? "Contact for Price" : money(total)}`;
    }),
    "", `Subtotal: ${pricing}`, `Fulfillment: ${customer.fulfillment === "pickup" ? "Pickup" : "Delivery"}`,
    ...(customer.fulfillment === "delivery" && address ? [`Address: ${address}`] : []),
    ...(notes ? [`Notes: ${notes}`] : []),
    "", "Please confirm availability and the final total.", "", "Thank you!",
  ].join("\n");
}
