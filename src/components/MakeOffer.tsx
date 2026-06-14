import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Power,
  Calendar,
  Key,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  List,
  Tag,
} from "lucide-react";

import {
  getInactiveOffers,
  activateOffers,
  getAllActiveOffers,
  inactivateOffers
} from "../services/offerService";
import { getAllRestaurants } from "../services/restaurantService";
import {
  getInactiveListings,
  getAllActiveListings,
  bulkActivateListings,
  inactivateListings as inactivateListingsSvc,
} from "../services/listingService";
import useAuth from "../auth/useAuth";
import { useModal } from "@/contexts/ModalContext";

// --- Types ---
interface Offer {
  id: number;
  title: string;
  restaurantId: number;
  cuisine?: string;
  validTo: string;
  active?: boolean;
  ownerLogin?: string;
  originalPrice?: string | number;
  discountedPrice?: string | number;
}

interface Listing {
  id: number;
  title: string;
  verticalId: string;
  description?: string;
  active?: boolean;
  ownerLogin?: string;
  pricing?: { originalPrice?: number; discountedPrice?: number; currency?: string };
  validity?: { from?: string; to?: string };
}

export default function MakeOfferOnline() {
  const navigate = useNavigate();
  const auth = useAuth();
  const isAdmin = auth.user?.role === "admin";
  const { openLogin } = useModal(); // 2. Get the open function

  // --- State ---
  // Top-level mode: "offers" or "listings"
  const [mode, setMode] = useState<'offers' | 'listings'>('offers');
  // Inner tab: activate (inactive → active) or deactivate (active → inactive)
  const [activeTab, setActiveTab] = useState<'activate' | 'deactivate'>('activate');

  const [offers, setOffers] = useState<Offer[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<number[]>([]);
  const [selectedListings, setSelectedListings] = useState<number[]>([]);

  const [validTo, setValidTo] = useState<Date | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [filterText, setFilterText] = useState("");

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Effects ---
  useEffect(() => {
    setSelectedOffers([]);
    setSelectedListings([]);
    setFilterText("");
    fetchData();
  }, [activeTab, mode]);

  useEffect(() => {
    getAllRestaurants().then(setRestaurants).catch(err => console.error("Failed to load restaurants", err));
  }, []);

  // --- Handlers ---
  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      if (mode === 'offers') {
        const data = activeTab === 'activate'
          ? await getInactiveOffers()
          : await getAllActiveOffers();
        setOffers(data || []);
      } else {
        const data = activeTab === 'activate'
          ? await getInactiveListings()
          : await getAllActiveListings();
        setListings(data || []);
      }
    } catch (err) {
      console.error(`Error loading ${activeTab} ${mode}:`, err);
      toast.error(`Failed to load data`);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSelectOffer = (id: number) => {
    setSelectedOffers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSelectListing = (id: number) => {
    setSelectedListings((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const filteredOffers = offers.filter(offer =>
    offer.title.toLowerCase().includes(filterText.toLowerCase()) ||
    offer.restaurantId?.toString().includes(filterText) ||
    (offer.ownerLogin && offer.ownerLogin.toLowerCase().includes(filterText.toLowerCase()))
  );

  const filteredListings = listings.filter(l =>
    l.title.toLowerCase().includes(filterText.toLowerCase()) ||
    l.verticalId?.toLowerCase().includes(filterText.toLowerCase()) ||
    (l.ownerLogin && l.ownerLogin.toLowerCase().includes(filterText.toLowerCase()))
  );

  const handleSelectAll = () => {
    if (mode === 'offers') {
      if (selectedOffers.length === filteredOffers.length) setSelectedOffers([]);
      else setSelectedOffers(filteredOffers.map(o => o.id));
    } else {
      if (selectedListings.length === filteredListings.length) setSelectedListings([]);
      else setSelectedListings(filteredListings.map(l => l.id));
    }
  };

  const isAllSelected = mode === 'offers'
    ? filteredOffers.length > 0 && selectedOffers.length === filteredOffers.length
    : filteredListings.length > 0 && selectedListings.length === filteredListings.length;

  const selectedCount = mode === 'offers' ? selectedOffers.length : selectedListings.length;

  const handlePriceChange = (id: number, field: 'originalPrice' | 'discountedPrice', value: string) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const handleOfferDateChange = (id: number, value: string) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, validTo: value } : o));
  };

  const handleSubmit = async () => {
    if (!apiKey.trim()) { toast.warning("Please enter your API Key."); return; }
    if (selectedCount === 0) { toast.warning(`Please select at least one ${mode === 'offers' ? 'offer' : 'listing'}.`); return; }

    setIsSubmitting(true);
    try {
      if (mode === 'offers') {
        if (activeTab === 'activate') {
          const updates = offers.filter(o => selectedOffers.includes(o.id)).map(o => ({
            id: o.id, originalPrice: o.originalPrice, discountedPrice: o.discountedPrice,
            validTo: o.validTo ? o.validTo.split("T")[0] : null
          }));
          await activateOffers({
            offerIds: selectedOffers,
            validTill: validTo ? `${validTo.getFullYear()}-${String(validTo.getMonth() + 1).padStart(2, '0')}-${String(validTo.getDate()).padStart(2, '0')}` : undefined,
            updates, apiKey,
          });
          toast.success("Offers activated successfully!");
        } else {
          await inactivateOffers({ offerIds: selectedOffers, apiKey });
          toast.success("Offers deactivated successfully!");
        }
      } else {
        // Listings mode
        if (activeTab === 'activate') {
          await bulkActivateListings({ offerIds: selectedListings }, apiKey);
          toast.success("Listings activated successfully!");
        } else {
          await inactivateListingsSvc({ offerIds: selectedListings }, apiKey);
          toast.success("Listings deactivated successfully!");
        }
      }
      setSelectedOffers([]);
      setSelectedListings([]);
      setValidTo(null);
      fetchData();
    } catch (err: any) {
      console.error("Operation failed:", err);
      toast.error(`Failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRestaurantName = (id: number) => {
    const r = restaurants.find(r => r.id === id);
    return r ? r.name : `#${id}`;
  };

  // ✅ NEW Helper: Checks Auth before navigating
  const handleProtectedNavigation = (path: string) => {
    //setMenuOpen(false); // Close the menu immediately

    if (auth.user) {
      // User is logged in -> Go to page
      setTimeout(() => navigate(path), 120);
    } else {
      // User is NOT logged in -> Open Login Modal
      if (auth.provider === "FIREBASE") {
        openLogin(() => {
          // This runs only AFTER successful login
          navigate(path);
        });
      } else {
        // Fallback for Keycloak
        auth.login();
      }
    }
  };
  // Inside your component
  const onGoToManageOfferClick = () => {
    // Mobile (< 768px) goes to simple form, others go to Admin Dashboard
    if (window.innerWidth < 768) {
      handleProtectedNavigation("/admin");
    } else {
      handleProtectedNavigation("/manage-offers");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

      {/* --- Responsive Header --- */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm shrink-0 z-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">

          <div className="flex items-center gap-3">
            <button
              onClick={onGoToManageOfferClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 flex-shrink-0"
              title="Back to Offer Management"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="leading-tight flex items-center gap-3">
              <img src="/bqLogo.jpg" alt="Browse Qatar" className="h-5 w-auto hidden sm:block" />
              <h1 className="text-lg md:text-xl font-bold text-gray-800">Review & Activate</h1>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            {/* Mode Toggle: Offers / Listings */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setMode('offers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${mode === 'offers' ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Tag size={14} /> Restaurant Offers
              </button>
              <button
                onClick={() => setMode('listings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${mode === 'listings' ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <List size={14} /> Ads Listings
              </button>
            </div>

            {/* Activate / Deactivate Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
              <button
                onClick={() => setActiveTab('activate')}
                className={`flex-1 md:flex-none justify-center px-4 py-1.5 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${activeTab === 'activate' ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Power size={14} /> {mode === 'offers' ? 'Inactive Offers' : 'Inactive Listings'}
              </button>
              <button
                onClick={() => setActiveTab('deactivate')}
                className={`flex-1 md:flex-none justify-center px-4 py-1.5 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${activeTab === 'deactivate' ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <XCircle size={14} /> {mode === 'offers' ? 'Active Offers' : 'Active Listings'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Guard */}
      {!isAdmin && (
        <div className="flex flex-col items-center justify-center flex-1 text-gray-500 gap-3">
          <XCircle size={40} className="text-red-400" />
          <p className="font-medium">Access restricted. Admin privileges required.</p>
          <button onClick={() => navigate(-1)} className="text-sm text-blue-600 underline">Go back</button>
        </div>
      )}

      {isAdmin && (
        <main className="flex-1 w-full max-w-5xl mx-auto p-2 md:p-6 overflow-hidden flex flex-col">
          <div className="bg-white shadow-md rounded-xl border border-gray-200 flex flex-col h-full overflow-hidden">

            {/* Toolbar */}
            <div className="p-3 md:p-4 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-gray-50/50 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${activeTab === 'activate' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {activeTab === 'activate' ? 'Inactive' : 'Active'}
                </span>
                <span className="text-xs md:text-sm text-gray-500">
                  {mode === 'offers' ? filteredOffers.length : filteredListings.length} found
                </span>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder={`Search ${mode}...`}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 min-h-0 overflow-auto relative w-full">
              {isLoadingData ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 absolute inset-0">
                  <Loader2 className="animate-spin" size={30} />
                  <span className="text-sm">Loading data...</span>
                </div>
              ) : mode === 'offers' ? (
                filteredOffers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 absolute inset-0">
                    <Search size={40} className="opacity-20" />
                    <p className="text-sm">No offers match your criteria.</p>
                  </div>
                ) : (
                  <table className="w-full min-w-[700px] text-left text-sm border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-20 border-b border-gray-200 text-gray-600 font-medium shadow-sm">
                      <tr>
                        <th className="px-4 py-3 w-10 sticky left-0 z-30 bg-gray-50 shadow-[1px_0_0_0_rgba(229,231,235,1)]">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" checked={isAllSelected} onChange={handleSelectAll} />
                        </th>
                        <th className="px-4 py-3">Offer Details</th>
                        <th className="px-4 py-3 whitespace-nowrap">Restaurant</th>
                        <th className="px-4 py-3 whitespace-nowrap">Price (QAR)</th>
                        <th className="px-4 py-3 whitespace-nowrap">Validity</th>
                        <th className="px-4 py-3 whitespace-nowrap">Owner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOffers.map((offer) => (
                        <tr key={offer.id} className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${selectedOffers.includes(offer.id) ? 'bg-blue-50' : ''}`} onClick={() => handleSelectOffer(offer.id)}>
                          <td className="px-4 py-3 sticky left-0 z-10 bg-white border-r border-gray-100 shadow-[1px_0_0_0_rgba(243,244,246,1)]">
                            <input type="checkbox" checked={selectedOffers.includes(offer.id)} readOnly className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none" />
                          </td>
                          <td className="px-4 py-3 max-w-[200px]">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800 truncate" title={offer.title}>#{offer.id} {offer.title}</span>
                              <span className="text-xs text-gray-500 bg-gray-100 w-fit px-1.5 py-0.5 rounded mt-1">{offer.cuisine || "General"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap max-w-xs">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800 truncate">{getRestaurantName(offer.restaurantId)}</span>
                              <span className="text-xs text-gray-400">ID: {offer.restaurantId}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {activeTab === 'activate' ? (
                              <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-gray-400 w-8">ORIG:</span>
                                  <input type="text" value={offer.originalPrice || ""} onChange={(e) => handlePriceChange(offer.id, 'originalPrice', e.target.value)} className="w-16 p-1 border rounded text-[10px] h-6 focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-gray-400 w-8">DISC:</span>
                                  <input type="text" value={offer.discountedPrice || ""} onChange={(e) => handlePriceChange(offer.id, 'discountedPrice', e.target.value)} className="w-16 p-1 border rounded text-[10px] h-6 focus:ring-1 focus:ring-blue-500 font-bold text-green-600" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 line-through">{offer.originalPrice}</span>
                                <span className="text-xs font-bold text-green-600">{offer.discountedPrice}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {activeTab === 'activate' ? (
                              <input type="date" value={offer.validTo ? offer.validTo.split("T")[0] : ""} onChange={(e) => handleOfferDateChange(offer.id, e.target.value)} onClick={(e) => e.stopPropagation()} className="bg-gray-50 border border-gray-300 text-gray-800 text-[10px] rounded focus:ring-blue-500 focus:border-blue-500 p-1 outline-none" />
                            ) : (
                              <span className="text-gray-500 font-mono text-xs">{offer.validTo ? offer.validTo.split("T")[0] : "No Expiry"}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{offer.ownerLogin || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                /* --- LISTINGS TABLE --- */
                filteredListings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 absolute inset-0">
                    <List size={40} className="opacity-20" />
                    <p className="text-sm">No listings match your criteria.</p>
                  </div>
                ) : (
                  <table className="w-full min-w-[650px] text-left text-sm border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-20 border-b border-gray-200 text-gray-600 font-medium shadow-sm">
                      <tr>
                        <th className="px-4 py-3 w-10 sticky left-0 z-30 bg-gray-50 shadow-[1px_0_0_0_rgba(229,231,235,1)]">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" checked={isAllSelected} onChange={handleSelectAll} />
                        </th>
                        <th className="px-4 py-3">Listing Details</th>
                        <th className="px-4 py-3 whitespace-nowrap">Vertical</th>
                        <th className="px-4 py-3 whitespace-nowrap">Price</th>
                        <th className="px-4 py-3 whitespace-nowrap">Valid Until</th>
                        <th className="px-4 py-3 whitespace-nowrap">Owner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredListings.map((l) => (
                        <tr key={l.id} className={`hover:bg-purple-50/50 transition-colors cursor-pointer ${selectedListings.includes(l.id) ? 'bg-purple-50' : ''}`} onClick={() => handleSelectListing(l.id)}>
                          <td className="px-4 py-3 sticky left-0 z-10 bg-white border-r border-gray-100 shadow-[1px_0_0_0_rgba(243,244,246,1)]">
                            <input type="checkbox" checked={selectedListings.includes(l.id)} readOnly className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 pointer-events-none" />
                          </td>
                          <td className="px-4 py-3 max-w-[200px]">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800 truncate" title={l.title}>#{l.id} {l.title}</span>
                              <span className="text-xs text-gray-500 mt-0.5 truncate">{l.description}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium">{l.verticalId}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {l.pricing?.discountedPrice ? (
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 line-through">{l.pricing.originalPrice}</span>
                                <span className="text-xs font-bold text-green-600">{l.pricing.currency || "QAR"} {l.pricing.discountedPrice}</span>
                              </div>
                            ) : <span className="text-xs text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-gray-500 font-mono text-xs">{l.validity?.to ? l.validity.to.split("T")[0] : "No Expiry"}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{l.ownerLogin || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </div>

            {/* Footer Form */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 shrink-0 z-30">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTab === 'activate' && mode === 'offers' ? (
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block uppercase">New Expiry</label>
                      <div className="relative z-50">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        <DatePicker
                          selected={validTo}
                          onChange={(date: Date | null) => setValidTo(date ?? new Date())}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholderText="Select date..."
                          dateFormat="yyyy-MM-dd"
                          minDate={new Date()}
                          wrapperClassName="w-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-red-500 flex items-center h-full pt-1 italic">
                      * {mode === 'offers' ? 'Offers' : 'Listings'} will be removed from public listing immediately.
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block uppercase">Security Key</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Enter Key"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || selectedCount === 0}
                  className={`w-full py-3 rounded-lg text-white font-bold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2
                    ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : activeTab === 'activate' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                >
                  {isSubmitting ? (
                    <><Loader2 className="animate-spin" size={18} /> Processing...</>
                  ) : activeTab === 'activate' ? (
                    <><CheckCircle size={18} /> Activate ({selectedCount})</>
                  ) : (
                    <><XCircle size={18} /> Inactivate ({selectedCount})</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}