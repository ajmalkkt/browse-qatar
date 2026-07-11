import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  getRestaurantDetail,
  uploadMenuImages,
  deleteMenuImage,
} from "../services/restaurantService";
import useAuth from "../auth/useAuth";
import {
  MapPin, Star, Utensils, ArrowLeft, ExternalLink,
  ShieldCheck, Tag, BookOpen, ChevronLeft, ChevronRight,
  Upload, Trash2, Plus, X, ImagePlus
} from "lucide-react";

const MAX_MENU_FILES = 10;
const BQ_PLACEHOLDER = "/bqLogo.jpg";

type MenuImageCardProps = {
  imageUrl: string;
  alt: string;
  index: number;
  isEditMode: boolean;
  onOpen: () => void;
  onDelete?: () => void;
};

function MenuImageCard({ imageUrl, alt, index, isEditMode, onOpen, onDelete }: MenuImageCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedSrc = imageFailed || !imageUrl ? BQ_PLACEHOLDER : imageUrl;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left"
        aria-label={`Open menu page ${index + 1}`}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
          <img
            src={resolvedSrc}
            alt={alt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
          {(!imageUrl || imageFailed) && (
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 text-center">
              <p className="text-xs font-semibold tracking-wide text-white">Menu image unavailable</p>
              <p className="mt-0.5 text-[10px] text-gray-300">Refresh or check back shortly.</p>
            </div>
          )}
        </div>
      </button>

      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
          Page {index + 1}
        </span>
        {isEditMode ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full bg-red-500 p-1.5 text-white shadow-sm transition hover:bg-red-600"
            title="Remove page"
            aria-label="Remove page"
          >
            <Trash2 size={12} />
          </button>
        ) : (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
            Flyer View
          </span>
        )}
      </div>
    </div>
  );
}

export default function RestaurantDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // edit=true when coming from ManageOffers / AdminImageManager
  const editRequested = searchParams.get("edit") === "true";
  const isAdminOrOwner = user && (user.role === "admin" || user.role === "restaurant_owner");
  const editMode = editRequested && !!isAdminOrOwner;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "menu">(editMode ? "menu" : "overview");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Edit-mode state
  const [menuImages, setMenuImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRestaurant = async () => {
    try {
      if (id) {
        const data = await getRestaurantDetail(id);
        setRestaurant(data);
        setMenuImages(data.menuImages || []);
      }
    } catch (error) {
      console.error("Failed to fetch restaurant details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  // Switch to menu tab when edit mode is active
  useEffect(() => {
    if (editMode) setActiveTab("menu");
  }, [editMode]);

  // Build file previews whenever selectedFiles changes
  useEffect(() => {
    const urls = selectedFiles.map((f) => URL.createObjectURL(f));
    setFilePreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [selectedFiles]);

  // ── Handlers ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const combined = [...selectedFiles, ...files].slice(0, MAX_MENU_FILES);
    setSelectedFiles(combined);
    setUploadError("");
    // reset input so same files can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSelectedFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    if (!user) return alert("You must be logged in.");
    setUploading(true);
    setUploadError("");
    try {
      const result = await uploadMenuImages(id, selectedFiles);
      setMenuImages(result.menuImages || []);
      setSelectedFiles([]);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePage = async (url: string) => {
    if (!window.confirm("Remove this menu page?")) return;
    try {
      const result = await deleteMenuImage(id, url);
      setMenuImages(result.menuImages || []);
    } catch (err: any) {
      alert("Failed to delete page: " + err.message);
    }
  };

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => setLightboxIndex((i) => (i !== null ? (i - 1 + menuImages.length) % menuImages.length : null));
  const nextImage = () => setLightboxIndex((i) => (i !== null ? (i + 1) % menuImages.length : null));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Helmet><title>Restaurant Not Found | BrowseQatar</title></Helmet>
        <Utensils size={48} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Restaurant Not Found</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">We couldn't find this restaurant.</p>
        <button onClick={() => navigate("/all-restaurants")} className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors">
          Back to All Restaurants
        </button>
      </div>
    );
  }

  const title = `${restaurant.name} in Qatar - Menus, Offers, Location | BrowseQatar`;
  const description = `Find the latest offers, menu items, and details for ${restaurant.name} located at ${restaurant.address || "Doha, Qatar"}.`;
  const canonicalUrl = `https://browseqatar.com/restaurant/${id}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={restaurant.logoUrl || "https://browseqatar.com/bqLogo.jpg"} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600" title="Back">
              <ArrowLeft size={20} />
            </button>
            <h1 onClick={() => navigate(-1)} className="text-sm font-bold text-gray-500 truncate">Home/{restaurant.name}</h1>
          </div>
          <img src="/bqLogo.jpg" alt="Browse Qatar" className="h-8 w-auto" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative"></div>
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end mb-4">
              <div className="w-24 h-24 bg-white rounded-xl shadow-md border-4 border-white flex items-center justify-center p-2 shrink-0 -mt-12 relative z-10">
                <img src={restaurant.logoUrl || restaurant.brandUrl || "https://via.placeholder.com/150"} alt={restaurant.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 pb-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{restaurant.name}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1"><MapPin size={16} className="text-gray-400" /><span>{restaurant.address || "Doha, Qatar"}</span></div>
                  <div className="flex items-center gap-1 font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                    <Star size={14} fill="currentColor" /><span>{restaurant.rating || "4.5"} Rating</span>
                  </div>
                  {restaurant.isPureVeg && (
                    <div className="flex items-center gap-1 font-semibold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200" title="Pure Vegetarian">
                      <span className="text-base">🌱</span><span className="text-xs">Pure Veg</span>
                    </div>
                  )}
                  {editMode && (
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">✏️ Edit Mode</span>
                  )}
                </div>
              </div>
              {!editMode && (
                <div className="w-full sm:w-auto">
                  <Link to={`/restaurants-offers/?restaurant=${id}`} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm w-full">
                    <Tag size={18} /><span>View Offers</span>
                  </Link>
                </div>
              )}
            </div>
            {Array.isArray(restaurant.cuisine) && restaurant.cuisine.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Cuisines Served</h3>
                <div className="flex flex-wrap gap-2">
                  {restaurant.cuisine.map((c: string, idx: number) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl shadow-sm px-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-colors border-b-2 ${activeTab === "overview" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            <ShieldCheck size={16} /> Overview
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-colors border-b-2 ${activeTab === "menu" ? "border-orange-500 text-orange-500" : "border-transparent text-red-700 animate-pulse"}`}
          >
            <BookOpen size={16} />
            Menu
            {menuImages.length > 0 && (
              <span className="ml-1 bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">{menuImages.length}</span>
            )}
            {editMode && <span className="ml-1 text-xs text-orange-400">(edit)</span>}
          </button>
        </div>

        {/* Tab: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4 text-orange-500">
                <Utensils size={24} />
                <h3 className="text-xl font-bold text-gray-900">Dining in Qatar</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">
                Qatar offers a vibrant culinary scene, blending traditional Middle Eastern flavors with international cuisines. Whether you're craving authentic Arabic Mandi, savory shawarmas, or globally-recognized fast food, Doha has it all. Experience the rich hospitality and exquisite tastes that make dining in Qatar truly memorable.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <ShieldCheck size={24} />
                <h3 className="text-xl font-bold text-gray-900">BrowseQatar Offers</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm mb-4">BrowseQatar connects you with the best dining deals across the country.</p>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Verified discounts and meal deals</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Updated regularly with new menus</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Direct links to order or visit</li>
              </ul>
              <Link to={`/restaurants-offers/?restaurant=${id}`} className="text-blue-600 font-semibold hover:underline flex items-center gap-1 text-sm">
                Check {restaurant.name} Offers Now <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* Tab: Menu */}
        {activeTab === "menu" && (
          <div className="space-y-6">

            {/* ── EDIT PANEL (admin/owner only) ── */}
            {editMode && (
              <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ImagePlus size={20} className="text-orange-500" />
                  <h3 className="text-base font-bold text-gray-800">Upload Menu Pages</h3>
                  <span className="ml-auto text-xs text-gray-400">Max {MAX_MENU_FILES} pages total</span>
                </div>

                {/* Drop zone / file picker */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-orange-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition"
                >
                  <Plus size={28} className="mx-auto mb-2 text-orange-400" />
                  <p className="text-sm text-gray-600 font-medium">Click to select menu page images</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Up to {MAX_MENU_FILES - menuImages.length} more pages</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {/* New file previews */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Selected ({selectedFiles.length})</p>
                    <div className="flex flex-wrap gap-3">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={filePreviews[idx]}
                            alt={file.name}
                            className="h-24 w-16 object-cover rounded-lg border-2 border-orange-300 shadow-sm"
                          />
                          <button
                            onClick={() => removeSelectedFile(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow text-xs hover:bg-red-600 transition"
                          >
                            <X size={11} />
                          </button>
                          <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center rounded-b-lg py-0.5">
                            New {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>

                    {uploadError && (
                      <p className="text-xs text-red-500 mt-2">{uploadError}</p>
                    )}

                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition shadow-sm"
                    >
                      {uploading ? (
                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Uploading…</>
                      ) : (
                        <><Upload size={16} /> Upload {selectedFiles.length} Page{selectedFiles.length !== 1 ? "s" : ""}</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── EXISTING MENU PAGES ── */}
            {menuImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
                <BookOpen size={48} className="mb-4 opacity-30" />
                <p className="text-lg font-semibold mb-1">No Menu Available</p>
                <p className="text-sm">{editMode ? "Upload menu pages using the panel above." : "The restaurant hasn't uploaded their menu yet."}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {!editMode && (
                  <p className="text-sm text-gray-500">
                    Showing {menuImages.length} page{menuImages.length !== 1 ? "s" : ""} — tap any image to enlarge.
                  </p>
                )}
                {editMode && (
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-1 whitespace-nowrap">
                    {menuImages.length} uploaded page{menuImages.length !== 1 ? "s" : ""} — click 
                    <Trash2 size={12} className="inline text-red-500" /> 
                    to remove a page.
                  </p>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {menuImages.map((url, idx) => (
                    <MenuImageCard
                      key={idx}
                      imageUrl={url}
                      alt={`${restaurant.name} menu page ${idx + 1}`}
                      index={idx}
                      isEditMode={editMode}
                      onOpen={() => openLightbox(idx)}
                      onDelete={() => handleDeletePage(url)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {menuImages.length > 0 && (
        <button
          onClick={() => setActiveTab("menu")}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full bg-white p-2 shadow-xl ring-1 ring-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          title="View Menu"
          aria-label="View Menu"
        >
          <img src="/menu_book.png" alt="Menu" className="h-10 w-10" />
        </button>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition">
            <ChevronLeft size={28} />
          </button>
          <div className="relative max-w-3xl w-full mx-16" onClick={(e) => e.stopPropagation()}>
            <img src={menuImages[lightboxIndex]} alt={`Menu page ${lightboxIndex + 1}`} className="w-full max-h-[90vh] object-contain rounded-xl" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-4 py-1.5 rounded-full">
              {lightboxIndex + 1} / {menuImages.length}
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition">
            <ChevronRight size={28} />
          </button>
          <button onClick={closeLightbox} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-full text-sm font-medium transition">
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
}
