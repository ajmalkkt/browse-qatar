import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Shield, Leaf, FileText, Lock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ModernMarketplaceFooter } from "./ModernMarketplace";

const TermsAndConditions = () => {
    const navigate = useNavigate();
    const isV2Theme = import.meta.env.VITE_MODERN_VIEW_V2 === "true" || import.meta.env.VITE_MODERN_VIEW === "true";

    return (
        <div className={`min-h-screen font-sans ${isV2Theme ? "bg-[#fffdfa] text-[#30252a]" : "bg-white text-gray-800"}`}>
            <Helmet>
                <title>Terms of Use | Browse Qatar - Dining Offers Platform</title>
                <meta name="description" content="Read the terms and conditions for using Browse Qatar. Learn about our platform nature, eco-friendly mission, and data privacy policies." />
                <link rel="canonical" href="https://browseqatar.com/terms" />
            </Helmet>
            {/* Header */}
            <header className={`sticky top-0 z-10 ${isV2Theme ? "bg-[#fffdfa] border-b border-[#ead9ca]" : "bg-white border-b border-gray-100"}`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/')}
                            className={`p-2 rounded-full transition-colors ${isV2Theme ? "text-[#6b5157] hover:bg-[#fff1c9] hover:text-[#941333]" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <img src="/bqLogo.jpg" alt="Browse Qatar" className="h-6 w-auto" />
                        <h1 className={`text-xl font-bold tracking-tight ${isV2Theme ? "text-[#851432]" : "text-gray-900"}`}>Terms of Use</h1>

                    </div>
                </div>
            </header>

            <main className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${isV2Theme ? "bg-[#fffdfa]" : ""}`}>

                {/* Intro Section */}
                <div className="mb-12 text-center">
                    <h2 className={`text-3xl font-bold mb-4 ${isV2Theme ? "text-[#851432]" : "text-gray-900"}`}>Welcome to BrowseQatar</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        We are committed to creating a transparent, safe, and eco-friendly platform.
                        Please read our terms carefully to understand our mutual agreement.
                    </p>
                </div>

                <div className="grid gap-8">
                    {/* 1. Platform Nature */}
                    <section className={`${isV2Theme ? "bg-[#fff7e6] border-[#ead9ca]" : "bg-blue-50/50 border-blue-100"} rounded-2xl p-8 border`}>
                        <div className="flex items-start gap-4">
                            <div className={`${isV2Theme ? "bg-[#fff0c7] text-[#941333]" : "bg-blue-100 text-blue-600"} p-3 rounded-xl`}>
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">1. Platform Nature</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    BrowseQatar acts exclusively as an <strong>Offer Aggregator Platform</strong>. We do not sell products, manage inventory, or handle payment transactions for goods. Our sole purpose is to connect users with offers from partner restaurants. Any transaction or service agreement is strictly between the user and the respective restaurant.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 2. Eco-Friendly Mission */}
                    <section className={`${isV2Theme ? "bg-[#fff7e6] border-[#ead9ca]" : "bg-green-50/50 border-green-100"} rounded-2xl p-8 border`}>
                        <div className="flex items-start gap-4">
                            <div className={`${isV2Theme ? "bg-[#fff0c7] text-[#941333]" : "bg-green-100 text-green-600"} p-3 rounded-xl`}>
                                <Leaf size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">2. Our Green Initiative</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    We are dedicated to sustainable practices. A core part of our mission is to <strong>Help Save Food</strong> and reduce waste. We prioritize partners who share our eco-friendly values. Users and partners are encouraged to use our platform to promote sustainable consumption and reduce environmental impact.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 3. Content Policy */}
                    <section className={`${isV2Theme ? "bg-[#fff7e6] border-[#ead9ca]" : "bg-red-50/50 border-red-100"} rounded-2xl p-8 border`}>
                        <div className="flex items-start gap-4">
                            <div className={`${isV2Theme ? "bg-[#fff0c7] text-[#941333]" : "bg-red-100 text-red-600"} p-3 rounded-xl`}>
                                <Shield size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">3. Content & Safety Policy</h3>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    We maintain a <strong>Zero Tolerance Policy</strong> for offensive or harmful content. Uploading or sharing content that depicts, encourages, or relates to:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-4">
                                    <li>War, violence, or political disputes.</li>
                                    <li>Hate speech, discrimination, or harassment.</li>
                                    <li>Illegal activities or potentially dangerous behavior.</li>
                                </ul>
                                <p className="text-gray-600 leading-relaxed">
                                    ...is strictly prohibited. Violators will be immediately banned, and relevant authorities may be notified if necessary.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 4. Privacy & Data Use */}
                    <section className={`${isV2Theme ? "bg-[#fff7e6] border-[#ead9ca]" : "bg-purple-50/50 border-purple-100"} rounded-2xl p-8 border`}>
                        <div className="flex items-start gap-4">
                            <div className={`${isV2Theme ? "bg-[#fff0c7] text-[#941333]" : "bg-purple-100 text-purple-600"} p-3 rounded-xl`}>
                                <Lock size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">4. Data Privacy & Communication</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    We respect your privacy. All personal information (such as Name, Email, and Phone Number) collected is used <strong>solely for communication related to your partnership or activities with BrowseQatar</strong>.
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600 mt-4">
                                    <li>We <strong>DO NOT</strong> sell, rent, or share your personal data with third-party agencies for marketing or any other purpose.</li>
                                    <li>Your contact details are used only to update you on offers, account status, or important platform announcements.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 5. Limitation of Liability */}
                    <section className={`${isV2Theme ? "bg-[#fff7e6] border-[#ead9ca]" : "bg-gray-50 border-gray-100"} rounded-2xl p-8 border`}>
                        <div className="flex items-start gap-4">
                            <div className={`${isV2Theme ? "bg-[#fff0c7] text-[#941333]" : "bg-gray-200 text-gray-600"} p-3 rounded-xl`}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">5. Limitation of Liability</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    BrowseQatar acts as an information service. While we strive for accuracy, we adhere to a standard "As Is" liability policy. We are not responsible for the quality, safety, or legality of the offers provided by third-party restaurants, nor for any disputes arising from transactions between users and partners.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-12 text-center border-t border-gray-100 pt-8">
                    <p className="text-sm text-gray-400">
                        Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </main>
            {isV2Theme && <ModernMarketplaceFooter variant="v2" />}
        </div>
    );
};

export default TermsAndConditions;
