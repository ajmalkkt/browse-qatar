// src/components/common/ListingCard.tsx
// Generic listing card component for any vertical

import React from 'react';
import { Star, MapPin, Calendar } from 'lucide-react';
import { Listing } from '../../types/listing';

interface ListingCardProps {
  listing: Listing;
  vertical: string;
  onClick?: (listing: Listing) => void;
  renderCustomFields?: (listing: Listing) => React.ReactNode;
  className?: string;
}

/**
 * Reusable card component for displaying listings
 * Can be customized with vertical-specific fields
 */
export default function ListingCard({
  listing,
  vertical,
  onClick,
  renderCustomFields,
  className = ''
}: ListingCardProps) {
  const handleClick = () => {
    onClick?.(listing);
  };

  const isVehicle = vertical === 'vehicles';

  // Get pricing info (handles both old and new format)
  const originalPrice = listing.pricing?.originalPrice || listing.originalPrice;
  const discountedPrice = listing.pricing?.discountedPrice || listing.discountedPrice;
  const currency = listing.pricing?.currency || 'QAR';

  // Calculate discount percentage
  const discount = originalPrice && discountedPrice
    ? Math.round(((Number(originalPrice) - Number(discountedPrice)) / Number(originalPrice)) * 100)
    : null;

  return (
    <div
      onClick={handleClick}
      className={`
        bg-white rounded-xl shadow-sm hover:shadow-md
        transition-all duration-200 cursor-pointer
        overflow-hidden group border border-gray-100
        ${['vehicles', 'jobs'].includes(vertical) ? 'md:flex md:h-48' : 'flex flex-col'}
        ${className}
      `}
    >
      {/* Image Container */}
      <div className={`relative bg-gray-200 overflow-hidden ${['vehicles', 'jobs'].includes(vertical) ? 'md:w-72 h-40 md:h-full' : 'h-40 md:h-48'}`}>
        {listing.imageUrl && (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        )}

        {/* Discount Badge */}
        {discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
            {discount}% OFF
          </div>
        )}

        {/* Status Badge */}
        {listing.status && listing.status !== 'active' && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
            {listing.status.toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-bold text-base md:text-lg text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
            {listing.title}
          </h3>

        {/* Category/Type */}
        {listing.category && (
          <p className="text-xs text-gray-500 mb-2">
            {listing.category}
          </p>
        )}

        {/* Custom Fields or Default Attributes */}
        {renderCustomFields ? (
          <div className="mb-2 text-xs text-gray-600">
            {renderCustomFields(listing)}
          </div>
        ) : (
          <div className="mb-3 flex flex-wrap gap-2">
            {vertical === 'vehicles' && listing.attributes && (
              <>
                {listing.attributes.year && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                    <Calendar size={12} />
                    {listing.attributes.year}
                  </span>
                )}
                {listing.attributes.mileage && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-semibold">
                    {listing.attributes.mileage.toLocaleString()} km
                  </span>
                )}
              </>
            )}
            {vertical === 'accommodations' && listing.attributes && (
              <>
                {listing.attributes.bedrooms !== undefined && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-xs font-bold">
                    {listing.attributes.bedrooms} BHK
                  </span>
                )}
                {listing.attributes.area && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-semibold">
                    {listing.attributes.area} sqm
                  </span>
                )}
              </>
            )}
            {vertical === 'jobs' && listing.attributes && (
              <>
                {listing.attributes.jobType && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-xs font-bold">
                    {listing.attributes.jobType}
                  </span>
                )}
                {listing.attributes.level && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-semibold">
                    {listing.attributes.level}
                  </span>
                )}
              </>
            )}
            {vertical === 'services' && listing.attributes && (
              <>
                {listing.attributes.experience && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-xs font-bold">
                    {listing.attributes.experience} exp
                  </span>
                )}
              </>
            )}
          </div>
        )}
        </div>

        {/* Location & Rating */}
        <div className="flex items-center justify-between">
          {listing.location?.city && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} />
              <span>{listing.location.city}</span>
            </div>
          )}
          
          {listing.rating && (
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-gray-700">{listing.rating}</span>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="border-t border-gray-100 pt-2 mt-2">
          {originalPrice && discountedPrice ? (
            <div className="flex items-baseline gap-2">
              <span className="text-lg md:text-xl font-bold text-gray-900">
                {currency}{discountedPrice}
              </span>
              <span className="text-xs md:text-sm text-gray-400 line-through">
                {currency}{originalPrice}
              </span>
            </div>
          ) : originalPrice ? (
            <span className="text-lg md:text-xl font-bold text-gray-900">
              {currency}{originalPrice}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
