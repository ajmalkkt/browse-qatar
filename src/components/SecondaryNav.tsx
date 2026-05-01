import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  SHOW_ENTERTAINMENT,
  SHOW_FINANCIAL_SERVICE,
  SHOW_CUISINE_NAV,
  cuisineLists,
} from "../config/appConfig";

interface Props {
  selectedCategory: string;
  onSelectCategory: (c: string) => void;
  onAddBusiness: () => void;
  onCuisineSelect?: (cuisine: string | null, isSeach: boolean | false) => void; // can be null for "All Offers"
}

const categoryList = [
  "All Offers",
  "Malls",
  "Independent Restaurants",
  "Catering Services",
];

const SecondaryNav: React.FC<Props> = ({
  selectedCategory,
  onSelectCategory,
  onAddBusiness,
  onCuisineSelect,
}) => {
  const cuisineRowRef = useRef<HTMLDivElement>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  const scrollBy = (offset: number) => {
    cuisineRowRef.current?.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleCuisineClick = (cuisine: string | null) => {
    setSelectedCuisine(cuisine);
    if (onCuisineSelect) onCuisineSelect(cuisine, false);
  };

  const categories = [
    ...categoryList,
    ...(SHOW_ENTERTAINMENT ? ["Entertainment"] : []),
    ...(SHOW_FINANCIAL_SERVICE ? ["Financial Service"] : []),
  ];

  //For old mode without cuisine nav
  if (!SHOW_CUISINE_NAV) {
    return (
      <div className="bg-purple-600 text-white w-full">
        <div className="container mx-auto px-2 w-full py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Dropdown for mobile */}
          <div className="relative w-full sm:hidden">
            <select
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="w-full bg-purple-700 text-white px-4 py-2 rounded font-medium appearance-none pr-8"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </div>
          {/* Horizontal buttons for desktop */}
          <div className="hidden sm:flex flex-row flex-wrap sm:flex-nowrap items-center gap-4 w-full">
            {categories.map((c) => (
              <button
                key={c}
                className={`hover:text-purple-200 font-medium whitespace-nowrap ${selectedCategory === c ? "text-orange-300" : ""
                  }`}
                onClick={() => onSelectCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            className="bg-orange-500 text-white px-3 py-1 rounded font-medium flex items-center text-sm whitespace-nowrap mt-2 sm:mt-0"
            onClick={onAddBusiness}
          >
            <span className="mr-2">+</span> Add your Business
          </button>
        </div>
      </div>
    );
  }

  // --- cuisine list layout for navigation. SHOW_CUISINE_NAV=true ---
  return (
    <div className="bg-white w-full py-1">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-between mb-0">
          <div className="flex items-center gap-3">
            <h2 className="font-bold brand-gradient-bg text-white px-3 py-1 rounded-md text-sm font-semibold">What's on your mind?</h2>
            <Link to="/cuisines" className="text-xs font-semibold text-blue-500 hover:text-blue-600 hover:underline">
              See All &gt;
            </Link>
          </div>
          <div className="flex gap-1">
            <button
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xl text-gray-600 hover:bg-gray-200"
              aria-label="Previous"
              onClick={() => scrollBy(-160)}
            >
              &#8592;
            </button>
            <button
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xl text-gray-600 hover:bg-gray-200"
              aria-label="Next"
              onClick={() => scrollBy(160)}
            >
              &#8594;
            </button>
          </div>
        </div>

        <div
          ref={cuisineRowRef}
          className="flex overflow-x-auto space-x-4 px-4 py-3 items-center scrollbar-hide"
          style={{
            maxWidth: "100%",
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >

          {/* --- All Offers (Clear Filter) item --- */}
          <div
            onClick={() => handleCuisineClick(null)}
            className={`flex flex-col items-center w-18 flex-shrink-0 cursor-pointer transition-transform transform-gpu origin-center ${selectedCuisine === null ? "scale-105" : "hover:scale-105"
              }`}
          >
            <img
              src="/images/cuisines/All.jpg"
              alt="All Offers"
              className={`w-14 h-14 object-contain rounded-full shadow mb-1 ${selectedCuisine === null ? "ring-4 ring-blue-400" : ""
                }`}
            />
            <span
              className={`text-sm font-medium ${selectedCuisine === null ? "text-blue-600" : "text-gray-700"
                }`}
              style={{ fontFamily: "Montserrat, Arial, sans-serif", fontWeight: 400 }}
            >
              All Offers
            </span>
          </div>

          {/* --- Cuisine items --- */}
          {cuisineLists.map((c) => (
            <div
              key={c.name}
              onClick={() => handleCuisineClick(c.name)}
              className={`flex flex-col items-center w-18 flex-shrink-0 cursor-pointer transition-transform transform-gpu origin-center ${selectedCuisine === c.name ? "scale-105" : "hover:scale-105"
                }`}
            >
              <img
                src={c.img}
                alt={c.altText || c.name}
                className={`w-14 h-14 object-contain rounded-full shadow mb-1 ${selectedCuisine === c.name ? "ring-4 ring-blue-400" : ""
                  }`}
              />
              <span
                className={`text-sm font-medium ${selectedCuisine === c.name ? "text-blue-600" : "text-gray-700"
                  }`}
                style={{ fontFamily: "Montserrat, Arial, sans-serif", fontWeight: 400 }}
              >
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecondaryNav;
