import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CarFront,
  Heart,
  Home,
  Menu,
  Search,
  ShieldCheck,
  Tag,
  UserRound,
  Utensils,
  Wrench,
} from "lucide-react";
import { verticalConfig } from "../config/verticalConfig";
import { ModernMarketplaceFooter } from "./ModernMarketplace";
import useAuth from "../auth/useAuth";
import { useModal } from "../contexts/ModalContext";

const categoryVisuals: Record<string, { description: string; icon: typeof Utensils; image: string; imageAlt: string }> = {
  restaurants: { description: "Great food. Amazing offers.", icon: Utensils, image: "/images/restaurants.png", imageAlt: "A plate of chicken machboos with aromatic rice" },
  vehicles: { description: "Cars, bikes & more.", icon: CarFront, image: "/images/vehicles.png", imageAlt: "Vehicles with the Doha skyline behind them" },
  accommodations: { description: "Homes, apartments & more.", icon: Home, image: "/images/accommodation.png", imageAlt: "A modern villa with a garden and swimming pool" },
  services: { description: "Professionals you can trust.", icon: Wrench, image: "/images/services.png", imageAlt: "A service professional at work" },
  classifieds: { description: "Buy & sell easily.", icon: Tag, image: "/images/classifieds.png", imageAlt: "A comfortable sofa in a bright modern living room" },
  jobs: { description: "Find your next opportunity.", icon: BriefcaseBusiness, image: "/images/jobs.png", imageAlt: "A professional working at a laptop" },
};

export default function BrowseQatarHomeV2() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const auth = useAuth();
  const { openLogin } = useModal();
  const categories = useMemo(() => Object.values(verticalConfig)
    .filter((vertical) => vertical.enabled && categoryVisuals[vertical.id])
    .map((vertical) => ({ ...vertical, ...categoryVisuals[vertical.id] })), []);
  const normalizedSearch = search.trim().toLowerCase();
  const visibleCategories = normalizedSearch
    ? categories.filter((category) => `${category.name} ${category.description}`.toLowerCase().includes(normalizedSearch))
    : categories;

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/marketplace/search?q=${encodeURIComponent(query)}` : "/marketplace/search");
  };

  const openAccount = () => {
    if (auth.user) navigate("/manage-offers");
    else if (auth.provider === "FIREBASE") openLogin();
    else auth.login();
  };

  const categoryPath = (verticalId: string) => {
    const query = search.trim();
    return `/marketplace/${verticalId}${query ? `?search=${encodeURIComponent(query)}` : ""}`;
  };

  return <main className="min-h-screen bg-[#fffdfa] text-[#24171b]">
    <header className="sticky top-0 z-40 mx-auto max-w-[1440px] bg-[#fffdfa]/95 px-4 pt-2 backdrop-blur-md sm:px-6 sm:pt-3 lg:px-10 lg:pt-4">
      <div className="flex flex-nowrap items-center gap-1.5 sm:gap-3 lg:gap-5">
        <details className="group relative shrink-0">
          <summary aria-label="Toggle navigation menu" className="grid size-9 cursor-pointer list-none place-items-center rounded-xl bg-[#fff1c9] text-[#941333] transition hover:bg-[#fbe7b2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#941333] sm:size-11 [&::-webkit-details-marker]:hidden">
            <Menu className="size-5 sm:size-6" aria-hidden="true" />
          </summary>
          <nav aria-label="Main navigation" className="absolute left-0 top-[calc(100%+0.75rem)] z-20 flex w-56 flex-col gap-1 rounded-2xl border border-[#f1e4d6] bg-white p-3 shadow-lg">
            {categories.map((category) => <Link key={category.id} to={categoryPath(category.id)} className="rounded-full bg-[#fff5dc] px-4 py-2 text-sm font-semibold text-[#7e1831] transition hover:bg-[#f9e8c3]">{category.id === "classifieds" ? "Classifieds" : category.name.replace(/ Buy & Sell| Deal/, "")}</Link>)}
          </nav>
        </details>

        <Link to="/" className="flex min-w-0 shrink-0 items-center" aria-label="Browse Qatar home">
          <img src="/images/bqLogo.png" alt="Browse Qatar" className="h-auto w-[84px] object-contain min-[390px]:w-[104px] sm:w-[150px] lg:w-[190px]" />
        </Link>

        <form role="search" onSubmit={submitSearch} className="flex h-9 min-w-[56px] flex-1 items-center gap-1.5 rounded-full border border-[#e8c8c6] bg-white px-2 shadow-[0_2px_10px_rgba(102,30,44,0.04)] focus-within:border-[#941333] sm:h-11 sm:min-w-[120px] sm:gap-2.5 sm:px-3.5 lg:ml-auto lg:max-w-[460px] lg:px-5">
          <Search className="size-4 shrink-0 text-[#941333] sm:size-5" aria-hidden="true" />
          <label htmlFor="v2-marketplace-search" className="sr-only">Search listings</label>
          <input id="v2-marketplace-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search..." className="min-w-0 flex-1 bg-transparent text-xs text-[#30252a] outline-none placeholder:text-[#777078] sm:text-sm" />
          <button type="submit" className="sr-only">Search</button>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 text-[#8c1534] sm:gap-1.5 lg:gap-4">
          <Link to="/favourites" aria-label="Saved listings" className="grid size-8 place-items-center rounded-full transition hover:bg-[#fff1c9] sm:size-10"><Heart className="size-[18px] sm:size-6" strokeWidth={1.8} /></Link>
          <button type="button" onClick={openAccount} aria-label={auth.user ? "Open account" : "Sign in"} className="grid size-8 place-items-center rounded-full transition hover:bg-[#fff1c9] sm:size-10"><UserRound className="size-[18px] sm:size-6" strokeWidth={1.8} /></button>
        </div>
      </div>

      <nav aria-label="Browse categories" className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:mt-5 sm:justify-between sm:gap-3 sm:px-0">
        {categories.map(({ id, name, icon: Icon }) => <Link key={id} to={categoryPath(id)} className="flex min-w-[76px] shrink-0 flex-col items-center gap-1 rounded-xl px-1.5 py-1 text-center text-[11px] font-semibold transition hover:bg-[#fff7e6] sm:min-w-0 sm:gap-1.5 sm:text-sm">
          <span className="grid size-10 place-items-center rounded-full bg-[#fff0c7] text-[#941333] sm:size-14"><Icon className="size-5 sm:size-7" strokeWidth={2.6} aria-hidden="true" /></span>
          <span>{id === "classifieds" ? "Classifieds" : name.replace(/ Buy & Sell| Deal/, "")}</span>
        </Link>)}
      </nav>
    </header>

    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
      <section id="home" aria-labelledby="v2-hero-heading" className="mt-4 grid min-h-[190px] grid-cols-[1.05fr_0.95fr] overflow-hidden rounded-[24px] bg-[#fff0c9] sm:mt-6 md:mt-7 md:min-h-[400px]">
        <div className="relative z-10 flex flex-col items-start px-2.5 py-4 min-[360px]:px-3 min-[390px]:px-4 sm:px-8 sm:py-8 md:justify-center md:px-8 lg:px-11 lg:py-10">
          <p className="mb-2 flex items-center gap-1 text-[8px] font-extrabold text-[#8c1534] sm:mb-3 sm:gap-2 sm:text-sm"><ShieldCheck className="size-3 shrink-0 sm:size-5" strokeWidth={2.3} aria-hidden="true" />QATAR, CLOSER TO YOU</p>
          <h1 id="v2-hero-heading" className="max-w-[600px] text-[clamp(1.1rem,6vw,4.2rem)] font-black leading-[1.02] text-[#851432]">Find what you need. Sell what you don&apos;t.</h1>
          <p className="mt-2 max-w-[470px] text-[9px] leading-[1.25] text-[#30252a] min-[390px]:text-[10px] sm:mt-4 sm:text-base lg:text-lg">Explore local deals, trusted services and great finds across Qatar.</p>
          <a href="#interests" className="mt-3 inline-flex min-h-8 items-center gap-1 whitespace-nowrap rounded-full bg-[#a20e3c] px-2 py-1.5 text-[10px] font-bold text-white shadow-[0_8px_20px_rgba(128,16,50,0.16)] transition hover:bg-[#84102f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#84102f] min-[390px]:min-h-9 min-[390px]:px-4 min-[390px]:text-[11px] sm:mt-6 sm:min-h-12 sm:gap-4 sm:px-6 sm:py-3 sm:text-base">Explore Listings <ArrowRight className="size-3.5 sm:size-5" aria-hidden="true" /></a>
        </div>
        <div className="relative -left-[22%] min-h-[190px] w-[122%] sm:min-h-[280px] md:min-h-[400px]">
          <img src="/images/doha-hero.png" alt="Doha skyline at sunset with a traditional dhow on the water" className="absolute inset-0 size-full object-cover object-center [clip-path:polygon(35%_0,100%_0,100%_100%,0_100%)]" />
          <div className="absolute inset-0 bg-[#a20e3c] [clip-path:polygon(35%_0,39%_0,4%_100%,0_100%)]" aria-hidden="true" />
        </div>
      </section>

      <section id="interests" aria-labelledby="v2-interests-heading" className="pb-12 pt-7 sm:pt-9 lg:pt-10">
        <div className="mb-5 flex items-center gap-4 sm:mb-6"><span className="h-px flex-1 bg-[#8c1534]/70" aria-hidden="true" /><h2 id="v2-interests-heading" className="shrink-0 text-center text-lg font-black text-[#8c1534] sm:text-2xl">BROWSE BY INTEREST</h2><span className="h-px flex-1 bg-[#8c1534]/70" aria-hidden="true" /></div>
        {visibleCategories.length > 0 ? <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
          {visibleCategories.map(({ id, name, description, icon: Icon, image, imageAlt }) => <Link key={id} to={categoryPath(id)} className="group relative isolate aspect-[1.15/1] min-h-[148px] overflow-hidden rounded-[18px] bg-[#e8ded1] shadow-sm sm:aspect-[1.65/1] sm:min-h-[190px] sm:rounded-[22px]">
            <img src={image} alt={imageAlt} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.04]" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" aria-hidden="true" />
            <span className="absolute left-3 top-3 grid size-10 place-items-center rounded-full bg-[#fff0c7] text-[#941333] shadow-sm sm:left-5 sm:top-5 sm:size-14"><Icon className="size-5 sm:size-7" strokeWidth={2.6} aria-hidden="true" /></span>
            <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-white sm:inset-x-5 sm:bottom-4"><span className="min-w-0"><span className="block truncate text-base font-extrabold leading-tight sm:text-2xl">{id === "classifieds" ? "Classifieds" : name.replace(/ Buy & Sell| Deal/, "")}</span><span className="mt-1 block truncate text-[11px] leading-tight sm:text-base">{description}</span></span><span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/70 bg-[#a20e3c] transition group-hover:bg-[#84102f] sm:size-12"><ArrowRight className="size-5 sm:size-6" /></span></span>
          </Link>)}
        </div> : <p role="status" className="rounded-2xl border border-[#f1e4d6] bg-white px-5 py-8 text-center text-sm text-[#6c5d61]">No categories match “{search}”. Try searching for food, cars, or jobs.</p>}
      </section>
    </div>
    <ModernMarketplaceFooter variant="v2" />
  </main>;
}