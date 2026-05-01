import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Home, Search } from "lucide-react";

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <Helmet>
                <title>Page Not Found | Browse Qatar</title>
                <meta name="robots" content="noindex" />
            </Helmet>

            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full text-center">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search size={40} />
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>

                <p className="text-gray-500 mb-8 leading-relaxed">
                    Oops! The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track to finding the best dining deals in Qatar.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-[0.98]"
                    >
                        <Home size={18} />
                        Back to Home
                    </Link>
                    <Link
                        to="/all-restaurants"
                        className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all border border-gray-200"
                    >
                        Browse Restaurants
                    </Link>
                </div>

                <button
                    onClick={() => window.history.back()}
                    className="mt-8 text-sm text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                    <ArrowLeft size={14} />
                    Go Back to Previous Page
                </button>
            </div>

            <div className="mt-8 text-center text-gray-400 text-sm">
                <img src="/bqLogo.jpg" alt="Browse Qatar" className="h-8 mx-auto mb-2 opacity-50" />
                <p>© {new Date().getFullYear()} Browse Qatar . All rights reserved.</p>
            </div>
        </div>
    );
};

export default NotFound;
