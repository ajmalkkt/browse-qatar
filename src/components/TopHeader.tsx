import React, { useState, useEffect, useRef } from "react";
import { SHOW_PRODUCTS, SHOW_COUPONS, SHOW_OFFERS } from "../config/appConfig";
import { useNavigate } from "react-router-dom";
import MenuOptions from "./MenuOptions";
import { useVertical } from "../contexts/VerticalContext";

interface Props {
  onSearch: (q: string) => void;
  selectedCountry: string;
  onSelectCountry: (c: string) => void;
  onAddBusiness: () => void;
  onSearchClick?: (cuisine: string | null, isSeach: boolean | true) => void;
  searchQuery: string;
}

export default function TopHeader({
  onSearch,
  selectedCountry,
  onSelectCountry,
  onAddBusiness,
  onSearchClick,
  searchQuery,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchKey, setSearchKey] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentVertical, currentConfig } = useVertical();

  // single ref that wraps hamburger + menu area (mobile) and desktop menu area separately
  const mobileContainerRef = useRef<HTMLDivElement | null>(null);
  const desktopContainerRef = useRef<HTMLDivElement | null>(null);

  // Document-level outside click handler active only while menuOpen
  useEffect(() => {
    if (!menuOpen) return;

    const onDocClick = (e: Event) => {
      const target = e.target as Node | null;
      const mobileEl = mobileContainerRef.current;
      const desktopEl = desktopContainerRef.current;

      // if click/touch is outside both mobile and desktop menu containers, close
      if (
        (mobileEl && !mobileEl.contains(target as Node)) &&
        (desktopEl && !desktopEl.contains(target as Node))
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick, { passive: true });

    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
    };
  }, [menuOpen]);

  const handleSearchClick = () => {
    onSearchClick?.(searchKey, true);
  };

  useEffect(() => {
    setSearchKey(searchQuery);
  }, [searchQuery]);

  return (
    <header className="bg-white shadow-md w-full">
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-2 py-2 w-full">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between w-full">
            {/* Level 1: logo + mobile menu */}
            <div className="flex flex-row items-center justify-between w-full">
              <button
                className="flex items-center bg-transparent p-0"
                onClick={() => {
                  navigate("/");
                  setMenuOpen(false);
                }}
                aria-label="DineDeals Home"
              >
                <img
                  src="/bqLogo.jpg"
                  alt="DineDeals"
                  className="w-13 h-11 object-contain shadow-sm"
                />
                <span className="sr-only">DineDeals</span>
                {(!currentVertical || currentVertical === 'restaurants') && (
                  <span className="ml-3 inline-flex items-center gap-1 px-1 py-1 md:px-3 md:py-1 rounded-full brand-gradient-bg text-white font-semibold text-xs md:text-sm">
                    <img src="/images/chef.jpg" alt="chef" className="w-4 h-4 md:w-5 md:h-5 object-cover rounded waving-chef" />
                    <span className="brand-wave">Dine Offers</span>
                  </span>
                )}
              </button>

              {/* MOBILE: country + menu (mobileContainerRef wraps the trigger and menu) */}
              <div className="flex md:hidden items-center gap-2 relative" ref={mobileContainerRef}>
                <select
                  value={selectedCountry}
                  onChange={(e) => onSelectCountry(e.target.value)}
                  className="bg-blue-600 brand-gradient-bg text-white px-1 py-1 rounded text-sm font-medium border-none outline-none cursor-pointer w-[60%] min-w-[80px] max-w-[120px] ml-auto block"
                >
                  <option value="Qatar">🇶🇦 QA-EN</option>
                  <option value="UAE">🇦🇪 AE-EN</option>
                  <option value="Bahrain">🇧🇭 BH-EN</option>
                  <option value="Kuwait">🇰🇼 KW-EN</option>
                  <option value="Saudi Arabia">🇸🇦 SA-EN</option>
                </select>

                <button
                  className="relative"
                  onClick={(e) => {
                    // prevent the document-level handler from immediately closing the menu
                    e.stopPropagation();
                    setMenuOpen((open) => !open);
                  }}
                  aria-expanded={menuOpen}
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* render menu inside same mobile container so contains() works */}
                {menuOpen && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <MenuOptions onAddBusiness={onAddBusiness} setMenuOpen={setMenuOpen} />
                  </div>
                )}
              </div>
            </div>


            {/* Level 3: search + desktop menu */}
            <div className="flex flex-row items-center gap-2 w-full">
              <div className="relative w-[80%] md:w-[80%] flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  placeholder={currentVertical === 'restaurants' ? "Find restaurant offers and deals" : `Search ${currentConfig?.name?.toLowerCase() || 'listings'}...`}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full text-sm"
                  onChange={(e) => {
                    onSearch(e.target.value);
                    setSearchKey(e.target.value);
                  }}
                />

                {/* Clear Button */}
                {searchQuery && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => {
                      onSearch("");
                      setSearchKey("");
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                className="brand-gradient-bg text-white px-5 py-1 rounded-full font-medium text-sm"
                onClick={() => handleSearchClick()}
              >
                Search
              </button>

              {/* DESKTOP menu container - separate ref so contains() can check both places */}
              <div className="hidden md:flex items-center gap-2 relative" ref={desktopContainerRef}>
                <select
                  value={selectedCountry}
                  onChange={(e) => onSelectCountry(e.target.value)}
                  className="bg-blue-600 brand-gradient-bg text-white px-3 py-1 rounded text-sm font-medium border-none outline-none cursor-pointer w-[70%] min-w-[90px] max-w-[140px]"
                >
                  <option value="Qatar">QA-EN</option>
                  <option value="UAE">AE-EN</option>
                  <option value="Bahrain">BH-EN</option>
                  <option value="Kuwait">KW-EN</option>
                  <option value="Saudi Arabia">SA-EN</option>
                </select>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((open) => !open);
                  }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {menuOpen && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <MenuOptions onAddBusiness={onAddBusiness} setMenuOpen={setMenuOpen} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
