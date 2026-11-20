import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { ModernMarketplaceFooter } from "./ModernMarketplace";

const faqItems = [
    {
        question: "What is Browse Qatar?",
        answer: "Browse Qatar is a local discovery marketplace where people can explore restaurant offers, vehicles, accommodation, services, classifieds, and job advertisements across Qatar.",
    },
    {
        question: "Which categories can I browse?",
        answer: "Browse Qatar currently features restaurant offers, vehicles, accommodation, local services, classifieds, and jobs. Available listings may vary by category and location.",
    },
    {
        question: "Do I need an account to browse?",
        answer: "You can browse public listings without signing in. Some features, such as syncing favorites across devices or managing an advertisement, may require an account.",
    },
    {
        question: "How do I contact a seller, service provider, employer, or restaurant?",
        answer: "Open the relevant listing or offer and use the contact details or enquiry options shown there. Confirm availability, terms, and other important details directly with the advertiser or provider.",
    },
    {
        question: "Does Browse Qatar sell items or complete transactions?",
        answer: "No. Browse Qatar helps people discover advertisements and offers. The transaction, service, job application, accommodation arrangement, or restaurant purchase is handled directly with the relevant advertiser or provider.",
    },
    {
        question: "Are listings and offers independently verified?",
        answer: "Listing information is supplied by advertisers, providers, or businesses. Browse Qatar does not guarantee that every detail, price, or availability is independently verified, so please confirm information directly before proceeding.",
    },
    {
        question: "What does a promoted listing mean?",
        answer: "A promoted or sponsored label indicates paid or featured placement where shown. Promotion affects visibility and is not an endorsement or guarantee of the advertiser, listing, product, or service.",
    },
    {
        question: "Can I save favorites?",
        answer: "Yes. You can save supported listings and offers to your favorites. Favorites may be stored in this browser while signed out; signing in enables account synchronization where available.",
    },
    {
        question: "How can a business or advertiser list an offering?",
        answer: "Use the Sell or listing action in Browse Qatar, sign in if prompted, choose the relevant category, and provide accurate information. Posting options and eligibility may depend on the category.",
    },
    {
        question: "What should I do if I see a suspicious or inaccurate listing?",
        answer: "Do not share sensitive information or send payment until you have independently checked the advertiser and terms. Contact Browse Qatar through the available enquiry channel with the listing details so it can be reviewed.",
    },
];

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
    })),
};

export default function FAQ() {
    const isV2Theme = import.meta.env.VITE_MODERN_VIEW_V2 === "true" || import.meta.env.VITE_MODERN_VIEW === "true";
    return (
        <div className={`flex min-h-screen flex-col ${isV2Theme ? "bg-[#fffdfa] text-[#30252a]" : "bg-gray-50"}`}>
            <Helmet>
                <title>Help & FAQ | Browse Qatar Marketplace</title>
                <meta name="description" content="Get help using Browse Qatar. Learn about marketplace categories, contacting advertisers, favorites, promoted listings, and account features." />
                <link rel="canonical" href="https://browseqatar.com/faq" />
                <link rel="alternate" type="text/markdown" href="https://browseqatar.com/content/faq.md" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Help & FAQ | Browse Qatar" />
                <meta property="og:description" content="Answers about browsing listings, restaurant offers, favorites, advertisers, and promoted placements on Browse Qatar." />
                <meta property="og:url" content="https://browseqatar.com/faq" />
                <meta property="og:image" content="https://browseqatar.com/bqLogo.jpg" />
                <script type="application/ld+json">{JSON.stringify(faqSchema).replace(/</g, "\\u003c")}</script>
            </Helmet>

            <header className={`sticky top-0 z-30 border-b shadow-sm ${isV2Theme ? "border-[#ead9ca] bg-[#fffdfa]" : "bg-white"}`}>
                <div className="container mx-auto flex items-center justify-between px-4 py-3">
                    <Link to="/" className={`flex items-center gap-2 ${isV2Theme ? "text-[#6b5157] hover:text-[#941333]" : "text-gray-600 hover:text-blue-600"}`}>
                        <ArrowLeft size={20} /><span className="hidden sm:inline">Home</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <HelpCircle className={isV2Theme ? "text-[#941333]" : "text-blue-600"} size={24} />
                        <h1 className="text-xl font-bold">Help & FAQ</h1>
                    </div>
                    <img src="/bqLogo.jpg" alt="Browse Qatar" className="h-8 w-auto" />
                </div>
            </header>

            <main className={`flex-1 px-4 py-8 ${isV2Theme ? "bg-gradient-to-b from-[#fff7e6] to-[#fffdfa]" : "bg-gradient-to-b from-orange-50 to-yellow-50"}`}>
                <div className={`mx-auto max-w-3xl rounded-2xl border p-6 shadow-xl sm:p-8 ${isV2Theme ? "border-[#ead9ca] bg-white" : "bg-white"}`}>
                    <h2 className="text-center text-2xl font-black text-[#851432]">Browse Qatar marketplace help</h2>
                    <p className="mt-2 text-center text-sm text-[#66565a]">Information about categories, listings, offers, and contacting advertisers across Qatar.</p>
                    <div className="mt-7 space-y-5">
                        {faqItems.map(({ question, answer }) => (
                            <section key={question} className="border-b border-[#f1e4d6] pb-4 last:border-0">
                                <h3 className="font-semibold text-[#941333]">{question}</h3>
                                <p className="mt-1 text-sm leading-6 text-[#66565a]">{answer}</p>
                            </section>
                        ))}
                    </div>
                    <p className="mt-4 text-sm text-[#66565a]">
                        For full platform rules, read our <Link to="/terms" className="font-semibold text-[#941333] underline">Terms of Use</Link>. Explore <Link to="/features" className="font-semibold text-[#941333] underline">marketplace features</Link> or <Link to="/about" className="font-semibold text-[#941333] underline">learn about Browse Qatar</Link>.
                    </p>
                </div>
            </main>
            {isV2Theme ? <ModernMarketplaceFooter variant="v2" /> : <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} Browse Qatar. All rights reserved.</footer>}
        </div>
    );
}
