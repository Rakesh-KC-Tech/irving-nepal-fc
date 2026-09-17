// Source of truth for store prices, mirrored on the static marketing site
// (irvingnepalfc.com's index.html `kits`/`gear` arrays). The checkout API
// looks prices up here rather than trusting the client, so a tampered
// request body can't change what a customer is actually charged.
//
// Keep the `id`s in sync with index.html when kits or gear change.

export const STORE_KITS = [
  {
    id: "home",
    name: "2026/27 Home Kit",
    priceCents: 6500,
    sizes: ["YM", "YL", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: "away",
    name: "2026/27 Away Kit",
    priceCents: 6500,
    sizes: ["YM", "YL", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: "third",
    name: "2026/27 Third Kit",
    priceCents: 6500,
    sizes: ["YM", "YL", "S", "M", "L", "XL", "XXL"],
  },
] as const;

export const STORE_GEAR = [
  { id: "jacket", name: "Training Jacket", priceCents: 5500 },
  { id: "shorts", name: "Match Shorts", priceCents: 2800 },
  { id: "cap", name: "Club Crest Cap", priceCents: 2200 },
  { id: "backpack", name: "Kit Backpack", priceCents: 3800 },
  { id: "scarf", name: "Supporter Scarf", priceCents: 2000 },
  { id: "ball", name: "Official Match Ball", priceCents: 3000 },
] as const;

export function findKit(id: string) {
  return STORE_KITS.find((k) => k.id === id);
}

export function findGear(id: string) {
  return STORE_GEAR.find((g) => g.id === id);
}
