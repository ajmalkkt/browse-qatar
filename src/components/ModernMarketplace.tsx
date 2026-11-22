import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CarFront,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Heart,
  Instagram,
  CircleUserRound,
  LayoutGrid,
  Leaf,
  Camera,
  Check,
  FileText,
  CircleHelp,
  HeartHandshake,
  Home,
  LogOut,
  MapPin,
  MessageCircle,
  Menu,
  Phone,
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
import { getAllVerticals } from "../services/verticalService";
import type { Vertical as ApiVertical } from "../services/verticalService";
import { getProviderById } from "../services/providerService";
import { verticalConfig } from "../config/verticalConfig";
import { marketplaceSpotlight } from "../config/marketplaceSpotlight";
import { marketplaceCampaignSlot } from "../config/marketplaceCampaignSlot";
import { cuisineLists, ENABLE_RANDOM_SORT, ENABLE_SIGNUP, SHOW_DISCOUNTED_PRICE } from "../config/appConfig";
import SharePopup from "./SharePopup";
import useAuth from "../auth/useAuth";
import { useModal } from "../contexts/ModalContext";
import { useFavoritesContext } from "../contexts/FavoritesContext";
import ListingEnquiryPopup from "./ListingEnquiryPopup";

type ListingRecord = Record<string, any>;

const marketplaceSeo: Record<string, { label: string; description: string }> = {
  restaurants: { label: "Restaurant Offers", description: "Explore restaurant deals, dining offers, and promotions in Qatar. Browse current offers and contact each restaurant for availability and terms." },
  vehicles: { label: "Vehicles", description: "Browse vehicle listings in Qatar, including cars and other vehicles. Compare listing details, prices, location, and contact the advertiser directly." },
  accommodations: { label: "Accommodation", description: "Explore accommodation listings in Qatar, including homes, apartments, and rooms. Review listing details and contact the advertiser to confirm availability." },
  services: { label: "Local Services", description: "Find local service listings in Qatar. Browse service descriptions, locations, and provider details, then contact providers directly." },
  classifieds: { label: "Classifieds", description: "Browse local classifieds in Qatar, including furniture, electronics, appliances, and more. Review item details and contact the advertiser." },
  jobs: { label: "Jobs", description: "Explore job listings in Qatar across different roles and work arrangements. Review each vacancy and contact the advertiser using the details provided." },
};

const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

const marketplaceBreadcrumbs = (vertical: string, verticalLabel: string, itemTitle?: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://browseqatar.com/" },
    { "@type": "ListItem", position: 2, name: verticalLabel, item: `https://browseqatar.com/marketplace/${encodeURIComponent(vertical)}` },
    ...(itemTitle ? [{ "@type": "ListItem", position: 3, name: itemTitle }] : []),
  ],
});

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
  accommodations: Home,
  services: Wrench,
  classifieds: Tag,
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

function MarketplaceCampaignSlot({ vertical, placement = "desktop" }: { vertical: string; placement?: "mobile" | "desktop" }) {
  const [isOpen, setIsOpen] = useState(false);
  const campaign = marketplaceCampaignSlot;
  const popup = campaign.popup;
  const shouldShow = campaign.enabled && campaign.categoryIds.includes(vertical);
  const usesPopup = campaign.action.type === "popup";

  useEffect(() => {
      if (!isOpen || !usesPopup) return;
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") setIsOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, usesPopup]);

  if (!shouldShow) return null;

  const triggerContent = placement === "mobile" ? <>
      <Leaf size={13} aria-hidden="true" />
      <span className="whitespace-nowrap">{campaign.mobileLabel}</span>
  </> : <>
      {campaign.desktopImage ? <img src={campaign.desktopImage.src} alt={campaign.desktopImage.alt} className="h-full w-24 shrink-0 rounded-md object-cover" /> : <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-green-100 text-green-700"><Leaf size={22} aria-hidden="true" /></span>}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-base font-bold text-green-800">{campaign.title}</span>
          <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-800">{campaign.label}</span>
        </span>
        <span className="mt-1 block truncate text-xs text-green-800/80">{campaign.description}</span>
      </span>
      <span className="shrink-0 text-xs font-semibold text-green-800">{usesPopup ? "Our story" : "Learn more"} <span aria-hidden="true">→</span></span>
  </>;

  const triggerClassName = placement === "mobile"
      ? "inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2 py-1.5 text-[10px] font-bold text-green-800 transition hover:border-green-400 hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
      : "flex h-[58px] min-w-0 w-full items-center gap-3 overflow-hidden rounded-xl border border-green-200 bg-gradient-to-r from-[#f0fdf4] via-[#f7fff7] to-[#dcfce7] px-4 text-left shadow-sm transition hover:border-green-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2";
  const trigger = campaign.action.type === "popup"
      ? <button type="button" onClick={() => setIsOpen(true)} aria-haspopup="dialog" className={triggerClassName}>{triggerContent}</button>
      : <a href={campaign.action.url} target={campaign.action.openInNewTab ? "_blank" : undefined} rel={campaign.action.openInNewTab ? "noreferrer" : undefined} className={triggerClassName}>{triggerContent}</a>;

  return <>
      {placement === "mobile" ? <div className="flex justify-center lg:hidden">
        {trigger}
        </div> : <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          {trigger}
        </div>}
      {isOpen && popup && <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setIsOpen(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="eco-campaign-title"
        className="relative my-auto flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border-4 border-double border-green-800/20 bg-[#fdfbf7] shadow-2xl"
      >
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close eco initiative details"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X size={20} />
        </button>
        <header className="relative shrink-0 bg-green-800 px-5 py-5 text-center text-white sm:px-7">
          <Leaf className="mx-auto mb-2 opacity-90" size={26} aria-hidden="true" />
          <h2 id="eco-campaign-title" className="text-xl font-bold tracking-wide sm:text-2xl">{popup.title}</h2>
          <p className="mt-1 text-xs tracking-widest text-green-100 sm:text-sm">{popup.eyebrow}</p>
        </header>
        <div className="overflow-y-auto px-5 py-5 text-center sm:px-8 sm:py-7">
          <HeartHandshake className="mx-auto mb-4 text-green-700/40" size={38} aria-hidden="true" />
          {popup.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph}`} className={`${index < popup.paragraphs.length - 1 ? "mb-4" : ""} text-sm leading-6 text-slate-700 ${index === 0 ? "text-base italic sm:text-lg" : ""}`}>
            {paragraph}
          </p>)}
        </div>
        <div className="h-1.5 shrink-0 bg-green-800" />
      </section>
    </div>}
    </>
}

export function ModernMarketplaceFooter({ variant = "modern" }: { variant?: "modern" | "v2" }) {
  const isV2 = variant === "v2";
  const [appLaunchNoticeOpen, setAppLaunchNoticeOpen] = useState(false);

  useEffect(() => {
    if (!appLaunchNoticeOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAppLaunchNoticeOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [appLaunchNoticeOpen]);

  const appButtonClass = `inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition ${
    isV2
      ? "border-[#e8d2bf] text-[#7e1831] hover:bg-[#fff0c7]"
      : "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
  }`;

  return <>
    <footer className={`border-t text-slate-700 ${isV2 ? "border-[#ead9ca] bg-[#fff7e6]" : "border-slate-200 bg-[#f3f8fc]"}`}>
    <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-9 sm:px-6 sm:py-11 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
      <div>
        <div className="flex items-center gap-3 sm:block">
        <Link to="/" aria-label="Browse Qatar home" className="mb-3 inline-flex shrink-0 items-center sm:hidden">
          <img src="/logo.jpg" alt="Browse Qatar" className="size-12 shrink-0 rounded-full object-cover" />
        </Link>
        <Link to="/" aria-label="Browse Qatar home" className="hidden items-center sm:inline-flex">
          <img src="/bqLogo.png" alt="Browse Qatar" className="h-11 w-auto object-contain" onError={(event) => { event.currentTarget.src = "/bqLogo.jpg"; }} />
        </Link>
        <p className="mt-0 min-w-0 flex-1 text-xs leading-5 text-slate-500 sm:mt-3 sm:max-w-sm sm:flex-none sm:text-sm sm:leading-6">Discover local deals, trusted services, and listings across Qatar.</p>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <a href="https://www.facebook.com/browseqatarofficial" target="_blank" rel="noreferrer" aria-label="Browse Qatar on Facebook" className={`grid h-9 w-9 place-items-center rounded-full border transition ${isV2 ? "border-[#e8d2bf] text-[#7e1831] hover:bg-[#fff0c7]" : "border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-700"}`}><Facebook size={17} /></a>
          <a href="https://www.instagram.com/browseqatarofficial/" target="_blank" rel="noreferrer" aria-label="Browse Qatar on Instagram" className={`grid h-9 w-9 place-items-center rounded-full border transition ${isV2 ? "border-[#e8d2bf] text-[#7e1831] hover:bg-[#fff0c7]" : "border-slate-200 text-slate-500 hover:border-pink-300 hover:text-pink-600"}`}><Instagram size={17} /></a>
          <a href="https://twitter.com/browseqatarofficial" target="_blank" rel="noreferrer" aria-label="Browse Qatar on X" className={`grid h-9 w-9 place-items-center rounded-full border transition ${isV2 ? "border-[#e8d2bf] text-[#7e1831] hover:bg-[#fff0c7]" : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900"}`}><Twitter size={16} /></a>
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
          <button type="button" onClick={() => setAppLaunchNoticeOpen(true)} className={appButtonClass}><img src="/android.png" alt="" className="h-5 w-5 object-contain" />Google Play</button>
          <button type="button" onClick={() => setAppLaunchNoticeOpen(true)} className={appButtonClass}><img src="/apple.png" alt="" className="h-5 w-5 object-contain" />App Store</button>
        </div>
      </div>
    </div>
    <div className={`border-t ${isV2 ? "border-[#ead9ca] bg-[#fff0c7]" : "border-slate-200 bg-[#eaf2f8]"}`}>
      <div className={`mx-auto flex max-w-[1320px] flex-col gap-2 px-4 py-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 ${isV2 ? "text-[#76565b]" : "text-slate-500"}`}>
        <p>© {new Date().getFullYear()} Browse Qatar. All rights reserved.</p>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
          <p>Made for exploring Qatar.</p>
          <div className="flex items-center gap-2">
            <img src="/meraki.webp" alt="Meraki AI" className="h-4 w-4 object-contain" />
            <span>Powered by <span className="font-medium text-slate-700">MerakiAi</span></span>
          </div>
        </div>
      </div>
    </div>
    </footer>
    {appLaunchNoticeOpen && <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) setAppLaunchNoticeOpen(false);
    }}
    >
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-launch-notice-title"
      className={`relative w-full max-w-md rounded-2xl border p-6 text-center shadow-2xl sm:p-8 ${
        isV2 ? "border-[#ead9ca] bg-[#fffdfa]" : "border-slate-200 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => setAppLaunchNoticeOpen(false)}
        aria-label="Close app launch notice"
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <X size={20} />
      </button>
      <div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${
        isV2 ? "bg-[#fff0c7] text-[#941333]" : "bg-blue-50 text-blue-700"
      }`}>
        <Sparkles size={26} />
      </div>
      <h2 id="app-launch-notice-title" className={`mt-4 text-xl font-bold ${
        isV2 ? "text-[#851432]" : "text-slate-900"
      }`}>Browse Qatar app launching soon</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        We&apos;re putting the finishing touches on the Browse Qatar app. It will be available on Google Play and the App Store soon.
      </p>
      <button
        type="button"
        autoFocus
        onClick={() => setAppLaunchNoticeOpen(false)}
        className={`mt-6 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition ${
          isV2 ? "bg-[#941333] hover:bg-[#7e102b]" : "bg-[#0878d1] hover:bg-[#0667b4]"
        }`}
      >Got it</button>
    </section>
    </div>}
  </>;
}

type RefineField = {
  label: string;
  key: string;
  aliases: string[];
  type: "text" | "select" | "range" | "multiselect";
  options?: string[];
  unit?: string;
  group?: string;
};

const verticalRefineConfig: Record<string, { subcategories: string[]; fields: RefineField[]; secondaryField?: RefineField }> = {
  vehicles: {
    subcategories: ["Cars", "Motorcycles & Bikes", "Commercial Vehicles", "Spare Parts & Accessories", "Boats & Marine"],
    fields: [
      { label: "Vehicle Type", key: "bodyType", aliases: ["bodyType", "vehicleType"], type: "select", options: ["Sedan", "SUV", "Coupe", "Hatchback", "Pickup", "Van", "Truck", "Bus", "Minivan", "Motorcycle", "Scooter", "ATV", "UTV", "Bicycle", "Boat", "Yacht", "Jet Ski", "Trailer", "RV / Motorhome", "Commercial Vehicle", "Other"], group: "Body Type" },
      { label: "Make", key: "make", aliases: ["make", "vehicleMake"], type: "text", group: "Makes" },
      { label: "Model", key: "model", aliases: ["model", "vehicleModel"], type: "text", group: "Model" },
      { label: "Year", key: "year", aliases: ["year", "modelYear"], type: "range", group: "Vehicle" },
      { label: "KM", key: "km", aliases: ["km", "mileage", "kilometers", "odometer"], type: "range", unit: "km", group: "Vehicle" },
      { label: "Transmission", key: "transmission", aliases: ["transmission"], type: "select", options: ["Automatic", "Manual", "CVT", "Semi-Automatic"], group: "Performance" },
      { label: "Fuel type", key: "fuelType", aliases: ["fuelType", "fuel"], type: "select", options: ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid", "CNG", "LPG"], group: "Performance" },
      { label: "Drive type", key: "wheelDrive", aliases: ["wheelDrive", "driveType", "drivetrain"], type: "select", options: ["RWD", "FWD", "2WD", "4WD", "AWD"], group: "Performance" },
      { label: "Doors", key: "doors", aliases: ["doors"], type: "select", options: ["2", "3", "4", "5"], group: "Style" },
      { label: "Seats", key: "seats", aliases: ["seats", "seatCount"], type: "select", options: ["2", "4", "5", "6", "7", "8", "9", "10", "12", "14", "24", "32", "40", "50"], group: "Style" },
      { label: "Seat type", key: "seatType", aliases: ["seatType", "seatingType"], type: "select", options: ["Standard", "Bucket", "Bench", "Captain", "Reclining", "Leather", "Fabric", "Cloth", "Vinyl", "Synthetic Leather", "Alcantara", "Sport", "Heated", "Ventilated", "Other"], group: "Style" },
      { label: "Condition", key: "condition", aliases: ["condition", "vehicleCondition"], type: "select", options: ["New", "Used", "Refurbished", "Preloved"], group: "Vehicle" },
      { label: "Service history", key: "serviceHistory", aliases: ["serviceHistory", "service_history"], type: "select", options: ["Full Service History", "Partial Service History", "No Service History", "Unknown"], group: "Vehicle" },
      { label: "Price", key: "price", aliases: ["pricing.discountedPrice", "discountedPrice", "price", "pricing.originalPrice", "originalPrice"], type: "range", unit: "QAR", group: "Price" },
    ],
  },
  accommodations: {
    subcategories: ["Rent (Apartment/Villa)", "Sale (Apartment/Villa)", "Commercial", "Shared/Partition", "Land & Plots"],
    fields: [
      { label: "Transaction type", key: "transactionType", aliases: ["transactionType"], type: "select", options: ["For Rent", "For Sale"], group: "Property" },
      { label: "Sector", key: "sector", aliases: ["sector"], type: "select", options: ["Residential", "Commercial", "International"], group: "Property" },
      { label: "Property type", key: "propertyType", aliases: ["propertyType", "type"], type: "select", options: ["Apartment", "Villa", "Standalone Villa", "Compound Villa", "Studio", "Penthouse", "Duplex", "Hotel Apartment", "Villa Apartment", "Townhouse", "Office", "Warehouse", "Shop"], group: "Property" },
      { label: "Area / Neighbourhood", key: "area", aliases: ["area", "neighbourhood", "location.area", "location.city"], type: "text", group: "Location" },
      { label: "Bedrooms", key: "bedrooms", aliases: ["bedrooms", "bedroom"], type: "range", group: "Property" },
      { label: "Bathrooms", key: "bathrooms", aliases: ["bathrooms", "bathroom"], type: "range", group: "Property" },
      { label: "Furnishing", key: "furnishing", aliases: ["furnishing", "furnished", "furnishingStatus"], type: "select", options: ["Furnished", "Fully Furnished", "Semi-Furnished", "Unfurnished"], group: "Property" },
      { label: "Parking", key: "parking", aliases: ["parking"], type: "select", options: ["Underground", "Dedicated Covered", "Dedicated Uncovered", "On-street"], group: "Features" },
      { label: "Size (sq ft)", key: "sizeSqFt", aliases: ["sizeSqFt", "size", "areaSqFt", "squareFeet"], type: "range", unit: "sq ft", group: "Property" },
      { label: "Amenities", key: "amenities", aliases: ["amenities", "features"], type: "text", group: "Features" },
      { label: "Price", key: "price", aliases: ["pricing.discountedPrice", "discountedPrice", "price", "pricing.originalPrice", "originalPrice"], type: "range", unit: "QAR", group: "Price" },
    ],
  },
  jobs: {
    subcategories: ["Jobs Offered", "Jobs Wanted"],
    secondaryField: { label: "Industry", key: "industry", aliases: ["industry"], type: "select", options: ["Accounting/Finance", "Customer Service", "IT/Telecom", "Sales/Marketing", "Drivers/Transport", "Domestic/Cleaning", "Hospitality/F&B", "Engineering/Construction"] },
    fields: [
      { label: "Function", key: "function", aliases: ["function", "jobFunction"], type: "select", options: ["Accounting & Auditing", "Administration", "Advertising", "Quality Assurance & HSE", "Customer Service", "IT", "Skilled Trades & Technicians", "Healthcare & Medical", "Human Resources", "Sales & Marketing", "Engineering & Construction", "Hospitality & F&B", "Other"], group: "Role" },
      { label: "Career level", key: "careerLevel", aliases: ["careerLevel", "level"], type: "select", options: ["Entry Level", "Mid Level", "Senior Level", "Manager", "Executive"], group: "Role" },
      { label: "Work type / mode", key: "workType", aliases: ["workType", "jobType", "employmentType", "type"], type: "select", options: ["Full-time", "Part-time", "Contract", "Freelance", "On site", "Remote", "Hybrid"], group: "Role" },
      { label: "Experience", key: "experience", aliases: ["experience", "yearsExperience", "experienceYears"], type: "text", group: "Role" },
      { label: "Salary", key: "salary", aliases: ["salary", "pricing.discountedPrice", "discountedPrice", "pricing.originalPrice", "originalPrice"], type: "range", unit: "QAR", group: "Salary" },
      { label: "Negotiable salary", key: "salaryNegotiable", aliases: ["salaryNegotiable"], type: "select", options: ["Yes", "No"], group: "Salary" },
      { label: "Visa status", key: "visaStatus", aliases: ["visaStatus"], type: "text", group: "Requirements" },
      { label: "Languages", key: "languages", aliases: ["languages"], type: "text", group: "Requirements" },
      { label: "Gender", key: "gender", aliases: ["gender"], type: "select", options: ["Any", "Male", "Female"], group: "Requirements" },
      { label: "Location / Area", key: "area", aliases: ["area", "location.city", "location.area", "location"], type: "text", group: "Location" },
      { label: "Hiring entity", key: "hiringEntity", aliases: ["hiringEntity", "company", "employer"], type: "text", group: "Employer" },
    ],
  },
  services: {
    subcategories: ["Home Maintenance", "Cleaning & Laundry", "Moving & Transport", "IT & Digital", "Events & Catering", "Beauty & Fitness", "Legal & Business"],
    fields: [
      { label: "Category", key: "serviceCategory", aliases: ["serviceCategory", "category", "serviceType"], type: "select", options: ["Home Maintenance", "Education", "Business Services", "Tech & IT", "Automotive", "Cleaning", "Events", "Moving & Delivery", "Fashion & Tailoring", "Domestic Help", "Travel", "AC Repair", "Construction", "Health & Wellness", "Pest Control", "Beauty & Spa", "Pet Services", "Furniture & Decor", "Catering & Venues", "Facility Management"], group: "Service" },
      { label: "Location / Area", key: "area", aliases: ["area", "location.city", "location.area", "city", "location", "address"], type: "text", group: "Location" },
      { label: "Experience", key: "experience", aliases: ["experience"], type: "text", group: "Professional" },
      { label: "Price", key: "price", aliases: ["pricing.discountedPrice", "discountedPrice", "price", "pricing.originalPrice", "originalPrice"], type: "range", unit: "QAR", group: "Price" },
      { label: "Price on request", key: "priceOnRequest", aliases: ["priceOnRequest"], type: "select", options: ["Yes", "No"], group: "Price" },
      { label: "Provider", key: "provider", aliases: ["provider", "providerType", "provider.type"], type: "select", options: ["Individual", "Agency", "Individual Provider", "Company"], group: "Provider" },
    ],
  },
  classifieds: {
    subcategories: ["Furniture", "Home Appliances", "Electronics", "Mobile Phones", "TVs", "Computers", "Books", "Clothing", "Sports", "Other"],
    fields: [
      { label: "Category", key: "classifiedCategory", aliases: ["classifiedCategory", "category", "subcategory"], type: "select", options: ["Mobile Phones & Tablets", "Electronics", "Furniture & Decor", "Fashion & Beauty", "Kids & Toys", "Sports & Hobbies", "Machinery", "Equipment & Materials", "Home Appliances", "Books", "Other"], group: "Listing" },
      { label: "Sub-category", key: "subcategory", aliases: ["subcategory", "category"], type: "text", group: "Listing" },
      { label: "Condition", key: "condition", aliases: ["condition"], type: "select", options: ["New", "Used", "Preloved", "Like New", "Good", "Fair"], group: "Listing" },
      { label: "Brand", key: "brand", aliases: ["brand", "make"], type: "text", group: "Listing" },
      { label: "Location / Area", key: "area", aliases: ["area", "location.city", "location.area", "location"], type: "text", group: "Location" },
      { label: "Price", key: "price", aliases: ["pricing.discountedPrice", "discountedPrice", "price", "pricing.originalPrice", "originalPrice"], type: "range", unit: "QAR", group: "Price" },
    ],
  },
};

function humanizeAttribute(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/^./, (value) => value.toUpperCase());
}

function buildRefineFields(vertical: string, metadata?: ApiVertical | null): RefineField[] {
  const refineConfig = verticalRefineConfig[vertical];
  const configured = [...(refineConfig?.fields || []), ...(refineConfig?.secondaryField ? [refineConfig.secondaryField] : [])];
  const localAttributes = verticalConfig[vertical]?.additionalAttributes || [];
  const remoteAttributes = metadata?.additionalAttributes || [];
  const remoteFilters = metadata?.filters || [];
  const attributeFields = [...localAttributes, ...remoteAttributes].map((attribute) => ({
    label: attribute.label || humanizeAttribute(attribute.name),
    key: attribute.name,
    aliases: [attribute.name, ...(attribute.aliases || [])],
    type: attribute.type === "select" ? "select" as const : attribute.type === "multiselect" ? "multiselect" as const : attribute.type === "number" || attribute.type === "range" ? "range" as const : "text" as const,
    options: attribute.options,
    unit: attribute.unit,
    group: attribute.group || attribute.category || attribute.section || "Additional details",
  }));
  const filterFields = remoteFilters.map((filter) => ({
    label: filter.label || humanizeAttribute(filter.key),
    key: filter.key,
    aliases: [filter.key, ...(filter.aliases || [])],
    type: filter.type === "select" ? "select" as const : filter.type === "multiselect" ? "multiselect" as const : filter.type === "number" || filter.type === "range" ? "range" as const : "text" as const,
    options: filter.options,
    unit: filter.unit,
    group: filter.group || filter.category || filter.section || "More filters",
  }));
  const fields = [...configured, ...attributeFields, ...filterFields];
  const uniqueFields = new Map<string, RefineField>();
  fields.forEach((field) => {
    const aliases = new Set([field.key, ...field.aliases]);
    const alreadyRepresented = Array.from(uniqueFields.values()).some((existing) =>
      [existing.key, ...existing.aliases].some((alias) => aliases.has(alias))
    );
    if (!alreadyRepresented) uniqueFields.set(field.key, field);
  });
  return Array.from(uniqueFields.values());
}

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
  return listing.discountedPrice
    ?? listing.pricing?.discountedPrice
    ?? listing.originalPrice
    ?? listing.pricing?.originalPrice
    ?? listing.price
    ?? listing.salary
    ?? null;
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

function imagesOf(listing: ListingRecord) {
  const candidates = [
    listing.imageUrl,
    listing.thumbnail,
    ...(Array.isArray(listing.galleryUrls) ? listing.galleryUrls : []),
    ...(Array.isArray(listing.imageUrls) ? listing.imageUrls : []),
    ...(Array.isArray(listing.images) ? listing.images : []),
  ];
  return Array.from(new Set(candidates.filter((url): url is string => typeof url === "string" && url.trim().length > 0)));
}

function listingAttributesOf(listing: ListingRecord) {
  const attributes = listing.attributes && typeof listing.attributes === "object" && !Array.isArray(listing.attributes) ? listing.attributes : {};
  const additionalAttributes = listing.additionalAttributes && typeof listing.additionalAttributes === "object" && !Array.isArray(listing.additionalAttributes) ? listing.additionalAttributes : {};
  const merged = { ...attributes, ...additionalAttributes } as Record<string, unknown>;
  if ((merged.fuelType === undefined || merged.fuelType === null || merged.fuelType === "") && merged.fuel) {
    merged.fuelType = merged.fuel;
  }
  delete merged.fuel;
  return merged;
}

function displayAttribute(value: unknown): string {
  if (Array.isArray(value)) return value.map(displayAttribute).filter(Boolean).join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === undefined || value === null) return "";
  return String(value).trim();
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

export function MarketplacePostAction({ children, className }: { children: React.ReactNode; className: string }) {
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

export function MarketplaceAccountMenu() {
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

  const handleManageOffers = () => {
    const continueToManage = () => {
      setMenuOpen(false);
      window.setTimeout(() => navigate(window.innerWidth < 768 ? "/admin" : "/manage-offers"), 120);
    };
    if (auth.user) continueToManage();
    else if (auth.provider === "FIREBASE") openLogin(continueToManage);
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

  return <div ref={menuRef} className="relative shrink-0">
    <button type="button" onClick={() => setMenuOpen((open) => !open)} className="grid size-8 place-items-center rounded-full transition hover:bg-[#fff1c9] sm:size-10" aria-label={auth.user ? "Open account menu" : "Open login menu"} aria-expanded={menuOpen}>
      <CircleUserRound className={`size-[18px] sm:size-6 ${auth.user ? "text-[#941333]" : "text-[#8c1534]"}`} strokeWidth={1.8} />
    </button>
    {menuOpen && <div className="absolute right-0 top-full z-50 mt-2 max-h-[calc(100dvh-4.5rem)] w-[min(360px,calc(100vw-1rem))] overflow-y-auto rounded-xl border border-[#ead9ca] bg-[#fffdfa] shadow-xl">
      <div className="flex items-center gap-3 border-b border-[#f1e4d6] bg-[#fff7e6] px-4 py-4">
        <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[#fff0c7] text-[#941333]">{auth.user?.photoURL ? <img src={auth.user.photoURL} alt="" className="size-full object-cover" /> : <CircleUserRound size={28} />}</span>
        <div className="min-w-0 flex-1">{auth.user ? <><p className="text-xs font-medium text-slate-500">My Account</p><p className="truncate text-sm font-semibold text-slate-900">{auth.user.displayName || auth.user.email || "Browse Qatar member"}</p></> : <><p className="text-base font-bold text-slate-900">Welcome to Browse Qatar</p><p className="mt-0.5 text-xs text-slate-500">Sign in to manage your account and listings.</p></>}</div>
      </div>
      {!auth.user && <div className="border-b border-[#f1e4d6] p-3"><button type="button" onClick={handleLogin} className="w-full rounded-md bg-[#941333] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#6f1028]">{ENABLE_SIGNUP ? "Login / Sign up" : "Login"}</button></div>}
      <div className="p-2">
        <button type="button" onClick={handleManageOffers} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-[#fff1c9]"><Camera size={18} className="text-[#941333]" />Start selling</button>
        <button type="button" onClick={handleManageOffers} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-[#fff1c9]"><FileText size={18} className="text-[#941333]" />My Listings & Offers</button>
        <Link to="/favourites" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-[#fff1c9]"><Heart size={18} className="text-[#941333]" />Wishlist</Link>
        <Link to="/faq" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-[#fff1c9]"><CircleHelp size={18} className="text-[#941333]" />Help</Link>
      </div>
      <div className="border-t border-[#ead9ca] p-2">
        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">Browse categories</p>
        <div className="grid grid-cols-2 gap-1">{categories.map((item) => <Link key={item.id} to={`/marketplace/${item.id}`} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 text-xs text-slate-600 hover:bg-[#fff1c9] hover:text-[#941333]">{item.id === "classifieds" ? "Classifieds" : item.name.replace(/ Buy & Sell| Deal/, "")}</Link>)}</div>
      </div>
      <div className="border-t border-[#ead9ca] p-2">
        <Link to="/about" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-[#fff1c9]">About Us</Link>
        {auth.user && <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-700"><LogOut size={18} />Log out</button>}
      </div>
    </div>}
  </div>;
}

export function PostingNudge({ vertical }: { vertical?: string } = {}) {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const CategoryIcon = categoryIcons[vertical || ""] || Tag;

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
      <div className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-[#e8c8c6] bg-[#fffdfa] p-3 pr-10 shadow-xl shadow-[#5b1827]/15">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-[#fff0c7] text-[#941333]"><CategoryIcon size={28} aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#941333]">Have something to share?</p>
          <p className="mt-1 text-sm font-bold leading-5 text-[#30252a]">List it on Browse Qatar</p>
          <MarketplacePostAction className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#941333] hover:text-[#6f1028]">Start posting <ArrowRight size={13} /></MarketplacePostAction>
        </div>
        <button type="button" onClick={() => { setDismissed(true); setVisible(false); }} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-[#806d70] transition hover:bg-[#fff1c9] hover:text-[#30252a]" aria-label="Dismiss posting prompt"><X size={15} /></button>
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

export function MarketplaceHeader({ search, onSearch, vertical }: { search?: string; onSearch?: (value: string) => void; vertical?: string }) {
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
      <header className="sticky top-0 z-40 w-full border-b border-[#ead9ca] bg-[#fffdfa]/95 px-4 pt-2 backdrop-blur-md sm:px-6 sm:pt-3 lg:px-10 lg:pt-4">
        <div ref={menuRef} className="relative flex flex-nowrap items-center gap-1 sm:gap-3 lg:gap-5">
          <details className="group relative shrink-0 lg:hidden">
            <summary aria-label="Toggle category navigation" className="grid size-9 cursor-pointer list-none place-items-center rounded-xl bg-[#fff1c9] text-[#941333] transition hover:bg-[#fbe7b2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#941333] sm:size-11 [&::-webkit-details-marker]:hidden">
              <Menu className="size-5 sm:size-6" aria-hidden="true" />
            </summary>
            <nav aria-label="Main navigation" className="absolute left-0 top-[calc(100%+0.75rem)] z-50 flex w-56 flex-col gap-1 rounded-2xl border border-[#f1e4d6] bg-white p-3 shadow-lg">
              <Link to="/" onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")} className="rounded-full bg-[#fff5dc] px-4 py-2 text-sm font-semibold text-[#7e1831] transition hover:bg-[#f9e8c3]">Home</Link>
              {categories.map((category) => <Link key={category.id} to={`/marketplace/${category.id}`} onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")} className="rounded-full bg-[#fff5dc] px-4 py-2 text-sm font-semibold text-[#7e1831] transition hover:bg-[#f9e8c3]">{category.id === "classifieds" ? "Classifieds" : category.name.replace(/ Buy & Sell| Deal/, "")}</Link>)}
            </nav>
          </details>
          <Link to="/" className="flex min-w-0 shrink-0 items-center" aria-label="Browse Qatar home"><img src="/bqLogo.jpg" alt="Browse Qatar" className="h-auto w-[76px] object-contain min-[390px]:w-[96px] sm:w-[150px] lg:w-[180px]" /></Link>
          <form className="flex h-8 min-w-[56px] flex-1 items-center gap-1 overflow-hidden rounded-full border border-[#e8c8c6] bg-white px-1.5 shadow-[0_2px_10px_rgba(102,30,44,0.04)] focus-within:border-[#941333] sm:h-11 sm:min-w-[120px] sm:gap-2.5 sm:rounded-lg sm:border-2 sm:py-0 sm:pl-3.5 sm:pr-0 lg:ml-auto lg:max-w-[460px]" onSubmit={(event) => event.preventDefault()}>
            <Search size={14} className="ml-0.5 shrink-0 text-[#941333] sm:ml-0 sm:size-[19px]" />
            <input value={search || ""} onChange={(event) => onSearch?.(event.target.value)} placeholder={vertical ? `Search ${verticalConfig[vertical]?.name || "listings"}` : "Search cars, offers, homes and more"} className="h-full min-w-0 flex-1 border-0 bg-transparent px-1 text-xs text-[#30252a] outline-none placeholder:text-[#8b7b7f] sm:px-3 sm:pr-2 sm:text-sm" />
            <button type="submit" className="hidden h-full shrink-0 items-center gap-2 bg-[#941333] px-4 text-sm font-semibold text-white transition hover:bg-[#6f1028] sm:flex"><Search size={16} /> Search</button>
          </form>
          <div className="ml-auto flex shrink-0 items-center gap-0 text-[#8c1534] sm:gap-1.5 lg:gap-4">
          <MarketplacePostAction className="relative size-6 shrink-0 rounded-full bg-[#fff0c7] text-[#941333] transition hover:bg-[#fbe7b2] sm:inline-flex sm:h-11 sm:w-auto sm:items-center sm:justify-center sm:gap-2 sm:rounded-full sm:border-2 sm:border-[#941333] sm:bg-transparent sm:px-4 sm:text-sm sm:font-extrabold sm:shadow-sm sm:hover:bg-[#fff0c7]"><span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-black leading-none sm:static sm:translate-x-0 sm:translate-y-0">+</span><span className="hidden sm:inline">SELL</span></MarketplacePostAction>
          <Link to="/favourites" className="grid size-8 shrink-0 place-items-center rounded-full text-[#6b5157] transition hover:bg-[#fff1c9] sm:rounded-lg sm:size-10" aria-label="Favorites"><Heart size={18} className="sm:size-5" /></Link>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#6b5157] transition hover:bg-[#fff1c9] sm:rounded-lg sm:h-10 sm:w-10" aria-label={auth.user ? "Open account menu" : "Open login menu"} aria-expanded={menuOpen}>
            <CircleUserRound size={20} className={auth.user ? "text-[#941333]" : ""} />
          </button>
          </div>
          {menuOpen && <div className="absolute right-2 top-full z-50 mt-2 max-h-[calc(100dvh-4.5rem)] w-[min(360px,calc(100vw-1rem))] overflow-y-auto rounded-xl border border-[#ead9ca] bg-[#fffdfa] shadow-xl sm:right-6 lg:right-8">
            <div className="flex items-center gap-3 border-b border-[#f1e4d6] bg-[#fff7e6] px-4 py-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[#fff0c7] text-[#941333]">{auth.user?.photoURL ? <img src={auth.user.photoURL} alt="" className="h-full w-full object-cover" /> : <CircleUserRound size={28} />}</span>
              <div className="min-w-0 flex-1">{auth.user ? <><p className="text-xs font-medium text-slate-500">My Account</p><p className="truncate text-sm font-semibold text-slate-900">{auth.user.displayName || auth.user.email || "Browse Qatar member"}</p></> : <><p className="text-base font-bold text-slate-900">Welcome to Browse Qatar</p><p className="mt-0.5 text-xs text-slate-500">Sign in to manage your account and listings.</p></>}</div>
            </div>
            {!auth.user && <div className="border-b border-[#f1e4d6] p-3"><button type="button" onClick={handleLogin} className="w-full rounded-md bg-[#941333] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#6f1028]">{ENABLE_SIGNUP ? "Login / Sign up" : "Login"}</button></div>}
            <div className="p-2">
              <button type="button" onClick={handleManageOffers} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-[#fff1c9]"><Camera size={18} className="text-[#941333]" />Start selling</button>
              <button type="button" onClick={handleManageOffers} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-[#fff1c9]"><FileText size={18} className="text-[#941333]" />My Listings & Offers</button>
              <Link to="/favourites" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-[#fff1c9]"><Heart size={18} className="text-[#941333]" />Wishlist</Link>
              <Link to="/faq" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-[#fff1c9]"><CircleHelp size={18} className="text-[#941333]" />Help</Link>
            </div>
            <div className="border-t border-[#ead9ca] p-2">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">Browse categories</p>
              <div className="grid grid-cols-2 gap-1">{categories.map((item) => <Link key={item.id} to={`/marketplace/${item.id}`} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 text-xs text-slate-600 hover:bg-[#fff1c9] hover:text-[#941333]">{item.id === "classifieds" ? "Classifieds" : item.name.replace(/ Buy & Sell| Deal/, "")}</Link>)}</div>
            </div>
            <div className="border-t border-[#ead9ca] p-2">
              <Link to="/about" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-[#fff1c9]">About Us</Link>
              <Link to="/" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-[#fff1c9]">Back to Home</Link>
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
  const favoriteSource = isRestaurant ? "offer" : "listing";
  const favoriteVertical = isRestaurant ? "restaurants" : vertical;
  const isFavorite = favorites.some((favorite) =>
    String(favorite.itemId ?? favorite.id) === String(listing.id) &&
    (favorite.source || "offer") === favoriteSource &&
    (favorite.verticalId || (favoriteSource === "offer" ? "restaurants" : "classifieds")) === favoriteVertical
  );
  const favoriteItem = {
    id: listing.id,
    itemId: String(listing.id),
    source: favoriteSource,
    verticalId: favoriteVertical,
    title: listing.title || (isRestaurant ? "Restaurant offer" : "Marketplace listing"),
    description: listing.description || "",
    restaurantId: Number(listing.restaurantId) || 0,
    cuisine: listing.cuisine || "",
    originalPrice: Number(listing.originalPrice ?? listing.pricing?.originalPrice) || 0,
    discountedPrice: Number(listing.discountedPrice ?? listing.pricing?.discountedPrice) || 0,
    offerType: listing.offerType || "Offer",
    validFrom: listing.validFrom || listing.validity?.from || "",
    validTo: listing.validTo || listing.validity?.to || "",
    imageUrl: imageOf(listing),
    location: locationOf(listing),
    country: listing.country || listing.location?.country,
    category: listing.category || verticalConfig[vertical]?.name,
    pricing: listing.pricing,
    attributes: listing.attributes,
    availability: listing.active !== false && listing.status !== "inactive",
  } as const;

  return <Link to={href} state={{ listing }} className="group min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-slate-400 hover:shadow-md">
    {isRestaurant ? <>
      <div className="relative overflow-hidden">
        <img src={imageOf(listing)} alt={listing.title || "Restaurant offer"} loading="lazy" className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.03] sm:h-44" onError={(event) => { event.currentTarget.src = "/bqLogo.jpg"; }} />
        <span className="absolute right-2 top-2 rounded-full bg-[#0878d1] px-2.5 py-1 text-xs font-bold text-white">{SHOW_DISCOUNTED_PRICE || Number(listing.originalPrice) === Number(listing.discountedPrice) ? `QAR ${Number(amount || 0).toLocaleString()}` : `${Math.round((1 - Number(listing.discountedPrice) / Number(listing.originalPrice)) * 100)}% OFF`}</span>
        <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleFavorite(favoriteItem); }} aria-label={isFavorite ? "Remove offer from favorites" : "Add offer to favorites"} className="absolute left-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-500 transition hover:bg-white">
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
        <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleFavorite(favoriteItem); }} aria-label={isFavorite ? "Remove listing from favorites" : "Add listing to favorites"} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-slate-600 transition hover:bg-white">
          <Heart size={16} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
        </button>
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

export function CategoryStrip({ active }: { active?: string }) {
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const categoryNavRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollIndicators = () => {
    const nav = categoryNavRef.current;
    if (!nav) return;
    setCanScrollLeft(nav.scrollLeft > 2);
    setCanScrollRight(nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 2);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSpotlightIndex((index) => (index + 1) % marketplaceSpotlight.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const nav = categoryNavRef.current;
    if (!nav) return;
    updateScrollIndicators();
    const resizeObserver = new ResizeObserver(updateScrollIndicators);
    resizeObserver.observe(nav);
    window.addEventListener("resize", updateScrollIndicators);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollIndicators);
    };
  }, []);

  const scrollCategories = (direction: "left" | "right") => {
    categoryNavRef.current?.scrollBy({ left: direction === "left" ? -180 : 180, behavior: "smooth" });
  };

  const spotlight = marketplaceSpotlight[spotlightIndex];

  return (
    <nav id="marketplace-categories" aria-label="Marketplace categories" className="border-b border-[#ead9ca] bg-[#fffdfa]">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8">
        <div className="group/category-scroll relative min-w-0 flex-1">
        <div ref={categoryNavRef} onScroll={updateScrollIndicators} className="flex min-w-0 gap-2 overflow-x-auto py-2 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-3 sm:overflow-visible sm:py-4 sm:pr-0 lg:gap-4">
          {categories.map((category) => {
            const Icon = categoryIcons[category.id] || Building2;
            return <Link key={category.id} to={`/marketplace/${category.id}`} className={`flex min-w-[76px] shrink-0 flex-col items-center gap-1 rounded-xl px-1.5 py-1 text-center text-[11px] font-semibold transition hover:bg-[#fff7e6] sm:min-w-0 sm:gap-1.5 sm:text-sm ${active === category.id ? "text-[#941333]" : "text-[#5d4c50]"}`}>
              <span className="grid size-10 place-items-center rounded-full bg-[#fff0c7] text-[#941333] sm:size-14"><Icon className="size-5 sm:size-7" strokeWidth={2.6} aria-hidden="true" /></span>
              <span>{category.id === "classifieds" ? "Classifieds" : category.name.replace(/ Buy & Sell| Deal/, "")}</span>
            </Link>;
          })}
        </div>
        {canScrollLeft && <>
          <span className="pointer-events-none absolute bottom-1 left-0 top-0 w-12 bg-gradient-to-r from-[#fffdfa] via-[#fffdfa]/90 to-transparent sm:hidden" aria-hidden="true" />
          <button type="button" onClick={() => scrollCategories("left")} aria-label="Scroll categories left" title="Previous categories" className="absolute left-1 top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-[#ead9ca] bg-white/95 text-[#941333] shadow-sm transition hover:bg-[#fff1c9] sm:hidden"><ChevronLeft size={18} /></button>
        </>}
        {canScrollRight && <>
          <span className="pointer-events-none absolute bottom-1 right-0 top-0 w-12 bg-gradient-to-l from-[#fffdfa] via-[#fffdfa]/90 to-transparent sm:hidden" aria-hidden="true" />
          <button type="button" onClick={() => scrollCategories("right")} aria-label="Scroll categories right" title="More categories" className="absolute right-1 top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-[#ead9ca] bg-white/95 text-[#941333] shadow-sm transition hover:bg-[#fff1c9] sm:hidden"><ChevronRight size={18} /></button>
        </>}
        </div>
        <Link key={spotlight.title} to={`/marketplace/${spotlight.vertical}?category=${encodeURIComponent(spotlight.category)}`} className="group hidden h-[82px] w-[340px] shrink-0 items-center gap-3 overflow-hidden rounded-xl border border-[#e8c8c6] bg-[#fff7e6] p-2 transition hover:border-[#941333] hover:bg-[#fff1c9] lg:flex xl:w-[390px]">
          <img src={spotlight.image} alt="" className="h-full w-[96px] shrink-0 rounded-md object-cover" />
          <span aria-live="polite" className="min-w-0 flex-1"><span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#941333]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#a20e3c]" />Popular right now</span><span className="mt-1 block truncate text-sm font-bold text-[#30252a]">{spotlight.title}</span><span className="block truncate text-xs text-[#806d70]">{spotlight.detail}</span></span>
          <ArrowRight size={17} className="mr-2 shrink-0 text-[#806d70] transition group-hover:translate-x-1 group-hover:text-[#941333]" />
        </Link>
      </div>
    </nav>
  );
}

function CategoryJump() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 360);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!visible) return null;

  return <button
    type="button"
    onClick={() => {
      const categories = document.getElementById("marketplace-categories");
      if (!categories) return;
      const stickyHeaderOffset = window.innerWidth < 640 ? 56 : 72;
      window.scrollTo({ top: window.scrollY + categories.getBoundingClientRect().top - stickyHeaderOffset, behavior: "smooth" });
    }}
    aria-label="Go to category navigation"
    title="Browse categories"
    className="fixed bottom-5 left-4 z-30 grid h-12 w-12 place-items-center rounded-full border border-[#e8c8c6] bg-gradient-to-br from-[#941333] to-[#b22b4a] text-white shadow-lg shadow-[#5b1827]/25 transition hover:-translate-y-0.5 hover:shadow-xl sm:bottom-7 sm:left-6"
  ><LayoutGrid size={21} aria-hidden="true" /></button>;
}

export function ModernMarketplaceHome() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { listings, loading } = useMarketplaceListings();
  const filtered = useMemo(() => listings.filter((item) => !search || `${item.title} ${item.description} ${locationOf(item)}`.toLowerCase().includes(search.toLowerCase())), [listings, search]);
  return <div className="min-h-screen bg-[#fffdfa] text-[#30252a]">
    <Helmet>
      <title>Browse Qatar | Marketplace for Listings, Offers, Services and Jobs</title>
      <meta name="description" content="Discover local listings and restaurant offers across Qatar: vehicles, accommodation, services, classifieds, jobs, and dining deals." />
      <link rel="canonical" href="https://browseqatar.com/" />
      <link rel="alternate" type="text/markdown" href="https://browseqatar.com/content/marketplace.md" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Browse Qatar | Qatar Marketplace" />
      <meta property="og:description" content="Explore local listings, restaurant offers, vehicles, accommodation, services, classifieds and jobs across Qatar." />
      <meta property="og:url" content="https://browseqatar.com/" />
      <meta property="og:image" content="https://browseqatar.com/bqLogo.jpg" />
      <meta name="twitter:card" content="summary" />
    </Helmet>
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
    <ModernMarketplaceFooter variant="v2" />
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
      const searchable = `${item.title || ""} ${item.description || ""} ${locationOf(item)} ${item.category || ""} ${item.restaurant?.name || ""} ${JSON.stringify(item.attributes || {})}`.toLowerCase();
      return searchable.includes(term);
    });
  }, [listings, search]);

  return <div className="min-h-screen bg-[#fffdfa] text-[#30252a]">
    <Helmet>
      <title>{search ? `Search: ${search.slice(0, 60)} | Browse Qatar` : "Search the Qatar Marketplace | Browse Qatar"}</title>
      <meta name="description" content="Search Browse Qatar for local listings and offers across vehicles, accommodation, services, classifieds, jobs, and restaurants." />
      <meta name="robots" content="noindex,follow" />
      <link rel="canonical" href="https://browseqatar.com/marketplace/search" />
    </Helmet>
    <MarketplaceHeader search={search} onSearch={setSearch} />
    <CategoryStrip />
    <main className="mx-auto min-h-[45vh] max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
        <div><p className="text-xs font-bold uppercase tracking-wide text-[#0878d1]">Marketplace search</p><h1 className="mt-1 text-xl font-bold sm:text-2xl">{search ? `Results for ΓÇ£${search}ΓÇ¥` : "Search listings"}</h1></div>
        {!loading && search && <p className="text-sm text-slate-500">{filtered.length} listings</p>}
      </div>
      {loading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-lg bg-slate-200" />)}</div> : filtered.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{filtered.map((item) => <ListingCard key={`${item.vertical}-${item.id}`} listing={item} vertical={item.vertical || "vehicles"} />)}</div> : <div className="rounded-lg border border-slate-200 bg-white px-5 py-12 text-center"><Search className="mx-auto text-slate-300" size={32} /><h2 className="mt-3 font-bold">{search ? "No listings found" : "Enter a search to browse listings"}</h2><p className="mt-1 text-sm text-slate-500">Try another search or choose a category to explore.</p></div>}
    </main>
    <ModernMarketplaceFooter variant="v2" />
  </div>;
}

function VerticalRefinePanel({ vertical, metadata, fields, cuisineFilter, categoryFilter, refineFilters, setRefineFilters, selectCuisine, selectCategory, mobileDrawer = false, onClose, onApply, hasPendingChanges = false }: {
  vertical: string;
  metadata?: ApiVertical | null;
  fields: RefineField[];
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
  const refineFields = fields;
  const subcategories = refineConfig?.subcategories || metadata?.subcategories || [];
  const fieldGroups = Array.from(refineFields.reduce((groups, field) => {
    const group = field.group || "More filters";
    groups.set(group, [...(groups.get(group) || []), field]);
    return groups;
  }, new Map<string, RefineField[]>()));
  const autoCloseChoices = vertical === "restaurants" || vertical === "classifieds";
  const [optionSearch, setOptionSearch] = useState<Record<string, string>>({});
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
        <label className="block text-xs font-semibold text-[#6b5157]">{field.label}{field.unit ? ` (${field.unit})` : ""}</label>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" inputMode="numeric" aria-label={`${field.label} minimum`} placeholder="Min" value={refineFilters[`${field.key}Min`] || ""} onChange={(event) => updateFilter(`${field.key}Min`, event.target.value)} className="min-w-0 rounded-lg border border-[#e8c8c6] bg-white/90 px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-[#941333] focus:ring-2 focus:ring-[#941333]/15" />
          <input type="number" inputMode="numeric" aria-label={`${field.label} maximum`} placeholder="Max" value={refineFilters[`${field.key}Max`] || ""} onChange={(event) => updateFilter(`${field.key}Max`, event.target.value)} className="min-w-0 rounded-lg border border-[#e8c8c6] bg-white/90 px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-[#941333] focus:ring-2 focus:ring-[#941333]/15" />
        </div>
      </div>;
    }
    if (field.type === "multiselect") {
      const selectedValues = (refineFilters[field.key] || "").split(",").filter(Boolean);
      const visibleOptions = (field.options || []).filter((option) => option.toLowerCase().includes((optionSearch[field.key] || "").toLowerCase()));
      return <fieldset key={field.key} className="space-y-2">
        <legend className="block text-xs font-semibold text-[#6b5157]">{field.label}</legend>
        {(field.options?.length || 0) > 5 && <input type="search" value={optionSearch[field.key] || ""} onChange={(event) => setOptionSearch((current) => ({ ...current, [field.key]: event.target.value }))} placeholder={`Search ${field.label.toLowerCase()}...`} aria-label={`Search ${field.label}`} className="w-full rounded-lg border border-[#e8c8c6] bg-white px-2.5 py-2 text-xs outline-none focus:border-[#941333]" />}
        {visibleOptions.map((option) => <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={selectedValues.includes(option)} onChange={(event) => {
            const nextValues = event.target.checked ? [...selectedValues, option] : selectedValues.filter((value) => value !== option);
            updateFilter(field.key, nextValues.join(","));
            closeAfterChoice();
          }} className="size-4 rounded border-[#d7aeb0] accent-[#941333]" />
          {option}
        </label>)}
      </fieldset>;
    }
    return <label key={field.key} className="block space-y-1.5">
      <span className="block text-xs font-semibold text-[#6b5157]">{field.label}</span>
      {field.type === "select" ? <select value={refineFilters[field.key] || ""} onChange={(event) => { updateFilter(field.key, event.target.value); closeAfterChoice(); }} className="w-full rounded-lg border border-[#e8c8c6] bg-white/90 px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-[#941333] focus:ring-2 focus:ring-[#941333]/15">
        <option value="">Any</option>
        {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
      </select> : <input type="text" value={refineFilters[field.key] || ""} onChange={(event) => updateFilter(field.key, event.target.value)} className="w-full rounded-lg border border-[#e8c8c6] bg-white/90 px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-[#941333] focus:ring-2 focus:ring-[#941333]/15" />}
    </label>;
  };
  const clearFilters = () => setRefineFilters({});

  const panel = <div className={`rounded-2xl border border-[#e8c8c6] bg-gradient-to-br from-[#fff7e6] via-[#fffdfa] to-[#fff0c7]/70 p-4 shadow-[0_8px_24px_rgba(111,16,40,0.08)] ${mobileDrawer ? "max-h-[82dvh] overflow-y-auto rounded-t-xl pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl" : "lg:sticky lg:top-28"}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-[#851432]">Refine your search</h2>
        <div className="flex items-center gap-3">
          {Object.values(refineFilters).some(Boolean) && <button type="button" onClick={clearFilters} className="text-xs font-semibold text-[#941333] hover:underline">Clear all</button>}
          {mobileDrawer && <button type="button" onClick={onClose} aria-label="Close filters" className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"><X size={18} /></button>}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#e8c8c6] bg-[#fffdfa]/80 px-3 py-2 text-sm text-[#6b5157]"><MapPin size={16} className="text-[#941333]" /> Doha, Qatar</div>
      {vertical === "restaurants" ? <>
        <div className="mt-5 flex items-center justify-between gap-2"><label className="text-sm font-semibold text-[#6b5157]">What's on your mind?</label>{cuisineFilter && <button type="button" onClick={() => { selectCuisine(null); closeAfterChoice(); }} className="text-xs font-semibold text-[#941333] hover:underline">Clear</button>}</div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">{cuisineLists.map((cuisine) => <button key={cuisine.name} type="button" onClick={() => { selectCuisine(cuisine.name === cuisineFilter ? null : cuisine.name); closeAfterChoice(); }} aria-pressed={cuisineFilter === cuisine.name} className={`flex min-w-0 items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs transition ${cuisineFilter === cuisine.name ? "border-[#941333] bg-[#fff0c7] font-semibold text-[#851432] shadow-sm" : "border-[#f1e4d6] bg-white/70 text-slate-600 hover:border-[#d7aeb0] hover:bg-[#fff1c9]"}`}><img src={cuisine.img} alt="" className="h-8 w-8 shrink-0 rounded-full bg-slate-100 object-contain" /><span className="truncate">{cuisine.name}</span></button>)}</div>
      </> : refineConfig || refineFields.length > 0 ? <div className="mt-5 space-y-2">
        {subcategories.length > 0 && <details className="group rounded-xl border border-[#f1e4d6] bg-white/70">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-3 text-sm font-semibold text-[#50343b] [&::-webkit-details-marker]:hidden">
            Category <ChevronDown size={16} className="text-[#941333] transition group-open:rotate-180" />
          </summary>
          <div className="border-t border-[#f1e4d6] p-3">
            <select value={refineFilters.subcategory || ""} onChange={(event) => { updateFilter("subcategory", event.target.value); closeAfterChoice(); }} className="w-full rounded-lg border border-[#e8c8c6] bg-white/90 px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-[#941333] focus:ring-2 focus:ring-[#941333]/15">
              <option value="">All categories</option>
              {subcategories.map((subcategory) => <option key={subcategory} value={subcategory}>{subcategory}</option>)}
            </select>
          </div>
        </details>}
        {fieldGroups.map(([group, fields]) => <details key={group} className="group rounded-xl border border-[#f1e4d6] bg-white/70">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-3 text-sm font-semibold text-[#50343b] [&::-webkit-details-marker]:hidden">
            {group} <ChevronDown size={16} className="text-[#941333] transition group-open:rotate-180" />
          </summary>
          <div className="space-y-4 border-t border-[#f1e4d6] p-3">{fields.map(renderField)}</div>
        </details>)}
      </div> : <>
        <label className="mt-4 block text-sm font-semibold text-[#6b5157]">Category</label>
        <div className="mt-2 space-y-2">{vertical === "classifieds" ? <>
          <button type="button" onClick={() => { selectCategory(null); closeAfterChoice(); }} aria-pressed={!categoryFilter} className={`block w-full text-left text-sm ${!categoryFilter ? "font-semibold text-[#0878d1]" : "text-slate-600 hover:text-slate-900"}`}>All categories</button>
          {["Furniture", "Home Appliances", "Electronics", "Mobile Phones", "TVs", "Computers", "Books", "Clothing", "Sports", "Other"].map((item) => <button key={item} type="button" onClick={() => { selectCategory(categoryFilter === item ? null : item); closeAfterChoice(); }} aria-pressed={categoryFilter === item} className={`block w-full text-left text-sm ${categoryFilter === item ? "font-semibold text-[#0878d1]" : "text-slate-600 hover:text-slate-900"}`}>{item}</button>)}
        </> : categories.map((item) => <Link key={item.id} to={`/marketplace/${item.id}`} className={`block text-sm ${vertical === item.id ? "font-semibold text-[#0878d1]" : "text-slate-600 hover:text-slate-900"}`}>{item.id === "classifieds" ? "Classifieds" : item.name}</Link>)}</div>
      </>}
      {mobileDrawer && !autoCloseChoices && hasPendingChanges && <div className="sticky bottom-0 mt-5 border-t border-[#ead9ca] bg-[#fffdfa] pt-3"><button type="button" onClick={onApply} className="w-full rounded-lg bg-[#941333] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6f1028]">Apply filters</button></div>}
      <div className="mt-5 border-t border-[#ead9ca] pt-4"><p className="text-sm font-semibold text-[#6b5157]">Trust</p><p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={15} className="text-[#941333]" /> Browse Qatar local listings</p></div>
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
  const [verticalMetadata, setVerticalMetadata] = useState<ApiVertical | null>(null);
  const searchQuery = searchParams.get("search") || searchParams.get("q") || "";
  const [search, setSearch] = useState(searchQuery);
  const [sort, setSort] = useState("latest");
  const [randomSeed] = useState(() => Math.random());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refineFilters, setRefineFilters] = useState<Record<string, string>>({});
  const [draftRefineFilters, setDraftRefineFilters] = useState<Record<string, string>>({});
  const { listings, loading, restaurantDirectory } = useMarketplaceListings(vertical);
  const config = verticalConfig[vertical];
  const seo = marketplaceSeo[vertical] || {
    label: config?.name || "Local Listings",
    description: `Browse ${config?.name || "local"} listings and offers in Qatar on Browse Qatar. Review listing details and contact the advertiser directly.`,
  };
  const categoryFilter = searchParams.get("category");
  const cuisineFilter = searchParams.get("cuisine");
  const restaurantFilter = searchParams.get("restaurant");

  useEffect(() => {
    let active = true;
    setVerticalMetadata(null);
    getAllVerticals()
      .then((items) => {
        if (active) setVerticalMetadata(items.find((item) => item.id === vertical) || null);
      })
      .catch((error) => console.error("Could not load marketplace filter definitions:", error));
    return () => { active = false; };
  }, [vertical]);

  useEffect(() => {
    setSort("latest");
    setSearch(searchQuery);
    setRefineFilters({});
    setDraftRefineFilters({});
  }, [vertical, searchQuery]);

  const refineFields = useMemo(() => buildRefineFields(vertical, verticalMetadata).map((field) => {
    const uniqueListingOptions = new Map<string, string>();
    listings.forEach((item) => {
      const value = getListingFieldValue(item, field.aliases);
      const values = Array.isArray(value) ? value : [value];
      values
        .filter((option): option is string | number => typeof option === "string" || typeof option === "number")
        .map((option) => String(option).trim())
        .filter(Boolean)
        .forEach((option) => {
          const normalized = option.toLocaleLowerCase();
          if (!uniqueListingOptions.has(normalized)) uniqueListingOptions.set(normalized, option);
        });
    });
    const listingOptions = Array.from(uniqueListingOptions.values()).sort((a, b) => a.localeCompare(b));
    const listingDrivenVehicleFilters = ["make", "model", "engineSize", "wheelDrive", "fuelType", "cylinders", "transmission", "color", "insideColor"];
    if (vertical === "vehicles" && listingDrivenVehicleFilters.includes(field.key) && listingOptions.length) {
      return { ...field, type: "multiselect" as const, options: listingOptions };
    }
    if ((field.type === "select" || field.type === "multiselect") && !field.options?.length && listingOptions.length) {
      return { ...field, options: listingOptions };
    }
    return field;
  }), [listings, vertical, verticalMetadata]);

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
      const matchesAttributes = refineFields.every((field) => {
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
        if (field.type === "multiselect") {
          const selectedValues = selected.split(",").filter(Boolean);
          const actualValues = Array.isArray(actual) ? actual.map(String) : String(actual ?? "").split(/[,|]/).map((value) => value.trim());
          return selectedValues.every((value) => actualValues.some((actualValue) => actualValue.toLowerCase() === value.toLowerCase()));
        }
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
  }, [categoryFilter, cuisineFilter, listings, randomSeed, refineFields, refineFilters, restaurantFilter, search, sort]);
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
  refineFields.forEach((field) => {
    const value = refineFilters[field.key];
    if (value) activeFilterChips.push({ key: field.key, label: `${field.label}: ${value.split(",").join(", ")}`, clear: () => setRefineFilters((current) => ({ ...current, [field.key]: "" })) });
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
  const categoryCanonical = `https://browseqatar.com/marketplace/${encodeURIComponent(vertical)}`;
  const categorySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${seo.label} in Qatar | Browse Qatar`,
    description: seo.description,
    url: categoryCanonical,
    isPartOf: { "@type": "WebSite", name: "Browse Qatar", url: "https://browseqatar.com/" },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: filtered.slice(0, 20).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title || `${seo.label} listing`,
        url: `https://browseqatar.com/marketplace/${encodeURIComponent(vertical)}/${encodeURIComponent(String(item.id))}`,
      })),
    },
  };
  return <div className="min-h-screen bg-[#fffdfa] text-[#30252a]">
    <Helmet>
      <title>{`${seo.label} in Qatar | Browse Qatar`}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={categoryCanonical} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={`${seo.label} in Qatar | Browse Qatar`} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={categoryCanonical} />
      <meta property="og:image" content="https://browseqatar.com/bqLogo.jpg" />
      <script type="application/ld+json">{jsonLd(categorySchema)}</script>
      <script type="application/ld+json">{jsonLd(marketplaceBreadcrumbs(vertical, seo.label))}</script>
    </Helmet>
    <MarketplaceHeader search={search} onSearch={setSearch} vertical={vertical} />
    <CategoryStrip active={vertical} />
    <CategoryJump />
    <main className="mx-auto max-w-[1320px] px-4 py-3 sm:px-6 sm:py-5 lg:px-8">
      <div className="mb-1 flex min-w-0 items-center justify-between gap-2 text-xs text-[#806d70] sm:mb-5">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
          <Link to="/" className="shrink-0 hover:text-[#941333]">Home</Link>
          <span className="shrink-0">/</span>
          <span className="truncate text-[#5d464c]">{config?.name || vertical}</span>
        </div>
        <MarketplaceCampaignSlot vertical={vertical} placement="mobile" />
      </div>
      <div className="relative mb-2 flex min-w-0 flex-nowrap items-center justify-between gap-1 border-b border-[#ead9ca] pb-2 sm:mb-3 sm:gap-4">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#fff0c7] text-[#941333] sm:h-9 sm:w-9"><Icon size={17} /></span><div className="min-w-0"><h1 className="truncate text-sm font-bold leading-tight text-[#3b252b] sm:text-xl">{config?.name || vertical}</h1><p className="truncate text-[10px] leading-4 text-[#806d70] sm:text-xs">{filtered.length} listings around Qatar</p></div></div>
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden w-[min(42vw,620px)] -translate-x-1/2 -translate-y-1/2 lg:block">
          <div className="pointer-events-auto">
            <MarketplaceCampaignSlot vertical={vertical} placement="desktop" />
          </div>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <button type="button" onClick={() => setSort("best-value")} title="Best value deals" aria-label="Best value deals" className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1.5 text-[10px] font-semibold transition sm:px-2.5 sm:text-xs ${sort === "best-value" ? "border-amber-400 bg-amber-50 text-amber-800" : "border-amber-200 bg-white text-amber-700 hover:bg-amber-50"}`}><Sparkles size={14} className="animate-pulse" /><span>Best Value Deals</span></button>
          <label className="flex shrink-0 items-center gap-1 text-[0px] text-slate-600 sm:gap-2 sm:text-sm"><span className="hidden sm:inline">Sort by</span><select aria-label="Sort by" value={sort} onChange={(event) => setSort(event.target.value)} className="w-[78px] rounded-md border border-slate-300 bg-white px-1.5 py-1.5 text-xs text-slate-800 sm:w-auto sm:px-3 sm:py-2 sm:text-sm">{vertical === "restaurants" ? <><option value="latest">Latest</option>{ENABLE_RANDOM_SORT && <option value="random">Random</option>}<option value="best-value">Best Value</option><option value="price-asc">Low to High</option><option value="price-desc">High to Low</option></> : <><option value="latest">Latest</option><option value="best-value">Best Value</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></>}</select></label>
        </div>
      </div>
      {vertical === "restaurants" && <RestaurantMarquee restaurants={restaurantDirectory} />}
      <div className="sticky top-[60px] z-20 mb-2 flex min-w-0 items-center gap-1.5 bg-[#fffdfa]/95 py-1 backdrop-blur lg:hidden sm:mb-3">
        <button type="button" onClick={openFilters} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#d7aeb0] bg-gradient-to-r from-[#941333] to-[#b22b4a] px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-[#941333]/20"><SlidersHorizontal size={14} /> Filters</button>
        {activeFilterChips.length > 0 && <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap py-0" aria-label="Applied filters">
          {activeFilterChips.map((chip) => <button key={chip.key} type="button" onClick={chip.clear} aria-label={`Remove filter ${chip.label}`} className="inline-flex max-w-[55vw] shrink-0 items-center gap-1 rounded-full border border-[#e8c8c6] bg-[#fff0c7] px-2 py-0.5 text-[11px] font-medium text-[#851432] hover:bg-[#fbe7b2]"><span className="truncate">{chip.label}</span><X size={12} className="shrink-0" /></button>)}
          <button type="button" onClick={clearAllAppliedFilters} className="shrink-0 px-1 py-0.5 text-[11px] font-semibold text-[#941333] hover:underline">Clear all</button>
        </div>}
      </div>
      {filtersOpen && <VerticalRefinePanel vertical={vertical} metadata={verticalMetadata} fields={refineFields} cuisineFilter={cuisineFilter} categoryFilter={categoryFilter} refineFilters={autoApplyMobileFilters ? refineFilters : draftRefineFilters} setRefineFilters={autoApplyMobileFilters ? setRefineFilters : setDraftRefineFilters} selectCuisine={selectCuisine} selectCategory={selectCategory} mobileDrawer onClose={closeFilters} onApply={applyDraftFilters} hasPendingChanges={hasPendingFilterChanges} />}
      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <VerticalRefinePanel vertical={vertical} metadata={verticalMetadata} fields={refineFields} cuisineFilter={cuisineFilter} categoryFilter={categoryFilter} refineFilters={refineFilters} setRefineFilters={setRefineFilters} selectCuisine={selectCuisine} selectCategory={selectCategory} />
        <section>
          {loading ? <div className={vertical === "restaurants" ? "grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4" : "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"}>{Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-lg bg-slate-200" />)}</div> : filtered.length ? <div className={vertical === "restaurants" ? "grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4" : "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"}>{filtered.map((item) => <ListingCard key={item.id} listing={item} vertical={vertical} />)}</div> : <div className="rounded-lg border border-slate-200 bg-white px-5 py-12 text-center"><Search className="mx-auto text-slate-300" size={32} /><h2 className="mt-3 font-bold">No listings found</h2><p className="mt-1 text-sm text-slate-500">Try another search or explore a different category.</p></div>}
        </section>
      </div>
    </main>
    <ModernMarketplaceFooter variant="v2" />
  </div>;
}

export function ModernMarketplaceDetail() {
  const { vertical = "vehicles", id = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingRecord | null>(location.state?.listing || null);
  const [provider, setProvider] = useState<ListingRecord | null>(null);
  const [verticalMetadata, setVerticalMetadata] = useState<ApiVertical | null>(null);
  const [loading, setLoading] = useState(!location.state?.listing);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const category = verticalConfig[vertical];
  const CategoryIcon = categoryIcons[vertical] || Building2;

  useEffect(() => {
    let active = true;
    if (location.state?.listing) {
      setListing(location.state.listing);
      setLoading(false);
      return () => { active = false; };
    }
    async function load() {
      setLoading(true);
      try {
        const service = getVerticalService(vertical);
        const found = await service.getById(id);
        const mock = (mockListings[vertical] || []).find((item) => String(item.id) === id);
        if (active) setListing(found || mock || null);
      } catch (error) {
        console.error(`Could not load ${vertical} listing ${id}:`, error);
        if (active) setListing((mockListings[vertical] || []).find((item) => String(item.id) === id) || null);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [id, location.state, vertical]);

  useEffect(() => {
    setSelectedImage(0);
    setProvider(null);
    if (!listing) return;
    const embeddedProvider = listing.provider && typeof listing.provider === "object" ? listing.provider as ListingRecord : null;
    setProvider(embeddedProvider);
    const providerId = String(listing.providerId || "");
    if (!/^\d+$/.test(providerId)) return;
    let active = true;
    getProviderById(Number(providerId))
      .then((result: ListingRecord) => { if (active) setProvider(result); })
      .catch((error: unknown) => console.warn("Could not load listing seller contact details:", error));
    return () => { active = false; };
  }, [listing]);

  useEffect(() => {
    let active = true;
    getAllVerticals()
      .then((items) => { if (active) setVerticalMetadata(items.find((item) => item.id === vertical) || null); })
      .catch((error) => console.error("Could not load listing attribute definitions:", error));
    return () => { active = false; };
  }, [vertical]);

  const amount = listing ? amountOf(listing) : null;
  const images = listing ? imagesOf(listing) : [];
  const attributes = listing ? listingAttributesOf(listing) : {};
  const definitions = [
    ...(verticalConfig[vertical]?.additionalAttributes || []),
    ...(verticalMetadata?.additionalAttributes || []),
  ];
  const attributeLabels = new Map(definitions.map((attribute) => [attribute.name, attribute]));
  const groupedAttributes = Object.entries(attributes).reduce((groups, [key, value]) => {
    if (value === undefined || value === null || value === "") return groups;
    const definition = attributeLabels.get(key);
    const defaultGroup = ["make", "model", "year"].includes(key) ? "Vehicle"
      : ["mileage", "engineSize", "wheelDrive", "fuelType", "cylinders", "transmission"].includes(key) ? "Performance"
        : ["color", "insideColor", "doors", "seats", "seatType"].includes(key) ? "Style"
          : ["convenience", "entertainment", "exteriorFeatures"].includes(key) ? "Features" : "Other details";
    const group = definition?.group || defaultGroup;
    groups.set(group, [...(groups.get(group) || []), { key, label: definition?.label || humanizeAttribute(key), value }]);
    return groups;
  }, new Map<string, Array<{ key: string; label: string; value: unknown }>>());
  const primaryFields = vertical === "vehicles"
    ? [
      { key: "mileage", label: "Mileage", aliases: ["mileage", "km", "odometer"] },
      { key: "fuelType", label: "Fuel", aliases: ["fuelType", "fuel"] },
      { key: "engineSize", label: "Engine", aliases: ["engineSize", "engine"] },
      { key: "cylinders", label: "Cylinders", aliases: ["cylinders", "cylinder"] },
    ].map((field) => ({ ...field, value: field.aliases.map((key) => attributes[key]).find((value) => value !== undefined && value !== null && value !== "") }))
      .filter((field) => field.value !== undefined)
    : Object.entries(attributes).filter(([, value]) => value !== undefined && value !== null && value !== "").slice(0, 4)
      .map(([key, value]) => ({ key, label: attributeLabels.get(key)?.label || humanizeAttribute(key), value }));
  const phone = listing && [listing.contactPhone, listing.phone, listing.providerPhone, listing.contact?.phone, provider?.phone].find((value) => typeof value === "string" && value.trim()) as string | undefined;
  const whatsapp = listing && [listing.whatsapp, listing.whatsApp, listing.whatsappNumber, listing.contact?.whatsapp, provider?.whatsapp, provider?.phone, phone].find((value) => typeof value === "string" && value.trim()) as string | undefined;
  const whatsappDigits = whatsapp?.replace(/\D/g, "");
  const formattedAmount = amount === null ? "" : numericValue(amount)?.toLocaleString() || String(amount);
  const currency = listing?.pricing?.currency || listing?.currency || "QAR";
  const seo = marketplaceSeo[vertical] || {
    label: category?.name || "Local Listings",
    description: `Browse ${category?.name || "local"} listings in Qatar on Browse Qatar.`,
  };
  const detailTitle = listing?.title || `${seo.label} listing`;
  const detailDescription = listing
    ? `${String(listing.description || `View details for ${detailTitle}.`).replace(/\s+/g, " ").trim().slice(0, 130)}${locationOf(listing) ? ` Location: ${locationOf(listing)}.` : ""}`.slice(0, 160)
    : seo.description;
  const detailCanonical = `https://browseqatar.com/marketplace/${encodeURIComponent(vertical)}/${encodeURIComponent(id)}`;

  return <div className="min-h-screen bg-[#fffdfa] text-[#30252a]">
    <Helmet>
      <title>{`${detailTitle} | ${seo.label} in Qatar | Browse Qatar`}</title>
      <meta name="description" content={detailDescription} />
      <link rel="canonical" href={detailCanonical} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={`${detailTitle} | Browse Qatar`} />
      <meta property="og:description" content={detailDescription} />
      <meta property="og:url" content={detailCanonical} />
      {images[0] && <meta property="og:image" content={images[0]} />}
      <script type="application/ld+json">{jsonLd(marketplaceBreadcrumbs(vertical, seo.label, detailTitle))}</script>
    </Helmet>
    <MarketplaceHeader vertical={vertical} />
    <CategoryStrip active={vertical} />
    <CategoryJump />
    <main className="mx-auto w-full min-w-0 max-w-[1320px] overflow-x-clip px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <button type="button" onClick={() => navigate(`/marketplace/${vertical}`)} className="mb-3 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-[#6b5157] transition hover:bg-[#fff1c9] hover:text-[#941333]"><ArrowLeft size={18} /> Back to {category?.name || "listings"}</button>
      {loading ? <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]"><div className="aspect-[16/10] animate-pulse rounded-2xl bg-slate-200" /><div className="h-80 animate-pulse rounded-2xl bg-slate-100" /></div> : listing ? vertical === "restaurants" ? <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
        <section className="overflow-hidden rounded-xl border border-[#ead9ca] bg-[#fffdfa] shadow-sm"><div className="aspect-[4/3] bg-[#fff7e6]"><img src={imageOf(listing)} alt={listing.title || "Listing"} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = "/bqLogo.jpg"; }} /></div><div className="flex items-center justify-between border-t border-[#ead9ca] px-4 py-3 text-sm text-[#6b5157]"><span className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#fff0c7] text-[#941333]"><CategoryIcon size={17} /></span>{category?.name || vertical}</span><button type="button" className="inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-[#fff1c9]"><Share2 size={16} /> Share</button></div></section>
        <aside className="h-fit rounded-xl border border-[#ead9ca] bg-[#fffdfa] p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-[#941333]">{listing.category || category?.name}</p><h1 className="mt-2 text-2xl font-bold leading-tight text-[#30252a]">{listing.title || "Listing details"}</h1>{amount !== null && <p className="mt-4 text-3xl font-bold text-[#851432]">{currency} {formattedAmount}</p>}<p className="mt-3 flex items-center gap-2 text-sm text-[#806d70]"><MapPin size={16} />{locationOf(listing)}</p><div className="mt-5 border-t border-[#ead9ca] pt-4"><h2 className="font-bold text-[#30252a]">Description</h2><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{listing.description || "Contact the seller for more information about this listing."}</p></div><button type="button" onClick={() => setEnquiryOpen(true)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#941333] px-4 py-3 font-bold text-white transition hover:bg-[#6f1028]"><Tag size={17} /> Contact seller</button><p className="mt-3 text-center text-xs text-[#806d70]">Browse Qatar marketplace</p></aside>
      </div> : <div className="min-w-0 space-y-5">
        <section className="relative isolate flex h-24 items-center overflow-hidden rounded-2xl border border-[#ead9ca] bg-[#341a24] shadow-sm sm:h-32">
          <img src={category?.featuredImage || categoryImages[vertical] || imageOf(listing)} alt="" className="absolute inset-0 -z-20 size-full object-cover opacity-70" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#35121f]/95 via-[#581c31]/75 to-transparent" />
          <div className="w-full overflow-hidden px-5 py-3 sm:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffe0a2] sm:text-xs">Browse Qatar spotlight · Sponsored</p>
            <div className="mt-1 whitespace-nowrap text-lg font-black text-white sm:text-2xl">
              <span className="inline-block animate-marquee">Discover trusted {vertical === "vehicles" ? "cars and vehicles" : (category?.name || "local listings").toLowerCase()} across Qatar&nbsp; · &nbsp;Find your next great deal&nbsp; &nbsp;</span>
            </div>
          </div>
          <span className="absolute bottom-2 right-3 rounded-full border border-white/40 bg-black/20 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-white/90 sm:right-5 sm:text-[10px]">Ad placement</span>
        </section>

        <div className="border-b border-[#ead9ca] pb-4">
          <div className="flex items-center gap-2 text-xs text-[#806d70]"><Link to="/" className="hover:text-[#941333]">Home</Link><span>/</span><Link to={`/marketplace/${vertical}`} className="hover:text-[#941333]">{category?.name || vertical}</Link><span>/</span><span className="truncate text-slate-500">Listing #{listing.id}</span></div>
          <div className="mt-3 flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0c7] text-[#941333] sm:size-12"><CategoryIcon size={22} /></span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#941333]">{listing.category || listing.subcategory || category?.name}</p>
              <h1 className="mt-1 text-xl font-black leading-tight text-[#30252a] sm:text-3xl">{listing.title || "Listing details"}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                {primaryFields.map((field) => <span key={field.key} className="inline-flex items-center gap-1 rounded-full border border-[#d7aeb0] bg-[#fff7e6] px-2.5 py-1 text-[11px] font-medium text-[#6b333e] sm:text-xs"><Check size={12} className="text-[#941333]" />{field.label}: {displayAttribute(field.value)}</span>)}
                <span className="inline-flex items-center gap-1 rounded-full border border-[#d7aeb0] bg-[#fff7e6] px-2.5 py-1 text-[11px] font-medium text-[#6b333e] sm:text-xs"><MapPin size={12} className="text-[#941333]" />{locationOf(listing)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.75fr)] lg:gap-6">
          <div className="min-w-0 space-y-5">
            <section className="overflow-hidden rounded-2xl border border-[#ead9ca] bg-white shadow-sm">
              <div className="relative mx-auto flex aspect-[4/3] w-full min-w-0 items-center justify-center bg-[#f2e9e5] sm:aspect-[16/10]">
                {images.length > 0 ? <img src={images[selectedImage] || images[0]} alt={`${listing.title || "Listing"} photo ${selectedImage + 1}`} className="size-full object-contain object-center" onError={(event) => { event.currentTarget.src = "/bqLogo.jpg"; }} /> : <div className="grid size-full place-items-center text-[#806d70]"><CategoryIcon size={48} /><span className="mt-2 text-sm">No photos added yet</span></div>}
                {listing.promoted || listing.isPromoted || listing.featured ? <span className="absolute left-3 top-3 rounded-md bg-[#941333] px-2.5 py-1 text-xs font-bold text-white shadow">Promoted</span> : null}
                {images.length > 1 && <>
                  <button type="button" onClick={() => setSelectedImage((index) => (index - 1 + images.length) % images.length)} aria-label="Previous photo" className="absolute left-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#851432] shadow hover:bg-white"><ArrowLeft size={18} /></button>
                  <button type="button" onClick={() => setSelectedImage((index) => (index + 1) % images.length)} aria-label="Next photo" className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#851432] shadow hover:bg-white"><ArrowRight size={18} /></button>
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold text-white">{selectedImage + 1} / {images.length}</span>
                </>}
              </div>
              {images.length > 1 && <div className="flex gap-2 overflow-x-auto border-t border-[#f1e4d6] p-3">
                {images.map((url, index) => <button key={`${url}-${index}`} type="button" onClick={() => setSelectedImage(index)} aria-label={`View photo ${index + 1}`} aria-pressed={selectedImage === index} className={`size-[76px] shrink-0 overflow-hidden rounded-lg border-2 transition sm:size-20 ${selectedImage === index ? "border-[#941333] shadow" : "border-transparent opacity-75 hover:opacity-100"}`}><img src={url} alt="" className="size-full object-cover" /></button>)}
              </div>}
              <div className="flex items-center justify-between border-t border-[#ead9ca] px-4 py-3 text-xs text-[#6b5157]"><span className="flex items-center gap-2"><Camera size={15} className="text-[#941333]" />{images.length} photos</span><span>Listing ID #{listing.id}</span></div>
            </section>

            {groupedAttributes.size > 0 && <div className="min-w-0 space-y-4">
              {Array.from(groupedAttributes).map(([group, values]) => <section key={group} className="overflow-hidden rounded-2xl border border-[#ead9ca] bg-white shadow-sm">
                <h2 className="border-b border-[#f1e4d6] bg-gradient-to-r from-[#fff7e6] to-white px-4 py-3 text-base font-bold text-[#50343b] sm:px-5">{group === "Vehicle" ? "Basic details" : group}</h2>
                <dl className="divide-y divide-[#f1e4d6] px-4 sm:px-5">
                  {values.map((attribute) => <div key={attribute.key} className="flex min-w-0 flex-col gap-1 py-3 text-sm sm:flex-row sm:items-start sm:justify-between sm:gap-5">
                    <dt className="font-medium text-[#806d70]">{attribute.label}</dt>
                    <dd className="min-w-0 max-w-full break-words text-left font-semibold text-[#30252a] [overflow-wrap:anywhere] sm:max-w-[65%] sm:text-right">
                      {["convenience", "entertainment", "exteriorFeatures"].includes(attribute.key) ? <span className="flex flex-wrap gap-1.5 sm:justify-end">{displayAttribute(attribute.value).split(/[,|\n]/).map((feature) => feature.trim()).filter(Boolean).map((feature) => <span key={feature} className="rounded-full bg-[#fff1c9] px-2.5 py-1 text-xs text-[#6b333e]">{feature}</span>)}</span> : displayAttribute(attribute.value)}
                    </dd>
                  </div>)}
                </dl>
              </section>)}
            </div>}
          </div>

          <aside className="w-full min-w-0 space-y-4 lg:sticky lg:top-24">
            <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-[#ead9ca] bg-white p-5 shadow-[0_8px_24px_rgba(111,16,40,0.08)] sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#941333]">{listing.category || listing.subcategory || category?.name}</p>
              <h2 className="mt-2 text-xl font-bold leading-snug text-[#30252a]">{listing.title || "Listing details"}</h2>
              <p className="mt-2 flex min-w-0 items-center gap-2 text-sm text-[#806d70]"><MapPin size={16} className="shrink-0 text-[#941333]" /><span className="min-w-0 break-words [overflow-wrap:anywhere]">{locationOf(listing)}</span></p>
              <div className="mt-4 rounded-xl bg-gradient-to-r from-[#fff7e6] to-[#fff0c7] p-4">
                <p className="text-xs font-medium text-[#806d70]">Price</p>
                <p className="mt-1 break-words text-2xl font-black leading-tight text-[#851432] [overflow-wrap:anywhere] sm:text-3xl">{amount !== null ? `${currency} ${formattedAmount}` : "Contact for price"}</p>
                {listing.pricing?.unit && <p className="mt-1 text-xs text-[#806d70]">Per {listing.pricing.unit}</p>}
              </div>
              <div className="mt-4 grid min-w-0 gap-2">
                {phone ? <a href={`tel:${phone}`} className="inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-[#941333] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#6f1028]"><Phone size={17} />Call seller</a> : <button type="button" onClick={() => setEnquiryOpen(true)} className="inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-[#941333] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#6f1028]"><Phone size={17} />Request a call</button>}
                {whatsappDigits ? <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-[#19a567] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#138552]"><MessageCircle size={18} />WhatsApp seller</a> : <button type="button" onClick={() => setEnquiryOpen(true)} className="inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-[#b8e4ce] bg-[#effaf4] px-4 py-3 text-sm font-bold text-[#137246] transition hover:bg-[#e2f5ea]"><MessageCircle size={18} />Contact seller</button>}
              </div>
              {phone && <p className="mt-3 text-center text-xs text-[#806d70]">Seller contact: {phone}</p>}
              <div className="mt-5 border-t border-[#f1e4d6] pt-4">
                <h3 className="text-sm font-bold text-[#30252a]">Description</h3>
                <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-[#66565a] [overflow-wrap:anywhere]">{listing.description || "Contact the seller for more information about this listing."}</p>
              </div>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#806d70]"><ShieldCheck size={14} className="text-[#941333]" /> Browse Qatar local listing</p>
            </section>
          </aside>
        </div>
      </div> : <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center"><h1 className="text-xl font-bold">Listing not found</h1><p className="mt-2 text-sm text-slate-500">This listing may have been removed or is temporarily unavailable.</p><button type="button" onClick={() => navigate(`/marketplace/${vertical}`)} className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"><ArrowLeft size={16} /> Browse category</button></div>}
    </main>
    {listing && <ListingEnquiryPopup open={enquiryOpen} onClose={() => setEnquiryOpen(false)} listingId={listing.id ?? id} adTitle={listing.title || "this listing"} />}
    <ModernMarketplaceFooter variant="v2" />
  </div>;
}
