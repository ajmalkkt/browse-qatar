import { ArrowLeft, Heart, RefreshCw, Bell, LoaderCircle, ExternalLink } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useFavoritesContext, type FavoriteOffer } from "../contexts/FavoritesContext";
import TopHeader from "./TopHeader";
import { CategoryStrip, MarketplaceHeader, ModernMarketplaceFooter } from "./ModernMarketplace";
import { getAllListings } from "../services/listingService";
import { getAllOffers } from "../services/offerService";
import { useEffect, useMemo, useState } from "react";
import EnquiryPopup from "./EnquiryPopup";
import { getNotificationPreferences, saveNotificationPreferences, verifyNotificationEmail } from "../services/favoriteService";
import type { FavoritePreference } from "../types/favorite";

type CatalogItem = Record<string, any>;
const SUPPORTED_CATEGORIES = ["restaurants", "vehicles", "accommodations", "services", "classifieds", "jobs"];

const emptyPreferences: FavoritePreference = {
  enabled: false,
  email: "",
  emailVerified: false,
  cadence: "weekly",
  categories: [],
  timezone: "Asia/Qatar",
};

function itemPrice(item: CatalogItem): number {
  return Number(item.discountedPrice ?? item.pricing?.discountedPrice ?? item.originalPrice ?? item.pricing?.originalPrice ?? 0);
}

function resolveFavorite(favorite: FavoriteOffer, listings: CatalogItem[], offers: CatalogItem[]): FavoriteOffer {
  const source = favorite.source || "offer";
  const verticalId = favorite.verticalId || (source === "offer" ? "restaurants" : "classifieds");
  const itemId = String(favorite.itemId ?? favorite.id);
  const records = source === "offer" ? offers : listings;
  const record = records.find((item) => String(item.id) === itemId);
  if (!record) return favorite;
  const price = itemPrice(record);
  const address = record.location?.address || record.location?.city || record.location || favorite.location;
  return {
    ...favorite,
    title: record.title || favorite.title,
    description: record.description || favorite.description,
    imageUrl: record.imageUrl || record.image || favorite.imageUrl,
    location: typeof address === "string" ? address : favorite.location,
    category: record.category || record.subcategory || favorite.category || verticalId,
    originalPrice: Number(record.originalPrice ?? record.pricing?.originalPrice ?? favorite.originalPrice),
    discountedPrice: price || favorite.discountedPrice,
    pricing: record.pricing || favorite.pricing,
    validTo: record.validTo || record.validity?.to || favorite.validTo,
    restaurantId: Number(record.restaurantId ?? favorite.restaurantId),
    cuisine: record.cuisine || favorite.cuisine,
    offerType: record.offerType || favorite.offerType,
  };
}

function titleForVertical(verticalId: string): string {
  const labels: Record<string, string> = {
    restaurants: "Restaurants",
    vehicles: "Vehicles",
    accommodations: "Accommodation",
    services: "Services",
    classifieds: "Classifieds",
    jobs: "Jobs",
  };
  return labels[verticalId] || verticalId.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function Favourites() {
  const isV2Theme = import.meta.env.VITE_MODERN_VIEW_V2 === "true" || import.meta.env.VITE_MODERN_VIEW === "true";
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    favorites,
    toggleFavorite,
    refreshFavorites,
    isLoading,
    isSignedIn,
    syncError,
    syncFavorites,
  } = useFavoritesContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("Qatar");
  const [listings, setListings] = useState<CatalogItem[]>([]);
  const [offers, setOffers] = useState<CatalogItem[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [preferences, setPreferences] = useState<FavoritePreference>(emptyPreferences);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  const [preferencesMessage, setPreferencesMessage] = useState<string | null>(null);

  const resolvedFavorites = useMemo(
    () => favorites.map((favorite) => resolveFavorite(favorite, listings, offers)),
    [favorites, listings, offers]
  );
  const filteredFavorites = resolvedFavorites.filter((favorite) => {
    const query = searchQuery.trim().toLowerCase();
    return !query || `${favorite.title} ${favorite.description} ${favorite.category} ${favorite.location}`.toLowerCase().includes(query);
  });
  const groupedFavorites = useMemo(() => {
    return filteredFavorites.reduce<Record<string, FavoriteOffer[]>>((groups, favorite) => {
      const verticalId = favorite.verticalId || (favorite.source === "listing" ? "classifieds" : "restaurants");
      (groups[verticalId] ||= []).push(favorite);
      return groups;
    }, {});
  }, [filteredFavorites]);
  const favoriteCategories = useMemo(
    () => [...new Set(favorites.map((favorite) => favorite.verticalId || "restaurants"))],
    [favorites]
  );

  const loadCatalog = async () => {
    const [listingResult, offerResult] = await Promise.allSettled([getAllListings(), getAllOffers()]);
    if (listingResult.status === "fulfilled") setListings(Array.isArray(listingResult.value) ? listingResult.value : []);
    if (offerResult.status === "fulfilled") setOffers(Array.isArray(offerResult.value) ? offerResult.value : []);
    if (listingResult.status === "rejected" && offerResult.status === "rejected") {
      console.error("Favourites: listing and offer catalogs could not be loaded", listingResult.reason, offerResult.reason);
      setCatalogError("Current item details could not be refreshed. Saved favorites are still available.");
    } else {
      setCatalogError(null);
    }
  };

  useEffect(() => {
    let active = true;
    void Promise.all([loadCatalog(), refreshFavorites()])
      .then(() => { if (active) setLastRefreshed(new Date()); })
      .catch((error) => {
        console.error("Favourites: refresh failed", error);
        if (active) setCatalogError("Favorites could not be refreshed. Please try again.");
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    let active = true;
    setPreferencesLoading(true);
    getNotificationPreferences()
      .then((saved) => {
        if (!active) return;
        if (saved) setPreferences({ ...emptyPreferences, ...saved });
      })
      .catch((error) => {
        console.error("Favourites: notification preferences could not be loaded", error);
        if (active) setPreferencesMessage("Notification settings could not be loaded.");
      })
      .finally(() => { if (active) setPreferencesLoading(false); });
    return () => { active = false; };
  }, [isSignedIn]);

  useEffect(() => {
    const token = searchParams.get("verifyEmail");
    if (!token) return;
    let active = true;
    verifyNotificationEmail(token)
      .then(({ message }) => {
        if (!active) return;
        setPreferencesMessage(message);
        setPreferences((current) => ({ ...current, emailVerified: true }));
        const next = new URLSearchParams(searchParams);
        next.delete("verifyEmail");
        setSearchParams(next, { replace: true });
      })
      .catch((error) => {
        console.error("Favourites: notification email verification failed", error);
        if (active) setPreferencesMessage(error instanceof Error ? error.message : "Email verification failed.");
      });
    return () => { active = false; };
  }, [searchParams, setSearchParams]);

  const handleRefresh = async () => {
    setCatalogError(null);
    try {
      await Promise.all([loadCatalog(), refreshFavorites()]);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("Favourites: manual refresh failed", error);
      setCatalogError("Favorites could not be refreshed. Please try again.");
    }
  };

  const savePreferences = async () => {
    setPreferencesSaving(true);
    setPreferencesMessage(null);
    try {
      const saved = await saveNotificationPreferences({
        ...preferences,
        categories: preferences.enabled
          ? (preferences.categories.length ? preferences.categories : favoriteCategories.length ? favoriteCategories : SUPPORTED_CATEGORIES)
          : preferences.categories,
        cadence: preferences.cadence || "weekly",
        timezone: preferences.timezone || "Asia/Qatar",
      });
      setPreferences({ ...emptyPreferences, ...saved });
      setPreferencesMessage((saved as FavoritePreference & { verificationRequired?: boolean }).verificationRequired
        ? "Check your email to verify this address before notifications begin."
        : "Notification preferences saved.");
    } catch (error) {
      console.error("Favourites: failed to save notification preferences", error);
      setPreferencesMessage(error instanceof Error ? error.message : "Notification preferences could not be saved.");
    } finally {
      setPreferencesSaving(false);
    }
  };

  const toggleCategory = (category: string) => {
    setPreferences((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((entry) => entry !== category)
        : [...current.categories, category],
    }));
  };

  return (
    <div className={`min-h-screen ${isV2Theme ? "bg-[#fffdfa] text-[#30252a]" : "bg-background"}`}>
      <Helmet>
        <title>My Favorites | Browse Qatar</title>
        <meta name="description" content="View and manage your saved Browse Qatar listings and restaurant offers." />
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href="https://browseqatar.com/favourites" />
      </Helmet>
      {isV2Theme ? (
        <>
          <MarketplaceHeader search={searchQuery} onSearch={setSearchQuery} />
          <CategoryStrip />
        </>
      ) : (
        <TopHeader
          onSearch={setSearchQuery}
          selectedCountry={selectedCountry}
          onSelectCountry={setSelectedCountry}
          onAddBusiness={() => setEnquiryOpen(true)}
          onSearchClick={() => undefined}
          searchQuery={searchQuery}
        />
      )}

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-full p-2 transition hover:bg-[#f4e9e3]" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#851432]">My Favorites</h1>
            <p className="text-sm text-slate-500">{favorites.length} saved item{favorites.length === 1 ? "" : "s"}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {lastRefreshed && <span className="hidden text-xs text-slate-500 sm:inline">Updated {lastRefreshed.toLocaleTimeString()}</span>}
            <button onClick={handleRefresh} className="inline-flex items-center gap-2 rounded-lg border border-[#ead9ca] bg-white px-3 py-2 text-sm font-semibold text-[#851432] shadow-sm hover:bg-[#fff7e6]">
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>

        {(syncError || catalogError) && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900" role="status">
            <span>{syncError || catalogError}</span>
            {syncError && isSignedIn && <button onClick={() => { void syncFavorites().catch((error) => console.error("Favorite sync retry failed", error)); }} className="font-bold underline">Retry account sync</button>}
          </div>
        )}

        {isSignedIn && (
          <section className="mb-8 rounded-2xl border border-[#ead9ca] bg-gradient-to-br from-[#fff7e6] to-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#851432] text-white"><Bell size={20} /></span>
              <div>
                <h2 className="font-bold text-[#5a1024]">Favorites email updates</h2>
                <p className="mt-1 text-sm text-slate-600">Get one email with new items in your selected categories and changes to saved items.</p>
              </div>
            </div>
            {preferencesLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle size={16} className="animate-spin" /> Loading preferences…</div>
            ) : (
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                  <input type="checkbox" checked={preferences.enabled} onChange={(event) => setPreferences((current) => ({
                    ...current,
                    enabled: event.target.checked,
                    cadence: current.cadence || "weekly",
                    categories: current.categories.length ? current.categories : favoriteCategories.length ? favoriteCategories : SUPPORTED_CATEGORIES,
                  }))} className="h-4 w-4 accent-[#851432]" />
                  Email me about new matches and saved-item changes
                </label>
                {preferences.enabled && (
                  <>
                    <label className="block max-w-lg text-sm">
                      <span className="mb-1 block font-medium text-slate-700">Email address</span>
                      <input type="email" value={preferences.email} onChange={(event) => setPreferences((current) => ({ ...current, email: event.target.value, emailVerified: false }))} placeholder="Use your account email or enter another address" className="w-full rounded-lg border border-[#dcc8b8] bg-white px-3 py-2 outline-none focus:border-[#851432] focus:ring-2 focus:ring-[#851432]/15" />
                      <span className="mt-1 block text-xs text-slate-500">Leave blank to use your account email. Any unverified address will receive a confirmation link.</span>
                      {!preferences.emailVerified && preferences.email && <span className="mt-1 block text-xs text-amber-700">This address must be verified before notifications can be sent.</span>}
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-slate-700">Frequency</span>
                        <select value={preferences.cadence} onChange={(event) => setPreferences((current) => ({ ...current, cadence: event.target.value as FavoritePreference["cadence"] }))} className="w-full rounded-lg border border-[#dcc8b8] bg-white px-3 py-2">
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly (default)</option>
                          <option value="monthly">Monthly</option>
                          <option value="once">One specific date</option>
                        </select>
                      </label>
                      {preferences.cadence === "once" && (
                        <label className="block text-sm">
                          <span className="mb-1 block font-medium text-slate-700">Send on</span>
                          <input type="date" value={preferences.oneTimeDate?.slice(0, 10) || ""} onChange={(event) => setPreferences((current) => ({ ...current, oneTimeDate: event.target.value }))} className="w-full rounded-lg border border-[#dcc8b8] bg-white px-3 py-2" />
                        </label>
                      )}
                      {preferences.cadence !== "once" && (
                        <label className="block text-sm">
                          <span className="mb-1 block font-medium text-slate-700">Stop after (optional)</span>
                          <input type="date" value={preferences.endDate?.slice(0, 10) || ""} onChange={(event) => setPreferences((current) => ({ ...current, endDate: event.target.value || undefined }))} className="w-full rounded-lg border border-[#dcc8b8] bg-white px-3 py-2" />
                        </label>
                      )}
                    </div>
                    <fieldset>
                      <legend className="mb-2 text-sm font-medium text-slate-700">Categories to include</legend>
                      <div className="flex flex-wrap gap-2">
                        {SUPPORTED_CATEGORIES.map((category) => (
                          <label key={category} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition ${preferences.categories.includes(category) ? "border-[#851432] bg-[#851432] text-white" : "border-[#ddc9bb] bg-white text-slate-700 hover:border-[#851432]"}`}>
                            <input type="checkbox" checked={preferences.categories.includes(category)} onChange={() => toggleCategory(category)} className="sr-only" />
                            {titleForVertical(category)}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <div className="flex flex-wrap items-center gap-3">
                      <button disabled={preferencesSaving} onClick={() => void savePreferences()} className="rounded-lg bg-[#851432] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#6f1028] disabled:opacity-60">
                        {preferencesSaving ? "Saving…" : "Save preferences"}
                      </button>
                      <span className="text-xs text-slate-500">Schedules use Asia/Qatar time.</span>
                      {preferencesMessage && <span className="text-sm text-slate-600" role="status">{preferencesMessage}</span>}
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16"><LoaderCircle className="animate-spin text-[#851432]" size={28} /></div>
        ) : filteredFavorites.length === 0 ? (
          <div className="rounded-2xl border border-[#ead9ca] bg-white px-6 py-14 text-center shadow-sm">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#fff1e6] text-[#851432]"><Heart size={25} /></span>
            <h2 className="text-xl font-bold text-slate-900">{favorites.length ? "No matching favorites" : "Your favorites will appear here"}</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">Save listings and restaurant offers while browsing Browse Qatar, then find them here grouped by category.</p>
            <Link to="/" className="mt-6 inline-flex rounded-xl bg-[#851432] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#6f1028]">Explore Browse Qatar</Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedFavorites).map(([verticalId, items]) => (
              <section key={verticalId} aria-labelledby={`favorites-${verticalId}`}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 id={`favorites-${verticalId}`} className="text-lg font-bold text-[#851432]">{titleForVertical(verticalId)}</h2>
                  <span className="rounded-full bg-[#fff1e6] px-3 py-1 text-xs font-semibold text-[#851432]">{items.length} saved</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                  {items.map((favorite) => {
                    const source = favorite.source || "offer";
                    const itemId = String(favorite.itemId ?? favorite.id);
                    const href = source === "offer" ? `/offer/${itemId}` : `/marketplace/${verticalId}/${itemId}`;
                    return (
                      <article key={`${source}:${verticalId}:${itemId}`} className="group overflow-hidden rounded-xl border border-[#ead9ca] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="relative aspect-[4/3] bg-[#f7efe9]">
                          <img src={favorite.imageUrl || "/bqLogo.jpg"} alt={favorite.title} loading="lazy" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = "/bqLogo.jpg"; }} />
                          <button type="button" onClick={() => toggleFavorite(favorite)} aria-label="Remove from favorites" className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-red-500 shadow-sm hover:bg-white">
                            <Heart size={18} className="fill-red-500" />
                          </button>
                          {favorite.category && <span className="absolute bottom-2 left-2 max-w-[80%] truncate rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#851432]">{favorite.category}</span>}
                        </div>
                        <div className="p-3">
                          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-900">{favorite.title}</h3>
                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">{favorite.location || titleForVertical(verticalId)}</p>
                          {favorite.discountedPrice > 0 && <p className="mt-2 text-sm font-bold text-[#851432]">QAR {favorite.discountedPrice.toLocaleString()}</p>}
                          <Link to={href} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#851432] hover:underline">View item <ExternalLink size={13} /></Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {isV2Theme ? <ModernMarketplaceFooter variant="v2" /> : <footer className="mt-12 bg-muted px-4 py-6 text-center text-muted-foreground">© {new Date().getFullYear()} Browse Qatar. All rights reserved.</footer>}
      <EnquiryPopup open={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
    </div>
  );
}
