export const categories = ["treats", "snacks", "specialties"] as const;
export type Category = typeof categories[number];
export type Product = {
  id: string;
  name: string;
  nameKm?: string;
  category: Category;
  description?: string;
  descriptionKm?: string;
  priceUsdCents: number | null;
  currency: "USD";
  availability: "unconfirmed" | "available" | "sold-out";
  image?: string;
  imageIsIllustrative?: boolean;
  additionalImages?: string[];
  bestSeller?: boolean;
  preorder?: boolean;
  portion?: string;
  ingredients?: string[];
};

type CatalogEntry = Pick<Product, "id" | "name" | "category" | "image" | "imageIsIllustrative"> & Partial<Product>;

const entries: CatalogEntry[] = [
  { id: "meatball", name: "Meatball", category: "snacks", image: "/images/products/meatball.webp", imageIsIllustrative: true },
  { id: "sausage", name: "Sausage", category: "snacks", image: "/images/products/sausage.webp", imageIsIllustrative: true },
  { id: "fried-spring-roll", name: "Deep-fried Spring Roll", category: "snacks", image: "/images/products/fried-spring-roll.webp", imageIsIllustrative: true },
  { id: "ta-pae", name: "Ta Pae", category: "treats", image: "/images/products/ta-pae.webp", imageIsIllustrative: true },
  { id: "naem", name: "Naem", category: "snacks", image: "/images/products/naem.webp", imageIsIllustrative: true },
  { id: "mum-lhong", name: "Mum Lhong", category: "specialties", image: "/images/products/mum-lhong.webp", imageIsIllustrative: true },
  { id: "kuong", name: "Fresh Spring Roll (Kuong)", category: "snacks", image: "/images/products/kuong.webp", imageIsIllustrative: true },
  { id: "fried-sticky-rice", name: "Special Fried Sticky Rice", category: "treats", image: "/images/products/fried-sticky-rice.webp", imageIsIllustrative: true },
  { id: "ambok", name: "Pounded Rice (Ambok)", category: "treats", image: "/images/products/ambok.webp", imageIsIllustrative: true },
  { id: "grilled-chicken", name: "Grilled Chicken (Sach Moan Rom Leang)", category: "specialties", image: "/images/products/grilled-chicken.webp", imageIsIllustrative: true },
  { id: "phak", name: "Ph’ak", category: "specialties", image: "/images/products/phak.webp", imageIsIllustrative: true },
  { id: "prahok", name: "Fermented Fish Paste (Prahok)", category: "specialties", image: "/images/products/prahok.webp", imageIsIllustrative: true },
  { id: "trey-ngiet", name: "Dried Fish (Trey Ngiet)", category: "specialties", image: "/images/products/trey-ngiet.webp", imageIsIllustrative: true },
];

export const products: readonly Product[] = entries.map((entry) => ({
  priceUsdCents: null,
  currency: "USD",
  availability: "unconfirmed",
  ...entry,
}));

export const productById = new Map(products.map((product) => [product.id, product]));
