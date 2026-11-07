import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  BriefcaseBusiness,
  Building2,
  CarFront,
  ChevronDown,
  Facebook,
  Heart,
  Instagram,
  CircleUserRound,
  Camera,
  FileText,
  CircleHelp,
  LogOut,
  MapPin,
  Menu,
  Package,
  Search,
  Twitter,
  Share2,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  Tag,
  Utensils,
  Wrench,
  X,
} from "lucide-react";
import { getAllOffers } from "../services/offerService";
import { getAllRestaurants } from "../services/restaurantService";
import { getVerticalService } from "../services/verticalServiceFactory";
import { verticalConfig } from "../config/verticalConfig";
import { marketplaceSpotlight } from "../config/marketplaceSpotlight";
import { cuisineLists, ENABLE_RANDOM_SORT, ENABLE_SIGNUP, SHOW_DISCOUNTED_PRICE } from "../config/appConfig";
import SharePopup from "./SharePopup";
import useAuth from "../auth/useAuth";
import { useModal } from "../contexts/ModalContext";
import { useFavoritesContext } from "../contexts/FavoritesContext";
import ListingEnquiryPopup from "./ListingEnquiryPopup";

type ListingRecord = Record<string, any>;

const mockListings: Record<string, ListingRecord[]> = {
  vehicles: [
    { id: "sample-car-1", title: "Toyota Land Cruiser GXR 2022", description: "Excellent condition, full service history and low mileage.", imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=85", location: "Doha, Qatar", pricing: { discountedPrice: 184000, currency: "QAR" }, category: "SUV", attributes: { year: 2022, mileage: "42,000 km" } },
    { id: "sample-car-2", title: "Mercedes-Benz C-Class 2021", description: "Well maintained sedan with premium interior.", imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=85", location: "Al Wakrah, Qatar", pricing: { discountedPrice: 112000, currency: "QAR" }, category: "Sedan", attributes: { year: 2021, mileage: "36,500 km" } },
    { id: "sample-car-3", title: "Nissan Patrol Platinum 2020", description: "Family-ready 4x4, clean interior and recent service.", imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=85", location: "Lusail, Qatar", pricing: { discountedPrice: 159000, currency: "QAR" }, category: "SUV", attributes: { year: 2020, mileage: "61,000 km" } },
  ],
  accommodations: [
    { id: "sample-home-1", title: "Bright 2-bedroom apartment in Lusail", description: "Furnished apartment with balcony, pool and covered parking.", imageUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85", location: "Lusail, Qatar", pricing: { discountedPrice: 7800, currency: "QAR" }, category: "Apartment", attributes: { bedrooms: 2 } },
    { id: "sample-home-2", title: "Modern villa with private garden", description: "Spacious family home close to schools and shopping.", imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85", location: "Al Waab, Doha", pricing: { discountedPrice: 14500, currency: "QAR" }, category: "Villa", attributes: { bedrooms: 4 } },
  ],
  services: [
    { id: "sample-service-1", title: "Home AC maintenance and repair", description: "Experienced technicians for residential AC servicing.", imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1000&q=85", location: "Doha, Qatar", pricing: { discountedPrice: 150, currency: "QAR" }, category: "Home maintenance" },
    { id: "sample-service-2", title: "Professional home cleaning", description: "Reliable deep cleaning with flexible appointments.", imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=85", location: "The Pearl, Doha", pricing: { discountedPrice: 220, currency: "QAR" }, category: "Cleaning" },
  ],
  classifieds: [
    { id: "sample-item-1", title: "iPhone 15 Pro, 256 GB", description: "Excellent condition, original box and accessories included.", imageUrl: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=1000&q=85", location: "Doha, Qatar", pricing: { discountedPrice: 2750, currency: "QAR" }, category: "Mobile Phones" },
    { id: "sample-item-2", title: "Solid wood dining table with 6 chairs", description: "Beautifully maintained set, ready for collection.", imageUrl: "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?auto=format&fit=crop&w=1000&q=85", location: "Al Rayyan, Qatar", pricing: { discountedPrice: 950, currency: "QAR" }, category: "Furniture" },
    { id: "sample-item-3", title: "Samsung 55-inch 4K Smart TV", description: "Clear picture, streaming apps and remote included.", imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1000&q=85", location: "Doha, Qatar", pricing: { discountedPrice: 1250, currency: "QAR" }, category: "TVs & Electronics" },
    { id: "sample-item-4", title: "Large-capacity front-load washing machine", description: "Clean, fully working home appliance. Collection from Lusail.", imageUrl: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1000&q=85", location: "Lusail, Qatar", pricing: { discountedPrice: 800, currency: "QAR" }, category: "Home Appliances" },
  ],
  jobs: [
    { id: "sample-job-1", title: "Customer Experience Specialist", description: "Join a growing local team focused on exceptional customer service.", imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85", location: "Doha, Qatar", pricing: { discountedPrice: 8500, currency: "QAR" }, category: "Full time" },
    { id: "sample-job-2", title: "Digital Marketing Coordinator", description: "Plan campaigns and create engaging content for local audiences.", imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=85", location: "West Bay, Doha", pricing: { discountedPrice: 10000, currency: "QAR" }, category: "Full time" },
  ],
};

const categoryIcons: Record<string, typeof CarFront> = {
  restaurants: Utensils,
  vehicles: CarFront,
  accommodations: BedDouble,
  services: Wrench,
  classifieds: Package,
  jobs: BriefcaseBusiness,
};

const categoryImages: Record<string, string> = {
  restaurants: "/images/categories/restaurants.jpg",
  vehicles: "/images/categories/vehicles.jpg",
  accommodations: "/images/categories/accommodations.jpg",
  services: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=900&q=85",
  classifieds: "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=900&q=85",
  jobs: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85",
};

const categories = Object.values(verticalConfig).filter((item) => item.enabled);

export function ModernMarketplaceFooter({ variant = "modern" }: { variant?: "modern" | "v2" }) {
  const isV2 = variant === "v2";
  return <footer className={`border-t text-slate-700 ${isV2 ? "border-[#ead9ca] bg-[#fff7e6]" : "border-slate-200 bg-[#f3f8fc]"}`}>
    <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-9 sm:px-6 sm:py-11 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
      <div>
        <Link to="/" aria-label="Browse Qatar home" className="hidden items-center sm:inline-flex">
          <img src="/bqLogo.png" alt="Browse Qatar" className="h-11 w-auto object-contain" onError={(event) => { event.currentTarget.src = "/bqLogo.jpg"; }} />
        </Link>
        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">Discover local deals, trusted services, and listings across Qatar.</p>
        <div className="mt-4 flex items-center gap-2">
          <a href="https://www.facebook.com/browseqatar" target="_blank" rel="noreferrer" aria-label="Browse Qatar on Facebook" className={`grid h-9 w-9 place-items-center rounded-full border transition ${isV2 ? "border-[#e8d2bf] text-[#7e1831] hover:bg-[#fff0c7]" : "border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-700"}`}><Facebook size={17} /></a>
          <a href="https://www.instagram.com/browseqatar/" target="_blank" rel="noreferrer" aria-label="Browse Qatar on Instagram" className={`grid h-9 w-9 place-items-center rounded-full border transition ${isV2 ? "border-[#e8d2bf] text-[#7e1831] hover:bg-[#fff0c7]" : "border-slate-200 text-slate-500 hover:border-pink-300 hover:text-pink-600"}`}><Instagram size={17} /></a>
          <a href="https://twitter.com/browseqatar" target="_blank" rel="noreferrer" aria-label="Browse Qatar on X" className={`grid h-9 w-9 place-items-center rounded-full border transition ${isV2 ? "border-[#e8d2bf] text-[#7e1831] hover:bg-[#fff0c7]" : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900"}`}><Twitter size={16} /></a>
        </div>
      </div>

      <nav aria-label="Explore categories">
        <h2 className="text-sm font-bold text-slate-900">Explore</h2>
        <ul className="mt-3 space-y-2">
          {categories.map((category) => <li key={category.id}><Link to={`/marketplace/${category.id}`} className={`text-sm transition ${isV2 ? "text-[#745e61] hover:text-[#941333]" : "text-slate-500 hover:text-[#0878d1]"}`}>{category.id === "classifieds" ? "Classifieds" : category.name.replace(/ Buy & Sell| Deal/, "")}</Link></li>)}
        </ul>
      </nav>

      <nav aria-label="Browse Qatar information">
        <h2 className="text-sm font-bold text-slate-900">Browse Qatar</h2>
        <ul className="mt-3 space-y-2">
          <li><Link to="/about" className={`text-sm transition ${isV2 ? "text-[#745e61] hover:text-[#941333]" : "text-slate-500 hover:text-[#0878d1]"}`}>About us</Link></li>
          <li><Link to="/faq" className={`text-sm transition ${isV2 ? "text-[#745e61] hover:text-[#941333]" : "text-slate-500 hover:text-[#0878d1]"}`}>Help & FAQ</Link></li>
          <li><Link to="/terms" className={`text-sm transition ${isV2 ? "text-[#745e61] hover:text-[#941333]" : "text-slate-500 hover:text-[#0878d1]"}`}>Terms & Conditions</Link></li>
          <li><Link to="/favourites" className={`text-sm transition ${isV2 ? "text-[#745e61] hover:text-[#941333]" : "text-slate-500 hover:text-[#0878d1]"}`}>Wishlist</Link></li>
        </ul>
      </nav>

      <div>
        <h2 className="text-sm font-bold text-slate-900">Get the app</h2>
        <p className="mt-3 text-sm text-slate-500">Browse Qatar wherever you go.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="https://play.google.com/store" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"><img src="/android.png" alt="" className="h-5 w-5 object-contain" />Google Play</a>
          <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"><img src="/apple.png" alt="" className="h-5 w-5 object-contain" />App Store</a>
        </div>
      </div>
    </div>
    <div className={`border-t ${isV2 ? "border-[#ead9ca] bg-[#fff0c7]" : "border-slate-200 bg-[#eaf2f8]"}`}>
      <div className={`mx-auto flex max-w-[1320px] flex-col gap-2 px-4 py-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 ${isV2 ? "text-[#76565b]" : "text-slate-500"}`}>
        <p>© {new Date().getFullYear()} Browse Qatar. All rights reserved.</p>
        <p>Made for exploring Qatar.</p>
      </div>
    </div>
  </footer>;
}

type RefineField = {
  label: string;
  key: string;
  aliases: string[];
  type: "text" | "select" | "range";
  options?: string[];
  unit?: string;
};

const verticalRefineConfig: Record<string, { subcategories: string[]; fields: RefineField[]; secondaryField?: RefineField }> = {
  vehicles: {
    subcategories: ["Cars", "Motorcycles & Bikes", "Commercial Vehicles", "Spare Parts & Accessories", "Boats & Marine"],
    fields: [
      { label: "Vehicle Type", key: "bodyType", aliases: ["bodyType", "vehicleType"], type: "select", options: ["Sedan", "SUV", "Coupe", "Hatchback", "Pickup", "Van"] },
      { label: "Make", key: "make", aliases: ["make", "vehicleMake"], type: "text" },
      { label: "Model", key: "model", aliases: ["model", "vehicleModel"], type: "text" },
      { label: "Year", key: "year", aliases: ["year", "modelYear"], type: "range" },
      { label: "KM", key: "km", aliases: ["km", "mileage", "kilometers", "odometer"], type: "range", unit: "km" },
      { label: "Transmission", key: "transmission", aliases: ["transmission"], type: "select", options: ["Automatic", "Manual", "CVT", "Semi-Automatic"] },
      { label: "Fuel", key: "fuel", aliases: ["fuel", "fuelType"], type: "select", options: ["Petrol", "Diesel", "Electric", "Hybrid"] },
      { label: "Price", key: "price", aliases: ["pricing.discountedPrice", "discountedPrice", "price", "pricing.originalPrice", "originalPrice"], type: "range", unit: "QAR" },
    ],
  },
  accommodations: {
    subcategories: ["Rent (Apartment/Villa)", "Sale (Apartment/Villa)", "Commercial", "Shared/Partition", "Land & Plots"],
    fields: [
      { label: "Property Type", key: "propertyType", aliases: ["propertyType", "type"], type: "select", options: ["Apartment", "Villa", "Commercial", "Land"] },
      { label: "Bedrooms", key: "bedrooms", aliases: ["bedrooms", "bedroom"], type: "range" },
      { label: "Bathrooms", key: "bathrooms", aliases: ["bathrooms", "bathroom"], type: "range" },
      { label: "Furnishing", key: "furnishing", aliases: ["furnishing", "furnished"], type: "select", options: ["Furnished", "Semi-furnished", "Unfurnished"] },
      { label: "Size (sq ft)", key: "size", aliases: ["size", "sizeSqFt", "areaSqFt", "squareFeet"], type: "range", unit: "sq ft" },
      { label: "Price", key: "price", aliases: ["pricing.discountedPrice", "discountedPrice", "price", "pricing.originalPrice", "originalPrice"], type: "range", unit: "QAR" },
    ],
  },
  jobs: {
    subcategories: ["Jobs Offered", "Jobs Wanted"],
    secondaryField: { label: "Industry", key: "industry", aliases: ["industry"], type: "select", options: ["Accounting/Finance", "Customer Service", "IT/Telecom", "Sales/Marketing", "Drivers/Transport", "Domestic/Cleaning", "Hospitality/F&B", "Engineering/Construction"] },
    fields: [
      { label: "Type (FT/PT/Contract)", key: "jobType", aliases: ["jobType", "type", "employmentType"], type: "select", options: ["Full-time", "Part-time", "Contract", "Freelance"] },
      { label: "Experience", key: "experience", aliases: ["experience", "yearsExperience", "experienceYears"], type: "text" },
      { label: "Salary", key: "salary", aliases: ["salary", "pricing.discountedPrice", "discountedPrice"], type: "range", unit: "QAR" },
    ],
  },
  services: {
    subcategories: ["Home Maintenance", "Cleaning & Laundry", "Moving & Transport", "IT & Digital", "Events & Catering", "Beauty & Fitness", "Legal & Business"],
    fields: [
      { label: "Service Type", key: "serviceType", aliases: ["serviceType", "category", "serviceCategory"], type: "text" },
      { label: "Location", key: "serviceLocation", aliases: ["location.city", "location.area", "city", "location", "address"], type: "text" },
      { label: "Provider", key: "provider", aliases: ["provider", "providerType", "provider.type"], type: "select", options: ["Individual", "Agency"] },
    ],
  },
};

function valueAtPath(record: ListingRecord, path: string): unknown {
  return path.split(".").reduce<unknown>((value, segment) => {
    if (!value || typeof value !== "object") return undefined;
    return (value as ListingRecord)[segment];
  }, record);
}

function getListingFieldValue(listing: ListingRecord, aliases: string[]): unknown {
  const sources = [listing, listing.attributes, listing.additionalAttributes, listing.pricing, listing.location]
    .filter((source): source is ListingRecord => Boolean(source && typeof source === "object"));

  for (const alias of aliases) {
    const direct = valueAtPath(listing, alias);
    if (direct !== undefined && direct !== null && direct !== "") return direct;
    for (const source of sources) {
      const value = source[alias];
      if (value !== undefined && value !== null && value !== "") return value;
    }
  }
  return undefined;
}

function numericValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const parsed = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function amountOf(listing: ListingRecord) {
  return listing.discountedPrice ?? listing.pricing?.discountedPrice ?? listing.price ?? listing.salary ?? null;
}

function locationOf(listing: ListingRecord) {
  const place = listing.location;
  if (typeof place === "string") return place;
  if (place && typeof place === "object") return [place.area, place.city, place.country].filter(Boolean).join(", ");
  return "Qatar";
}

function imageOf(listing: ListingRecord) {
  return listing.imageUrl || listing.images?.[0] || listing.thumbnail || "/bqLogo.jpg";
}

async function loadRestaurantFeed() {
  const [offerResult, restaurantResult] = await Promise.all([
    getAllOffers().catch(() => []),
    getAllRestaurants().catch(() => []),
  ]);
  const [offerFallback, restaurantFallback] = await Promise.all([
    Array.isArray(offerResult) && offerResult.length ? Promise.resolve([]) : fetch("/data/offers.json").then((response) => response.ok ? response.json() : []).catch(() => []),
    Array.isArray(restaurantResult) && restaurantResult.length ? Promise.resolve([]) : fetch("/data/restaurants.json").then((response) => response.ok ? response.json() : []).catch(() => []),
  ]);
  const offers = Array.isArray(offerResult) && offerResult.length ? offerResult : offerFallback;
  const restaurants = Array.isArray(restaurantResult) && restaurantResult.length ? restaurantResult : restaurantFallback;
  return {
    restaurants: Array.isArray(restaurants) ? restaurants : [],
    listings: (Array.isArray(offers) ? offers : []).map((offer: ListingRecord) => ({
      ...offer,
      vertical: "restaurants",
      restaurant: restaurants.find((restaurant: ListingRecord) => String(restaurant.id) === String(offer.restaurantId)),
    })),
  };
}

function MarketplacePostAction({ children, className }: { children: React.ReactNode; className: string }) {
  const navigate = useNavigate();
  const auth = useAuth();
  const { openLogin } = useModal();

  const handleClick = () => {
    const destination = window.innerWidth < 768 ? "/admin" : "/manage-offers";
    const navigateToDestination = () => {
      window.setTimeout(() => navigate(destination), 120);
    };

    if (auth.user) {
      navigateToDestination();
    } else if (auth.provider === "FIREBASE") {
      openLogin(navigateToDestination);
    } else {
      auth.login();
    }
  };

  return <button type="button" onClick={handleClick} className={className}>{children}</button>;
}

function PostingNudge({ vertical }: { vertical?: string }) {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const image = categoryImages[vertical || ""] || categoryImages.classifieds;

  useEffect(() => {
    setVisible(false);
    setDismissed(false);
    let timer: number | undefined;

    const handleScroll = () => {
      if (window.scrollY < 220) {
        window.clearTimeout(timer);
        timer = undefined;
        setVisible(false);
        return;
      }

      if (!timer && !dismissed) {
        timer = window.setTimeout(() => setVisible(true), 5000);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(timer);
    };
  }, [dismissed, location.pathname]);

  if (!visible || dismissed) return null;

  return (
    <aside className="fixed bottom-4 right-4 z-40 w-[min(360px,calc(100vw-2rem))] animate-in slide-in-from-bottom-3 fade-in duration-300 sm:bottom-6 sm:right-6" aria-label="Post a listing">
      <div className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 pr-10 shadow-xl shadow-slate-900/15">
        <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#0878d1]">Have something to share?</p>
          <p className="mt-1 text-sm font-bold leading-5 text-slate-900">List it on Browse Qatar</p>
          <MarketplacePostAction className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#0878d1] hover:text-blue-800">Start posting <ArrowRight size={13} /></MarketplacePostAction>
        </div>
        <button type="button" onClick={() => { setDismissed(true); setVisible(false); }} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Dismiss posting prompt"><X size={15} /></button>
      </div>
    </aside>
  );
}

function useMarketplaceListings(vertical?: string) {
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantDirectory, setRestaurantDirectory] = useState<ListingRecord[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        let results: ListingRecord[] = [];
        let directory: ListingRecord[] = [];
        if (vertical === "restaurants") {
          const feed = await loadRestaurantFeed();
          results = feed.listings;
          directory = feed.restaurants;
        } else if (vertical && verticalConfig[vertical]) {
          results = await getVerticalService(vertical).getAll();
        } else {
          const feed = await loadRestaurantFeed();
          directory = feed.restaurants;
          const feeds = await Promise.all(categories.map(async (category) => {
            try {
              if (category.id === "restaurants") {
                return feed.listings.slice(0, 8);
              }
              const rows = await getVerticalService(category.id).getAll();
              return (rows.length ? rows : mockListings[category.id] || []).slice(0, 3).map((item: ListingRecord) => ({ ...item, vertical: category.id }));
            } catch {
              return (mockListings[category.id] || []).slice(0, 3).map((item: ListingRecord) => ({ ...item, vertical: category.id }));
            }
          }));
          results = feeds.flat();
        }
        if (vertical && vertical !== "restaurants" && results.length === 0) results = mockListings[vertical] || [];
        if (active) {
          setListings(results);
          setRestaurantDirectory(directory);
        }
      } catch (error) {
        console.error("Marketplace listings could not be loaded:", error);
        if (active) setListings(vertical ? (mockListings[vertical] || []) : Object.entries(mockListings).flatMap(([key, rows]) => rows.slice(0, 2).map((item) => ({ ...item, vertical: key }))));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [vertical]);

  return { listings, loading, restaurantDirectory };
}

function MarketplaceHeader({ search, onSearch, vertical }: { search?: string; onSearch?: (value: string) => void; vertical?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const auth = useAuth();
  const { openLogin } = useModal();

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  const navigateToManage = () => {
    setMenuOpen(false);
    window.setTimeout(() => navigate(window.innerWidth < 768 ? "/admin" : "/manage-offers"), 120);
  };

  const handleManageOffers = () => {
    if (auth.user) navigateToManage();
    else if (auth.provider === "FIREBASE") openLogin(navigateToManage);
    else auth.login();
  };

  const handleLogin = () => {
    setMenuOpen(false);
    if (auth.provider === "FIREBASE") openLogin();
    else auth.login();
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      if (auth.provider === "FIREBASE") await auth.logout();
      else await auth.logout({ redirectUri: window.location.origin });
    } catch (error) {
      console.error("Marketplace logout failed:", error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#f3f8fc]/95 backdrop-blur-md">
        <div ref={menuRef} className="relative mx-auto flex max-w-[1320px] items-center gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3 lg:px-8">
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-700 lg:hidden" aria-label="Open marketplace menu" aria-expanded={menuOpen}><Menu size={19} /></button>
          <Link to="/" className="flex shrink-0 items-center" aria-label="Browse Qatar home"><img src="/bqLogo.jpg" alt="Browse Qatar" className="h-10 w-auto max-w-[156px] object-contain" /></Link>
          <button type="button" className="hidden h-11 min-w-[170px] items-center gap-2 rounded-lg border border-slate-300 px-3 text-left text-sm text-slate-700 md:flex"><MapPin size={18} className="shrink-0 text-[#0878d1]" /><span className="truncate">Doha, Qatar</span><ChevronDown size={16} className="ml-auto shrink-0 text-slate-400" /></button>
          <form className="flex h-11 min-w-0 flex-1 items-center overflow-hidden rounded-lg border-2 border-slate-800 bg-white focus-within:border-[#0878d1]" onSubmit={(event) => event.preventDefault()}>
            <Search size={19} className="ml-3 shrink-0 text-slate-500" />
            <input value={search || ""} onChange={(event) => onSearch?.(event.target.value)} placeholder={vertical ? `Search ${verticalConfig[vertical]?.name || "listings"}` : "Search cars, offers, homes and more"} className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            <button type="submit" className="hidden h-full items-center gap-2 bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-[#0878d1] sm:flex"><Search size={16} /> Search</button>
          </form>
          <Link to="/favourites" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-700 transition hover:bg-slate-100 sm:h-10 sm:w-10" aria-label="Favorites"><Heart size={20} /></Link>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-700 transition hover:bg-slate-100 sm:h-10 sm:w-10" aria-label={auth.user ? "Open account menu" : "Open login menu"} aria-expanded={menuOpen}>
            <CircleUserRound size={22} className={auth.user ? "text-[#0878d1]" : ""} />
          </button>
          <MarketplacePostAction className="hidden h-11 shrink-0 items-center gap-2 rounded-full border-[3px] border-[#0878d1] px-4 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-blue-50 sm:inline-flex"><span className="text-lg leading-none">+</span> SELL</MarketplacePostAction>
          {menuOpen && <div className="absolute right-2 top-full z-50 mt-2 max-h-[calc(100dvh-4.5rem)] w-[min(360px,calc(100vw-1rem))] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl sm:right-6 lg:right-8">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-blue-100 text-[#0878d1]">{auth.user?.photoURL ? <img src={auth.user.photoURL} alt="" className="h-full w-full object-cover" /> : <CircleUserRound size={28} />}</span>
              <div className="min-w-0 flex-1">{auth.user ? <><p className="text-xs font-medium text-slate-500">My Account</p><p className="truncate text-sm font-semibold text-slate-900">{auth.user.displayName || auth.user.email || "Browse Qatar member"}</p></> : <><p className="text-base font-bold text-slate-900">Welcome to Browse Qatar</p><p className="mt-0.5 text-xs text-slate-500">Sign in to manage your account and listings.</p></>}</div>
            </div>
            {!auth.user && <div className="border-b border-slate-100 p-3"><button type="button" onClick={handleLogin} className="w-full rounded-md bg-[#0878d1] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700">{ENABLE_SIGNUP ? "Login / Sign up" : "Login"}</button></div>}
            <div className="p-2">
              <button type="button" onClick={handleManageOffers} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"><Camera size={18} className="text-slate-500" />Start selling</button>
              <button type="button" onClick={handleManageOffers} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"><FileText size={18} className="text-slate-500" />My Ads / Manage Offers</button>
              <Link to="/favourites" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><Heart size={18} className="text-slate-500" />Wishlist</Link>
              <Link to="/faq" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><CircleHelp size={18} className="text-slate-500" />Help</Link>
            </div>
            <div className="border-t border-slate-100 p-2">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">Browse categories</p>
              <div className="grid grid-cols-2 gap-1">{categories.map((item) => <Link key={item.id} to={`/marketplace/${item.id}`} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 text-xs text-slate-600 hover:bg-blue-50 hover:text-[#0878d1]">{item.id === "classifieds" ? "Classifieds" : item.name.replace(/ Buy & Sell| Deal/, "")}</Link>)}</div>
            </div>
            <div className="border-t border-slate-100 p-2">
              <Link to="/about" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">About Us</Link>
              {auth.user && <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-700"><LogOut size={18} />Log out</button>}
            </div>
          </div>}
        </div>
      </header>
      <PostingNudge vertical={vertical} />
    </>
  );
}

function RestaurantMarquee({ restaurants: restaurantRecords }: { restaurants: ListingRecord[] }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const currentScrollPos = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const restaurants = useMemo(() => {
    const unique = new Map<string, ListingRecord>();
    restaurantRecords.forEach((restaurant) => {
      if (restaurant?.name) unique.set(String(restaurant.id), restaurant);
    });
    return [...unique.values()].slice(0, 12);
  }, [restaurantRecords]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || restaurants.length === 0) return;

    const animate = () => {
      if (!isPaused) {
        currentScrollPos.current += 1;
        if (currentScrollPos.current >= scrollContainer.scrollWidth / 2) {
          currentScrollPos.current = 0;
          scrollContainer.scrollLeft = 0;
        } else {
          scrollContainer.scrollLeft = currentScrollPos.current;
        }
      } else {
        currentScrollPos.current = scrollContainer.scrollLeft;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused, restaurants.length]);

  const scrollManual = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: direction === "left" ? -200 : 200, behavior: "smooth" });
  };

  if (!restaurants.length) return null;

  return (
    <section className="mb-3 min-w-0 border-b border-slate-200 pb-3 sm:mb-4 sm:pb-4" aria-label="Featured restaurants">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-rose-400"><Sparkles size={15} className="text-amber-400" /> In the Spotlight</h2>
        <Link to="/all-restaurants" state={{ returnTo: "/marketplace/restaurants" }} className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700">View All Restaurants &gt;</Link>
      </div>
      <div className="group relative min-w-0">
        <button type="button" onClick={() => scrollManual("left")} className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-slate-600 shadow md:block" aria-label="Scroll restaurants left"><ArrowLeft size={16} /></button>
        <div ref={scrollRef} className="flex min-w-0 items-start gap-4 overflow-x-auto py-1 scrollbar-hide sm:gap-5" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}>
          {[...restaurants, ...restaurants].map((restaurant, index) => (
            <Link key={`${restaurant.id}-${index}`} to={`/restaurant/${restaurant.id}`} state={{ returnTo: "/marketplace/restaurants" }} className="flex w-[76px] shrink-0 flex-col items-center gap-1.5 text-center transition-transform hover:scale-105">
              <span className="grid h-[60px] w-[60px] place-items-center overflow-hidden rounded-xl border-2 border-slate-100 bg-white shadow-sm sm:h-[68px] sm:w-[68px]">
                <img src={restaurant.brandUrl || restaurant.logoUrl || "/bqLogo.jpg"} alt={restaurant.name} className="h-full w-full object-contain p-1.5" />
              </span>
              <span className="w-full truncate text-xs font-medium text-slate-600">{restaurant.name}</span>
            </Link>
          ))}
        </div>
        <button type="button" onClick={() => scrollManual("right")} className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-slate-600 shadow md:block" aria-label="Scroll restaurants right"><ArrowRight size={16} /></button>
      </div>
    </section>
  );
}

function ListingCard({ listing, vertical }: { listing: ListingRecord; vertical: string }) {
  const amount = amountOf(listing);
  const isRestaurant = vertical === "restaurants";
  const href = isRestaurant ? `/offer/${listing.id}` : `/marketplace/${vertical}/${listing.id}`;
  const { favorites, toggleFavorite } = useFavoritesContext();
  const [showSharePopup, setShowSharePopup] = useState(false);
  const isFavorite = favorites.some((favorite) => String(favorite.id) === String(listing.id));

  return <Link to={href} state={{ listing }} className="group min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-slate-400 hover:shadow-md">
    {isRestaurant ? <>
      <div className="relative overflow-hidden">
        <img src={imageOf(listing)} alt={listing.title || "Restaurant offer"} loading="lazy" className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.03] sm:h-44" onError={(event) => { event.currentTarget.src = "/bqLogo.jpg"; }} />
        <span className="absolute right-2 top-2 rounded-full bg-[#0878d1] px-2.5 py-1 text-xs font-bold text-white">{SHOW_DISCOUNTED_PRICE || Number(listing.originalPrice) === Number(listing.discountedPrice) ? `QAR ${Number(amount || 0).toLocaleString()}` : `${Math.round((1 - Number(listing.discountedPrice) / Number(listing.originalPrice)) * 100)}% OFF`}</span>
        <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleFavorite({ id: Number(listing.id), title: listing.title || "Restaurant offer", description: listing.description || "", restaurantId: Number(listing.restaurantId), cuisine: listing.cuisine || "", originalPrice: Number(listing.originalPrice) || 0, discountedPrice: Number(listing.discountedPrice) || 0, offerType: listing.offerType || "Offer", validFrom: listing.validFrom || "", validTo: listing.validTo || "", imageUrl: imageOf(listing), location: locationOf(listing), country: listing.country, category: listing.category }); }} aria-label={isFavorite ? "Remove offer from favorites" : "Add offer to favorites"} className="absolute left-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-500 transition hover:bg-white">
          <Heart size={18} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
        </button>
        <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setShowSharePopup((open) => !open); }} aria-label="Share restaurant offer" className="absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-600 shadow-sm transition hover:bg-white"><Share2 size={18} /></button>
        <div className="absolute bottom-12 right-2" onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}><SharePopup isOpen={showSharePopup} onClose={() => setShowSharePopup(false)} title={listing.title || "Check out this offer"} url={`${window.location.origin}/offer/${listing.id}`} /></div>
        <img src={listing.restaurant?.logoUrl || "/bqLogo.jpg"} alt={listing.restaurant?.name || "Restaurant"} className="absolute bottom-2 left-2 h-9 w-9 rounded-full border-2 border-white bg-white object-cover shadow" />
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">{listing.title || "Restaurant offer"}</h3>
        <div className="mt-1 flex items-start justify-between gap-2">
          <span className="min-w-0 truncate text-xs text-slate-500">{listing.restaurant?.name || "Browse Qatar restaurant"}</span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-800">
            {Number(listing.originalPrice) !== Number(listing.discountedPrice) && <span className="text-[10px] font-normal text-slate-400 line-through">QAR {Number(listing.originalPrice || 0).toLocaleString()}</span>}
            QAR {Number(amount || 0).toLocaleString()}
          </span>
        </div>
        <p className="mt-2 flex items-center gap-1 truncate text-xs text-slate-500"><MapPin size={13} className="shrink-0" />{listing.restaurant?.address || locationOf(listing)}</p>
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[10px] text-slate-400">
          <span className="truncate">Valid till: {listing.validTo ? String(listing.validTo).split("T")[0] : ""}</span>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-slate-600">{listing.offerType || "Offer"}</span>
        </div>
      </div>
    </> : <>
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img src={imageOf(listing)} alt={listing.title || "Marketplace listing"} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" onError={(event) => { event.currentTarget.src = "/bqLogo.jpg"; }} />
        <span className="absolute left-2 top-2 rounded bg-white/95 px-2 py-1 text-[10px] font-bold uppercase text-slate-700">{listing.category || verticalConfig[vertical]?.name}</span>
        <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-slate-600" aria-hidden="true"><Heart size={16} /></span>
      </div>
      <div className="p-3 sm:p-4">
        {amount !== null && <p className="text-lg font-bold text-slate-950">{`${listing.pricing?.currency || "QAR"} `}{Number(amount).toLocaleString()}</p>}
        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-medium leading-5 text-slate-800">{listing.title || "Browse this listing"}</h3>
        <p className="mt-2 flex items-center gap-1 truncate text-xs text-slate-500"><MapPin size={13} className="shrink-0" />{locationOf(listing)}</p>
        <p className="mt-1 text-[11px] text-slate-400">{listing.attributes?.year || "Browse Qatar"}{listing.attributes?.mileage ? ` · ${listing.attributes.mileage}` : ""}</p>
      </div>
    </>}
  </Link>;
}

function CategoryStrip({ active }: { active?: string }) {
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSpotlightIndex((index) => (index + 1) % marketplaceSpotlight.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  const spotlight = marketplaceSpotlight[spotlightIndex];

  return (
    <nav id="marketplace-categories" aria-label="Marketplace categories" className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 gap-2 overflow-x-auto py-2 sm:gap-3 sm:py-4 lg:gap-4">
          {categories.map((category) => {
            const Icon = categoryIcons[category.id] || Building2;
            return <Link key={category.id} to={`/marketplace/${category.id}`} className={`flex w-[84px] shrink-0 flex-col items-center gap-1.5 rounded-lg p-1 text-center transition hover:bg-slate-50 sm:w-[92px] sm:gap-2 sm:p-2 ${active === category.id ? "bg-blue-50 text-[#0878d1]" : "text-slate-700"}`}>
              <span className={`relative grid h-11 w-11 place-items-center overflow-hidden rounded-xl sm:h-14 sm:w-14 ${active === category.id ? "bg-white" : "bg-slate-100"}`}><img src={categoryImages[category.id]} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /><Icon size={22} className="relative z-10 rounded-full bg-white/90 p-1 text-slate-800" /></span>
              <span className="line-clamp-2 text-xs font-semibold leading-4">{category.id === "classifieds" ? "Classifieds" : category.name.replace(/ Buy & Sell| Deal/, "")}</span>
            </Link>;
          })}
        </div>
        <Link key={spotlight.title} to={`/marketplace/${spotlight.vertical}?category=${encodeURIComponent(spotlight.category)}`} className="group hidden h-[82px] w-[340px] shrink-0 items-center gap-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2 transition hover:border-[#0878d1] hover:bg-blue-50 lg:flex xl:w-[390px]">
          <img src={spotlight.image} alt="" className="h-full w-[96px] shrink-0 rounded-md object-cover" />
          <span aria-live="polite" className="min-w-0 flex-1"><span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0878d1]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0878d1]" />Popular right now</span><span className="mt-1 block truncate text-sm font-bold text-slate-900">{spotlight.title}</span><span className="block truncate text-xs text-slate-500">{spotlight.detail}</span></span>
          <ArrowRight size={17} className="mr-2 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-[#0878d1]" />
        </Link>
      </div>
    </nav>
  );
}

export function ModernMarketplaceHome() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { listings, loading } = useMarketplaceListings();
  const filtered = useMemo(() => listings.filter((item) => !search || `${item.title} ${item.description} ${locationOf(item)}`.toLowerCase().includes(search.toLowerCase())), [listings, search]);
  return <div className="min-h-screen bg-[#f5f6f7] text-slate-950">
    <MarketplaceHeader search={search} onSearch={setSearch} />
    <CategoryStrip />
    <main className="mx-auto max-w-[1320px] px-4 pb-16 pt-5 sm:px-6 lg:px-8">
      <section className="relative mb-7 min-h-[190px] overflow-hidden rounded-xl bg-[#0b2538] text-white sm:min-h-[230px]">
        <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1800&q=85" alt="Doha skyline" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#081d2b]/95 via-[#081d2b]/70 to-transparent" />
        <div className="relative max-w-2xl px-6 py-8 sm:px-10 sm:py-10">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-100"><ShieldCheck size={15} /> Qatar, closer to you</p>
          <h1 className="mt-3 max-w-xl text-3xl font-bold leading-tight sm:text-4xl">Find what you need. Sell what you don’t.</h1>
          <p className="mt-2 max-w-lg text-sm text-white/80 sm:text-base">Explore local deals, trusted services and great finds across Qatar.</p>
          <button type="button" onClick={() => document.getElementById("fresh-listings")?.scrollIntoView({ behavior: "smooth" })} className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-cyan-50">Explore listings <ArrowRight size={16} /></button>
        </div>
      </section>
      <section className="mb-9">
        <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0878d1]">Browse by interest</p><h2 className="mt-1 text-xl font-bold sm:text-2xl">Explore categories</h2></div><Link to="/marketplace/vehicles" className="hidden items-center gap-1 text-sm font-semibold text-[#0878d1] sm:flex">All categories <ArrowRight size={16} /></Link></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => {
            const Icon = categoryIcons[category.id] || Building2;
            return <Link key={category.id} to={`/marketplace/${category.id}`} className="group relative h-28 overflow-hidden rounded-lg bg-slate-900 sm:h-32">
              <img src={categoryImages[category.id]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-300 group-hover:scale-105 group-hover:opacity-85" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-white"><span className="truncate text-sm font-bold">{category.name.replace(/ Buy & Sell| Deal/, "")}</span><Icon size={18} className="shrink-0" /></span>
            </Link>;
          })}
        </div>
      </section>
      <section id="fresh-listings">
        <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0878d1]">Updated locally</p><h2 className="mt-1 text-xl font-bold sm:text-2xl">Fresh recommendations</h2></div><button type="button" onClick={() => navigate("/marketplace/vehicles")} className="inline-flex items-center gap-1 text-sm font-semibold text-[#0878d1]">Browse all <ArrowRight size={16} /></button></div>
        {loading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-lg bg-slate-200" />)}</div> : filtered.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{filtered.slice(0, 8).map((item) => <ListingCard key={`${item.vertical}-${item.id}`} listing={item} vertical={item.vertical || "vehicles"} />)}</div> : <p className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">No listings match that search.</p>}
      </section>
      <MarketplacePostAction className="mt-8 flex w-full items-center justify-between gap-4 rounded-lg border border-blue-100 bg-[#e6f3ff] px-5 py-5 text-left text-slate-900 transition hover:bg-blue-50 sm:px-7"><span><span className="block text-lg font-bold">Have something to sell?</span><span className="mt-1 block text-sm text-slate-600">Reach people across Qatar with a new listing.</span></span><span className="flex shrink-0 items-center gap-2 rounded-md bg-[#0878d1] px-4 py-3 text-sm font-bold text-white">List it <ArrowRight size={16} /></span></MarketplacePostAction>
    </main>
    <ModernMarketplaceFooter />
  </div>;
}

export function ModernMarketplaceSearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || searchParams.get("search") || "";
  const [search, setSearch] = useState(query);
  const { listings, loading } = useMarketplaceListings();

  useEffect(() => setSearch(query), [query]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return listings.filter((item) => {
      const verticalName = verticalConfig[item.vertical]?.name || item.vertical || "";
      const searchable = `${item.title || ""} ${item.description || ""} ${locationOf(item)} ${item.category || ""} ${item.subcategory || ""} ${verticalName} ${item.restaurant?.name || ""} ${JSON.stringify(item.attributes || {})}`.toLowerCase();
      return searchable.includes(term);
    });
  }, [listings, search]);

  return <div className="min-h-screen bg-[#f5f6f7] text-slate-950">
    <MarketplaceHeader search={search} onSearch={setSearch} />
    <CategoryStrip />
    <main className="mx-auto min-h-[45vh] max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
        <div><p className="text-xs font-bold uppercase tracking-wide text-[#0878d1]">Marketplace search</p><h1 className="mt-1 text-xl font-bold sm:text-2xl">{search ? `Results for “${search}”` : "Search listings"}</h1></div>
        {!loading && search && <p className="text-sm text-slate-500">{filtered.length} listings</p>}
      </div>
      {loading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-lg bg-slate-200" />)}</div> : filtered.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{filtered.map((item) => <ListingCard key={`${item.vertical}-${item.id}`} listing={item} vertical={item.vertical || "vehicles"} />)}</div> : <div className="rounded-lg border border-slate-200 bg-white px-5 py-12 text-center"><Search className="mx-auto text-slate-300" size={32} /><h2 className="mt-3 font-bold">{search ? "No listings found" : "Enter a search to browse listings"}</h2><p className="mt-1 text-sm text-slate-500">Try another search or choose a category to explore.</p></div>}
    </main>
    <ModernMarketplaceFooter />
  </div>;
}

function VerticalRefinePanel({ vertical, cuisineFilter, categoryFilter, refineFilters, setRefineFilters, selectCuisine, selectCategory, mobileDrawer = false, onClose, onApply, hasPendingChanges = false }: {
  vertical: string;
  cuisineFilter: string | null;
  categoryFilter: string | null;
  refineFilters: Record<string, string>;
  setRefineFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectCuisine: (cuisine: string | null) => void;
  selectCategory: (category: string | null) => void;
  mobileDrawer?: boolean;
  onClose?: () => void;
  onApply?: () => void;
  hasPendingChanges?: boolean;
}) {
  const refineConfig = verticalRefineConfig[vertical];
  const autoCloseChoices = vertical === "restaurants" || vertical === "classifieds";
  const updateFilter = (key: string, value: string) => {
    setRefineFilters((current) => {
      const next = { ...current };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
  };
  const closeAfterChoice = () => {
    if (mobileDrawer && autoCloseChoices) onClose?.();
  };
  const renderField = (field: RefineField) => {
    if (field.type === "range") {
      return <div key={field.key} className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-600">{field.label}{field.unit ? ` (${field.unit})` : ""}</label>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" inputMode="numeric" aria-label={`${field.label} minimum`} placeholder="Min" value={refineFilters[`${field.key}Min`] || ""} onChange={(event) => updateFilter(`${field.key}Min`, event.target.value)} className="min-w-0 rounded-md border border-slate-300 px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-[#0878d1]" />
          <input type="number" inputMode="numeric" aria-label={`${field.label} maximum`} placeholder="Max" value={refineFilters[`${field.key}Max`] || ""} onChange={(event) => updateFilter(`${field.key}Max`, event.target.value)} className="min-w-0 rounded-md border border-slate-300 px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-[#0878d1]" />
        </div>
      </div>;
    }
    return <label key={field.key} className="block space-y-1.5">
      <span className="block text-xs font-medium text-slate-600">{field.label}</span>
      {field.type === "select" ? <select value={refineFilters[field.key] || ""} onChange={(event) => { updateFilter(field.key, event.target.value); closeAfterChoice(); }} className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-[#0878d1]">
        <option value="">All</option>
        {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
      </select> : <input type="text" value={refineFilters[field.key] || ""} onChange={(event) => updateFilter(field.key, event.target.value)} className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-[#0878d1]" />}
    </label>;
  };
  const clearFilters = () => setRefineFilters({});

  const panel = <div className={`rounded-lg border border-slate-200 bg-white p-4 ${mobileDrawer ? "max-h-[82dvh] overflow-y-auto rounded-t-xl pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl" : "lg:sticky lg:top-28"}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold">Refine your search</h2>
        <div className="flex items-center gap-3">
          {Object.values(refineFilters).some(Boolean) && <button type="button" onClick={clearFilters} className="text-xs font-semibold text-[#0878d1] hover:underline">Clear all</button>}
          {mobileDrawer && <button type="button" onClick={onClose} aria-label="Close filters" className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"><X size={18} /></button>}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600"><MapPin size={16} /> Doha, Qatar</div>
      {vertical === "restaurants" ? <>
        <div className="mt-5 flex items-center justify-between gap-2"><label className="text-sm font-medium text-slate-700">What's on your mind?</label>{cuisineFilter && <button type="button" onClick={() => { selectCuisine(null); closeAfterChoice(); }} className="text-xs font-semibold text-[#0878d1] hover:underline">Clear</button>}</div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">{cuisineLists.map((cuisine) => <button key={cuisine.name} type="button" onClick={() => { selectCuisine(cuisine.name === cuisineFilter ? null : cuisine.name); closeAfterChoice(); }} aria-pressed={cuisineFilter === cuisine.name} className={`flex min-w-0 items-center gap-2 rounded-md border px-2 py-2 text-left text-xs transition ${cuisineFilter === cuisine.name ? "border-[#0878d1] bg-blue-50 font-semibold text-[#0878d1]" : "border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}><img src={cuisine.img} alt="" className="h-8 w-8 shrink-0 rounded-full bg-slate-100 object-contain" /><span className="truncate">{cuisine.name}</span></button>)}</div>
      </> : refineConfig ? <div className="mt-5 space-y-4">
        <label className="block space-y-1.5"><span className="block text-xs font-medium text-slate-600">Category</span><select value={refineFilters.subcategory || ""} onChange={(event) => { updateFilter("subcategory", event.target.value); closeAfterChoice(); }} className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-[#0878d1]"><option value="">All categories</option>{refineConfig.subcategories.map((subcategory) => <option key={subcategory} value={subcategory}>{subcategory}</option>)}</select></label>
        {refineConfig.secondaryField && renderField(refineConfig.secondaryField)}
        {refineConfig.fields.map(renderField)}
      </div> : <>
        <label className="mt-4 block text-sm font-medium text-slate-700">Category</label>
        <div className="mt-2 space-y-2">{vertical === "classifieds" ? <>
          <button type="button" onClick={() => { selectCategory(null); closeAfterChoice(); }} aria-pressed={!categoryFilter} className={`block w-full text-left text-sm ${!categoryFilter ? "font-semibold text-[#0878d1]" : "text-slate-600 hover:text-slate-900"}`}>All categories</button>
          {["Furniture", "Home Appliances", "Electronics", "Mobile Phones", "TVs", "Computers", "Books", "Clothing", "Sports", "Other"].map((item) => <button key={item} type="button" onClick={() => { selectCategory(categoryFilter === item ? null : item); closeAfterChoice(); }} aria-pressed={categoryFilter === item} className={`block w-full text-left text-sm ${categoryFilter === item ? "font-semibold text-[#0878d1]" : "text-slate-600 hover:text-slate-900"}`}>{item}</button>)}
        </> : categories.map((item) => <Link key={item.id} to={`/marketplace/${item.id}`} className={`block text-sm ${vertical === item.id ? "font-semibold text-[#0878d1]" : "text-slate-600 hover:text-slate-900"}`}>{item.id === "classifieds" ? "Classifieds" : item.name}</Link>)}</div>
      </>}
      {mobileDrawer && !autoCloseChoices && hasPendingChanges && <div className="sticky bottom-0 mt-5 border-t border-slate-200 bg-white pt-3"><button type="button" onClick={onApply} className="w-full rounded-md bg-[#0878d1] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">Apply filters</button></div>}
      <div className="mt-5 border-t border-slate-100 pt-4"><p className="text-sm font-medium text-slate-700">Trust</p><p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={15} className="text-emerald-600" /> Browse Qatar local listings</p></div>
    </div>;

  if (mobileDrawer) {
    return <div className="fixed inset-0 z-50 flex items-end lg:hidden" role="dialog" aria-modal="true" aria-label="Refine your search">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-slate-950/45" aria-label="Close filters backdrop" />
      <div className="relative z-10 w-full">{panel}</div>
    </div>;
  }

  return <aside className="hidden lg:block">{panel}</aside>;
}

export function ModernMarketplaceListing() {
  const { vertical = "vehicles" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || searchParams.get("q") || "";
  const [search, setSearch] = useState(searchQuery);
  const [sort, setSort] = useState("latest");
  const [randomSeed] = useState(() => Math.random());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refineFilters, setRefineFilters] = useState<Record<string, string>>({});
  const [draftRefineFilters, setDraftRefineFilters] = useState<Record<string, string>>({});
  const { listings, loading, restaurantDirectory } = useMarketplaceListings(vertical);
  const config = verticalConfig[vertical];
  const categoryFilter = searchParams.get("category");
  const cuisineFilter = searchParams.get("cuisine");
  const restaurantFilter = searchParams.get("restaurant");

  useEffect(() => {
    setSort("latest");
    setSearch(searchQuery);
    setRefineFilters({});
    setDraftRefineFilters({});
  }, [vertical, searchQuery]);

  const refineConfig = verticalRefineConfig[vertical];

  const filtered = useMemo(() => {
    let rows = listings.filter((item) => {
      const searchText = `${item.title || ""} ${item.description || ""} ${locationOf(item)} ${item.category || ""} ${item.restaurant?.name || ""} ${Array.isArray(item.restaurant?.cuisine) ? item.restaurant.cuisine.join(" ") : ""}`.toLowerCase();
      const matchesSearch = !search || searchText.includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || `${item.subcategory || ""} ${item.category || ""} ${item.title || ""}`.toLowerCase().includes(categoryFilter.toLowerCase());
      const cuisineText = `${item.cuisine || ""} ${item.category || ""} ${item.title || ""} ${item.description || ""}`.toLowerCase();
      const matchesCuisine = !cuisineFilter || cuisineText.includes(cuisineFilter.toLowerCase());
      const matchesRestaurant = !restaurantFilter || String(item.restaurantId) === restaurantFilter;
      const selectedSubcategory = refineFilters.subcategory;
      const itemSubcategory = getListingFieldValue(item, ["subcategory", "category"]);
      const matchesSubcategory = !selectedSubcategory || String(itemSubcategory || "").toLowerCase() === selectedSubcategory.toLowerCase();
      const fields = [...(refineConfig?.fields || []), ...(refineConfig?.secondaryField ? [refineConfig.secondaryField] : [])];
      const matchesAttributes = fields.every((field) => {
        if (field.type === "range") {
          const min = numericValue(refineFilters[`${field.key}Min`]);
          const max = numericValue(refineFilters[`${field.key}Max`]);
          if (min === undefined && max === undefined) return true;
          const value = numericValue(getListingFieldValue(item, field.aliases));
          return value !== undefined && (min === undefined || value >= min) && (max === undefined || value <= max);
        }
        const selected = refineFilters[field.key];
        if (!selected) return true;
        const actual = getListingFieldValue(item, field.aliases);
        return String(actual ?? "").toLowerCase().includes(selected.toLowerCase());
      });
      return matchesSearch && matchesCategory && matchesCuisine && matchesRestaurant && matchesSubcategory && matchesAttributes;
    });
    if (categoryFilter && rows.length === 0) {
      rows = (mockListings[vertical] || []).filter((item) => `${item.category || ""} ${item.title || ""}`.toLowerCase().includes(categoryFilter.toLowerCase()));
    }
    if (sort === "latest") rows = [...rows].sort((a, b) => new Date(b.updatedAt || b.validFrom || 0).getTime() - new Date(a.updatedAt || a.validFrom || 0).getTime());
    if (sort === "best-value") rows = [...rows].sort((a, b) => {
      const discountA = Number(a.originalPrice) > 0 ? (Number(a.originalPrice) - Number(a.discountedPrice)) / Number(a.originalPrice) : 0;
      const discountB = Number(b.originalPrice) > 0 ? (Number(b.originalPrice) - Number(b.discountedPrice)) / Number(b.originalPrice) : 0;
      return discountB - discountA;
    });
    if (sort === "price-asc" || sort === "price-low") rows = [...rows].sort((a, b) => Number(amountOf(a) || 0) - Number(amountOf(b) || 0));
    if (sort === "price-desc" || sort === "price-high") rows = [...rows].sort((a, b) => Number(amountOf(b) || 0) - Number(amountOf(a) || 0));
    if (sort === "random" && rows.length) {
      const offset = Math.floor(randomSeed * rows.length);
      rows = [...rows.slice(offset), ...rows.slice(0, offset)];
    }
    return rows;
  }, [categoryFilter, cuisineFilter, listings, randomSeed, refineConfig, refineFilters, restaurantFilter, search, sort]);
  const Icon = categoryIcons[vertical] || Building2;

  const selectCuisine = (cuisine: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (cuisine) next.set("cuisine", cuisine);
    else next.delete("cuisine");
    setSearchParams(next, { replace: true });
  };
  const selectCategory = (category: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (category) next.set("category", category);
    else next.delete("category");
    setSearchParams(next, { replace: true });
  };
  const autoApplyMobileFilters = vertical === "restaurants" || vertical === "classifieds";
  const openFilters = () => {
    if (!autoApplyMobileFilters) setDraftRefineFilters({ ...refineFilters });
    setFiltersOpen(true);
  };
  const closeFilters = () => setFiltersOpen(false);
  const applyDraftFilters = () => {
    setRefineFilters({ ...draftRefineFilters });
    setFiltersOpen(false);
  };
  const hasPendingFilterChanges = JSON.stringify(draftRefineFilters) !== JSON.stringify(refineFilters);
  const activeFilterChips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (cuisineFilter) activeFilterChips.push({ key: "cuisine", label: cuisineFilter, clear: () => selectCuisine(null) });
  if (categoryFilter) activeFilterChips.push({ key: "category", label: categoryFilter, clear: () => selectCategory(null) });
  if (restaurantFilter) {
    const restaurantName = restaurantDirectory.find((restaurant) => String(restaurant.id) === restaurantFilter)?.name;
    activeFilterChips.push({
      key: "restaurant",
      label: restaurantName || `Restaurant ${restaurantFilter}`,
      clear: () => {
        const next = new URLSearchParams(searchParams);
        next.delete("restaurant");
        setSearchParams(next, { replace: true });
      },
    });
  }
  if (refineFilters.subcategory) activeFilterChips.push({ key: "subcategory", label: refineFilters.subcategory, clear: () => setRefineFilters((current) => ({ ...current, subcategory: "" })) });
  const appliedFields = [...(refineConfig?.fields || []), ...(refineConfig?.secondaryField ? [refineConfig.secondaryField] : [])];
  appliedFields.forEach((field) => {
    const value = refineFilters[field.key];
    if (value) activeFilterChips.push({ key: field.key, label: value, clear: () => setRefineFilters((current) => ({ ...current, [field.key]: "" })) });
    if (field.type === "range") {
      const minKey = `${field.key}Min`;
      const maxKey = `${field.key}Max`;
      const min = refineFilters[minKey];
      const max = refineFilters[maxKey];
      if (min || max) {
        const rangeLabel = min && max ? `${min} - ${max}` : min ? `${min}+` : `Up to ${max}`;
        activeFilterChips.push({
          key: field.key,
          label: `${rangeLabel}${field.unit ? ` ${field.unit}` : ""}`,
          clear: () => setRefineFilters((current) => ({ ...current, [minKey]: "", [maxKey]: "" })),
        });
      }
    }
  });
  const clearAllAppliedFilters = () => {
    setRefineFilters({});
    setDraftRefineFilters({});
    const next = new URLSearchParams(searchParams);
    next.delete("category");
    next.delete("cuisine");
    next.delete("restaurant");
    setSearchParams(next, { replace: true });
  };
  return <div className="min-h-screen bg-[#f5f6f7] text-slate-950">
    <MarketplaceHeader search={search} onSearch={setSearch} vertical={vertical} />
    <CategoryStrip active={vertical} />
    <main className="mx-auto max-w-[1320px] px-4 py-3 sm:px-6 sm:py-5 lg:px-8">
      <div className="mb-3 flex items-center gap-2 text-xs text-slate-500 sm:mb-5"><Link to="/" className="hover:text-[#0878d1]">Home</Link><span>/</span><span className="text-slate-700">{config?.name || vertical}</span></div>
      <div className="mb-2 flex flex-nowrap items-center justify-between gap-1 border-b border-slate-200 pb-2 sm:mb-3 sm:gap-4">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-blue-50 text-[#0878d1] sm:h-9 sm:w-9 sm:rounded-lg"><Icon size={17} /></span><div className="min-w-0"><h1 className="truncate text-sm font-bold leading-tight sm:text-xl">{config?.name || vertical}</h1><p className="truncate text-[10px] leading-4 text-slate-500 sm:text-xs">{filtered.length} listings around Qatar</p></div></div>
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <button type="button" onClick={() => setSort("best-value")} title="Best value deals" aria-label="Best value deals" className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1.5 text-[10px] font-semibold transition sm:px-2.5 sm:text-xs ${sort === "best-value" ? "border-amber-400 bg-amber-50 text-amber-800" : "border-amber-200 bg-white text-amber-700 hover:bg-amber-50"}`}><Sparkles size={14} className="animate-pulse" /><span>Best Value Deals</span></button>
          <label className="flex shrink-0 items-center gap-1 text-[0px] text-slate-600 sm:gap-2 sm:text-sm"><span className="hidden sm:inline">Sort by</span><select aria-label="Sort by" value={sort} onChange={(event) => setSort(event.target.value)} className="w-[78px] rounded-md border border-slate-300 bg-white px-1.5 py-1.5 text-xs text-slate-800 sm:w-auto sm:px-3 sm:py-2 sm:text-sm">{vertical === "restaurants" ? <><option value="latest">Latest</option>{ENABLE_RANDOM_SORT && <option value="random">Random</option>}<option value="best-value">Best Value</option><option value="price-asc">Low to High</option><option value="price-desc">High to Low</option></> : <><option value="latest">Latest</option><option value="best-value">Best Value</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></>}</select></label>
        </div>
      </div>
      {vertical === "restaurants" && <RestaurantMarquee restaurants={restaurantDirectory} />}
      <div className="sticky top-[60px] z-20 mb-2 flex min-w-0 items-center gap-1.5 bg-[#f5f6f7]/95 py-0 backdrop-blur lg:hidden sm:mb-3">
        <button type="button" onClick={openFilters} className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm"><SlidersHorizontal size={14} /> Filters</button>
        {activeFilterChips.length > 0 && <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap py-0" aria-label="Applied filters">
          {activeFilterChips.map((chip) => <button key={chip.key} type="button" onClick={chip.clear} aria-label={`Remove filter ${chip.label}`} className="inline-flex max-w-[55vw] shrink-0 items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-800 hover:bg-blue-100"><span className="truncate">{chip.label}</span><X size={12} className="shrink-0" /></button>)}
          <button type="button" onClick={clearAllAppliedFilters} className="shrink-0 px-1 py-0.5 text-[11px] font-semibold text-[#0878d1] hover:underline">Clear all</button>
        </div>}
      </div>
      {filtersOpen && <VerticalRefinePanel vertical={vertical} cuisineFilter={cuisineFilter} categoryFilter={categoryFilter} refineFilters={autoApplyMobileFilters ? refineFilters : draftRefineFilters} setRefineFilters={autoApplyMobileFilters ? setRefineFilters : setDraftRefineFilters} selectCuisine={selectCuisine} selectCategory={selectCategory} mobileDrawer onClose={closeFilters} onApply={applyDraftFilters} hasPendingChanges={hasPendingFilterChanges} />}
      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <VerticalRefinePanel vertical={vertical} cuisineFilter={cuisineFilter} categoryFilter={categoryFilter} refineFilters={refineFilters} setRefineFilters={setRefineFilters} selectCuisine={selectCuisine} selectCategory={selectCategory} />
        <section>
          {loading ? <div className={vertical === "restaurants" ? "grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4" : "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"}>{Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-lg bg-slate-200" />)}</div> : filtered.length ? <div className={vertical === "restaurants" ? "grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4" : "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"}>{filtered.map((item) => <ListingCard key={item.id} listing={item} vertical={vertical} />)}</div> : <div className="rounded-lg border border-slate-200 bg-white px-5 py-12 text-center"><Search className="mx-auto text-slate-300" size={32} /><h2 className="mt-3 font-bold">No listings found</h2><p className="mt-1 text-sm text-slate-500">Try another search or explore a different category.</p></div>}
        </section>
      </div>
    </main>
    <ModernMarketplaceFooter />
  </div>;
}

export function ModernMarketplaceDetail() {
  const { vertical = "vehicles", id = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingRecord | null>(location.state?.listing || null);
  const [loading, setLoading] = useState(!location.state?.listing);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const category = verticalConfig[vertical];

  useEffect(() => {
    if (location.state?.listing) {
      setListing(location.state.listing);
      setLoading(false);
      return;
    }
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const service = getVerticalService(vertical);
        const found = await service.getById(id);
        const mock = (mockListings[vertical] || []).find((item) => String(item.id) === id);
        if (active) setListing(found || mock || null);
      } catch {
        if (active) setListing((mockListings[vertical] || []).find((item) => String(item.id) === id) || null);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [id, location.state, vertical]);

  const amount = listing ? amountOf(listing) : null;
  return <div className="min-h-screen bg-[#f5f6f7] text-slate-950">
    <MarketplaceHeader vertical={vertical} />
    <main className="mx-auto max-w-[1120px] px-4 py-5 sm:px-6 lg:px-8">
      <button type="button" onClick={() => navigate(`/marketplace/${vertical}`)} className="mb-5 inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-[#0878d1]"><ArrowLeft size={18} /> Back to {category?.name || "listings"}</button>
      {loading ? <div className="grid gap-6 rounded-lg bg-white p-5 md:grid-cols-2"><div className="aspect-[4/3] animate-pulse rounded bg-slate-200" /><div className="h-64 animate-pulse rounded bg-slate-100" /></div> : listing ? <div className="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white"><div className="aspect-[4/3] bg-slate-100"><img src={imageOf(listing)} alt={listing.title || "Listing"} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = "/bqLogo.jpg"; }} /></div><div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500"><span>{category?.name || vertical}</span><button type="button" className="inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-100"><Share2 size={16} /> Share</button></div></section>
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-[#0878d1]">{listing.category || category?.name}</p><h1 className="mt-2 text-2xl font-bold leading-tight">{listing.title || "Listing details"}</h1>{amount !== null && <p className="mt-4 text-3xl font-bold">{listing.pricing?.currency || "QAR"} {Number(amount).toLocaleString()}</p>}<p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><MapPin size={16} />{locationOf(listing)}</p><div className="mt-5 border-t border-slate-100 pt-4"><h2 className="font-bold">Description</h2><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{listing.description || "Contact the seller for more information about this listing."}</p></div><button type="button" onClick={() => setEnquiryOpen(true)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-[#0878d1] px-4 py-3 font-bold text-white transition hover:bg-blue-700"><Tag size={17} /> Contact seller</button><p className="mt-3 text-center text-xs text-slate-400">Browse Qatar marketplace</p></aside>
      </div> : <div className="rounded-lg border border-slate-200 bg-white px-5 py-12 text-center"><h1 className="text-xl font-bold">Listing not found</h1><p className="mt-2 text-sm text-slate-500">This listing may have been removed or is temporarily unavailable.</p><button type="button" onClick={() => navigate(`/marketplace/${vertical}`)} className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"><ArrowLeft size={16} /> Browse category</button></div>}
    </main>
    {listing && <ListingEnquiryPopup open={enquiryOpen} onClose={() => setEnquiryOpen(false)} listingId={listing.id ?? id} adTitle={listing.title || "this listing"} />}
    <ModernMarketplaceFooter />
  </div>;
}