import assert from "node:assert/strict";
import test from "node:test";
import { products, type Product } from "../src/data/products";
import { dictionaries } from "../src/i18n/dictionaries";
import { cartLines, cleanQuantities, filterProducts, formatMoney, lineTotal, orderSummary, productName, subtotal, telegramUrl, updateQuantity, validateCustomer, canAdd } from "../src/lib/shop";
import { useCart } from "../src/stores/cart";

const customer = { name: "Example Customer", phone: "+855 12 345 678", fulfillment: "pickup" as const, address: "Example address", notes: "Test note" };

test("all 13 distinct products are searchable and category and text filters combine", () => {
  assert.equal(new Set(products.map(({ id }) => id)).size, 13);
  assert.deepEqual(filterProducts("  ROLL ", "snacks").map(({ id }) => id), ["fried-spring-roll", "kuong"]);
  assert.equal(filterProducts("roll", "specialties").length, 0);
  assert.equal(filterProducts("", "treats").length, 3);
});

test("cart rejects malformed storage, unknown IDs, sold-out items, and invalid quantities", () => {
  assert.deepEqual(cleanQuantities({ meatball: 2, sausage: "2", "ta-pae": -2, missing: 1 }), { meatball: 2 });
  assert.deepEqual(updateQuantity({ meatball: 2 }, "meatball", 100), { meatball: 2 });
  assert.deepEqual(updateQuantity({ meatball: 2 }, "meatball", 0), {});
  assert.equal(canAdd({ ...products[0], availability: "sold-out" }), false);
});

test("Zustand actions add, update, limit and clear cart items", () => {
  const { add, setQuantity, clear } = useCart.getState();
  clear();
  add("meatball", 2);
  add("meatball", 1);
  setQuantity("sausage", 3);
  add("sausage", 99);
  assert.deepEqual(useCart.getState().items, { meatball: 3, sausage: 3 });
  clear();
  assert.deepEqual(useCart.getState().items, {});
});

test("currency conversions use integer line totals and exclude prices awaiting confirmation", () => {
  const item: Product = { ...products[0], priceUsdCents: 125 };
  assert.equal(lineTotal(item, 3, "USD"), 375);
  assert.equal(lineTotal(item, 3, "KHR"), 15000);
  assert.equal(formatMoney(375, "USD", "en"), "$3.75");
  assert.deepEqual(subtotal([{ product: item, quantity: 3 }, ...cartLines({ sausage: 1 })], "KHR"),
    { amount: 15000, hasPrice: true, hasUnknown: true });
});

test("checkout validates fields and formats pickup and delivery summaries", () => {
  assert.deepEqual(validateCustomer({ ...customer, name: " ", phone: "123" }), { name: "nameError", phone: "phoneError" });
  assert.equal(orderSummary(customer, {}, "USD"), "");
  const pickup = orderSummary(customer, { meatball: 2 }, "USD");
  assert.match(pickup, /Meatball × 2 — Contact for Price/);
  assert.match(pickup, /Subtotal: Contact for Price/);
  assert.doesNotMatch(pickup, /Address:/);
  const delivery = orderSummary({ ...customer, fulfillment: "delivery" }, { sausage: 1 }, "KHR");
  assert.match(delivery, /Fulfillment: Delivery\nAddress: Example address\nNotes: Test note/);
});

test("Telegram URLs support valid handles and reject malformed destinations", () => {
  assert.equal(telegramUrl("@example_shop"), "https://t.me/example_shop");
  assert.equal(telegramUrl("https://t.me/example_shop/"), "https://t.me/example_shop");
  assert.equal(telegramUrl("https://example.com"), undefined);
  assert.equal(telegramUrl(""), undefined);
});

test("dictionary keys match and unverified Khmer product names fall back to English", () => {
  assert.deepEqual(Object.keys(dictionaries.en), Object.keys(dictionaries.km));
  assert.equal(productName(products[0], "km"), products[0].name);
});
