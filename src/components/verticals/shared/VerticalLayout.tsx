import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useVertical } from '../../../hooks/useVertical';
import { useListing } from '../../../hooks/useListing';
import VerticalHeader from '../../common/VerticalHeader';
import ListingCard from '../../common/ListingCard';
import TopHeader from '../../TopHeader';
import { DEFAULT_COUNTRY } from '../../../config/appConfig';

/**
 * Shared layout for all verticals listing pages
 * Handles fetching data, filtering, and displaying listing grid
 */
const VerticalLayout: React.FC = () => {
  const { vertical } = useParams<{ vertical: string }>();
  const navigate = useNavigate();
  const { currentVertical, switchVertical, verticals, currentConfig } = useVertical();
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync context with URL parameter
  useEffect(() => {
    if (vertical && vertical !== currentVertical) {
      switchVertical(vertical);
    }
  }, [vertical, currentVertical, switchVertical]);

  const { listings, loading, error, setFilters } = useListing({
    verticalId: vertical || '',
    filters: {}
  });

  const filteredListings = listings.filter((l: any) => {
    if (!selectedCountry) return true;
    return l.location?.country === selectedCountry;
  });

  // Validate vertical ID
  const isValidVertical = verticals.some(v => v.id === vertical);

  if (!vertical || !isValidVertical) {
    return <Navigate to="/" replace />;
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Update API filters so backend search is triggered
    setFilters(query ? { search: query } : {});
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Re-use main TopHeader for consistent branding/auth */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <TopHeader
          onSearch={handleSearch}
          selectedCountry={selectedCountry}
          onSelectCountry={setSelectedCountry}
          onAddBusiness={() => {}} // TODO: Handle business enquiry for verticals
          searchQuery={searchQuery}
        />
      </div>

      {/* Vertical-specific header with navigation */}
      <VerticalHeader />

      <main className="container mx-auto px-4 pt-0 pb-4">
        {currentConfig && vertical !== 'restaurants' && (
          <div className="mb-1 md:hidden flex items-center gap-2 px-1">
            <h1 className="text-lg font-bold text-gray-900">{currentConfig.name}</h1>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <h3 className="text-red-800 font-bold mb-2">Error loading listings</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              We couldn't find any {currentConfig?.name?.toLowerCase()} matching your criteria.
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${['vehicles', 'jobs'].includes(vertical) ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
            {filteredListings.map((listing) => (
              <ListingCard 
                key={listing.id} 
                listing={listing} 
                vertical={vertical} 
                onClick={() => navigate(`/${vertical}/${listing.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-muted py-6 px-4 mt-2 pb-8">
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
    </div>
  );
};

export default VerticalLayout;
