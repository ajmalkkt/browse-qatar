export interface MarketplaceSpotlightItem {
  title: string;
  detail: string;
  vertical: string;
  category: string;
  image: string;
}

export const marketplaceSpotlight: MarketplaceSpotlightItem[] = [
  {
    title: "Used phones",
    detail: "Mobiles & accessories",
    vertical: "classifieds",
    category: "Mobile Phones",
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=240&q=80",
  },
  {
    title: "Home furniture",
    detail: "Sofas, tables & more",
    vertical: "classifieds",
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?auto=format&fit=crop&w=240&q=80",
  },
  {
    title: "TVs & appliances",
    detail: "Popular home finds",
    vertical: "classifieds",
    category: "Home Appliances",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=240&q=80",
  },
];