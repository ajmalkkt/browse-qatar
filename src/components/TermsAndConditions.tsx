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
                <title>Terms of Use | Browse Qatar Marketplace</title>
                <meta name="description" content="Review Browse Qatar's marketplace terms for listings, restaurant offers, advertisers, promoted placements, user conduct, and direct transactions." />
                <link rel="canonical" href="https://browseqatar.com/terms" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Terms of Use | Browse Qatar Marketplace" />
                <meta property="og:description" content="Terms for using Browse Qatar to discover listings, restaurant offers, services, accommodation, classifieds, and jobs." />
                <meta property="og:url" content="https://browseqatar.com/terms" />
                <meta property="og:image" content="https://browseqatar.com/bqLogo.jpg" />
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
                        These terms apply when you browse, save, post, or respond to marketplace listings and restaurant offers on Browse Qatar.
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
                                    Browse Qatar is a discovery and advertising marketplace for restaurant offers, vehicles, accommodation, services, classifieds, and job listings. Unless a specific service expressly states otherwise, Browse Qatar is not the seller, buyer, landlord, tenant, employer, applicant, service provider, or restaurant, and does not own or control third-party listings, inventory, or offers. Transactions and arrangements are made directly between the users and the relevant advertiser or provider.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className={`${isV2Theme ? "bg-[#fff7e6] border-[#ead9ca]" : "bg-amber-50/50 border-amber-100"} rounded-2xl p-8 border`}>
                        <div className="flex items-start gap-4">
                            <div className={`${isV2Theme ? "bg-[#fff0c7] text-[#941333]" : "bg-amber-100 text-amber-700"} p-3 rounded-xl`}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">2. Listings, Offers & Advertisements</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Advertisers and providers are responsible for the accuracy, legality, and currency of the information they submit, including prices, descriptions, images, contact information, eligibility, and availability. Information may change; confirm material details directly before paying, visiting, applying, or entering an agreement.
                                </p>
                                <p className="mt-3 text-gray-600 leading-relaxed">
                                    Paid or promoted placements may be labeled as promoted or sponsored. Such placement is advertising and does not mean Browse Qatar guarantees, independently verifies, or endorses the advertiser, item, offer, vacancy, or service.
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
                                <h3 className="text-xl font-bold text-gray-900 mb-2">3. Our Green Initiative</h3>
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
                                <h3 className="text-xl font-bold text-gray-900 mb-2">4. Content & Safety Policy</h3>
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
                                <h3 className="text-xl font-bold text-gray-900 mb-2">5. Data Privacy & Communication</h3>
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
                                <h3 className="text-xl font-bold text-gray-900 mb-2">6. Limitation of Liability</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Browse Qatar provides marketplace information on an "as available" basis. To the extent permitted by applicable law, Browse Qatar is not responsible for third-party listing accuracy, the quality or safety of goods and services, job outcomes, accommodation conditions, restaurant offers, or disputes arising from arrangements between users and advertisers or providers. Nothing in these terms limits any rights that cannot be excluded under applicable law.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-12 text-center border-t border-gray-100 pt-8">
                    <p className="text-sm text-gray-400">
                        Last Updated: November 20, 2026
                    </p>
                </div>
            </main>
            {isV2Theme && <ModernMarketplaceFooter variant="v2" />}
        </div>
    );
};

export default TermsAndConditions;
