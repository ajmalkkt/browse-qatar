import React from "react";
import { Card, CardContent } from "./ui/card";
import { Leaf, ArrowRight } from "lucide-react";

interface Props {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  onTextClick?: () => void;
  // New Prop for the button click
  onSuperSaverClick?: () => void;
  // 1. Add new prop
  showSuperSaverButton?: boolean;
}

export default function FeaturedCard({ 
  title = "No Waste... More Tasty!!!", 
  subtitle = "Save Food Campaign. Join the movement to honor every meal.", 
  imageUrl,
  onTextClick,
  onSuperSaverClick,
   // 2. Destructure with default false
  showSuperSaverButton = false
}: Props) {
  return (
    // Added 'relative' here so the absolute button positions relative to this section
    <section className="mb-1 w-full relative">
      
      {/* 
        FLOATING SUPER SAVER BUTTON 
        - Z-index: 50 to stay on top
        - Absolute positioning to hang off the corner
        - animate-pulse for the "blinking" effect
        - Conditional Rendering
         Only render this block if showSuperSaverButton is true
      */}
      {showSuperSaverButton && (
        <div 
          onClick={(e) => {
            e.stopPropagation(); // Prevent clicking the card underneath
            if (onSuperSaverClick) onSuperSaverClick();
          }}
          className="absolute -top-4 -right-2 md:-right-4 z-50 cursor-pointer group/btn"
        >
          <img 
            src="/supersaver.png" 
            alt="Super Saver Offer" 
            // Animate pulse gives the blinking effect. Hover stops it and scales up.
            className="w-15 h-20 md:w-20 md:h-20 object-contain drop-shadow-xl animate-pulse hover:animate-none hover:scale-110 rounded-full transition-transform duration-2000"
          />
        </div>
      )}
      <div 
        onClick={onTextClick} 
        className="w-full cursor-pointer group transition-transform hover:-translate-y-1 duration-300 relative z-0"
      >
        <Card className="brand-cream-gradient border-[#8B1538]/10 overflow-hidden h-auto min-h-[128px] md:h-32 shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardContent className="p-0 h-full">
            <div className="flex flex-row h-full relative items-stretch">
              
              {/* --- LEFT SIDE: TEXT CONTENT --- */}
              <div className="flex-1 p-4 md:p-6 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B1538] bg-[#8B1538]/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                      Premium Selection
                    </span>
                  </div>

                  <h2 className="text-xl md:text-3xl font-bold text-[#8B1538] leading-tight mb-2 group-hover:text-[#70112d] transition-colors">
                    {title}
                  </h2>
                  
                  <p className="text-[#8B1538]/80 text-xs md:text-sm line-clamp-2 leading-snug font-medium">
                    {subtitle}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs md:text-sm font-bold text-[#8B1538] transition-all transform 
                  opacity-100 translate-x-0"
                >
                   Discover more <ArrowRight size={14} />
                </div>
              </div>

              {/* --- RIGHT SIDE: IMAGE --- */}
              <div className="w-28 md:w-48 relative self-stretch flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#f0fdf4]/80 z-10 md:hidden"></div>
                
                <img 
                  src={imageUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80"} 
                  alt="Save Food Campaign" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}