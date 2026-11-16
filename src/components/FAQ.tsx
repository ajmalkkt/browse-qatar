import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { ModernMarketplaceFooter } from "./ModernMarketplace";

export default function FAQ() {
    const isV2Theme = import.meta.env.VITE_MODERN_VIEW_V2 === "true" || import.meta.env.VITE_MODERN_VIEW === "true";
    return (
        <div className={`min-h-screen flex flex-col ${isV2Theme ? "bg-[#fffdfa] text-[#30252a]" : "bg-gray-50"}`}>
            <Helmet>
                <title>FAQ | Browse Qatar</title>
                <meta
                    name="description"
                    content="Frequently asked questions about Browse Qatar including login, offers, and business registration."
                />
                <link rel="canonical" href="https://browseqatar.com/faq" />
                <link rel="alternate" type="text/markdown" href="/content/faq" />

                {/* SEO FAQ Schema */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    mainEntity: [
                        {
                            "@type": "Question",
                            name: "Do I need to login?",
                            acceptedAnswer: {
                                "@type": "Answer",
                                text: "If you are a business partner, you may need to login to add offers and promotions. Regular customers can browse offers without login or signup."
                            }
                        },
                        {
                            "@type": "Question",
                            name: "What is Browse Qatar?",
                            acceptedAnswer: {
                                "@type": "Answer",
                                text: "Browse Qatar helps users discover food offers and dining deals across Qatar."
                            }
                        },
                        {
                            "@type": "Question",
                            name: "Is it free to use?",
                            acceptedAnswer: {
                                "@type": "Answer",
                                text: "Yes, Browse Qatar is completely free for customers."
                            }
                        },
                        {
                            "@type": "Question",
                            name: "How can I register my business?",
                            acceptedAnswer: {
                                "@type": "Answer",
                                text: "You can register your business by submitting an enquiry through the platform with your contact details and business information."
                            }
                        },
                        {
                            "@type": "Question",
                            name: "How do I contact Browse Qatar?",
                            acceptedAnswer: {
                                "@type": "Answer",
                                text: "You can contact us by submitting an enquiry form with your name, email or phone number, and details of your request."
                            }
                        }
                    ]
                })}} />
            </Helmet>

            {/* Header */}
            <div className={`shadow-sm sticky top-0 z-50 ${isV2Theme ? "bg-[#fffdfa] border-b border-[#ead9ca]" : "bg-white"}`}>
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to="/" className={`flex items-center gap-2 ${isV2Theme ? "text-[#6b5157] hover:text-[#941333]" : "text-gray-600 hover:text-blue-600"}`}>
                        <ArrowLeft size={20} />
                        <span className="hidden sm:inline">Back</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <HelpCircle className={isV2Theme ? "text-[#941333]" : "text-blue-600"} size={24} />
                        <h1 className="text-xl font-bold">FAQ</h1>
                    </div>

                    <img src="/bqLogo.jpg" alt="Browse Qatar" className="h-8" />
                </div>
            </div>

            {/* Content */}
            <main className={`flex-1 py-6 px-4 ${isV2Theme ? "bg-gradient-to-b from-[#fff7e6] to-[#fffdfa]" : "bg-gradient-to-b from-orange-50 to-yellow-50"}`}>
                <div className={`max-w-3xl mx-auto shadow-xl rounded-2xl p-6 border space-y-5 ${isV2Theme ? "bg-[#fffdfa] border-[#ead9ca]" : "bg-white"}`}>

                    <h1 className={`text-xl font-bold text-center mb-4 ${isV2Theme ? "text-[#851432]" : "text-green-900"}`}>
                        Frequently Asked Questions
                    </h1>

                    {/* About */}
                    <div>
                        <h3 className={`font-semibold ${isV2Theme ? "text-[#941333]" : "text-green-800"}`}>What is Browse Qatar?</h3>
                        <p>
                            Browse Qatar is a platform that helps you discover the best food offers,
                            dining deals, and restaurant promotions across Qatar.
                        </p>
                    </div>

                    {/* Free */}
                    <div>
                        <h3 className={`font-semibold ${isV2Theme ? "text-[#941333]" : "text-green-800"}`}>Is it free to use?</h3>
                        <p>Yes, the platform is completely free for customers.</p>
                    </div>

                    {/* Login */}
                    <div>
                        <h3 className={`font-semibold ${isV2Theme ? "text-[#941333]" : "text-green-800"}`}>Do I need to login?</h3>
                        <p>
                            If you are a <strong>business partner</strong>, you may need to login to add your
                            offers and promotions.
                        </p>
                        <p className="mt-1">
                            If you are a <strong>customer looking for deals</strong>, you can browse and use offers
                            without login or signup.
                        </p>
                    </div>

                    {/* Offers */}
                    <div>
                        <h3 className={`font-semibold ${isV2Theme ? "text-[#941333]" : "text-green-800"}`}>How do I use an offer?</h3>
                        <p>
                            You can visit the restaurant or follow the instructions provided with each deal.
                        </p>
                    </div>

                    {/* Updates */}
                    <div>
                        <h3 className={`font-semibold ${isV2Theme ? "text-[#941333]" : "text-green-800"}`}>Are offers updated regularly?</h3>
                        <p>
                            Yes, offers are updated frequently to ensure accuracy and availability.
                        </p>
                    </div>

                    {/* Registration */}
                    <div>
                        <h3 className={`font-semibold ${isV2Theme ? "text-[#941333]" : "text-green-800"}`}>How can I register my business?</h3>
                        <p>
                            You can register your business by submitting an enquiry through our platform.
                        </p>
                        <p className="mt-1">
                            Provide your <strong>name, email or phone number, and business details</strong>.
                            Our team will review and get in touch with you.
                        </p>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className={`font-semibold ${isV2Theme ? "text-[#941333]" : "text-green-800"}`}>How can I contact Browse Qatar?</h3>
                        <p>
                            Use the enquiry form available on the platform to send us your request.
                        </p>
                        <p className="mt-1">
                            You can share your details and message, and our team will respond shortly.
                        </p>
                    </div>

                </div>
            </main>

            {/* Footer */}
            {isV2Theme ? <ModernMarketplaceFooter variant="v2" /> : <footer className="bg-white py-6 text-center text-sm text-gray-500 border-t">
                © {new Date().getFullYear()} BrowseQatar. All rights reserved.
            </footer>}
        </div>
    );
}