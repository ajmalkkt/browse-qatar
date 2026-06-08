// src/components/common/VerticalGrid.tsx
// Grid component displaying all enabled verticals as cards using the design from Figma

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVertical } from '../../contexts/VerticalContext';
import { ImageWithFallback } from './ImageWithFallback';

interface VerticalGridProps {
  className?: string;
  title?: string;
  showOnlyOthers?: boolean; // If true, hide current vertical
  onVerticalClick?: (verticalId: string) => void;
}

/**
 * Displays a list of vertical cards for browsing different categories
 * User can click a card to navigate to that vertical
 */
export default function VerticalGrid({
  className = '',
  title = '',
  showOnlyOthers = false,
  onVerticalClick
}: VerticalGridProps) {
  const navigate = useNavigate();
  const { currentVertical, verticals } = useVertical();

  const displayVerticals = showOnlyOthers
    ? verticals.filter(v => v.id !== currentVertical)
    : verticals;

  if (displayVerticals.length === 0) {
    return null;
  }

  return (
    <section className={`w-full max-w-7xl mx-auto ${className}`}>
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-[#8B1538] mb-6">
          {title}
        </h2>
      )}

      <div className="space-y-3 md:space-y-4">
        {displayVerticals.map((vertical) => {
          return (
            <div
              key={vertical.id}
              onClick={() => {
                if (onVerticalClick) {
                  onVerticalClick(vertical.id);
                } else {
                  navigate(vertical.route);
                }
              }}
              className="relative h-28 sm:h-36 md:h-44 lg:h-48 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            >
              <div className="absolute inset-0 flex items-center">
                {/* Left Section: Content with slanted gradient */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[55%] sm:w-[52%] md:w-[48%] bg-gradient-to-r from-[#FFF8E7] to-[#FFF4D6] z-10"
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
                  }}
                >
                  <div className="flex items-center h-full pl-4 sm:pl-6 md:pl-8 pr-8 sm:pr-12 md:pr-16">
                    <h2 className="text-[#8B1538] text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight drop-shadow-sm">
                      {vertical.name}
                    </h2>
                  </div>
                </div>

                {/* Right Section: Image */}
                <div className="absolute right-0 top-0 bottom-0 w-[50%] sm:w-[55%] md:w-[60%]">
                  <ImageWithFallback
                    src={vertical.featuredImage}
                    alt={vertical.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#FFF8E7]/20"></div>
                </div>

                {/* Middle Section: Slanted Accent Line - removed now, check commit */}
              
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
