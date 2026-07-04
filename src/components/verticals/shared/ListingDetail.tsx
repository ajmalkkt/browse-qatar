import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { useListingById } from '../../../hooks/useListing';
import { useVertical } from '../../../hooks/useVertical';
import { ChevronLeft, MapPin, Calendar, Tag, Share2, Heart, ExternalLink, Lock, Mail, Phone, Sparkles, X } from 'lucide-react';
import { getProviderById } from '../../../services/providerService';
import { incrementListingEnquiryClicks } from '../../../services/listingService';
import ListingEnquiryPopup from '../../ListingEnquiryPopup';

const MOCK_PROVIDERS: Record<string, any> = {
  dealer1: {
    id: "dealer1",
    name: "Al Faris Motors",
    type: "Dealer",
    phone: "+974 5555 1234",
    email: "contact@alfarismotors.com",
    address: "Salwa Road, Doha, Qatar",
    logoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alfaris",
    bannerUrl: ""
  },
  landlord1: {
    id: "landlord1",
    name: "Doha Real Estate",
    type: "Agency",
    phone: "+974 4444 9876",
    email: "info@doharealestate.qa",
    address: "West Bay, Doha, Qatar",
    logoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=dohare",
    bannerUrl: ""
  },
  recruiter1: {
    id: "recruiter1",
    name: "Qatar Careers Ltd",
    type: "Agency",
    phone: "+974 3333 7777",
    email: "recruitment@qatarcareers.qa",
    address: "Grand Hamad Street, Doha, Qatar",
    logoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=qatarcareers",
    bannerUrl: ""
  }
};

const maskEmail = (email?: string) => {
  if (!email || email.trim() === "") return "Not disclosed";
  const parts = email.split('@');
  if (parts.length !== 2) return "********";
  const [local, domain] = parts;
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local.slice(0, 2)}*****${local.slice(-1)}@${domain}`;
};

const maskPhone = (phone?: string) => {
  if (!phone || phone.trim() === "") return "Not disclosed";
  if (phone.length <= 5) return "*****";
  return phone.slice(0, 5) + "*".repeat(phone.length - 5);
};

/**
 * Shared detail page for any listing from any vertical
 */
const ListingDetail: React.FC = () => {
  const { vertical, id } = useParams<{ vertical: string; id: string }>();
  const navigate = useNavigate();
  const { verticals, currentConfig } = useVertical();
  
  const { listing, loading, error } = useListingById(vertical || '', id);

  const [provider, setProvider] = useState<any>(null);
  const [loadingProvider, setLoadingProvider] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const handleEnquireNow = async () => {
    setEnquiryOpen(true);
    if (listing && listing.id) {
      try {
        await incrementListingEnquiryClicks(listing.id);
        (listing as any).enquiryClicks = (Number((listing as any).enquiryClicks) || 0) + 1;
      } catch (err) {
        console.error("Failed to increment enquiry clicks:", err);
      }
    }
  };

  useEffect(() => {
    if (!listing || !listing.providerId) {
      setProvider(null);
      return;
    }

    const providerIdStr = String(listing.providerId);
    const isNumericId = /^\d+$/.test(providerIdStr);

    if (isNumericId) {
      setLoadingProvider(true);
      getProviderById(parseInt(providerIdStr))
        .then((data) => {
          setProvider(data);
        })
        .catch((err) => {
          console.warn("Failed to fetch provider from API, using fallback name if available:", err);
          setProvider({
            id: providerIdStr,
            name: (listing as any).restaurantName || "Verified Partner",
            type: listing.providerType || "Partner",
            phone: "",
            email: "",
            address: listing.location && typeof listing.location === 'object' ? `${listing.location.city || ''}, ${listing.location.country || ''}` : String(listing.location || "")
          });
        })
        .finally(() => {
          setLoadingProvider(false);
        });
    } else {
      const mock = MOCK_PROVIDERS[providerIdStr];
      if (mock) {
        setProvider(mock);
      } else {
        setProvider({
          id: providerIdStr,
          name: (listing as any).restaurantName || "Verified Partner",
          type: listing.providerType || "Partner",
          phone: "",
          email: "",
          address: listing.location && typeof listing.location === 'object' ? `${listing.location.city || ''}, ${listing.location.country || ''}` : String(listing.location || "")
        });
      }
    }
  }, [listing]);

  // Validate vertical
  const isValidVertical = verticals.some(v => v.id === vertical);
  if (!vertical || !isValidVertical) {
    return <Navigate to="/" replace />;
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error || !listing) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 py-20">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing not found</h2>
            <p className="text-gray-600 mb-6">
              The listing you're looking for might have been removed or is temporarily unavailable.
            </p>
            <button 
              onClick={() => navigate(`/${vertical}`)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md"
            >
              Back to {currentConfig?.name || 'Category'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl flex-1">
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
                  <span>
                    {typeof listing.location === 'string' 
                      ? listing.location 
                      : `${listing.location?.city || ''}, ${listing.location?.country || ''}`.replace(/^, | , |^,/g, '')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Tag size={18} className="text-gray-400" />
                  <span>ID: #{listing.id}</span>
                </div>
              </div>

              <div className="py-6 border-y border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {vertical === 'jobs' ? 'Salary Offered' : 'Price'}
                  </p>
                  <div className="flex items-baseline gap-2">
                    {(() => {
                      const originalPrice = listing.pricing?.originalPrice || listing.originalPrice;
                      const discountedPrice = listing.pricing?.discountedPrice || listing.discountedPrice;
                      const currency = listing.pricing?.currency || 'QR';
                      const unit = listing.pricing?.unit || listing.unit;
                      const showDiscount = vertical !== 'jobs' && discountedPrice && Number(discountedPrice) > 0 && Number(discountedPrice) < Number(originalPrice);
                      const showUnit = vertical === 'accommodations' || vertical === 'vehicles';
                      const isJob = vertical === 'jobs';

                      if (showDiscount) {
                        return (
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-black text-blue-600">
                                {currency} {discountedPrice} 
                              </span>
                              <span className="text-lg text-gray-400 line-through font-medium">
                                {currency} {originalPrice}
                              </span>
                            </div>
                            {showUnit && (
                              <p className="text-sm font-normal text-gray-500 mt-1">{unit ? `#${unit}` : '1'} unit(s)</p>
                            )}
                            {isJob && (
                              <p className="text-sm font-normal text-gray-500 mt-1">{unit || '1'} open position(s)</p>
                            )}
                          </div>
                        );
                      }
                      return (
                        <div className="flex flex-col">
                          <span className="text-3xl font-black text-blue-600">
                            {currency} {originalPrice || 0}
                          </span>
                          {showUnit && (
                            <p className="text-sm font-normal text-gray-500 mt-1">{unit ? `#${unit}` : '1'} unit(s)</p>
                          )}
                          {isJob && (
                            <p className="text-sm font-normal text-gray-500 mt-1">{unit || '1'} open position(s)</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                {(() => {
                  const originalPrice = listing.pricing?.originalPrice || listing.originalPrice;
                  const discountedPrice = listing.pricing?.discountedPrice || listing.discountedPrice;
                  const showDiscount = vertical !== 'jobs' && discountedPrice && Number(discountedPrice) > 0 && Number(discountedPrice) < Number(originalPrice);

                  if (showDiscount) {
                    return (
                      <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold">
                        {Math.round((1 - Number(discountedPrice) / Number(originalPrice)) * 100)}% OFF
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Attributes Section */}
              {(() => {
                const attrs = listing.attributes || listing.additionalAttributes;
                if (!attrs || Object.keys(attrs).length === 0) return null;
                
                const getAttributeLabel = (key: string) => {
                  const attrConfig = currentConfig?.additionalAttributes?.find((a: any) => a.name === key);
                  if (attrConfig?.label) return attrConfig.label;
                  return key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase());
                };

                return (
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Specifications</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(attrs).map(([key, value]) => {
                        if (value === undefined || value === null || value === '') return null;
                        return (
                          <div key={key} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                              {getAttributeLabel(key)}
                            </p>
                            <p className="text-gray-900 font-semibold">{String(value)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className="pt-8 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleEnquireNow}
                  className="flex-1 bg-blue-600 text-white h-14 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
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
                {provider?.logoUrl ? (
                  <img src={provider.logoUrl} alt={provider.name} className="w-12 h-12 rounded-full object-cover border" />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xl font-bold">
                    {(provider?.name || listing.providerType || 'P')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400">Listed by</p>
                  <p className="font-bold text-gray-900">{provider?.name || "Verified Partner"}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProviderModal(true)}
                className="text-blue-600 font-bold hover:underline"
              >
                View Profile
              </button>
            </div>

            {/* Provider Details Modal */}
            {showProviderModal && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
                onClick={() => setShowProviderModal(false)}
              >
                <div 
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative border border-gray-100 transform transition-all scale-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header Banner */}
                  <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-700 relative flex items-center justify-center">
                    <button
                      className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 p-1.5 rounded-full transition-colors"
                      onClick={() => setShowProviderModal(false)}
                      title="Close"
                    >
                      <X size={18} />
                    </button>
                    <h2 className="text-white text-lg font-bold">Business Profile</h2>
                  </div>

                  {/* Provider Logo / Avatar (overlapping the banner) */}
                  <div className="flex justify-center -mt-10 relative z-10">
                    {provider?.logoUrl ? (
                      <img 
                        src={provider.logoUrl} 
                        alt={provider.name} 
                        className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-white object-cover" 
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl">
                        {(provider?.name || 'P')[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Provider Info */}
                  <div className="px-6 pt-3 pb-6 space-y-4">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900">{provider?.name || "Verified Partner"}</h3>
                      <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 capitalize">
                        {provider?.type || "Verified Partner"}
                      </span>
                      {provider?.address && (
                        <p className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-2">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{provider.address}</span>
                        </p>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-left">Contact Information</h4>
                      
                      {/* Email (masked) */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">{maskEmail(provider?.email)}</span>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Lock size={10} /> Locked
                        </span>
                      </div>

                      {/* Mobile/Phone (masked) */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">{maskPhone(provider?.phone)}</span>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Lock size={10} /> Locked
                        </span>
                      </div>
                    </div>

                    {/* Premium Plan Promotion Callout */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                        <Sparkles size={16} className="text-amber-600" />
                        <span>Subscribe to Premium Plan</span>
                      </div>
                      <p className="text-xs text-amber-700 leading-relaxed text-left">
                        Subscribe to our Premium Plan to disclose provider contact numbers, email addresses, and unlock direct contact options.
                      </p>
                      <button 
                        onClick={() => alert("Premium subscription feature is coming soon!")}
                        className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all text-xs"
                      >
                        Subscribe to Disclose Contact Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Validity info */}
            <div className="flex items-center gap-2 text-gray-400 text-xs px-2">
              <Calendar size={14} />
              <span>Listing valid from {listing.validity.from} to {listing.validity.to}</span>
            </div>
          </div>
        </div>
      </main>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header / Nav */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to={`/${vertical}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ChevronLeft size={20} />
            <span className="font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:opacity-80 transition-opacity flex items-center">
              <img src="/bqLogo.jpg" alt="Browse Qatar" className="h-10 object-contain" />
            </Link>
            <Link to={`/${vertical}`} className="hover:opacity-80 transition-opacity hidden sm:flex items-center border-l-2 border-gray-200 pl-3">
              <span className="font-bold text-[#8B1538]">
                {currentConfig?.name || 'Listing Details'}
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-red-500 transition rounded-full hover:bg-gray-100">
              <Heart size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-blue-500 transition rounded-full hover:bg-gray-100">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {renderContent()}
      <footer className="bg-muted py-6 px-4 mt-2 pb-8 border-t border-gray-200">
        <div className="container mx-auto text-center text-muted-foreground">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3">
            <p className="m-0">© {new Date().getFullYear()} BrowseQatar Offers Platform. All rights reserved.</p>
            <span className="hidden md:inline text-muted-foreground mr-2">|</span>
            <a href="/terms" className="text-sm text-gray-500 hover:text-blue-600 transition-colors md:mr-3 underline">
              Terms & Conditions
            </a>
            <span className="hidden md:inline text-muted-foreground">|</span>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <img src={'/meraki.webp'} alt="Meraki AI" className="w-6 h-6 object-contain" />
              <span>Powered by MerakiAi</span>
            </div>
          </div>
        </div>
      </footer>
      <ListingEnquiryPopup
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        listingId={listing?.id ?? ''}
        adTitle={listing?.title ?? 'this Ad'}
      />
    </div>
  );
};

export default ListingDetail;
