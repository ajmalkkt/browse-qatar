import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { CURRENT_FESTIVAL } from "../config/festivalConfig";

const FestivalBanner = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [isDismissed, setIsDismissed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomScale, setZoomScale] = useState(1);

    const offers = CURRENT_FESTIVAL.offers;

    // Manages the "Flashy" show/hide cycle
    useEffect(() => {
        if (isDismissed || !CURRENT_FESTIVAL.active || isHovered || isZoomed) return;

        const cycle = setInterval(() => {
            setIsVisible((prev) => !prev);
        }, 3000);

        return () => clearInterval(cycle);
    }, [isDismissed, isHovered, isZoomed]);

    // Update index when banner is hidden
    useEffect(() => {
        if (!isVisible) {
            const timer = setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length);
            }, 800); // Give time for exit animation
            return () => clearTimeout(timer);
        }
    }, [isVisible, offers.length]);

    const handleZoomIn = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoomScale((z) => Math.min(z + 0.2, 3));
    };

    const handleZoomOut = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoomScale((z) => Math.max(z - 0.2, 1));
    };

    const closeZoom = () => {
        setIsZoomed(false);
        setZoomScale(1);
    };

    if (!CURRENT_FESTIVAL.active || isDismissed) return null;

    return (
        <>
            <AnimatePresence>
                {isVisible && !isZoomed && (
                    <motion.div
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -300 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="relative w-[92vw] max-w-[340px] md:max-w-md mx-auto overflow-hidden rounded-xl shadow-2xl bg-gradient-to-br from-[#064e4b] via-[#0d6b67] to-[#043331] border-2 border-amber-500/50 z-30 pointer-events-auto group cursor-pointer"
                        onClick={() => setIsZoomed(true)}
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {/* Fixed Stars */}
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute animate-star-twinkle"
                                    style={{
                                        top: `${(i * 137) % 95}%`,
                                        left: `${(i * 149) % 95}%`,
                                        width: `${(i % 3) + 1.2}px`,
                                        height: `${(i % 3) + 1.2}px`,
                                        backgroundColor: '#fcd34d',
                                        borderRadius: '50%',
                                        boxShadow: '0 0 4px #fcd34d',
                                        animationDelay: `${i * 0.3}s`,
                                        animationDuration: `${1.5 + (i % 3)}s`,
                                        opacity: 0.7
                                    }}
                                />
                            ))}

                            {/* Main Large Sky Crescent Moon */}
                            <div className="absolute top-[15px] left-[15px] w-12 h-12 text-amber-300 animate-glitter opacity-90 blur-[0.5px]">
                                <svg viewBox="0 0 24 24" className="w-full h-full fill-current drop-shadow-[0_0_15px_rgba(252,211,77,0.9)]">
                                    <path d="M12 3c.132 0 .263 0 .393.007a9 9 0 0 0 7.23 15.115A9 9 0 1 1 12 3z" />
                                </svg>
                            </div>

                            {/* Left Side: Glittering Minaret & Minaret Crescent */}
                            <div className="absolute bottom-0 left-[-5px] w-24 h-32 opacity-90 text-amber-400 animate-glitter">
                                <svg viewBox="0 0 40 80" className="w-full h-full fill-current">
                                    <path d="M5,80 L15,80 L15,35 Q10,30 5,35 Z" />
                                    <path d="M8,32 L12,32 L10,20 Z" />
                                    {/* Minaret Crescent */}
                                    <path d="M10,5 A4,4 0 1,0 10,13 A3,3 0 1,1 10,5" transform="translate(0, 10)" />
                                </svg>
                            </div>

                            {/* Right Side: Arabian Design Layout */}
                            <div className="absolute bottom-0 right-[-10px] w-32 h-36 opacity-90 text-amber-500 animate-glitter">
                                <svg viewBox="0 0 60 80" className="w-full h-full fill-current">
                                    <path d="M10,80 L40,80 L40,65 Q25,45 10,65 Z" />
                                    <path d="M35,80 L42,80 L42,35 Q38,30 35,35 Z" />
                                    {/* Side Crescent - Large & Bold */}
                                    <path d="M15,10 A8,8 0 1,0 15,26 A6,6 0 1,1 15,10" transform="translate(10, 5) rotate(10)" />
                                </svg>
                            </div>
                        </div>

                        {/* Top Close Button - Always visible on mobile, hover on desktop */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDismissed(true);
                            }}
                            className="absolute top-2 left-2 z-50 p-1.5 rounded-full bg-black/40 text-white hover:bg-amber-500 hover:text-black transition-all md:opacity-0 md:group-hover:opacity-100 shadow-lg"
                            title="Close Banner"
                        >
                            <X size={16} />
                        </button>

                        <div className="relative h-36 md:h-48 w-full overflow-hidden flex items-center justify-center bg-transparent">
                            <motion.img
                                src={offers[currentIndex].image}
                                alt={offers[currentIndex].title}
                                className="w-full h-full object-contain relative z-10"
                                animate={{ scale: isHovered ? 1.05 : 1 }}
                                transition={{ duration: 0.6 }}
                            />

                            {/* Zoom Indicator Icon */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="bg-black/40 p-2 rounded-full backdrop-blur-sm border border-white/20">
                                    <Maximize2 size={24} className="text-white" />
                                </div>
                            </div>

                            {/* Seasonal Badge */}
                            <div className="absolute top-2 right-2 z-20">
                                <div className="bg-amber-500/95 backdrop-blur-sm text-black px-2 py-0.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-1 shadow-lg border border-white/20">
                                    <Sparkles size={8} className="animate-pulse" />
                                    {CURRENT_FESTIVAL.badge}
                                </div>
                            </div>
                        </div>

                        {/* Progress Indicator Dots */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-40 bg-black/40 px-2 py-1 rounded-full">
                            {offers.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-1.5 transition-all duration-300 rounded-full ${index === currentIndex ? "w-4 bg-amber-500" : "w-1.5 bg-white/30"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Bottom Right Close Button - Always visible on mobile, hover on desktop */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDismissed(true);
                            }}
                            className="absolute bottom-2 right-2 z-50 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 text-white hover:bg-red-600 transition-all md:opacity-0 md:group-hover:opacity-100 border border-white/10 shadow-lg text-[10px] font-bold"
                        >
                            <X size={12} />
                            CLOSE
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Zoom Overlay - Matching OffersGrid Style */}
            <AnimatePresence>
                {isZoomed && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4"
                        onClick={closeZoom}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg shadow-2xl p-2 max-w-2xl w-full relative flex flex-col items-center pointer-events-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Close Button top right of modal */}
                            <button
                                className="absolute top-2 right-2 z-20 text-gray-600 hover:text-black text-xl font-bold bg-white/80 rounded-full w-9 h-9 flex items-center justify-center shadow-md transition-colors"
                                onClick={closeZoom}
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>

                            <div className="relative w-full flex justify-center overflow-hidden rounded bg-zinc-50 min-h-[40vh] max-h-[70vh]">
                                <motion.img
                                    src={offers[currentIndex].image}
                                    alt={offers[currentIndex].title}
                                    className="w-full h-auto max-h-[70vh] object-contain"
                                    style={{ scale: zoomScale }}
                                    transition={{ duration: 0.2 }}
                                />

                                {/* Zoom Controls Overlay (matching OffersGrid) */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white/70 backdrop-blur-md rounded-lg p-1.5 shadow-lg border border-black/5 hover:bg-white/95 transition-colors">
                                    <button
                                        className="p-2 rounded-md hover:bg-zinc-200 text-zinc-800 transition-colors"
                                        onClick={handleZoomIn}
                                        title="Zoom In"
                                    >
                                        <ZoomIn size={22} />
                                    </button>
                                    <div className="h-px bg-zinc-300 mx-1" />
                                    <button
                                        className="p-2 rounded-md hover:bg-zinc-200 text-zinc-800 transition-colors"
                                        onClick={handleZoomOut}
                                        title="Zoom Out"
                                    >
                                        <ZoomOut size={22} />
                                    </button>
                                </div>
                            </div>

                            {/* Title area (matching OffersGrid) */}
                            <div className="mt-4 pb-2 text-center">
                                <h3 className="font-bold text-xl text-zinc-900">{offers[currentIndex].title}</h3>
                                <p className="text-zinc-500 text-sm mt-1">{CURRENT_FESTIVAL.badge}</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FestivalBanner;
