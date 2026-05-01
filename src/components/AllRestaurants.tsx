import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getAllRestaurants } from "../services/restaurantService";
import { Search, MapPin, Star, Utensils, ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from "lucide-react";

export default function AllRestaurants() {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20; // 5 columns * 4 rows = 20 items

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = restaurants.filter(r =>
            (r.name && r.name.toLowerCase().includes(term)) ||
            (Array.isArray(r.cuisine) && r.cuisine.some((c: string) => c.toLowerCase().includes(term)))
        );


        setFilteredRestaurants(filtered);
        setCurrentPage(1); // Reset to first page on search
    }, [searchTerm, restaurants]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getAllRestaurants();
            setRestaurants(data || []);
            setFilteredRestaurants(data || []);
        } catch (error) {
            console.error("Failed to load restaurants", error);
        } finally {
            setLoading(false);
        }
    };

    // Pagination Logic
    const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRestaurants.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Helmet>
                <title>All Restaurants in Qatar | Browse Best Dining Places & Cuisines – BrowseQatar</title>
                <meta name="description" content="Explore a comprehensive list of restaurants in Qatar. Search by cuisine, location, and rating to find the perfect dining spot for your next meal." />
                <link rel="canonical" href="https://browseqatar.com/all-restaurants" />
                <meta property="og:title" content="Find Restaurants in Qatar - Browse Best Dining Places" />
                <meta property="og:description" content="Discover restaurants across Qatar. Search by cuisine, view ratings, and find the best locations to dine in Doha and beyond." />
                <meta property="og:url" content="https://browseqatar.com/all-restaurants" />
                <meta property="og:image" content="https://browseqatar.com/bqLogo.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={() => navigate("/")}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                                title="Back to Home"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <img src="/bqLogo.jpg" alt="Browse Qatar" className="h-8 w-auto hidden sm:block" />
                            <h1 className="text-xl font-bold text-gray-800">Restaurants</h1>

                        </div>

                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search restaurants or cuisines..."
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
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredRestaurants.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <Utensils size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">No restaurants found matching {searchTerm ? `"${searchTerm}"` : ""}</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            {currentItems.map((r) => (
                                <div
                                    key={r.id}
                                    onClick={() => navigate(`/?restaurant=${r.id}`)}
                                    className="bg-white rounded-xl shadow-sm border-2 border-gray-300 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full"
                                >
                                    <div className="h-20 bg-gray-50 relative overflow-hidden flex items-center justify-center p-1">
                                        {/* Logo Display */}
                                        <img
                                            src={r.logoUrl || r.brandUrl || "https://via.placeholder.com/150"}
                                            alt={r.name}
                                            className="w-14 h-14 object-contain drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>

                                    <div className="p-2 flex-1 flex flex-col">
                                        <h3 className="font-bold text-gray-800 truncate mb-0.5 text-sm" title={r.name}>{r.name}</h3>

                                        <div className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
                                            <MapPin size={10} className="text-gray-400" />
                                            <span className="truncate">{r.address || r.location || "Doha, Qatar"}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-1 mb-1">
                                            {Array.isArray(r.cuisine) && r.cuisine.length > 0 ? (
                                                r.cuisine.slice(0, 2).map((c: string, idx: number) => (
                                                    <span key={idx} className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0 rounded-full border border-blue-100 truncate max-w-[70px]">
                                                        {c}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[9px] bg-gray-50 text-gray-600 px-1.5 py-0 rounded-full border border-gray-100">General</span>
                                            )}
                                            {Array.isArray(r.cuisine) && r.cuisine.length > 2 && (
                                                <span className="text-[9px] text-gray-400">+{r.cuisine.length - 2}</span>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-1 border-t border-gray-50 flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500">
                                                <Star size={10} fill="currentColor" />

                                                {r.rating || "4.5"}
                                            </div>
                                            <span className="text-xs text-blue-600 font-medium group-hover:underline">View Offers</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8 mb-8">
                                <button
                                    onClick={() => paginate(1)}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-full border ${currentPage === 1 ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm'}`}
                                    title="First Page"
                                >
                                    <ChevronsLeft size={20} />
                                </button>
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-full border ${currentPage === 1 ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm'}`}
                                    title="Previous Page"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <span className="text-sm font-medium text-gray-600 mx-2">
                                    Page <span className="text-gray-900 font-bold">{currentPage}</span> of {totalPages}
                                </span >

                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-full border ${currentPage === totalPages ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm'}`}
                                    title="Next Page"
                                >
                                    <ChevronRight size={20} />
                                </button>
                                <button
                                    onClick={() => paginate(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-full border ${currentPage === totalPages ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm'}`}
                                    title="Last Page"
                                >
                                    <ChevronsRight size={20} />
                                </button>
                            </div >
                        )}
                    </>
                )}
            </main>
        </div >
    );
}
