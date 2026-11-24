import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  BriefcaseBusiness,
  CarFront,
  CalendarDays,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudSun,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  MapPin,
  Menu,
  Moon,
  Newspaper,
  Search,
  ShieldCheck,
  Sun,
  Tag,
  TrendingUp,
  Utensils,
  Wrench,
} from "lucide-react";
import { verticalConfig } from "../config/verticalConfig";
import { getAllActiveListings } from "../services/listingService";
import { Listing } from "../types/listing";
import { MarketplaceAccountMenu, MarketplacePostAction, ModernMarketplaceFooter, PostingNudge } from "./ModernMarketplace";

const categoryVisuals: Record<string, { description: string; icon: typeof Utensils; image: string; imageAlt: string }> = {
  restaurants: { description: "Great food. Amazing offers.", icon: Utensils, image: "/images/restaurants.png", imageAlt: "A plate of chicken machboos with aromatic rice" },
  vehicles: { description: "Cars, bikes & more.", icon: CarFront, image: "/images/vehicles.png", imageAlt: "Vehicles with the Doha skyline behind them" },
  accommodations: { description: "Homes, apartments & more.", icon: Home, image: "/images/accommodation.png", imageAlt: "A modern villa with a garden and swimming pool" },
  services: { description: "Professionals you can trust.", icon: Wrench, image: "/images/services.png", imageAlt: "A service professional at work" },
  classifieds: { description: "Buy & sell easily.", icon: Tag, image: "/images/classifieds.png", imageAlt: "A comfortable sofa in a bright modern living room" },
  jobs: { description: "Find your next opportunity.", icon: BriefcaseBusiness, image: "/images/jobs.png", imageAlt: "A professional working at a laptop" },
};

const heroSlides = [
  { id: "doha", imageUrl: "/images/doha-hero.png", imageAlt: "Doha skyline at sunset with a traditional dhow on the water" },
  { id: "vehicles", imageUrl: categoryVisuals.vehicles.image, imageAlt: categoryVisuals.vehicles.imageAlt },
  { id: "accommodations", imageUrl: categoryVisuals.accommodations.image, imageAlt: categoryVisuals.accommodations.imageAlt },
  { id: "restaurants", imageUrl: categoryVisuals.restaurants.image, imageAlt: categoryVisuals.restaurants.imageAlt },
];

const demoNews = [
  { section: "Community", headline: "Local Qatar headlines and community updates", summary: "A preview of the latest stories from across Qatar.", image: "/images/doha-hero.png", imageAlt: "Doha skyline at sunset" },
  { section: "Business", headline: "Business and market updates from Doha", summary: "Business news will appear here when a news feed is connected.", image: "/images/jobs.png", imageAlt: "Professional working at a laptop" },
  { section: "Culture", headline: "Culture, lifestyle, and events around Qatar", summary: "Discover what is happening in the local community.", image: "/images/chef.jpg", imageAlt: "Chef preparing a meal" },
];

const demoStocks = [
  { symbol: "QNBK", name: "QNB Group", price: "QAR 1.00", change: "+0.0%" },
  { symbol: "QIBK", name: "Qatar Islamic Bank", price: "QAR 1.00", change: "+0.0%" },
  { symbol: "QEWS", name: "Qatar Electricity & Water", price: "QAR 1.00", change: "+0.0%" },
];

const demoEvents = [
  { category: "Community", title: "Doha Community Market", location: "Doha, Qatar" },
  { category: "Family", title: "Family Activities Around Qatar", location: "Qatar" },
  { category: "Arts & Culture", title: "Local Arts and Culture Weekend", location: "Doha, Qatar" },
];

type WeatherSummary = {
  temperature: number;
  code: number;
  isDay: boolean;
};

type PrayerTimings = Record<string, string>;

type HomeListing = Listing & {
  verticalId?: string;
  active?: boolean;
};

function getQatarDate(offsetDays = 0) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Qatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const date = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day) + offsetDays));
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getUTCDate())}-${pad(date.getUTCMonth() + 1)}-${date.getUTCFullYear()}`;
}

function getQatarMinutes(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Qatar",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return Number(values.hour) * 60 + Number(values.minute);
}

function parsePrayerMinutes(time: string) {
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function formatPrayerTime(minutes: number) {
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function getWeatherInfo(code: number, isDay: boolean) {
  if (code === 0) return { label: "Clear sky", icon: isDay ? Sun : Moon };
  if (code <= 3) return { label: "Partly cloudy", icon: isDay ? CloudSun : Cloud };
  if (code === 45 || code === 48) return { label: "Fog", icon: CloudFog };
  if (code >= 51 && code <= 57) return { label: "Drizzle", icon: CloudDrizzle };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { label: "Rain", icon: CloudDrizzle };
  if (code >= 71 && code <= 86) return { label: "Snow", icon: Cloud };
  if (code >= 95) return { label: "Thunderstorm", icon: CloudLightning };
  return { label: "Current conditions", icon: Cloud };
}

export default function BrowseQatarHomeV2() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const categoryNavRef = useRef<HTMLElement>(null);
  const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = useState(false);
  const [canScrollCategoriesRight, setCanScrollCategoriesRight] = useState(false);
  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const [weatherError, setWeatherError] = useState("");
  const [prayerTimings, setPrayerTimings] = useState<{ today: PrayerTimings; tomorrow: PrayerTimings } | null>(null);
  const [prayerError, setPrayerError] = useState("");
  const [clock, setClock] = useState(() => new Date());
  const [latestListings, setLatestListings] = useState<HomeListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState("");
  const categories = useMemo(() => Object.values(verticalConfig)
    .filter((vertical) => vertical.enabled && categoryVisuals[vertical.id])
    .map((vertical) => ({ ...vertical, ...categoryVisuals[vertical.id] })), []);
  const normalizedSearch = search.trim().toLowerCase();
  const visibleCategories = normalizedSearch
    ? categories.filter((category) => `${category.name} ${category.description}`.toLowerCase().includes(normalizedSearch))
    : categories;
  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  const nextPrayer = useMemo(() => {
    if (!prayerTimings) return null;
    const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    const now = getQatarMinutes(clock);
    for (const name of prayers) {
      const time = parsePrayerMinutes(prayerTimings.today[name] || "");
      if (time !== null && time > now) return { name, minutes: time };
    }
    for (const name of prayers) {
      const time = parsePrayerMinutes(prayerTimings.tomorrow[name] || "");
      if (time !== null) return { name, minutes: time };
    }
    return null;
  }, [clock, prayerTimings]);

  useEffect(() => {
    let active = true;
    const loadWeather = async () => {
      try {
        const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=25.2854&longitude=51.531&current=temperature_2m,weather_code,is_day&timezone=Asia%2FQatar");
        if (!response.ok) throw new Error(`Weather request failed (${response.status})`);
        const result = await response.json();
        if (typeof result.current?.temperature_2m !== "number" || typeof result.current?.weather_code !== "number") {
          throw new Error("Weather response is missing current conditions");
        }
        if (active) {
          setWeather({
            temperature: result.current.temperature_2m,
            code: result.current.weather_code,
            isDay: result.current.is_day === 1,
          });
          setWeatherError("");
        }
      } catch (error) {
        console.error("[BrowseQatarHomeV2] Failed to load Doha weather:", error);
        if (active) setWeatherError("Weather is temporarily unavailable.");
      }
    };
    void loadWeather();
    const interval = window.setInterval(loadWeather, 15 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadPrayerTimings = async () => {
      try {
        const getTimings = async (date: string) => {
          const response = await fetch(`https://api.aladhan.com/v1/timingsByCity/${date}?city=Doha&country=Qatar&method=10`);
          if (!response.ok) throw new Error(`Prayer time request failed (${response.status})`);
          const result = await response.json();
          if (result.code !== 200 || !result.data?.timings) throw new Error("Prayer time response is missing timings");
          return result.data.timings as PrayerTimings;
        };
        const [today, tomorrow] = await Promise.all([getTimings(getQatarDate()), getTimings(getQatarDate(1))]);
        if (active) {
          setPrayerTimings({ today, tomorrow });
          setPrayerError("");
        }
      } catch (error) {
        console.error("[BrowseQatarHomeV2] Failed to load Doha prayer times:", error);
        if (active) setPrayerError("Prayer times are temporarily unavailable.");
      }
    };
    void loadPrayerTimings();
    const interval = window.setInterval(loadPrayerTimings, 60 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setClock(new Date()), 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;
    const loadListings = async () => {
      setListingsLoading(true);
      try {
        const result = await getAllActiveListings();
        if (!Array.isArray(result)) throw new Error("Active listings response is not a list");
        const listings = (result as HomeListing[])
          .filter((listing) => {
            const verticalId = listing.verticalId || listing.vertical;
            return Boolean(verticalId && categoryVisuals[verticalId] && listing.title && (listing.active === true || listing.status === "active"));
          })
          .sort((left, right) => Date.parse(right.createdAt || "") - Date.parse(left.createdAt || ""))
          .slice(0, 6);
        if (active) {
          setLatestListings(listings);
          setListingsError("");
        }
      } catch (error) {
        console.error("[BrowseQatarHomeV2] Failed to load active listings:", error);
        if (active) setListingsError("Latest listings are temporarily unavailable.");
      } finally {
        if (active) setListingsLoading(false);
      }
    };
    void loadListings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const nav = categoryNavRef.current;
    if (!nav) return;
    const updateScrollIndicators = () => {
      setCanScrollCategoriesLeft(nav.scrollLeft > 2);
      setCanScrollCategoriesRight(nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 2);
    };
    updateScrollIndicators();
    const resizeObserver = new ResizeObserver(updateScrollIndicators);
    resizeObserver.observe(nav);
    window.addEventListener("resize", updateScrollIndicators);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollIndicators);
    };
  }, [categories.length]);

  const scrollCategories = (direction: "left" | "right") => {
    categoryNavRef.current?.scrollBy({ left: direction === "left" ? -180 : 180, behavior: "smooth" });
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/marketplace/search?q=${encodeURIComponent(query)}` : "/marketplace/search");
  };

  const categoryPath = (verticalId: string) => {
    const query = search.trim();
    return `/marketplace/${verticalId}${query ? `?search=${encodeURIComponent(query)}` : ""}`;
  };
  const weatherInfo = weather ? getWeatherInfo(weather.code, weather.isDay) : null;
  const WeatherIcon = weatherInfo?.icon || CloudSun;

  return <main className="min-h-screen bg-[#fffdfa] text-[#24171b]">
    <Helmet>
      <title>Browse Qatar | Qatar Marketplace for Local Listings and Offers</title>
      <meta name="description" content="Find restaurant offers, vehicles, accommodation, services, classifieds and jobs across Qatar. Browse local listings and contact advertisers directly." />
      <link rel="canonical" href="https://browseqatar.com/" />
      <link rel="alternate" type="text/markdown" href="https://browseqatar.com/content/marketplace.md" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Browse Qatar" />
      <meta property="og:title" content="Browse Qatar | Qatar Marketplace" />
      <meta property="og:description" content="Explore local listings and offers across restaurants, vehicles, accommodation, services, classifieds and jobs." />
      <meta property="og:url" content="https://browseqatar.com/" />
      <meta property="og:image" content="https://browseqatar.com/bqLogo.jpg" />
      <meta name="twitter:card" content="summary" />
    </Helmet>
    <header className="sticky top-0 z-40 w-full bg-[#fffdfa]/95 px-4 pt-2 backdrop-blur-md sm:px-6 sm:pt-3 lg:px-10 lg:pt-2">
      <div className="flex flex-nowrap items-center gap-1 border-b border-[#ead9ca] pb-2 sm:gap-3 sm:pb-3 lg:gap-5 lg:pb-2">
        <details className="group relative shrink-0">
          <summary aria-label="Toggle navigation menu" className="grid size-9 cursor-pointer list-none place-items-center rounded-xl bg-[#fff1c9] text-[#941333] transition hover:bg-[#fbe7b2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#941333] sm:size-11 [&::-webkit-details-marker]:hidden">
            <Menu className="size-5 sm:size-6" aria-hidden="true" />
          </summary>
          <nav aria-label="Main navigation" className="absolute left-0 top-[calc(100%+0.75rem)] z-20 flex w-56 flex-col gap-1 rounded-2xl border border-[#f1e4d6] bg-white p-3 shadow-lg">
            {categories.map((category) => <Link key={category.id} to={categoryPath(category.id)} className="rounded-full bg-[#fff5dc] px-4 py-2 text-sm font-semibold text-[#7e1831] transition hover:bg-[#f9e8c3]">{category.id === "classifieds" ? "Classifieds" : category.name.replace(/ Buy & Sell| Deal/, "")}</Link>)}
          </nav>
        </details>

        <Link to="/" className="flex min-w-0 shrink-0 items-center" aria-label="Browse Qatar home">
          <img src="/bqLogo.jpg" alt="Browse Qatar" className="h-auto w-[76px] object-contain min-[390px]:w-[96px] sm:w-[150px] lg:w-[180px]" />
        </Link>

        <form role="search" onSubmit={submitSearch} className="flex h-8 min-w-[56px] flex-1 items-center gap-1 rounded-full border border-[#e8c8c6] bg-white px-1.5 shadow-[0_2px_10px_rgba(102,30,44,0.04)] focus-within:border-[#941333] sm:h-11 sm:min-w-[120px] sm:gap-2.5 sm:px-3.5 lg:ml-auto lg:max-w-[460px] lg:px-5">
          <Search className="size-3.5 shrink-0 text-[#941333] sm:size-5" aria-hidden="true" />
          <label htmlFor="v2-marketplace-search" className="sr-only">Search listings</label>
          <input id="v2-marketplace-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search..." className="min-w-0 flex-1 bg-transparent text-xs text-[#30252a] outline-none placeholder:text-[#777078] sm:text-sm" />
          <button type="submit" className="sr-only">Search</button>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-0 text-[#8c1534] sm:gap-1.5 lg:gap-4">
          <MarketplacePostAction className="inline-flex h-7 shrink-0 items-center gap-0.5 rounded-full border-2 border-[#941333] px-2.5 text-[10px] font-extrabold text-[#941333] shadow-sm transition hover:bg-[#fff0c7] min-[390px]:px-3 min-[390px]:text-[11px] sm:h-11 sm:gap-2 sm:px-4 sm:text-sm"><span className="text-sm leading-none sm:text-lg">+</span> SELL</MarketplacePostAction>
          <Link to="/favourites" aria-label="Saved listings" className="grid size-8 place-items-center rounded-full transition hover:bg-[#fff1c9] sm:size-10"><Heart className="size-[18px] sm:size-6" strokeWidth={1.8} /></Link>
          <MarketplaceAccountMenu />
        </div>
      </div>

      <div className="group/category-scroll relative -mx-4 mt-3 sm:mx-0 sm:mt-5 lg:mt-2">
        <nav ref={categoryNavRef} id="v2-category-shortcuts" onScroll={(event) => {
          const nav = event.currentTarget;
          setCanScrollCategoriesLeft(nav.scrollLeft > 2);
          setCanScrollCategoriesRight(nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 2);
        }} aria-label="Browse categories" className="flex gap-2 overflow-x-auto px-4 pb-1.5 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-between sm:gap-3 sm:overflow-visible sm:px-0 sm:pr-0">
          {categories.map(({ id, name, icon: Icon }) => <Link key={id} to={categoryPath(id)} className="flex min-w-[76px] shrink-0 flex-col items-center gap-1 rounded-xl px-1.5 py-1 text-center text-[11px] font-semibold transition hover:bg-[#fff7e6] sm:min-w-0 sm:gap-1.5 sm:text-sm lg:gap-1 lg:py-0 lg:text-xs">
            <span className="grid size-10 place-items-center rounded-full bg-[#fff0c7] text-[#941333] sm:size-14 lg:size-11"><Icon className="size-5 sm:size-7 lg:size-5" strokeWidth={2.6} aria-hidden="true" /></span>
            <span>{id === "classifieds" ? "Classifieds" : name.replace(/ Buy & Sell| Deal/, "")}</span>
          </Link>)}
        </nav>
        {canScrollCategoriesLeft && <>
          <span className="pointer-events-none absolute bottom-1 left-0 top-0 w-12 bg-gradient-to-r from-[#fffdfa] via-[#fffdfa]/90 to-transparent sm:hidden" aria-hidden="true" />
          <button type="button" onClick={() => scrollCategories("left")} aria-label="Scroll categories left" title="Previous categories" className="absolute left-1 top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-[#ead9ca] bg-white/95 text-[#941333] shadow-sm transition hover:bg-[#fff1c9] sm:hidden"><ChevronLeft size={18} /></button>
        </>}
        {canScrollCategoriesRight && <>
          <span className="pointer-events-none absolute bottom-1 right-0 top-0 w-12 bg-gradient-to-l from-[#fffdfa] via-[#fffdfa]/90 to-transparent sm:hidden" aria-hidden="true" />
          <button type="button" onClick={() => scrollCategories("right")} aria-label="Scroll categories right" title="More categories" className="absolute right-1 top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-[#ead9ca] bg-white/95 text-[#941333] shadow-sm transition hover:bg-[#fff1c9] sm:hidden"><ChevronRight size={18} /></button>
        </>}
      </div>
    </header>

    <div className="w-full px-4 sm:px-6 lg:px-10">
      <section id="home" aria-labelledby="v2-hero-heading" className="mt-4 grid min-h-[190px] grid-cols-[1.05fr_0.95fr] overflow-hidden rounded-[24px] bg-[#fff0c9] sm:mt-6 md:mt-7 md:min-h-[320px] lg:mt-4 lg:min-h-[280px]">
        <div className="relative z-10 flex flex-col items-start px-2.5 py-4 min-[360px]:px-3 min-[390px]:px-4 sm:px-8 sm:py-6 md:justify-center md:px-8 lg:px-8 lg:py-4">
          <p className="mb-2 flex items-center gap-1 text-[8px] font-extrabold text-[#8c1534] sm:mb-3 sm:gap-2 sm:text-sm lg:mb-2 lg:text-xs"><ShieldCheck className="size-3 shrink-0 sm:size-5" strokeWidth={2.3} aria-hidden="true" />QATAR, CLOSER TO YOU</p>
          <h1 id="v2-hero-heading" className="max-w-[600px] text-[clamp(1.1rem,6vw,4.2rem)] font-black leading-[1.02] text-[#851432] md:text-[clamp(2rem,4.2vw,3.75rem)] lg:text-[clamp(1.8rem,3vw,2.8rem)]">Find what you need. Sell what you don&apos;t.</h1>
          <p className="mt-2 max-w-[470px] text-[9px] leading-[1.25] text-[#30252a] min-[390px]:text-[10px] sm:mt-4 sm:text-base lg:mt-2 lg:text-sm">Explore local deals, trusted services and great finds across Qatar.</p>
          <a href="#interests" className="mt-3 inline-flex min-h-8 items-center gap-1 whitespace-nowrap rounded-full bg-[#a20e3c] px-2 py-1.5 text-[10px] font-bold text-white shadow-[0_8px_20px_rgba(128,16,50,0.16)] transition hover:bg-[#84102f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#84102f] min-[390px]:min-h-9 min-[390px]:px-4 min-[390px]:text-[11px] sm:mt-6 sm:min-h-12 sm:gap-4 sm:px-6 sm:py-3 sm:text-base lg:mt-4 lg:min-h-10 lg:gap-2 lg:px-5 lg:py-2 lg:text-sm">Explore Listings <ArrowRight className="size-3.5 sm:size-5 lg:size-4" aria-hidden="true" /></a>
        </div>
        <div role="group" aria-label="Hero image carousel" className="relative -left-[22%] min-h-[190px] w-[122%] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[280px]">
          <img src={heroSlides[activeHeroSlide].imageUrl} alt={heroSlides[activeHeroSlide].imageAlt} className="absolute inset-0 size-full object-cover object-center transition-opacity duration-500 motion-reduce:transition-none [clip-path:polygon(35%_0,100%_0,100%_100%,0_100%)]" />
          <div className="absolute inset-0 bg-[#a20e3c] [clip-path:polygon(35%_0,39%_0,4%_100%,0_100%)]" aria-hidden="true" />
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-full bg-white/90 p-1 shadow-md backdrop-blur-sm sm:bottom-4 sm:right-4">
            <button type="button" onClick={() => setActiveHeroSlide((current) => (current + heroSlides.length - 1) % heroSlides.length)} aria-label="Show previous hero image" className="grid size-8 place-items-center rounded-full text-[#8c1534] transition hover:bg-[#fff0c7] focus-visible:outline-2 focus-visible:outline-[#8c1534]"><ChevronLeft className="size-4" aria-hidden="true" /></button>
            <button type="button" onClick={() => setActiveHeroSlide((current) => (current + 1) % heroSlides.length)} aria-label="Show next hero image" className="grid size-8 place-items-center rounded-full text-[#8c1534] transition hover:bg-[#fff0c7] focus-visible:outline-2 focus-visible:outline-[#8c1534]"><ChevronRight className="size-4" aria-hidden="true" /></button>
          </div>
        </div>
      </section>

      <section aria-label="Doha weather and prayer times" className="mt-2 grid grid-cols-2 gap-1 md:mt-2">
        <article className="flex min-h-[40px] items-center gap-1 rounded-2xl border border-[#f1e4d6] bg-white px-1 py-1 shadow-sm sm:min-h-[54px] sm:gap-2 sm:px-2 sm:py-1.5">
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#fff0c7] text-[#941333] sm:size-8"><WeatherIcon className="size-3 sm:size-4" aria-hidden="true" /></span>
          <div className="flex min-w-0 flex-1 items-baseline gap-1 sm:gap-3">
            <p className="sr-only shrink-0 text-xs font-bold uppercase leading-none tracking-wide text-[#8c1534] sm:not-sr-only">Doha weather</p>
            <p className="min-w-0 truncate text-[10px] leading-none text-[#6b5157] sm:text-sm" title={weatherError || (weatherInfo ? weatherInfo.label : "Loading current conditions…")}>{weatherError || (weatherInfo ? weatherInfo.label : "Loading current conditions…")}</p>
          </div>
          {weather && <p className="shrink-0 text-[10px] font-semibold leading-none text-[#30252a] sm:text-xl">{Math.round(weather.temperature)}°C</p>}
        </article>
        <article className="flex min-h-[40px] items-center gap-1 rounded-2xl border border-[#f1e4d6] bg-white px-1 py-1 shadow-sm sm:min-h-[54px] sm:gap-2 sm:px-2 sm:py-1.5">
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#fff0c7] text-[#941333] sm:size-8"><Moon className="size-3 sm:size-4" aria-hidden="true" /></span>
          <div className="flex min-w-0 flex-1 items-baseline gap-1 sm:gap-3">
            <p className="sr-only shrink-0 text-xs font-bold uppercase leading-none tracking-wide text-[#8c1534] sm:not-sr-only">Next prayer in Doha</p>
            <p className="min-w-0 truncate text-[10px] leading-none text-[#6b5157] sm:text-sm" title={prayerError || (nextPrayer ? nextPrayer.name : "Loading prayer times…")}>{prayerError || (nextPrayer ? nextPrayer.name : "Loading prayer times…")}</p>
          </div>
          {nextPrayer && <p className="shrink-0 text-[10px] font-semibold leading-none text-[#30252a] sm:text-xl">{formatPrayerTime(nextPrayer.minutes)}</p>}
        </article>
      </section>

      <section id="interests" aria-label="Browse categories and latest listings" className="pb-8 pt-3 sm:pt-4 lg:pt-4">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-6 2xl:gap-10">
          <div>
            <h2 id="v2-interests-heading" className="mb-4 text-left text-xl font-black text-[#8c1534] sm:text-2xl xl:text-3xl">BROWSE BY INTEREST</h2>
            {visibleCategories.length > 0 ? <div className="grid grid-cols-1 gap-3 min-[300px]:grid-cols-2">
              {visibleCategories.map(({ id, name, description, icon: Icon, image, imageAlt }) => <Link key={id} to={categoryPath(id)} className="group relative isolate box-border aspect-[1.5/1] w-full min-w-0 overflow-hidden rounded-[18px] bg-[#e8ded1] shadow-sm min-[300px]:aspect-[1.1/1] sm:aspect-[1.65/1] lg:aspect-[1.4/1] lg:min-h-[145px] 2xl:aspect-[1.65/1]">
                <img src={image} alt={imageAlt} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" aria-hidden="true" />
                <span className="absolute left-3 top-3 grid size-10 place-items-center rounded-full bg-[#fff0c7] text-[#941333] shadow-sm sm:left-5 sm:top-5 sm:size-14 lg:size-12 2xl:size-14"><Icon className="size-5 sm:size-7 lg:size-6 2xl:size-7" strokeWidth={2.6} aria-hidden="true" /></span>
                <span className="absolute inset-x-3 bottom-3 flex min-w-0 items-end justify-between gap-2 text-white sm:inset-x-5 sm:bottom-4 lg:inset-x-4 lg:bottom-4"><span className="min-w-0 flex-1"><span className="block truncate text-sm font-extrabold leading-tight min-[390px]:text-base sm:text-2xl lg:text-xl 2xl:text-2xl">{id === "classifieds" ? "Classifieds" : name.replace(/ Buy & Sell| Deal/, "")}</span><span className="mt-1 block truncate text-[10px] leading-tight min-[390px]:text-[11px] sm:text-base lg:text-xs 2xl:text-sm">{description}</span></span><span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/70 bg-[#a20e3c] transition group-hover:bg-[#84102f] min-[390px]:size-9 sm:size-12 lg:size-10"><ArrowRight className="size-4 min-[390px]:size-5 sm:size-6 lg:size-5" /></span></span>
              </Link>)}
            </div> : <p role="status" className="rounded-2xl border border-[#f1e4d6] bg-white px-5 py-8 text-center text-sm text-[#6c5d61]">No categories match “{search}”. Try searching for food, cars, or jobs.</p>}
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black text-[#8c1534] sm:text-2xl xl:text-3xl">LATEST LISTINGS</h2>
              <Link to="/marketplace" className="shrink-0 text-sm font-semibold text-[#941333] hover:underline">View all <ArrowRight className="inline size-4" aria-hidden="true" /></Link>
            </div>
            {listingsLoading ? <p role="status" className="rounded-2xl border border-[#f1e4d6] bg-white px-5 py-8 text-center text-sm text-[#6c5d61]">Loading latest listings…</p>
              : listingsError ? <p role="status" className="rounded-2xl border border-[#f1e4d6] bg-white px-5 py-8 text-center text-sm text-[#6c5d61]">{listingsError}</p>
                : latestListings.length > 0 ? <div className="grid grid-cols-2 gap-3 min-[480px]:grid-cols-3">
                  {latestListings.map((listing) => {
                    const verticalId = listing.verticalId || listing.vertical;
                    const visual = categoryVisuals[verticalId];
                    const price = listing.pricing?.discountedPrice ?? listing.pricing?.originalPrice ?? listing.originalPrice;
                    return <Link key={`${verticalId}-${listing.id}`} to={categoryPath(verticalId)} className="group overflow-hidden rounded-2xl border border-[#f1e4d6] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      <img src={listing.imageUrl || visual.image} alt="" loading="lazy" className="h-32 w-full bg-[#f7efe5] object-cover" />
                      <div className="p-3">
                        <p className="truncate text-[10px] font-bold uppercase tracking-wide text-[#941333]">{verticalConfig[verticalId]?.name.replace(/ Buy & Sell| Deal/, "") || verticalId}</p>
                        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold text-[#30252a] group-hover:text-[#941333]">{listing.title}</h3>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          {price !== undefined && price !== null && price !== "" ? <span className="truncate text-sm font-bold text-[#30252a]">{listing.pricing?.currency || "QAR"} {price}</span> : <span className="text-xs text-[#6b5157]">View listing</span>}
                          {listing.location?.city && <span className="flex min-w-0 items-center gap-1 truncate text-[10px] text-[#6b5157]"><MapPin className="size-3 shrink-0" />{listing.location.city}</span>}
                        </div>
                      </div>
                    </Link>;
                  })}
                </div> : <p className="rounded-2xl border border-[#f1e4d6] bg-white px-5 py-8 text-center text-sm text-[#6c5d61]">No active listings to feature right now.</p>}
          </div>
        </div>
      </section>

      <section aria-label="Qatar news and stock market" className="grid gap-5 pb-8 pt-5 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="rounded-2xl border border-[#f1e4d6] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#f1e4d6] pb-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#8c1534] text-[#fff0c7] shadow-sm ring-4 ring-[#fff0c7]/60"><Newspaper className="size-5" aria-hidden="true" /></span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#941333]">Around Qatar</p>
                <h2 className="mt-0.5 text-xl font-black tracking-tight text-[#30252a] sm:text-2xl">Latest News</h2>
              </div>
            </div>
            <span className="rounded-full border border-[#f0dfc8] bg-[#fff7e6] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8c1534]">Demo content</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {demoNews.map((item) => <article key={item.section} className="overflow-hidden rounded-xl bg-[#fffdfa]">
              <img src={item.image} alt={item.imageAlt} loading="lazy" className="h-32 w-full bg-[#f7efe5] object-cover" />
              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#941333]">{item.section}</p>
                <h3 className="mt-2 text-base font-bold leading-snug text-[#30252a]">{item.headline}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6b5157]">{item.summary}</p>
              </div>
            </article>)}
          </div>
          <p className="mt-3 text-xs text-[#6b5157]">Sample headlines only; connect a Qatar news feed for live stories.</p>
        </div>

        <div className="rounded-2xl border border-[#f1e4d6] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#f1e4d6] pb-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#8c1534] text-[#fff0c7] shadow-sm ring-4 ring-[#fff0c7]/60"><TrendingUp className="size-5" aria-hidden="true" /></span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#941333]">Market snapshot</p>
                <h2 className="mt-0.5 text-xl font-black tracking-tight text-[#30252a] sm:text-2xl">Qatar Stock Update</h2>
              </div>
            </div>
            <span className="rounded-full border border-[#f0dfc8] bg-[#fff7e6] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8c1534]">Not live</span>
          </div>
          <div className="divide-y divide-[#f1e4d6]">
            {demoStocks.map((stock) => <div key={stock.symbol} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0"><p className="text-sm font-bold text-[#30252a]">{stock.symbol}</p><p className="truncate text-xs text-[#6b5157]">{stock.name}</p></div>
              <div className="shrink-0 text-right"><p className="text-sm font-semibold text-[#30252a]">{stock.price}</p><p className="text-xs font-semibold text-emerald-700">{stock.change}</p></div>
            </div>)}
          </div>
          <p className="mt-4 text-xs text-[#6b5157]">Demo values for layout only—not investment data.</p>
        </div>
      </section>

      <section aria-labelledby="v2-events-heading" className="pb-12 pt-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#ead9ca] pb-4">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#8c1534] text-[#fff0c7] shadow-sm ring-4 ring-[#fff0c7]/60"><CalendarDays className="size-6" aria-hidden="true" /></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#941333]">What&apos;s on</p>
              <h2 id="v2-events-heading" className="mt-0.5 text-xl font-black tracking-tight text-[#30252a] sm:text-2xl xl:text-3xl">Events in Qatar</h2>
            </div>
          </div>
          <span className="rounded-full border border-[#f0dfc8] bg-[#fff7e6] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8c1534]">Demo events</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {demoEvents.map((event) => <article key={event.title} className="rounded-2xl border border-[#f1e4d6] bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-[#941333]">{event.category}</p>
            <h3 className="mt-2 text-lg font-bold text-[#30252a]">{event.title}</h3>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-[#6b5157]"><MapPin className="size-4" />{event.location}</p>
            <p className="mt-3 text-xs text-[#6b5157]">Sample event · live event feed not connected</p>
          </article>)}
        </div>
      </section>
    </div>
    <ModernMarketplaceFooter variant="v2" />
    <PostingNudge />
  </main>;
}