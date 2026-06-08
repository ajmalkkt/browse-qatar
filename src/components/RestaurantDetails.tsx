import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getRestaurantById } from "../services/restaurantService";
import { MapPin, Star, Utensils, ArrowLeft, ExternalLink, ShieldCheck, Tag } from "lucide-react";

export default function RestaurantDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                if (id) {
                    const data = await getRestaurantById(id);
                    setRestaurant(data);
                }
            } catch (error) {
                console.error("Failed to fetch restaurant details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurant();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <Helmet>
                    <title>Restaurant Not Found | BrowseQatar</title>
                </Helmet>
                <Utensils size={48} className="text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Restaurant Not Found</h2>
                <p className="text-gray-600 mb-6 text-center max-w-md">We couldn't find the details for this restaurant. It may have been removed or the link is incorrect.</p>
                <button
                    onClick={() => navigate("/all-restaurants")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
                >
                    Back to All Restaurants
                </button>
            </div>
        );
    }

    const title = `${restaurant.name} in Qatar - Menus, Offers, Location | BrowseQatar`;
    const description = `Find the latest offers, menu items, and details for ${restaurant.name} located at ${restaurant.address || "Doha, Qatar"}. Enjoy ${restaurant.cuisine?.join(", ")} and more!`;
    const canonicalUrl = `https://browseqatar.com/restaurant/${id}`;

    return (
        <div className="min-h-screen bg-gray-50">
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={restaurant.logoUrl || restaurant.brandUrl || "https://browseqatar.com/bqLogo.jpg"} />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/all-restaurants")}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                            title="Back to Restaurants"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800 truncate">Restaurant Details</h1>
                    </div>
                    <img src="/bqLogo.jpg" alt="Browse Qatar" className="h-8 w-auto" />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Restaurant Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative"></div>
                    <div className="px-6 pb-6 relative">
                        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end mb-4">
                            <div className="w-24 h-24 bg-white rounded-xl shadow-md border-4 border-white flex items-center justify-center p-2 shrink-0 -mt-12 relative z-10">
                                <img
                                    src={restaurant.logoUrl || restaurant.brandUrl || "https://via.placeholder.com/150"}
                                    alt={restaurant.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex-1 pb-1">
                                <h2 className="text-3xl font-bold text-gray-900 mb-1">{restaurant.name}</h2>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <MapPin size={16} className="text-gray-400" />
                                        <span>{restaurant.address || restaurant.location || "Doha, Qatar"}</span>
                                    </div>
                                    <div className="flex items-center gap-1 font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                                        <Star size={14} fill="currentColor" />
                                        <span>{restaurant.rating || "4.5"} Rating</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full sm:w-auto">
                                <Link
                                    to={`/restaurants-offers/?restaurant=${id}`}
                                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm w-full"
                                >
                                    <Tag size={18} />
                                    <span>View Offers</span>
                                </Link>
                            </div>
                        </div>

                        {/* Cuisines */}
                        {Array.isArray(restaurant.cuisine) && restaurant.cuisine.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Cuisines Served</h3>
                                <div className="flex flex-wrap gap-2">
                                    {restaurant.cuisine.map((c: string, idx: number) => (
                                        <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Information Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* About Qatar Food Culture */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4 text-orange-500">
                            <Utensils size={24} />
                            <h3 className="text-xl font-bold text-gray-900">Dining in Qatar</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            Qatar offers a vibrant culinary scene, blending traditional Middle Eastern flavors with international cuisines. Whether you're craving authentic Arabic Mandi, savory shawarmas, or globally-recognized fast food, Doha has it all. This restaurant is part of Qatar's growing ecosystem of amazing food destinations. Experience the rich hospitality and exquisite tastes that make dining in Qatar truly memorable.
                        </p>
                    </div>

                    {/* About BQ Offers */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4 text-blue-600">
                            <ShieldCheck size={24} />
                            <h3 className="text-xl font-bold text-gray-900">BrowseQatar Offers</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm mb-4">
                            BrowseQatar (BQ) connects you with the best dining deals across the country. Our platform ensures you never miss a great offer from your favorite restaurants. 
                        </p>
                        <ul className="text-sm text-gray-600 space-y-2 mb-4">
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Verified discounts and meal deals</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Updated regularly with new menus</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Direct links to order or visit</li>
                        </ul>
                        <Link to={`/restaurants-offers/?restaurant=${id}`} className="text-blue-600 font-semibold hover:underline flex items-center gap-1 text-sm">
                            Check {restaurant.name} Offers Now <ExternalLink size={14} />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
