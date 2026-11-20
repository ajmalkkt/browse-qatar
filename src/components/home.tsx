import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, ArrowUp, ChevronDown, ChevronUp, Info, Search } from "lucide-react"; // Import Icons
import { Helmet } from "react-helmet-async";
import VerticalNav from "./common/VerticalNav";

// Components
import FilterBar from "./FilterBar";
import OffersGrid from "./OffersGrid";
import TopHeader from "./TopHeader";
import EnquiryPopup from "./EnquiryPopup";
import SecondaryNav from "./SecondaryNav";
import FeaturedCard from "./FeaturedCard";
import PopularBrands from "./PopularBrands";
import SaveFoodPopup from "./SaveFoodPopup";
import FestivalBanner from "./FestivalBanner";
import VerticalGrid from "./common/VerticalGrid";

// Hooks / Context
import { useFavoritesContext } from "../contexts/FavoritesContext";
import { useVertical } from "../contexts/VerticalContext";

// Services & Config
import { getVerticalService } from "../services/verticalServiceFactory";
import { verticalConfig } from "../config/verticalConfig";
import { getAllOffers, searchOffersByCuisine, getOffersByRestaurantId } from "../services/offerService";
import { getAllRestaurants } from "../services/restaurantService";
import {
  countryMap,
  DEFAULT_COUNTRY,
  DEFAULT_CATEGORY,
  SHOW_CUISINE_NAV,
  SHOW_OFFER_DETAIL,
  ENABLE_RANDOM_SORT,
  SHOW_VERTICAL_NAV,
} from "../config/appConfig";

// Types
interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  rating: number;
  cuisine: string[];
  logoUrl: string;
  country: string;
}
interface Offer {
  id: number;
  title: string;
  description: string;
  restaurantId: number;
  cuisine: string;
  originalPrice: number;
  discountedPrice: number;
  offerType: string;
  validFrom: string;
  validTo: string;
  imageUrl: string;
  location: string;
  country: string;
  category: string;
  updatedAt?: string;
}

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  // --- Favorites Context ---
  const { favorites, toggleFavorite } = useFavoritesContext();
  const { currentVertical, currentConfig, switchVertical } = useVertical();

  const location = useLocation();
  const navigate = useNavigate();

  // --- UI State ---
  const [isPortal, setIsPortal] = useState(location.pathname === "/");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [showFloatBtn, setShowFloatBtn] = useState(false); // Toggle float button visibility
  const [showSeoContent, setShowSeoContent] = useState(false); // Toggle SEO content visibility

  // Sync isPortal with path
  useEffect(() => {
    if (location.pathname === "/restaurants-offers") {
      setIsPortal(false);
      switchVertical("restaurants");
    } else if (location.pathname === "/") {
      const vertical = searchParams.get("vertical");
      if (vertical && vertical !== "portal") {
        setIsPortal(false);
        switchVertical(vertical);
      } else {
        setIsPortal(true);
      }
    } else {
      setIsPortal(false);
    }
  }, [location.pathname, searchParams, switchVertical]);

  // --- Data State ---
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Filter State ---
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") || "");
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORY);
  const [filters, setFilters] = useState({
    cuisines: [] as string[],
    locations: [] as string[],
    offerTypes: [] as string[],
  });
  // ✅ New State for the Popup
  const [isSaveFoodOpen, setSaveFoodOpen] = useState(false);
  const [randomSeed] = useState(() => Math.random());

  // Initialize sortOption based on config
  const [sortOption, setSortOption] = useState(() => {
    if (ENABLE_RANDOM_SORT) {
      return "random";
    }
    return "best-value"; // Default
  });


  // Refs for scrolling
  const categoriesRef = useRef<HTMLDivElement>(null);
  const offersSectionRef = useRef<HTMLElement | null>(null);

  // 1. Initial Load - Reactive to currentVertical
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const service = getVerticalService(currentVertical);
        
        // For restaurants, we still want to fetch all restaurants for the grid metadata
        // For other verticals, we'll fetch their respective providers
        const [listingsResult, providersResult] = await Promise.all([
          currentVertical === 'restaurants' ? getAllOffers() : service.getAll(),
          // Eventually, we should have a generic way to get providers for any vertical
          currentVertical === 'restaurants' ? getAllRestaurants() : Promise.resolve([])
        ]);
        
        setOffers(listingsResult as any);
        setRestaurants(providersResult as any);
      } catch (error) {
        console.error(`Error fetching data for ${currentVertical}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentVertical]);

  // Detect restaurant filter from URL
  useEffect(() => {
    const restaurantId = searchParams.get("restaurant");
    if (restaurantId && restaurants.length > 0) {
      handleSelectRestaurant(restaurantId);
      scrollToOffers();
      // Removed clearing to fix "Page with redirect" and allow bookmarking
      // setSearchParams({}, { replace: true });
    }
  }, [searchParams, restaurants, setSearchParams]);

  // Detect search query from URL
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchQuery(query);
      scrollToOffers();
      // Removed clearing to fix "Page with redirect" and allow bookmarking
      // setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // 2. Track Scrolling to show/hide Floating Button
  useEffect(() => {
    const handleScroll = () => {
      // Show button if scrolled down more than 300px
      if (window.scrollY > 300) {
        setShowFloatBtn(true);
      } else {
        setShowFloatBtn(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 3. Filtering Logic (Memoized)
  const restaurantLookup = useMemo(() => {
    const lookup = new Map();
    restaurants.forEach((r) => lookup.set(r.id, r.name.toLowerCase()));
    return lookup;
  }, [restaurants]);

  useEffect(() => {
    let result = [...offers];
    if (selectedCountry && countryMap[selectedCountry]) {
      result = result.filter((offer) => offer.country === countryMap[selectedCountry]);
    }
    if (selectedCategory !== "All Offers") {
      result = result.filter((offer) => offer.category === selectedCategory);
    }
    if (filters.cuisines?.length > 0) {
      result = result.filter((offer) => filters.cuisines.includes(offer.cuisine));
    }
    if (filters.locations?.length > 0) {
      result = result.filter((offer) =>
        filters.locations.some((loc) => offer.location.includes(loc))
      );
    }
    if (filters.offerTypes?.length > 0) {
      result = result.filter((offer) => filters.offerTypes.includes(offer.offerType));
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((offer) => {
        // Fast lookup using the Map we created earlier
        const restaurantName = restaurantLookup.get(offer.restaurantId) || "";
        return (
          (offer.title && offer.title.toLowerCase().includes(query)) ||
          (offer.description && offer.description.toLowerCase().includes(query)) ||
          (offer.cuisine && offer.cuisine.toLowerCase().includes(query)) ||
          restaurantName.includes(query)
        );
      });
    }

    setFilteredOffers(result);
  }, [offers, filters, searchQuery, restaurantLookup, restaurants, selectedCountry, selectedCategory]);

  const sortedOffers = useMemo(() => {
    let sortable = [...filteredOffers];
    const option = sortOption || "best-value"; // Default to best-value if empty
    //console.log("Sort Option:", option);
    sortable.sort((a, b) => {
      if (option === "latest") {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        if (dateA !== dateB) return dateB - dateA;
        return b.id - a.id; // Fallback to ID if dates are same
      } else if (option === "price-asc") {
        return a.discountedPrice - b.discountedPrice;

      } else if (option === "price-desc") {
        return b.discountedPrice - a.discountedPrice;
      } else if (option === "best-value") {
        // Sort by discount percentage descending
        const discountA = (a.originalPrice - a.discountedPrice) / a.originalPrice;
        const discountB = (b.originalPrice - b.discountedPrice) / b.originalPrice;
        return discountB - discountA;
      }
      return 0;
    });

    if (option === "random" && sortable.length > 0) {
      const offset = Math.floor(randomSeed * sortable.length);
      return [...sortable.slice(offset), ...sortable.slice(0, offset)];
    }

    return sortable;
  }, [filteredOffers, sortOption, randomSeed]);

  // 1. Calculate if Super Saver exists
  // We use useMemo so it doesn't recalculate on every scroll, only when 'offers' changes.
  const hasSuperSaverOffers = useMemo(() => {
    return offers.some((offer) => offer.cuisine === "Super Saver");
  }, [offers]);
  // --- Handlers ---

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (payload: any) => {
    setFilters({
      cuisines: payload.cuisines || [],
      locations: payload.locations || [],
      offerTypes: payload.offerTypes || [],
    });
  };

  const handleCuisineSelect = async (cuisine: string | null, isSearch: boolean | false) => {
    setLoading(true);
    try {
      if (!cuisine) {
        // All Offers clicked → reset to all
        const all = await getAllOffers();
        setFilteredOffers(all);
        setSearchParams({}, { replace: true });
      } else {
        const result = await searchOffersByCuisine(cuisine);
        setFilteredOffers(result);
        setSearchParams({ search: cuisine }, { replace: true });
      }
      if (!isSearch) setSearchQuery(cuisine || "");
      scrollToOffers();
    } catch (error) {
      console.error("Error fetching cuisine offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRestaurant = async (id: String | null) => {
    setLoading(true);
    try {
      const result = await getOffersByRestaurantId(id);
      setFilteredOffers(result);
      setSearchQuery("");
    } catch (error) {
      console.error("Error fetching cuisine offers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Scroll Helpers
  const scrollToOffers = () => {
    setTimeout(() => {
      // 80px offset for the sticky header
      const yOffset = -80;
      const element = offersSectionRef.current;
      if (element) {
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 200);
  };

  const scrollToCategories = () => {
    // Scroll back up to the SecondaryNav
    if (categoriesRef.current) {
      // 90px offset so the Sticky TopHeader doesn't cover the categories
      const yOffset = -90;
      const y = categoriesRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // ✅ New Handler: Filter for super saver/50% Savings
  const handleFindBigSavings = () => {

    setSaveFoodOpen(false);
    // 3. Update UI Text/Selection to show user what happened
    //setSearchQuery(""); 
    handleCuisineSelect("Super Saver", false); // seaech for super savers

  };

  if (isPortal) {
    return (
      <div className="min-h-screen bg-white">
        <Helmet>
          <title>Browse Qatar | All Offers & Categories</title>
        </Helmet>
        <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
          <TopHeader
            onSearch={handleSearch}
            onSelectCountry={setSelectedCountry}
            selectedCountry={selectedCountry}
            searchQuery={searchQuery}
            onAddBusiness={() => setEnquiryOpen(true)}
          />
          {SHOW_VERTICAL_NAV && (
            <div className="max-w-7xl mx-auto px-2 py-2 overflow-x-auto flex justify-center">
              <VerticalNav compact={false} showLabels={true} className="!pb-0" />
            </div>
          )}
        </div>
        <main className="max-w-7xl mx-auto px-2 py-6">
          <VerticalGrid
            className="!px-0"
            title=""
            onVerticalClick={(verticalId) => {
              const config = Object.values(verticalConfig).find(cfg => cfg.id === verticalId);
              if (config) {
                navigate(config.route);
              } else {
                setSearchParams({ vertical: verticalId });
              }
            }}
          />

          <div className="text-center py-8 text-gray-500 text-sm">
            <p>Trusted by thousands of users in Qatar</p>
          </div>
        </main>

        <footer className="bg-muted py-6 px-4 mt-2 pb-8 border-t border-gray-200">
          <div className="container mx-auto text-center text-muted-foreground">
            <div className="flex flex-col md:flex-row items-center justify-center gap-3">
              <p className="m-0">© {new Date().getFullYear()} Browse Qatar Marketplace. All rights reserved.</p>
              <span className="hidden md:inline text-muted-foreground mr-2">|</span>
              <a href="/terms" className="text-sm text-gray-500 hover:text-blue-600 transition-colors md:mr-3 underline">
                Terms &amp; Conditions
              </a>
              <span className="hidden md:inline text-muted-foreground">|</span>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <img src={'/meraki.webp'} alt="Meraki AI" className="w-6 h-6 object-contain" />
                <span>Powered by MerakiAi</span>
              </div>
            </div>
          </div>
        </footer>

        <EnquiryPopup open={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Browse Qatar | Local Marketplace, Listings and Restaurant Offers</title>
        <meta
          name="description"
          content="Discover restaurant offers, vehicles, accommodation, services, classifieds, and jobs across Qatar. Browse local listings and contact advertisers directly."
        />
        <link rel="canonical" href="https://browseqatar.com/" />
        <link rel="alternate" type="text/markdown" href="https://browseqatar.com/content/marketplace.md" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Browse Qatar | Qatar Local Marketplace" />
        <meta property="og:description" content="Explore local listings and offers across restaurants, vehicles, accommodation, services, classifieds, and jobs." />
        <meta property="og:url" content="https://browseqatar.com/" />
        <meta property="og:image" content="https://browseqatar.com/bqLogo.jpg" />
        <meta name="twitter:card" content="summary" />
      </Helmet>

      {/* Screen reader only H1 for SEO */}
      <h1 className="sr-only">Browse Qatar marketplace: local listings, restaurant offers, services, and jobs</h1>

      {/* 
         ✅ STICKY TOP HEADER ONLY 
         This stays fixed at the top. z-50 ensures it's above everything.
      */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <TopHeader
          onSearch={handleSearch}
          selectedCountry={selectedCountry}
          onSelectCountry={setSelectedCountry}
          onAddBusiness={() => setEnquiryOpen(true)}
          onSearchClick={(query, isSearch) => {
            if (currentVertical === 'restaurants') {
              handleCuisineSelect(query, isSearch);
            } else {
              if (!isSearch) setSearchQuery(query || "");
              setSearchParams(query ? { search: query } : {}, { replace: true });
              scrollToOffers();
            }
          }}
          searchQuery={searchQuery}
        />
        {/* 
         Vertical Nav reprsent the business vertical nav/tab in the headers .
      */}
        {SHOW_VERTICAL_NAV && (
          <div className="max-w-7xl mx-auto px-4 py-2 overflow-x-auto flex justify-center">
            <VerticalNav compact={false} showLabels={true} className="!pb-0" />
          </div>
        )}
      </div>

      {/* 
         ✅ CATEGORIES (SecondaryNav) 
         This scrolls naturally with the page, but we attach a ref to scroll back to it.
      */}
      <div ref={categoriesRef} className="bg-white">
        <SecondaryNav
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onAddBusiness={() => setEnquiryOpen(true)}
          onCuisineSelect={handleCuisineSelect}
        />
      </div>
      {/* Marketplace category strip */}
      <div className="overflow-hidden bg-green-50 border-green-200">
        <div className="whitespace-nowrap animate-marquee py-1 text-sm font-medium text-green-900">
          <span className="mx-6">
            Browse local listings across Qatar • Vehicles • Accommodation • Services • Classifieds • Jobs • Restaurant offers
          </span>
        </div>
      </div>
      <main className="container mx-auto px-2 py-1">
        <div className="mt-0 relative">
          {/* Overlay placement: Center of FeaturedCard */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-screen max-w-full flex justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <FestivalBanner />
            </div>
          </div>

          <FeaturedCard
            onTextClick={() => setSaveFoodOpen(true)}

            onSuperSaverClick={() => handleCuisineSelect("Super Saver", false)}
            // 2. Pass the calculated boolean
            showSuperSaverButton={hasSuperSaverOffers}
          />
        </div>

        <PopularBrands
          onSelectRestaurant={handleSelectRestaurant}
        />

        {/* Multi-Vertical Browse Section */}

        {!SHOW_CUISINE_NAV && (
          <section className="mb-2">
            <FilterBar onFilterChange={handleFilterChange} />
          </section>
        )}

        <section ref={offersSectionRef} className="mb-4">
          <div className="flex flex-row justify-between items-center mb-1 gap-4">
            <h2 className="brand-gradient-bg text-white px-3 py-1 rounded-md text-sm font-semibold">
              Enjoy your offers...
            </h2>

            <div className="flex items-center gap-2">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="brand-gradient-bg text-white border-none rounded-md text-sm focus:ring-2 focus:ring-white/20 outline-none cursor-pointer py-1 px-2"
              >
                <option value="random" className="text-gray-700 bg-white">Sort By</option>
                <option value="latest" className="text-gray-700 bg-white">Latest</option>
                <option value="best-value" className="text-gray-700 bg-white">Best Value</option>
                <option value="price-asc" className="text-gray-700 bg-white">Low to High</option>
                <option value="price-desc" className="text-gray-700 bg-white">High to Low</option>
              </select>
            </div>
          </div>
          <OffersGrid
            offers={sortedOffers}
            restaurants={restaurants}
            isLoading={loading}
            showOfferDetail={SHOW_OFFER_DETAIL}
            favorites={favorites.filter((favorite) => (favorite.source || "offer") === "offer").map((favorite) => Number(favorite.id)).filter(Number.isFinite)}
            onToggleFavorite={toggleFavorite}
          />
        </section>

        {/* --- Marketplace guide --- */}
        <section className="my-2 max-w-4xl mx-auto px-4">
          <button
            onClick={() => setShowSeoContent(!showSeoContent)}
            className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 rounded-2xl border border-gray-100 transition-colors group"
          >
            <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
              <Info size={16} className="text-blue-400" />
              <span>Guide to the Browse Qatar Marketplace</span>
            </div>
            {showSeoContent ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>

          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showSeoContent ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
            <div className="p-6 bg-white rounded-2xl border border-gray-50 shadow-sm leading-relaxed text-slate-500 text-xs font-sans">
              <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Discover local listings and offers across Qatar</h2>

              <div className="space-y-3">
                <p>
                  Browse Qatar brings together local discovery across <strong>restaurant offers, vehicles, accommodation, services, classifieds, and jobs</strong>. Choose a category, review the details available on a listing, and contact the advertiser or provider directly.
                </p>

                <p>
                  Search and category filters can help narrow the listings shown. Available inventory changes over time, and details such as price, terms, and availability are supplied by the relevant advertiser, service provider, employer, or restaurant.
                </p>

                <h3 className="text-[11px] font-black text-slate-700 pt-1 uppercase">Browse categories</h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Vehicles:</strong> Review advertised vehicles and the details provided by the seller.</li>
                  <li><strong>Accommodation:</strong> Browse homes, apartments, rooms, and other accommodation listings.</li>
                  <li><strong>Services and classifieds:</strong> Explore local service providers and advertised goods.</li>
                  <li><strong>Jobs and restaurant offers:</strong> Review vacancy information or dining promotions shared by advertisers.</li>
                </ul>

                <p>
                  Browse Qatar is a discovery and advertising platform, not the transaction party. Promoted placements, where labeled, are advertising and are not an endorsement. Confirm important details and terms directly before arranging a purchase, service, job application, accommodation, or restaurant visit.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 
        ✅ FLOATING CATEGORIES BUTTON
        Appears only when user scrolls down.
      */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${showFloatBtn ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <button
          onClick={scrollToCategories}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full px-2 py-1 flex items-center gap-2 font-semibold transition-transform hover:scale-105 active:scale-95"
        >
          <LayoutGrid size={15} />
          <span className="text-sm">Categories</span>
        </button>
      </div>

      <footer className="bg-muted py-6 px-4 mt-2 pb-20"> {/* pb-20 adds space for float button */}
        <div className="container mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-3">
            <p className="m-0">© {new Date().getFullYear()} Browse Qatar Marketplace. All rights reserved.</p>
            <span className="text-muted-foreground mr-2">|</span>
            <a href="/terms" className="text-sm text-gray-500 hover:text-blue-600 transition-colors mr-3 underline">
              Terms & Conditions
            </a>
            <span className="text-muted-foreground">|</span>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <img src={'/meraki.webp'} alt="Meraki AI" className="w-6 h-6 object-contain" />
              <span>Powered by MerakiAi</span>
            </div>
          </div>
        </div>
      </footer>
      {/* ✅ Add the Popup Component */}
      <SaveFoodPopup
        isOpen={isSaveFoodOpen}
        onClose={() => setSaveFoodOpen(false)}
        onFindDeals={handleFindBigSavings}
      />
      <EnquiryPopup open={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
    </div >
  );
}

export default Home;