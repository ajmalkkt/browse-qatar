import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useListingById } from '../../../hooks/useListing';
import { useVertical } from '../../../hooks/useVertical';
import { ChevronLeft, MapPin, Calendar, Tag, Share2, Heart, ExternalLink } from 'lucide-react';

/**
 * Shared detail page for any listing from any vertical
 */
const ListingDetail: React.FC = () => {
  const { vertical, id } = useParams<{ vertical: string; id: string }>();
  const navigate = useNavigate();
  const { verticals, currentConfig } = useVertical();
  
  const { listing, loading, error } = useListingById(vertical || '', id);

  // Validate vertical
  const isValidVertical = verticals.some(v => v.id === vertical);
  if (!vertical || !isValidVertical) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing not found</h2>
        <p className="text-gray-600 mb-6 text-center">
          The listing you're looking for might have been removed or is temporarily unavailable.
        </p>
        <button 
          onClick={() => navigate(`/${vertical}`)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Back to {currentConfig?.name || 'Category'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Quick Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition font-medium"
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-red-500 transition">
              <Heart size={24} />
            </button>
            <button className="p-2 text-gray-400 hover:text-blue-500 transition">
              <Share2 size={24} />
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Visuals */}
          <div className="space-y-6">
            <div className="rounded-2xl overflow-hidden shadow-lg bg-white h-[400px] md:h-[500px]">
              <img 
                src={listing.imageUrl} 
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Gallery Placeholder */}
            {listing.galleryUrls && listing.galleryUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {listing.galleryUrls.map((url, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-sm bg-white cursor-pointer hover:opacity-80 transition">
                    <img src={url} alt={`${listing.title} gallery ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase text-white"
                  style={{ backgroundColor: currentConfig?.color || '#3b82f6' }}
                >
                  {listing.category}
                </span>
                {listing.status === 'active' && (
                  <span className="flex items-center gap-1 text-green-600 text-xs font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Active
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {listing.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin size={18} className="text-gray-400" />
                  <span>{listing.location.city}, {listing.location.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tag size={18} className="text-gray-400" />
                  <span>ID: #{listing.id}</span>
                </div>
              </div>

              <div className="py-6 border-y border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Starting Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-blue-600">
                      {listing.pricing.currency} {listing.pricing.discountedPrice}
                    </span>
                    {listing.pricing.originalPrice > listing.pricing.discountedPrice && (
                      <span className="text-lg text-gray-400 line-through font-medium">
                        {listing.pricing.currency} {listing.pricing.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
                
                {Number(listing.pricing?.originalPrice || 0) > Number(listing.pricing?.discountedPrice || 0) && (
                  <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold">
                    {Math.round((1 - Number(listing.pricing?.discountedPrice || 0) / Number(listing.pricing?.originalPrice || 1)) * 100)}% OFF
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Attributes Section */}
              {listing.attributes && Object.keys(listing.attributes).length > 0 && (
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(listing.attributes).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">{key}</p>
                        <p className="text-gray-900 font-semibold">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-8 flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-blue-600 text-white h-14 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  <span>Enquire Now</span>
                </button>
                <button className="sm:w-14 h-14 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 transition">
                  <ExternalLink size={24} />
                </button>
              </div>
            </div>

            {/* Provider Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xl font-bold">
                  {listing.providerType?.[0].toUpperCase() || 'P'}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Listed by</p>
                  <p className="font-bold text-gray-900">Verified Partner</p>
                </div>
              </div>
              <button className="text-blue-600 font-bold hover:underline">
                View Profile
              </button>
            </div>
            
            {/* Validity info */}
            <div className="flex items-center gap-2 text-gray-400 text-xs px-2">
              <Calendar size={14} />
              <span>Listing valid from {listing.validity.from} to {listing.validity.to}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListingDetail;
