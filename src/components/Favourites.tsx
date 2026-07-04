import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useFavoritesContext } from "../contexts/FavoritesContext";
import OffersGrid from "./OffersGrid";
import TopHeader from "./TopHeader";
import { getAllRestaurants } from "../services/restaurantService";
import { useEffect, useState } from "react";
import EnquiryPopup from "./EnquiryPopup";

export default function Favourites() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, refreshFavorites, isLoading } = useFavoritesContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("Qatar");
  const [restaurants, setRestaurants] = useState([] as any[]);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  // Filter favorites by search query if needed
  const filteredFavorites = favorites.filter((offer) => {
    const query = searchQuery.toLowerCase();
    return (
      offer.title.toLowerCase().includes(query) ||
      offer.description.toLowerCase().includes(query)
    );
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleToggleFavorite = (offer: any) => {
    toggleFavorite(offer);
  };

  // Load restaurant list so OffersGrid can resolve restaurant names
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getAllRestaurants();
        if (mounted) setRestaurants(res || []);
      } catch (err) {
        console.error('Error loading restaurants for favourites:', err);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Refresh favourite offers with latest data on mount (and when favorites change)
  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        // call refreshFavorites if available
        if (refreshFavorites) await refreshFavorites();
        if (mounted) setLastRefreshed(new Date());
      } catch (err) {
        console.error('Error refreshing favourites:', err);
      }
    };
    if (mounted) refresh();
    return () => { mounted = false; };
  }, []);

  const handleManualRefresh = async () => {
    try {
      if (refreshFavorites) await refreshFavorites();
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Manual refresh failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>My Favorite Offers | Browse Qatar - Best Dining Deals Saved</title>
        <meta name="description" content="View and manage your favorite dining deals, food offers, and restaurant discounts in Qatar. Save the best buffet and lunch offers to your personal list on Browse Qatar." />
        <link rel="canonical" href="https://browseqatar.com/favourites" />
      </Helmet>
      <TopHeader
        onSearch={handleSearch}
        selectedCountry={selectedCountry}
        onSelectCountry={setSelectedCountry}
        onAddBusiness={() => setEnquiryOpen(true)}
        onSearchClick={() => { }}
        searchQuery={searchQuery}
      />

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">My Favorite Offers</h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 transition-colors"
            >
              Refresh
            </button>
            {lastRefreshed && (
              <div className="text-xs text-muted-foreground">Last refreshed: {lastRefreshed.toLocaleTimeString()}</div>
            )}
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Your Favorite Food Offers in Qatar</h2>
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-8 text-left">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Planning your next meal in Doha? <strong>Browse Qatar</strong> makes it easy to keep track of the
                  <strong> best food offers in Qatar today</strong>. By clicking the heart icon on any deal, you can save
                  <strong> cheap food offers</strong>, <strong>family dinner buffet offers</strong>, and exclusive
                  <strong> dining deals in Qatar</strong> right here.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <p className="text-gray-600">Save <strong>budget-friendly dining options</strong> from QAR 5 to 20 for quick access.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <p className="text-gray-600">Compare <strong>top food offers in Qatar</strong> before you head out to dine.</p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2">No favorites yet?</h3>
              <p className="text-muted-foreground mb-8 text-sm">
                Start building your personalized food guide today. Click the heart icon on any restaurant or offer
                across the platform to see it listed here instantly.
              </p>

              <button
                onClick={() => navigate("/")}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md font-bold"
              >
                Start Browsing Best Offers
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredFavorites.length} favorite offer{filteredFavorites.length !== 1 ? "s" : ""}
            </p>
            <OffersGrid
              offers={filteredFavorites}
              restaurants={restaurants}
              isLoading={false}
              showOfferDetail={true}
              favorites={favorites.map((f) => f.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          </>
        )}
      </main>

      <footer className="bg-muted py-6 px-4 mt-12">
        <div className="container mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-3">
            <p className="m-0">© {new Date().getFullYear()} BrowseQatar Offers Platform. All rights reserved.</p>
            <span className="text-muted-foreground">|</span>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <img src={"/meraki.webp"} alt="Meraki AI" className="w-6 h-6 object-contain" />
              <span>Powered by MerakiAi</span>
            </div>
          </div>
        </div>
      </footer>
      <EnquiryPopup open={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
    </div>
  );
}
