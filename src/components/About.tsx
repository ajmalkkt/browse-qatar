import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { cuisineLists } from "../config/appConfig";
import { ModernMarketplaceFooter } from "./ModernMarketplace";

export default function AboutUs() {
  const navigate = useNavigate();
  const isV2Theme = import.meta.env.VITE_MODERN_VIEW_V2 === "true" || import.meta.env.VITE_MODERN_VIEW === "true";

  // Use the synchronized cuisine list from config for SEO consistency
  const cuisineImages = cuisineLists.slice(0, 12); // Use a subset for the animated banner

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % cuisineImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [cuisineImages.length]);

  return (
    <div className={`min-h-screen flex flex-col ${isV2Theme ? "bg-[#fffdfa] text-[#30252a]" : "bg-gray-50"}`}>
      <Helmet>
        <title>About Browse Qatar | Qatar Local Marketplace</title>
        <meta name="description" content="Learn about Browse Qatar, a local marketplace to discover restaurant offers, vehicles, accommodation, services, classifieds and jobs across Qatar." />
        <link rel="canonical" href="https://browseqatar.com/about" />
        <link rel="alternate" type="text/markdown" href="https://browseqatar.com/content/about.md" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="About Browse Qatar | Qatar Local Marketplace" />
        <meta property="og:description" content="Discover a Qatar marketplace for restaurant offers, vehicles, accommodation, services, classifieds and jobs." />
        <meta property="og:url" content="https://browseqatar.com/about" />
        <meta property="og:image" content="https://browseqatar.com/bqLogo.jpg" />
      </Helmet>

      {/* Header */}
      <div className={`sticky top-0 z-50 shadow-sm ${isV2Theme ? "border-b border-[#ead9ca] bg-[#fffdfa]" : "bg-white"}`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className={`flex items-center gap-2 transition-colors ${isV2Theme ? "text-[#6b5157] hover:text-[#941333]" : "text-gray-600 hover:text-blue-600"}`}>
            <ArrowLeft size={20} />
            <span className="font-semibold hidden sm:inline">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Info className={isV2Theme ? "text-[#941333]" : "text-blue-600"} size={24} />
            <h1 className={`text-xl font-bold ${isV2Theme ? "text-[#851432]" : "text-gray-900"}`}>About Browse Qatar</h1>
          </div>
          <img src="/bqLogo.jpg" alt="Browse Qatar" className="h-8 w-auto object-contain" />
        </div>
      </div>

      <main className={`flex-1 px-4 py-6 ${isV2Theme ? "bg-gradient-to-b from-[#fff7e6] to-[#fffdfa]" : "bg-gradient-to-b from-orange-50 to-yellow-50"}`}>
        <div className={`relative mx-auto max-w-3xl overflow-hidden rounded-2xl border shadow-xl ${isV2Theme ? "border-[#ead9ca] bg-[#fffdfa]" : "border-gray-200 bg-white"}`}>

          {/* Animated Top Banner */}
          <div className="relative h-56 w-full overflow-hidden">
            {cuisineImages.map((c, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImage ? "opacity-100" : "opacity-0"
                  }`}
                style={{
                  backgroundImage: `url(${c.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/70"></div>
          </div>

          {/* Content */}
          <div className="p-6 relative z-10">

            <h1 className={`mb-2 text-center text-lg font-black leading-tight md:text-2xl ${isV2Theme ? "text-[#851432]" : "text-green-900"}`}>
              A Local Marketplace for Life in Qatar
            </h1>

            {/* Core About Text */}
            <p className="mb-4 text-center leading-relaxed text-gray-700">
              Browse Qatar brings local discovery together in one place. Explore restaurant offers, vehicles, accommodation, services, classifieds, and job listings across Qatar, then review each listing and contact the advertiser or provider directly.
            </p>

            <p className="mb-4 leading-relaxed text-gray-700">
              Whether you are looking for a car in Doha, a home or room to rent, a local professional, a second-hand item, a new career opportunity, or a restaurant deal, Browse Qatar helps you search by category and discover relevant local listings.
            </p>

            <p className="mb-4 leading-relaxed text-gray-700">
              Browse Qatar is a discovery and advertising platform, not the seller, landlord, employer, service provider, or restaurant. Listing details and availability are provided by advertisers and providers; please confirm important details directly before making a decision or transaction.
            </p>

            <p className="mb-6 leading-relaxed text-gray-700">
              Restaurants can share dining offers, while individuals and businesses can advertise eligible vehicles, accommodation, services, items, and job opportunities. Promoted placements may be marked and do not replace your own review of a listing.
            </p>

            <h2 className={`mt-6 mb-3 text-center text-base font-semibold md:text-lg ${isV2Theme ? "text-[#851432]" : "text-green-900"}`}>
              Explore Browse Qatar Categories
            </h2>
            <nav aria-label="Browse marketplace categories" className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {[["restaurants", "Restaurant offers"], ["vehicles", "Vehicles"], ["accommodations", "Accommodation"], ["services", "Local services"], ["classifieds", "Classifieds"], ["jobs", "Jobs"]].map(([path, label]) => (
                <Link key={path} to={`/marketplace/${path}`} className={`rounded-lg border px-3 py-2 text-center font-semibold transition ${isV2Theme ? "border-[#ead9ca] bg-[#fff7e6] text-[#851432] hover:bg-[#fff0c7]" : "border-gray-200 bg-white text-gray-700 hover:bg-orange-50"}`}>{label} in Qatar</Link>
              ))}
            </nav>

            {/* Cuisine Icons */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-6">
              {cuisineImages.map((e) => (
                <div key={e.name} className="flex flex-col items-center justify-center">
                  <img
                    src={e.img}
                    alt={e.name}
                    className="w-16 h-16 object-contain hover:scale-110 transition-transform"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      {isV2Theme ? <ModernMarketplaceFooter variant="v2" /> : <footer className="border-t border-gray-100 bg-white px-4 py-6">
        <div className="container mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-3">
            <p className="m-0 text-gray-600 text-sm">
              © {new Date().getFullYear()} Browse Qatar Marketplace. All rights reserved.
            </p>
            <span className="text-muted-foreground">|</span>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <img src="/meraki.webp" alt="Meraki AI" className="w-5 h-5 object-contain" />
              <span>Powered by MerakiAi</span>
            </div>
          </div>
        </div>
      </footer>}
    </div>
  );
}
