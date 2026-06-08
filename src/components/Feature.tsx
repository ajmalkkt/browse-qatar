import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function Features() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Helmet>
                <title>Features | Browse Qatar - Food Deals Platform</title>
                <meta
                    name="description"
                    content="Explore features of Browse Qatar including food deals, affordable dining, family offers, and real-time restaurant updates across Doha."
                />
                <link rel="canonical" href="https://browseqatar.com/features" />

                <link rel="alternate" type="text/markdown" href="/content/features" />
            </Helmet>

            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                        <ArrowLeft size={20} />
                        <span className="hidden sm:inline">Back</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Star className="text-yellow-500" size={24} />
                        <h1 className="text-xl font-bold">Features</h1>
                    </div>

                    <img src="/bqLogo.jpg" alt="Browse Qatar" className="h-8" />
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 py-6 px-4 bg-gradient-to-b from-orange-50 to-yellow-50">
                <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6 border">

                    <h1 className="text-xl font-bold text-green-900 text-center mb-4">
                        Powerful Features for Food Discovery
                    </h1>

                    <div className="space-y-5 text-gray-700">

                        <div>
                            <h3 className="font-semibold text-green-800">🍽 Discover Food Offers</h3>
                            <p>Browse the best food deals in Qatar from restaurants, cafés, and hotels.</p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-green-800">💰 Affordable Dining</h3>
                            <p>Find budget-friendly meals starting from QAR 5 to premium dining options.</p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-green-800">📍 Smart Search</h3>
                            <p>Filter by cuisine, location, and price to find the perfect deal.</p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-green-800">⏱ Real-Time Updates</h3>
                            <p>Offers are updated frequently so you always see the latest deals.</p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-green-800">👨‍👩‍👧‍👦 Family Dining</h3>
                            <p>Discover buffet offers and group deals for special occasions.</p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-green-800">🌱 Sustainability</h3>
                            <p>Helping reduce food wastage by promoting unused restaurant capacity.</p>
                        </div>

                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white py-6 text-center text-sm text-gray-500 border-t">
                © {new Date().getFullYear()} BrowseQatar. All rights reserved.
            </footer>
        </div>
    );
}