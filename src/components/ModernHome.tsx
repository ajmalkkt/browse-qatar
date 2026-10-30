import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  Car,
  Compass,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { verticalConfig } from "../config/verticalConfig";

const iconMap: Record<string, typeof Compass> = {
  restaurants: UtensilsCrossed,
  vehicles: Car,
  accommodations: Building2,
  services: Wrench,
  classifieds: Package,
  jobs: Briefcase,
};

const featuredListings = [
  {
    title: "Luxury brunch deal in West Bay",
    subtitle: "Restaurants • 25% off this weekend",
    meta: "Verified • 1.2 km away",
    badge: "Hot deal",
  },
  {
    title: "BMW X5 in immaculate condition",
    subtitle: "Vehicles • Premium seller",
    meta: "Negotiable • Doha",
    badge: "New",
  },
  {
    title: "Modern serviced apartment near Lusail",
    subtitle: "Accommodations • Flexible stays",
    meta: "Available now",
    badge: "Featured",
  },
];

const trustPoints = [
  "Verified listings and quick responses",
  "Professional browsing experience with smart filters",
  "Local market focus with premium presentation",
];

export default function ModernHome() {
  const navigate = useNavigate();

  const categories = useMemo(() => {
    return Object.values(verticalConfig)
      .filter((item) => item.enabled)
      .map((item) => ({
        ...item,
        Icon: iconMap[item.id] || Compass,
      }));
  }, []);

  const switchToClassic = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("modern_view", "false");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-cyan-400 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              <Store className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900">Browse Qatar</p>
              <p className="text-xs text-slate-500">Modern marketplace</p>
            </div>
          </button>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#categories" className="transition hover:text-cyan-600">
              Categories
            </a>
            <a href="#featured" className="transition hover:text-cyan-600">
              Featured
            </a>
            <a href="#how-it-works" className="transition hover:text-cyan-600">
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/make-offer")}
              className="hidden rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700 sm:inline-flex"
            >
              Post a listing
            </button>
            <button
              type="button"
              onClick={switchToClassic}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Classic view
            </button>
          </div>
        </div>
      </header>

      <main className="flex w-full flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-800 to-cyan-700 p-8 text-white shadow-2xl lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-cyan-100 backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Built for modern local discovery
              </div>
              <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
                Find the best deals, services, and listings in Qatar.
              </h1>
              <p className="mt-4 max-w-xl text-lg text-slate-200">
                Discover verified offers, trusted services, and premium local opportunities in a cleaner, faster marketplace experience.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/restaurants-offers")}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Browse deals <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/make-offer")}
                  className="rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Post your offer
                </button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-semibold">2.4k+</p>
                  <p className="mt-1 text-sm text-slate-200">Active listings</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-semibold">98%</p>
                  <p className="mt-1 text-sm text-slate-200">Verified reviews</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-semibold">24/7</p>
                  <p className="mt-1 text-sm text-slate-200">Local support</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur">
              <div className="rounded-[24px] bg-white p-5 text-slate-900">
                <div className="flex items-center gap-2 text-sm font-semibold text-cyan-700">
                  <Search className="h-4 w-4" />
                  Search the marketplace
                </div>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    What are you looking for?
                  </label>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Restaurants, cars, services..."
                      className="w-full border-none bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Category</label>
                    <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none">
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Location</label>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" />
                      <span>Doha, Qatar</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/restaurants-offers")}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Search marketplace <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="categories" className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600">Popular categories</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Explore the marketplace by vertical</h2>
            </div>
            <p className="text-sm text-slate-500">A polished collection of verticals designed for browsing, discovery, and quick actions.</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => {
              const Icon = category.Icon;
              return (
                <button
                  key={category.id}
                      type="button"
                      onClick={() => navigate(`/marketplace/${category.id}`)}
                  className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-1 hover:border-cyan-400 hover:bg-white hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-cyan-600" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{category.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{category.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section id="featured" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600">Featured picks</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Trending right now</h2>
              </div>
              <button type="button" onClick={() => navigate("/restaurants-offers")} className="text-sm font-semibold text-cyan-600 transition hover:text-cyan-700">
                View all
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {featuredListings.map((listing) => (
                <article key={listing.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-400 hover:bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                        {listing.badge}
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-slate-900">{listing.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{listing.subtitle}</p>
                    </div>
                    <div className="rounded-full bg-white p-2 shadow-sm">
                      <TrendingUp className="h-4 w-4 text-cyan-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <span>{listing.meta}</span>
                    <button type="button" onClick={() => navigate("/restaurants-offers")} className="font-semibold text-slate-900 transition hover:text-cyan-600">
                      Explore
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div id="how-it-works" className="space-y-6">
            <div className="rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-700 p-6 text-white shadow-lg sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">How it works</p>
              <h2 className="mt-2 text-2xl font-semibold">Faster than traditional classifieds</h2>
              <div className="mt-6 space-y-4">
                {[
                  { title: "Search smart", text: "Find deals, services, or properties using clear categories and filters." },
                  { title: "Compare quickly", text: "Review offers with polished cards, clear pricing, and local context." },
                  { title: "Act confidently", text: "Connect with sellers and buyers with confidence through a trusted experience." },
                ].map((step, index) => (
                  <div key={step.title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
                      0{index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="mt-1 text-sm text-slate-200">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Why Browse Qatar feels premium</h3>
                  <p className="text-sm text-slate-500">A modern layer over your existing vertical experience.</p>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {trustPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-slate-600">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
