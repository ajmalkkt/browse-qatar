import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Utensils, Search, X } from "lucide-react";
import { cuisineLists } from "../config/appConfig";
import TopHeader from "./TopHeader";

const CuisinesPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCuisines = cuisineLists.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Helmet>
                <title>Explore Global Cuisines in Qatar | Browse Qatar</title>
                <meta name="description" content="Discover the variety of cuisines available in Qatar. From traditional Arabic and Qatari dishes to Italian, Chinese, and Indian flavors. Find the best dining deals by cuisine." />
                <link rel="canonical" href="https://browseqatar.com/cuisines" />
                <meta property="og:title" content="Discover Cuisines in Qatar - Arabic, Indian, Italian & More" />
                <meta property="og:description" content="Explore a world of flavors. Browse top dining offers in Qatar categorized by cuisine." />
                <meta property="og:url" content="https://browseqatar.com/cuisines" />
                <meta property="og:image" content="https://browseqatar.com/bqLogo.jpg" />
            </Helmet>

            <div className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center w-full md:w-auto justify-between">
                        <div className="flex items-center gap-3">
                            <Link to="/restaurants-offers" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                                <ArrowLeft size={20} />
                            </Link>
                            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Explore Cuisines</h1>
                        </div>
                        <img src="/bqLogo.jpg" alt="Browse Qatar" className="h-8 w-auto object-contain md:hidden" />
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search cuisines..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <img src="/bqLogo.jpg" alt="Browse Qatar" className="h-8 w-auto object-contain hidden md:block" />
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                <header className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">A World of Flavors in Qatar</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        From spicy street food to elegant fine dining, explore the diverse culinary landscape
                        of Qatar and find amazing offers for your favorite dishes.
                    </p>
                </header>

                {filteredCuisines.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <Utensils size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">No cuisines found matching {searchTerm ? `"${searchTerm}"` : ""}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCuisines.map((cuisine) => (
                        <div
                            key={cuisine.name}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col"
                        >
                            <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                                <img
                                    src={cuisine.img}
                                    alt={cuisine.altText || cuisine.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>

                            <div className="p-5 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {cuisine.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-6 flex-grow leading-relaxed">
                                    {cuisine.description || `Discover the best ${cuisine.name} food offers and dining deals across Doha and Qatar.`}
                                </p>

                                <Link
                                    to={`/restaurants-offers?search=${encodeURIComponent(cuisine.name)}`}
                                    className="w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-2.5 rounded-xl text-center transition-all flex items-center justify-center gap-2"
                                >
                                    View Offers
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
                )}
            </main>

            <footer className="mt-16 py-12 bg-white border-t border-gray-100">
                <div className="container mx-auto px-4 text-center">
                    <img src="/bqLogo.jpg" alt="Browse Qatar" className="h-10 mx-auto mb-6" />
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Browse Qatar Dining Platform. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default CuisinesPage;
