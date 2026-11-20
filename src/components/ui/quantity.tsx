import { Minus, Plus } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";

export function Quantity({ value, change, min, max, t }: {
  value: number; change: (value: number) => void; min: number; max: number; t: Dictionary;
}) {
  return <div className="quantity" role="group" aria-label={t.quantity}>
    <button type="button" aria-label={t.less} disabled={value <= min} onClick={() => change(value - 1)}><Minus size={15} /></button>
    <output aria-label={t.quantity}>{value}</output>
    <button type="button" aria-label={t.more} disabled={value >= max} onClick={() => change(value + 1)}><Plus size={15} /></button>
  </div>;
}
