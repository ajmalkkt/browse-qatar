import { Link } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, CarFront, Home, Tag, Utensils, Wrench } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { ModernMarketplaceFooter } from "./ModernMarketplace";

const features = [
    { title: "Restaurant offers", description: "Explore dining promotions and restaurant offers shared for customers across Qatar.", icon: Utensils, href: "/marketplace/restaurants" },
    { title: "Vehicles", description: "Browse vehicle advertisements, review available specifications, and contact the advertiser directly.", icon: CarFront, href: "/marketplace/vehicles" },
    { title: "Accommodation", description: "Discover accommodation listings such as homes, apartments, and rooms, with details provided by each advertiser.", icon: Home, href: "/marketplace/accommodations" },
    { title: "Local services", description: "Find service listings and provider information to help you compare options in Qatar.", icon: Wrench, href: "/marketplace/services" },
    { title: "Classifieds", description: "Browse advertised items such as furniture, electronics, appliances, and other local finds.", icon: Tag, href: "/marketplace/classifieds" },
    { title: "Jobs", description: "Explore job advertisements and review role details and application instructions from the advertiser.", icon: BriefcaseBusiness, href: "/marketplace/jobs" },
];

export default function Features() {
    const isV2Theme = import.meta.env.VITE_MODERN_VIEW_V2 === "true" || import.meta.env.VITE_MODERN_VIEW === "true";

    return (
        <div className={`flex min-h-screen flex-col ${isV2Theme ? "bg-[#fffdfa] text-[#30252a]" : "bg-gray-50 text-gray-800"}`}>
            <Helmet>
                <title>Browse Qatar Marketplace Features | Local Listings and Offers</title>
                <meta name="description" content="Explore Browse Qatar features for discovering restaurant offers, vehicles, accommodation, services, classifieds, and jobs across Qatar." />
                <link rel="canonical" href="https://browseqatar.com/features" />
                <link rel="alternate" type="text/markdown" href="https://browseqatar.com/content/features.md" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Browse Qatar Marketplace Features" />
                <meta property="og:description" content="Discover local listings and offers across six categories in Qatar." />
                <meta property="og:url" content="https://browseqatar.com/features" />
                <meta property="og:image" content="https://browseqatar.com/bqLogo.jpg" />
            </Helmet>

            <header className={`sticky top-0 z-30 border-b shadow-sm ${isV2Theme ? "border-[#ead9ca] bg-[#fffdfa]" : "border-gray-100 bg-white"}`}>
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <Link to="/" className={`inline-flex items-center gap-2 text-sm font-semibold ${isV2Theme ? "text-[#6b5157] hover:text-[#941333]" : "text-gray-600 hover:text-blue-600"}`}>
                        <ArrowLeft size={18} /> <span>Home</span>
                    </Link>
                    <h1 className={`text-lg font-bold sm:text-xl ${isV2Theme ? "text-[#851432]" : "text-gray-900"}`}>Marketplace features</h1>
                    <img src="/bqLogo.jpg" alt="Browse Qatar" className="h-8 w-auto object-contain" />
                </div>
            </header>

            <main className={`flex-1 px-4 py-8 sm:py-12 ${isV2Theme ? "bg-gradient-to-b from-[#fff7e6] to-[#fffdfa]" : "bg-gradient-to-b from-orange-50 to-yellow-50"}`}>
                <div className="mx-auto max-w-5xl">
                    <div className="mx-auto mb-8 max-w-3xl text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#941333]">Browse Qatar</p>
                        <h2 className="mt-2 text-2xl font-black text-[#30252a] sm:text-4xl">One place to discover local listings and offers</h2>
                        <p className="mt-3 text-sm leading-6 text-[#66565a] sm:text-base">
                            Search by category, review listing information, save favorites, and contact advertisers, sellers, service providers, employers, or restaurants directly.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map(({ title, description, icon: Icon, href }) => (
                            <Link key={href} to={href} className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${isV2Theme ? "border-[#ead9ca] bg-white hover:border-[#d7aeb0]" : "border-gray-200 bg-white"}`}>
                                <span className="grid size-11 place-items-center rounded-xl bg-[#fff0c7] text-[#941333]"><Icon size={22} /></span>
                                <h3 className="mt-4 font-bold text-[#851432]">{title} in Qatar</h3>
                                <p className="mt-2 text-sm leading-6 text-[#66565a]">{description}</p>
                                <span className="mt-4 inline-block text-sm font-semibold text-[#941333]">Browse {title.toLowerCase()} →</span>
                            </Link>
                        ))}
                    </div>

                    <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-5 text-[#806d70]">
                        Browse Qatar is a discovery platform. Listing details and availability are supplied by advertisers and providers; confirm terms directly before arranging a purchase, service, job application, accommodation, or restaurant visit.
                    </p>
                </div>
            </main>
            {isV2Theme ? <ModernMarketplaceFooter variant="v2" /> : <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} Browse Qatar. All rights reserved.</footer>}
        </div>
    );
}
