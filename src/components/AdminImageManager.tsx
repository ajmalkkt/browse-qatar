import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Tag,
  UploadCloud,
  LogOut,
  Plus,
  Trash2,
  Search,
  User,
  Menu,
  X,
  ChevronRight,
  Save,
  Image as ImageIcon,
  Paperclip,
  ArrowLeft,
  Loader2,
  Key,
  EyeOff,
  AlertCircle,
  ExternalLink,
  MessageSquare, // Added for Messages
  CheckCircle,   // Added for Actions
  XCircle,       // Added for Status
  Clock,         // Added for Status
  ChevronLeft,    // Added for Pagination
  HelpCircle,     // Added for User Guide
  Edit2,          // Added for Edit action
  List,           // Added for Listings
  Building2       // Added for Providers
} from "lucide-react";

// Services (Existing)
import {
  getAllOwnerRestaurants,
  uploadRestaurant,
  uploadBulkData,
} from "../services/restaurantService";
import {
  getOffersByOwnerRestaurantId,
  uploadOffer,
  deleteOffer,
  getInactiveOffers,
  updateOffer,
} from "../services/offerService";

import { uploadListing, getAllListings, getInactiveListings, updateListing, deleteListing } from "../services/listingService";
import { getAllProviders, createProvider, updateProvider, deleteProvider } from "../services/providerService";
import { getEnquiries, updateEnquiryStatus } from "../services/enquiryService";

// Auth Hook
import useAuth from "../auth/useAuth";

// App Config
import { cuisineOptions, countryMap } from "../config/appConfig";
import ListingForm from "./common/ListingForm";
import ProviderForm from "./common/ProviderForm";


export default function ManageOffers() {
  const navigate = useNavigate();
  const offerInputRef = useRef(null);
  const { user, initialized } = useAuth();

  // Fallback user display
  const displayUser = user ? {
    name: user.displayName || user.email || "User",
    email: user.email || "",
    role: user.role || "user"
  } : {
    name: "Guest",
    email: "",
    role: "user"
  };

  // ===== Navigation State =====
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddRestaurantForm, setShowAddRestaurantForm] = useState(false);
  const [showAddOfferForm, setShowAddOfferForm] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // ===== Data States =====
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [offers, setOffers] = useState([]);
  const [inactiveOffers, setInactiveOffers] = useState([]);

  // -- Message States --
  const [messages, setMessages] = useState([]);
  const [msgPage, setMsgPage] = useState(1);
  const [msgTotalPages, setMsgTotalPages] = useState(1);
  const [loadingMessages, setLoadingMessages] = useState(false);
  // --------------------

  const [logoPreview, setLogoPreview] = useState(null);
  const [brandPreview, setBrandPreview] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [offerPreview, setOfferPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [offerTab, setOfferTab] = useState("active"); // active, inactive
  const [showEditOfferForm, setShowEditOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [updateImage, setUpdateImage] = useState(false);

  // -- Listings States --
  const [showAddListingForm, setShowAddListingForm] = useState(false);
  const [listings, setListings] = useState([]);
  const [listingPreview, setListingPreview] = useState(null);
  const [listingGalleryPreviews, setListingGalleryPreviews] = useState([]);
  const [inactiveListings, setInactiveListings] = useState<any[]>([]);
  const [listingTab, setListingTab] = useState("active"); // active, inactive
  const [showEditListingForm, setShowEditListingForm] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [listingUpdateImage, setListingUpdateImage] = useState(false);

  // -- Provider States --
  const [providers, setProviders] = useState([]);
  const [showAddProviderForm, setShowAddProviderForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [providerLogoPreview, setProviderLogoPreview] = useState(null);
  const [providerBannerPreview, setProviderBannerPreview] = useState(null);
  const [providerForm, setProviderForm] = useState({
    verticalId: "",
    type: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    country: "Qatar",
    logo: null,
    banner: null
  });

  // ===== Forms =====
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [form, setForm] = useState({
    id: "", name: "", address: "", phone: "", rating: "", cuisine: "",
    logo: null, brand: null, country: "Qatar",
  });
  const [offerForm, setOfferForm] = useState({
    title: "", description: "", cuisine: "", originalPrice: "", discountedPrice: "",
    offerType: "Discount", validFrom: getTodayDate(), validTo: getTomorrowDate(), location: "", country: "Qatar",
    category: "", image: null, active: true,
  });

  const [listingForm, setListingForm] = useState<any>({
    verticalId: "", title: "", description: "", category: "", subcategory: "",
    originalPrice: "", discountedPrice: "", unit: "", currency: "QAR",
    validFrom: getTodayDate(), validTo: getTomorrowDate(),
    city: "", country: "Qatar", address: "",
    attributes: {}, active: false, image: null, gallery: []
  });

  // ===== Helpers =====
  const getAuthHeaders = () => ({ "x-api-token": apiKey || "" });

  const getFilteredRestaurants = (allRestaurants) => {
    if (!user) return [];
    if (user.role === "admin") return allRestaurants;
    return allRestaurants.filter((r) => r.ownerLogin === user.email);
  };

  const getFilteredOffers = (allOffers) => {
    if (!user) return [];
    if (user.role === "admin") return allOffers;
    return allOffers.filter((o) => o.ownerLogin === user.email);
  };

  const getFilteredProviders = (allProviders) => {
    if (!user) return [];
    if (user.role === "admin") return allProviders;
    return allProviders.filter((p) => p.ownerLogin === user.email || p.email === user.email);
  };

  const getFilteredListings = (allListings) => {
    if (!user) return [];
    if (user.role === "admin") return allListings;
    return allListings.filter((l) => l.ownerLogin === user.email);
  };

  // ===== Effects =====
  useEffect(() => {
    getAllOwnerRestaurants().then(setRestaurants).catch(console.error);
    getAllProviders().then(setProviders).catch(console.error);
    getAllListings().then(setListings).catch(console.error);
  }, []);

  // Fetch inactive offers when tab is switched
  useEffect(() => {
    if (activeTab === "offers" || activeTab === "bulk") {
      getInactiveOffers()
        .then((data) => setInactiveOffers(data || []))
        .catch((err) => {
          console.error("Failed to fetch inactive offers", err);
          setInactiveOffers([]);
        });
    }

    if (activeTab === "listings") {
      getInactiveListings()
          .then((data) => setInactiveListings(data || []))
          .catch((err) => {
            console.error("Failed to fetch inactive listings", err);
            setInactiveListings([]);
          });
    }

    // Fetch Providers when tab is switched
    if (activeTab === "providers") {
      getAllProviders().then(setProviders).catch(console.error);
    }
    // Fetch Messages when tab is switched
    if (activeTab === "messages") {
      fetchMessages(msgPage);
    }
  }, [activeTab, msgPage]); // Re-run when tab or page changes

  const fetchMessages = async (page) => {
    //if (!apiKey) return; // Wait for key
    setLoadingMessages(true);
    try {
      const data = await getEnquiries(page, 10, apiKey);
      // Assuming backend returns { enquiries: [...], totalPages: x, page: y }
      // Adjust property names based on your actual backend response
      setMessages(data.enquiries || []);
      setMsgTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'offers' && !selectedRestaurant && restaurants.length > 0) {
      // Logic kept safe
    }
  }, [activeTab, restaurants]);

  // Handle mobile menu close on tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  // ===== Handlers =====
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
      if (name === "logo") setLogoPreview(URL.createObjectURL(files[0]));
      if (name === "brand") setBrandPreview(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleOfferFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      setOfferForm((prev) => ({ ...prev, image: files[0] }));
      if (name === "offerImg") setOfferPreview(URL.createObjectURL(files[0]));
    } else {
      setOfferForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleAddOfferForm = () => {
    if (!showAddOfferForm) {
      setOfferForm({
        title: "", description: "", cuisine: "", originalPrice: "", discountedPrice: "",
        offerType: "Discount", validFrom: getTodayDate(), validTo: getTomorrowDate(), location: "", country: "Qatar",
        category: "", image: null, active: false,
      });
      setOfferPreview(null);
    }
    setShowAddOfferForm(!showAddOfferForm);
  };

  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey) return alert("Please enter your Key.");
    if (!form.name || !form.address || !form.logo || !form.country) return alert("Missing required fields.");

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => { if (val) formData.append(key, val); });

    setIsUploading(true);
    try {
      await uploadRestaurant(formData, { headers: getAuthHeaders() });
      alert("Restaurant saved!");
      setRestaurants(await getAllOwnerRestaurants());
      setForm({ id: "", name: "", address: "", phone: "", rating: "", cuisine: "", logo: null, brand: null, country: "Qatar" });
      setLogoPreview(null);
      setBrandPreview(null);
      setShowAddRestaurantForm(false);
    } catch (err) { console.error(err); alert("Error saving restaurant"); }
    finally { setIsUploading(false); }
  };

  const handleSelectRestaurant = async (e) => {
    const id = e.target.value;
    setSelectedRestaurant(id);
    if (id) {
      const activeData = await getOffersByOwnerRestaurantId(id);
      setOffers(activeData);
      // Refresh inactive offers as well
      getInactiveOffers().then(setInactiveOffers).catch(console.error);
    } else {
      setOffers([]);
    }
  };

  const handleOfferUpload = async (e) => {
    e.preventDefault();
    if (!apiKey) return alert("Please enter your Key.");
    if (!selectedRestaurant) return alert("Select a restaurant first.");

    const formData = new FormData();
    formData.set("restaurantId", selectedRestaurant);
    const rName = restaurants.find(r => String(r.id) === String(selectedRestaurant))?.name || "";
    formData.set("restaurantName", rName);

    const offerData = { ...offerForm, cuisine: offerForm.category };
    Object.entries(offerData).forEach(([key, val]) => { if (val) formData.append(key, val); });

    setIsUploading(true);
    try {
      await uploadOffer(formData, { headers: getAuthHeaders() });
      alert("Offer uploaded!");
      setOffers(await getOffersByOwnerRestaurantId(selectedRestaurant));
      // Refresh inactive offers
      getInactiveOffers().then(setInactiveOffers).catch(console.error);
      setOfferForm({ title: "", description: "", cuisine: "", originalPrice: "", discountedPrice: "", offerType: "Discount", validFrom: getTodayDate(), validTo: getTomorrowDate(), location: "", country: "Qatar", category: "", image: null, active: false });
      if (offerInputRef.current) offerInputRef.current.value = "";
      setShowAddOfferForm(false);
      setOfferPreview(null);
    } catch (err) { console.error(err); alert("Error uploading offer: " + err.message); }
    finally { setIsUploading(false); }
  };

  const handleListingFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      if (name === "image") {
        setListingForm((prev) => ({ ...prev, image: files[0] }));
        setListingPreview(URL.createObjectURL(files[0]));
      } else if (name === "galleryUrls") {
        const newFiles = Array.from(files) as File[];
        setListingForm((prev) => {
          const currentGallery = prev.gallery || [];
          const combined = [...currentGallery, ...newFiles].slice(0, 5);
          return { ...prev, gallery: combined };
        });
        setListingGalleryPreviews((prev) => {
          const currentPreviews = prev || [];
          const newPreviews = newFiles.map(f => URL.createObjectURL(f));
          return [...currentPreviews, ...newPreviews].slice(0, 5);
        });
      }
    } else {
      setListingForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const removeGalleryImage = (index: number) => {
    setListingForm(prev => {
      const newGallery = [...(prev.gallery || [])];
      newGallery.splice(index, 1);
      return { ...prev, gallery: newGallery };
    });
    setListingGalleryPreviews(prev => {
      const newPreviews = [...(prev || [])];
      if (newPreviews[index] && newPreviews[index].startsWith('blob:')) {
        URL.revokeObjectURL(newPreviews[index]); // Free memory if it's a blob
      }
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const toggleAddListingForm = () => {
    if (!showAddListingForm) {
      setListingForm({
        verticalId: "vehicles", title: "", description: "", category: "", subcategory: "",
        originalPrice: "", discountedPrice: "", unit: "", currency: "QAR",
        validFrom: getTodayDate(), validTo: getTomorrowDate(),
        city: "", country: "Qatar", address: "",
        attributes: {}, image: null, gallery: []
      });
      setListingPreview(null);
      setListingGalleryPreviews([]);
    }
    setShowAddListingForm(!showAddListingForm);
  };

  const handleListingUpload = async (e) => {
    e.preventDefault();
    if (!apiKey) return alert("Please enter your Key.");

    const formData = new FormData();
    if (!selectedRestaurant) return alert("Select a Provider/Restaurant first.");
    formData.set("providerId", selectedRestaurant);

    const textFields = ['verticalId', 'title', 'description', 'category', 'subcategory'];
    textFields.forEach(field => {
      if (listingForm[field]) formData.set(field, listingForm[field]);
    });

    formData.set("pricing", JSON.stringify({
      originalPrice: listingForm.originalPrice,
      discountedPrice: listingForm.discountedPrice,
      unit: listingForm.unit,
      currency: listingForm.currency
    }));

    formData.set("location", JSON.stringify({
      city: listingForm.city,
      country: listingForm.country,
      address: listingForm.address
    }));

    formData.set("validity", JSON.stringify({
      validFrom: listingForm.validFrom,
      validTo: listingForm.validTo
    }));

    formData.set("attributes", JSON.stringify(listingForm.attributes));

    if (listingForm.image) {
      formData.append("image", listingForm.image);
    }
    
    if (listingForm.gallery && listingForm.gallery.length > 0) {
      listingForm.gallery.forEach(file => {
        formData.append("galleryUrls", file);
      });
    }

    setIsUploading(true);

    try {
      await uploadListing(formData, { headers: getAuthHeaders() });
      alert("Listing uploaded successfully!");
      setListingForm({ verticalId: "", title: "", description: "", category: "", subcategory: "", originalPrice: "", discountedPrice: "", unit: "", currency: "QAR", validFrom: getTodayDate(), validTo: getTomorrowDate(), city: "", country: "Qatar", address: "", attributes: {}, image: null, gallery: [] });
      setShowAddListingForm(false);
    } catch (err) { 
      console.error(err); 
      alert("Error uploading listing: " + err.message); 
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteListing = async (id: number, title: string) => {
    if (!apiKey) return alert("Please enter your Key.");
    if (!window.confirm(`Delete listing "${title}"? This cannot be undone.`)) return;
    setIsUploading(true);
    try {
      await deleteListing(id, { headers: getAuthHeaders() });
      setListings(prev => prev.filter((l: any) => l.id !== id));
      setInactiveListings(prev => prev.filter((l: any) => l.id !== id));
    } catch (err: any) {
      alert("Failed to delete listing: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleListingUpdate = async (e) => {
    e.preventDefault();
    if (!apiKey) return alert("Please enter your Key.");
    if (!editingListing) return;
    const formData = new FormData();
    formData.set("providerId", String((editingListing as any).providerId));
    const textFields = ['verticalId', 'title', 'description', 'category', 'subcategory'];
    textFields.forEach(field => { if (listingForm[field]) formData.set(field, listingForm[field]); });
    formData.set("pricing", JSON.stringify({ originalPrice: listingForm.originalPrice, discountedPrice: listingForm.discountedPrice, unit: listingForm.unit, currency: listingForm.currency }));
    formData.set("location", JSON.stringify({ city: listingForm.city, country: listingForm.country, address: listingForm.address }));
    
    // Convert validFrom/validTo into backend dates if provided
    const validityData: any = {};
    if (listingForm.validFrom) validityData.from = new Date(listingForm.validFrom).toISOString();
    if (listingForm.validTo) validityData.to = new Date(listingForm.validTo).toISOString();
    formData.set("validity", JSON.stringify(validityData));
    
    formData.set("attributes", JSON.stringify(listingForm.attributes || {}));

    if (listingForm.active !== undefined) {
      formData.set("active", String(listingForm.active));
      formData.set("status", listingForm.active ? "active" : "inactive");
    }
    if (listingUpdateImage && listingForm.image) formData.append("image", listingForm.image);
    if (listingForm.gallery && listingForm.gallery.length > 0) {
      listingForm.gallery.forEach(file => formData.append("galleryUrls", file));
    }
    setIsUploading(true);
    try {
      await updateListing((editingListing as any).id, formData, { headers: getAuthHeaders() });
      alert("Listing updated successfully!");
      const allListings = await getAllListings();
      setListings(allListings);
      getInactiveListings().then(setInactiveListings).catch(console.error);
      setShowEditListingForm(false);
      setEditingListing(null);
    } catch (err: any) {
      alert("Failed to update listing: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // ===== Provider Handlers =====
  const handleProviderFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      setProviderForm(prev => ({ ...prev, [name]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === "logo") setProviderLogoPreview(reader.result);
        if (name === "banner") setProviderBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProviderForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetProviderForm = () => {
    setProviderForm({ verticalId: "", type: "", name: "", email: "", phone: "", address: "", country: "Qatar", logo: null, banner: null });
    setProviderLogoPreview(null);
    setProviderBannerPreview(null);
    setEditingProvider(null);
    setShowAddProviderForm(false);
  };

  const handleProviderSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(providerForm).forEach(([key, val]) => {
      if (val !== null && val !== undefined) {
        formData.append(key, val);
      }
    });

    setIsUploading(true);
    try {
      if (editingProvider) {
        await updateProvider(editingProvider.id, formData);
        alert("Provider updated successfully!");
      } else {
        await createProvider(formData);
        alert("Provider created successfully!");
      }
      getAllProviders().then(setProviders).catch(console.error);
      resetProviderForm();
    } catch (err) {
      console.error(err);
      alert("Error saving provider: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditProvider = (p) => {
    setEditingProvider(p);
    setProviderForm({
      verticalId: p.verticalId || "",
      type: p.type || "",
      name: p.name || "",
      email: p.email || "",
      phone: p.phone || "",
      address: p.address || "",
      country: p.country || "Qatar",
      logo: null,
      banner: null
    });
    setProviderLogoPreview(p.logoUrl || null);
    setProviderBannerPreview(p.bannerUrl || null);
    setShowAddProviderForm(true);
  };

  const handleDeleteProvider = async (id) => {
    if (!window.confirm("Are you sure you want to delete this provider?")) return;
    try {
      await deleteProvider(id);
      setProviders(prev => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting provider: " + err.message);
    }
  };

  const handleOfferUpdate = async (e) => {
    e.preventDefault();
    if (!apiKey) return alert("Please enter your Key.");
    if (!editingOffer) return;

    const formData = new FormData();
    formData.set("restaurantId", editingOffer.restaurantId);

    // category is used for cuisine context in this app
    const submissionData = { ...offerForm, cuisine: offerForm.category };

    Object.entries(submissionData).forEach(([key, val]) => {
      if (key === 'image') {
        if (updateImage && val) {
          formData.set("image", val);
        }
      } else if (val !== null && val !== undefined) {
        formData.set(key, val);
      }
    });

    formData.set("updateImage", updateImage.toString());

    setIsUploading(true);
    try {
      await updateOffer(editingOffer.id, formData, { headers: getAuthHeaders() });
      alert("Offer updated successfully!");

      if (selectedRestaurant) {
        setOffers(await getOffersByOwnerRestaurantId(selectedRestaurant));
      }
      // Always refresh inactive to be sure
      getInactiveOffers().then(setInactiveOffers).catch(console.error);

      setShowEditOfferForm(false);
      setEditingOffer(null);
      setOfferPreview(null);
      setUpdateImage(false);
    } catch (err) {
      console.error(err);
      alert("Error updating offer: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!apiKey) return alert("Please enter your Key.");
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    try {
      await deleteOffer(id, { headers: getAuthHeaders() });
      if (selectedRestaurant) {
        setOffers(await getOffersByOwnerRestaurantId(selectedRestaurant));
      }
      // Always refresh inactive to be sure
      getInactiveOffers().then(setInactiveOffers).catch(console.error);
      alert("Offer deleted successfully!");
    } catch (err) { console.error(err); alert("Error deleting offer:" + err.message); }
  };

  const handleBulkProcessing = async () => {
    if (!apiKey) return alert("Please enter your Key.");
    setIsUploading(true);
    try {
      await uploadBulkData({ headers: getAuthHeaders() });
      alert("Bulk processing completed!");
    } catch (err) { console.error(err); alert("Error in bulk processing"); }
    finally { setIsUploading(false); }
  };

  // --- Message Handlers ---
  const handleResolveMessage = async (id) => {
    if (!apiKey) return alert("Please enter your Key.");
    if (!window.confirm("Mark this message as RESOLVED?")) return;

    setIsUploading(true);
    try {
      await updateEnquiryStatus(id, "RESOLVED", apiKey);
      // Refresh list
      fetchMessages(msgPage);
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setIsUploading(false);
    }
  };

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ===== Render Helpers =====
  const renderSidebarItem = (id, icon, label) => (
    <button
      onClick={() => handleTabChange(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === id
        ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
        : "text-gray-600 hover:bg-gray-50"
        }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800 overflow-hidden">

      {/* ===== Mobile Sidebar Overlay ===== */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ===== Sidebar ===== */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-50 bg-white border-r border-gray-200 
          transition-all duration-300 flex flex-col
          ${isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}
          md:translate-x-0 ${isSidebarOpen ? "md:w-64" : "md:w-20"}
        `}
      >
        <div className="h-16 flex items-center justify-between px-4 md:justify-center border-b border-gray-200">
          {isSidebarOpen || isMobileMenuOpen ? (
            <span className="text-xl font-bold text-blue-600 tracking-tight">Browse<span className="text-slate-800">Qatar</span></span>
          ) : (
            <span className="text-xl font-bold text-blue-600">M</span>
          )}
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
          {renderSidebarItem("dashboard", <LayoutDashboard size={20} />, "Dashboard")}
          {renderSidebarItem("restaurants", <Store size={20} />, "Restaurants")}
          {renderSidebarItem("offers", <Tag size={20} />, "Restaurant offers")}
          {renderSidebarItem("providers", <Building2 size={20} />, "Ads Providers")}
          {renderSidebarItem("listings", <List size={20} />, "Ads Listings")}
          {/* New Messages Item */}
          {renderSidebarItem("messages", <MessageSquare size={20} />, "Messages")}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <button onClick={() => navigate("/admin-guide")} className="flex items-center gap-3 text-gray-500 hover:text-blue-600 transition-colors w-full p-2 rounded-md hover:bg-blue-50">
            <HelpCircle size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">User Guide</span>}
          </button>
          <button onClick={() => navigate("/")} className="flex items-center gap-3 text-gray-500 hover:text-red-600 transition-colors w-full p-2 rounded-md hover:bg-red-50">
            <LogOut size={20} />
            {(isSidebarOpen || isMobileMenuOpen) && <span className="text-sm font-medium">Exit Admin</span>}
          </button>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <div className="flex-1 flex flex-col w-full">

        {/* ===== Top Header ===== */}
        <header className="bg-white border-b border-gray-200 z-10 sticky top-0">
          <div className="h-16 flex items-center justify-between px-4 md:px-6 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <Menu size={24} />
              </button>

              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="hidden md:block p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <Menu size={20} />
              </button>

              <img src="/bqLogo.jpg" alt="Browse Qatar" className="h-5 w-auto hidden sm:block" />
              <h2 className="text-lg font-semibold text-gray-700 capitalize truncate">{activeTab}</h2>
            </div>


            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-red-400">Key</span>
              <button
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className={`md:hidden p-2 rounded-full transition-colors ${apiKey ? "text-green-600 bg-green-50" : "text-gray-500 bg-gray-100"}`}
              >
                <Key size={20} />
              </button>

              <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-1.5 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <span className="text-xs font-bold text-red-400 mr-2">Key</span>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Your Key..."
                  className="bg-transparent border-none outline-none text-sm w-24 lg:w-32 text-gray-700 placeholder-gray-400"
                />
              </div>

              <div className="h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                {displayUser.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {showApiKeyInput && (
            <div className="md:hidden px-4 pb-4 animate-in slide-in-from-top-2">
              <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 border border-gray-200">
                <span className="text-xs font-bold text-red-400 mr-2 whitespace-nowrap">Your Key</span>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your key"
                  className="bg-transparent border-none outline-none text-sm w-full text-gray-700"
                />
              </div>
            </div>
          )}
        </header>

        {/* ===== Scrollable Content Area ===== */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">

          {/* --- DASHBOARD TAB --- */}
          {activeTab === "dashboard" && (
            <div className="space-y-4 md:space-y-6">

              {/* Stat Cards — row 1: Restaurants, Offers, Inactive */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
                {[
                  { icon: <Store size={22} />, color: "text-blue-600", bg: "bg-blue-100", label: "Restaurants", val: getFilteredRestaurants(restaurants).length },
                  { icon: <Tag size={22} />, color: "text-green-600", bg: "bg-green-100", label: "Offers", val: offers.length },
                  { icon: <EyeOff size={22} />, color: "text-orange-600", bg: "bg-orange-100", label: "Inactive Offers", val: getFilteredOffers(inactiveOffers).length || "-" },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className={`p-3 ${stat.bg} ${stat.color} rounded-lg flex-shrink-0`}>{stat.icon}</div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800">{stat.val}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stat Cards — row 2: Providers, Listings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                {[
                  { icon: <Building2 size={22} />, color: "text-indigo-600", bg: "bg-indigo-100", label: "Ad Providers", val: providers.length },
                  { icon: <List size={22} />, color: "text-teal-600", bg: "bg-teal-100", label: "Total Ad Listings", val: listings.length },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className={`p-3 ${stat.bg} ${stat.color} rounded-lg flex-shrink-0`}>{stat.icon}</div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800">{stat.val}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions — 2x2 grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 md:gap-5">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-lg">
                  <h3 className="text-base md:text-lg font-bold mb-1">Manage Restaurants</h3>
                  <p className="text-blue-100 mb-3 text-xs">Add, edit, or update restaurant details.</p>
                  <button onClick={() => setActiveTab('restaurants')} className="w-full md:w-auto bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition">Go to Restaurants</button>
                </div>
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-5 text-white shadow-lg">
                  <h3 className="text-base md:text-lg font-bold mb-1">Manage Restaurant Offers</h3>
                  <p className="text-slate-300 mb-3 text-xs">Create seasonal offers and manage pricing strategies.</p>
                  <button onClick={() => setActiveTab('offers')} className="w-full md:w-auto bg-white text-slate-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition">Go to Restaurant Offers</button>
                </div>
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-5 text-white shadow-lg">
                  <h3 className="text-base md:text-lg font-bold mb-1">Manage Ad Providers</h3>
                  <p className="text-indigo-100 mb-3 text-xs">Register and manage providers across verticals.</p>
                  <button onClick={() => setActiveTab('providers')} className="w-full md:w-auto bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition">Go to Ad Providers</button>
                </div>
                <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl p-5 text-white shadow-lg">
                  <h3 className="text-base md:text-lg font-bold mb-1">Manage Ad Listings</h3>
                  <p className="text-teal-100 mb-3 text-xs">Post listings for vehicles, accommodation, services.</p>
                  <button onClick={() => setActiveTab('listings')} className="w-full md:w-auto bg-white text-teal-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-50 transition">Go to Ad Listings</button>
                </div>
              </div>

            </div>
          )}

          {/* --- RESTAURANTS TAB --- */}
          {activeTab === "restaurants" && (
            <div className="space-y-4 md:space-y-6">
              {/* ... (Existing Restaurant Tab Content) ... */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">All Restaurants</h3>
                <button
                  onClick={() => setShowAddRestaurantForm(!showAddRestaurantForm)}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition shadow-sm"
                >
                  {showAddRestaurantForm ? <X size={18} /> : <Plus size={18} />}
                  {showAddRestaurantForm ? "Cancel" : "Add New Restaurant"}
                </button>
              </div>

              {showAddRestaurantForm && (
                <div className="bg-white p-4 md:p-6 rounded-xl shadow border border-blue-100 animate-in slide-in-from-top-2">
                  <h4 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">New Restaurant</h4>
                  <form onSubmit={handleRestaurantSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ... (Existing Form Fields) ... */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase text-gray-500">Name *</label>
                      <input name="name" value={form.name} onChange={handleFormChange} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase text-gray-500">Address *</label>
                      <input name="address" value={form.address} onChange={handleFormChange} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase text-gray-500">Cuisine(comma separated)</label>
                      <input name="cuisine" value={form.cuisine} onChange={handleFormChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase text-gray-500">Rating</label>
                        <input name="rating" type="number" step="1" value={form.rating} onChange={handleFormChange} className="w-full border border-gray-300 rounded-lg p-3 text-sm" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase text-gray-500">Country</label>
                        <select name="country" value={form.country} onChange={handleFormChange} className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white">
                          {Object.values(countryMap).map((c) => <option key={c as string} value={c as string}>{c as string}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Paperclip size={14} /> Logo *</label>
                      <input name="logo" type="file" accept="image/*" onChange={handleFormChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700" required />
                    </div>
                    <div className="col-span-1 md:col-span-2 pt-2">
                      <button type="submit" className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2">
                        <Save size={18} /> Save Restaurant
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {getFilteredRestaurants(restaurants).map((r) => (
                  <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-row md:flex-col">
                    <div className="w-24 md:w-full md:h-24 bg-gray-100 flex-shrink-0 relative flex items-center justify-center">
                      <img src={r.logoUrl || "https://via.placeholder.com/150"} alt={r.name} className="md:absolute md:-bottom-10 md:left-5 h-16 w-16 md:h-20 md:w-20 rounded-lg md:border-4 md:border-white md:shadow object-cover m-2 md:m-0" />
                    </div>
                    <div className="p-3 md:px-5 md:pb-5 md:pt-12 flex-1 flex flex-col justify-center md:block">
                      <h4 className="font-bold text-gray-800 leading-tight">{r.name}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 line-clamp-1"><Store size={12} /> {r.address}</p>
                      <button onClick={() => { setSelectedRestaurant(r.id); setActiveTab("offers"); }} className="mt-2 md:mt-4 w-full flex items-center justify-center gap-2 bg-gray-50 text-blue-600 py-1.5 md:py-2 rounded-lg border border-gray-200 text-xs md:text-sm font-medium">
                        Manage Offers <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- OFFERS TAB --- */}
          {activeTab === "offers" && (
            <div className="space-y-4 md:space-y-6">
              {/* ... (Existing Offers Tab Content) ... */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 md:items-end">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 font-semibold block mb-1">SELECT RESTAURANT</label>
                  <select
                    value={selectedRestaurant}
                    onChange={handleSelectRestaurant}
                    className="bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
                  >
                    <option value="">-- Choose a Restaurant --</option>
                    {getFilteredRestaurants(restaurants).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                {selectedRestaurant && (
                  <button onClick={toggleAddOfferForm} className="w-full md:w-auto flex-shrink-0 self-end bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition shadow-sm whitespace-nowrap">
                    {showAddOfferForm ? <X size={18} /> : <Plus size={18} />}
                    {showAddOfferForm ? "Cancel" : "Add New Offer"}
                  </button>
                )}
              </div>

              {showAddOfferForm && selectedRestaurant && (
                <div className="bg-white p-4 md:p-6 rounded-xl shadow border border-green-100">
                  <h4 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Create New Offer</h4>
                  <form onSubmit={handleOfferUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* ... (Existing Offer Form Fields) ... */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Offer Title</label>
                      <input name="title" value={offerForm.title} onChange={handleOfferFormChange} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 outline-none" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Category/Cuisine</label>
                      <select name="category" value={offerForm.category} onChange={handleOfferFormChange} className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white">
                        <option value="">Select</option>
                        {cuisineOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    {/* Price Row */}
                    <div className="grid grid-cols-2 gap-3 md:contents">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Original (QAR)</label>
                        <input name="originalPrice" type="number" value={offerForm.originalPrice} onChange={handleOfferFormChange} className="w-full border border-gray-300 rounded-lg p-3 text-sm" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Discounted (QAR)</label>
                        <input name="discountedPrice" type="number" value={offerForm.discountedPrice} onChange={handleOfferFormChange} className="w-full border border-gray-300 rounded-lg p-3 text-sm" required />
                      </div>
                    </div>

                    {/* Date Row */}
                    <div className="grid grid-cols-2 gap-3 md:contents">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Valid From</label>
                        <input name="validFrom" type="date" value={offerForm.validFrom} onChange={handleOfferFormChange} className="w-full border border-gray-300 rounded-lg p-3 text-sm" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Valid To</label>
                        <input name="validTo" type="date" value={offerForm.validTo} onChange={handleOfferFormChange} className="w-full border border-gray-300 rounded-lg p-3 text-sm" required />
                      </div>
                    </div>
                    <div className="space-y-1 md:col-span-1">
                      <label className="text-xs font-semibold text-gray-500">Offer Type</label>
                      <select name="offerType" value={offerForm.offerType} onChange={handleOfferFormChange} className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white">
                        {["All", "Buffet", "Combo", "Happy Hour", "Special", "Catering", "Discount"].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Paperclip size={14} /> Image *</label>
                      <input name="offerImg" type="file" accept="image/*" onChange={handleOfferFormChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700" required />
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Description</label>
                      <textarea name="description" rows={3} value={offerForm.description} onChange={handleOfferFormChange} className="w-full border border-gray-300 rounded-lg p-3 text-sm" />
                    </div>
                    <div className="md:col-span-3 pt-2">
                      <button type="submit" className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium shadow-md">Upload Offer</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Sub-tabs for Offers */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setOfferTab("active")}
                  className={`px-6 py-2 text-sm font-medium transition-colors ${offerTab === "active" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Active Offers
                </button>
                <button
                  onClick={() => setOfferTab("inactive")}
                  className={`px-6 py-2 text-sm font-medium transition-colors ${offerTab === "inactive" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Inactive / Under Review
                </button>
              </div>

              {!selectedRestaurant ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                  <Store size={40} className="mb-3 opacity-30" />
                  <p className="text-sm">Select a restaurant to manage offers.</p>
                </div>
              ) : (offerTab === "active" ? (
                offers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                    <Tag size={40} className="mb-3 opacity-30" />
                    <p className="text-sm">No active offers found. Create one!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {getFilteredOffers(offers).map((o) => (
                      <div key={o.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex flex-col">
                        <div className="relative h-48 sm:h-40">
                          <img src={o.imageUrl} alt={o.title} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button
                              onClick={() => {
                                setEditingOffer(o);
                                setOfferForm({
                                  ...o,
                                  category: o.cuisine || o.category || "",
                                  image: null
                                });
                                setUpdateImage(false);
                                setOfferPreview(null);
                                setShowEditOfferForm(true);
                              }}
                              className="bg-white/90 text-blue-600 p-1.5 rounded-full hover:bg-blue-600 hover:text-white transition shadow"
                              title="Edit Offer"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDeleteOffer(o.id)} className="bg-white/90 text-red-600 p-1.5 rounded-full hover:bg-red-600 hover:text-white transition shadow">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded uppercase tracking-wide">
                            {o.offerType}
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <h5 className="font-bold text-gray-800 line-clamp-1">{o.title}</h5>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{o.description}</p>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-bold text-green-600">{o.discountedPrice} QAR</span>
                              {o.originalPrice && <span className="text-[10px] text-gray-400 line-through decoration-red-400">{o.originalPrice} QAR</span>}
                            </div>
                            <span className="text-[9px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-100 uppercase">
                              Exp: {formatDate(o.validTo)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                inactiveOffers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                    <AlertCircle size={48} className="mb-4 opacity-30" />
                    <p className="text-sm font-medium">No inactive offers found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {getFilteredOffers(inactiveOffers).filter(o => String(o.restaurantId) === String(selectedRestaurant)).map((o, idx) => (
                      <div key={o.id || idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex flex-col opacity-90">
                        {/* Placeholder Image Area */}
                        <div className="relative h-40 bg-gray-100 flex flex-col items-center justify-center text-center p-4">
                          <img src={o.imageUrl} alt={o.title} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button
                              onClick={() => {
                                setEditingOffer(o);
                                setOfferForm({
                                  ...o,
                                  category: o.cuisine || o.category || "",
                                  image: null
                                });
                                setUpdateImage(false);
                                setShowEditOfferForm(true);
                              }}
                              className="bg-white/90 text-blue-600 p-1.5 rounded-full hover:bg-blue-600 hover:text-white transition shadow"
                              title="Edit Offer"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDeleteOffer(o.id)} className="bg-white/90 text-red-600 p-1.5 rounded-full hover:bg-red-600 hover:text-white transition shadow">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          {user?.role !== "admin" && (
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 pointer-events-none">
                              <div className="bg-orange-100 text-orange-600 p-2 rounded-full mb-1">
                                <AlertCircle size={20} />
                              </div>
                              <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-orange-600/80 px-2 py-0.5 rounded">Under Review</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-bold text-gray-800 line-clamp-1 flex-1 pr-2">{o.title}</h5>
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200">{o.cuisine || o.category || "General"}</span>
                          </div>

                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-base font-bold text-gray-700">{o.discountedPrice} QAR</span>
                            {o.originalPrice && <span className="text-[10px] text-gray-400 line-through">{o.originalPrice} QAR</span>}
                          </div>

                          <div className="mt-3 space-y-1.5 text-[10px] text-gray-500 border-t border-gray-100 pt-3">
                            <div className="flex justify-between">
                              <span>From:</span>
                              <span className="font-medium text-gray-700">{formatDate(o.validFrom)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>To:</span>
                              <span className="font-medium text-gray-700">{formatDate(o.validTo)}</span>
                            </div>
                          </div>

                          {user?.role === "admin" && (
                            <div className="mt-4 pt-3 border-t border-gray-100">
                              <button
                                onClick={() => navigate('/make-offer', { state: { offer: o } })}
                                className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                              >
                                Review & Activate <ExternalLink size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ))}
            </div>
          )}

          {/* --- LISTINGS TAB (NEW) --- */}
          {activeTab === "listings" && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 md:items-end justify-between">
                <div className="flex items-end gap-2 w-full md:w-auto">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><List size={20} /></div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 font-semibold block mb-1">SELECT AD PROVIDER</label>
                    <select
                      value={selectedRestaurant}
                      onChange={handleSelectRestaurant}
                      className="bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                    >
                      <option value="">-- Choose a Provider --</option>
                      {getFilteredProviders(providers).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                {selectedRestaurant && (
                  <button
                    onClick={toggleAddListingForm}
                    className="w-full md:w-auto flex-shrink-0 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition shadow-sm whitespace-nowrap"
                  >
                    {showAddListingForm ? <X size={18} /> : <Plus size={18} />}
                    {showAddListingForm ? "Cancel" : "Add New Listing"}
                  </button>
                )}
              </div>

              {/* Add Listing Form */}
              {showAddListingForm && selectedRestaurant && (
                <div className="bg-white p-6 rounded-xl shadow border border-green-100">
                  <h4 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Create New Listing</h4>
                  <ListingForm 
                    listingForm={listingForm}
                    setListingForm={setListingForm}
                    handleListingFormChange={handleListingFormChange}
                    handleListingUpload={handleListingUpload}
                    listingPreview={listingPreview}
                    listingGalleryPreviews={listingGalleryPreviews}
                    removeGalleryImage={removeGalleryImage}
                  />
                </div>
              )}

              {!selectedRestaurant ? (
                <div className="text-center py-20 text-gray-400">
                  <List size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Please select a provider to manage listings.</p>
                </div>
              ) : (
                <>
                  {/* Sub-tabs */}
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setListingTab("active")}
                      className={`px-6 py-2 text-sm font-medium transition-colors ${listingTab === "active" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      Active Listings
                    </button>
                    <button
                      onClick={() => setListingTab("inactive")}
                      className={`px-6 py-2 text-sm font-medium transition-colors ${listingTab === "inactive" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      Inactive / Under Review
                    </button>
                  </div>

                  {/* Listing Cards */}
                  {(() => {
                    const displayListings = (listingTab === "active"
                      ? getFilteredListings(listings).filter((l: any) => l.active)
                      : getFilteredListings(inactiveListings)
                    ).filter((l: any) => selectedRestaurant ? String(l.providerId) === String(selectedRestaurant) : true);
                    return displayListings.length === 0 ? (
                      <div className="text-center py-16 text-gray-400">
                        <List size={40} className="mx-auto mb-3 opacity-20" />
                        <p>{listingTab === "active" ? "No active listings." : "No inactive listings."}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {displayListings.map((l: any) => (
                          <div key={l.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition group">
                            <div className="relative h-40">
                              <img
                                src={l.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"}
                                alt={l.title}
                                className="w-full h-full object-cover"
                              />
                              {/* Active / Inactive Badge */}
                              <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                l.active ? "bg-green-500 text-white" : "bg-yellow-400 text-gray-800"
                              }`}>
                                {l.active ? "Active" : "Under Review"}
                              </span>
                              {/* Edit / Delete Buttons */}
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button
                                  onClick={() => {
                                    setEditingListing(l);
                                    setListingForm({
                                      verticalId: l.verticalId || "",
                                      title: l.title || "",
                                      description: l.description || "",
                                      category: l.category || "",
                                      subcategory: l.subcategory || "",
                                      originalPrice: l.pricing?.originalPrice || "",
                                      discountedPrice: l.pricing?.discountedPrice || "",
                                      unit: l.pricing?.unit || "",
                                      currency: l.pricing?.currency || "QAR",
                                      validFrom: l.validity?.from ? new Date(l.validity.from).toISOString().split("T")[0] : "",
                                      validTo: l.validity?.to ? new Date(l.validity.to).toISOString().split("T")[0] : "",
                                      city: l.location?.city || "",
                                      country: l.location?.country || "Qatar",
                                      address: l.location?.address || "",
                                      attributes: l.attributes || {},
                                      active: !!l.active,
                                      image: null,
                                      gallery: []
                                    } as any);
                                    setListingUpdateImage(false);
                                    setListingPreview(l.imageUrl || null);
                                    setListingGalleryPreviews(l.galleryUrls || []);
                                    setShowEditListingForm(true);
                                  }}
                                  className="bg-white/90 text-blue-600 p-1.5 rounded-full hover:bg-blue-600 hover:text-white transition shadow"
                                  title="Edit Listing"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteListing(l.id, l.title)}
                                  className="bg-white/90 text-red-600 p-1.5 rounded-full hover:bg-red-600 hover:text-white transition shadow"
                                  title="Delete Listing"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <div className="p-3">
                              <h5 className="font-semibold text-gray-800 text-sm truncate" title={l.title}>#{l.id} {l.title}</h5>
                              <p className="text-xs text-gray-500 mt-1 truncate">{l.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{l.verticalId}</span>
                                {l.pricing?.discountedPrice && (
                                  <span className="text-xs font-bold text-green-600">{l.pricing.currency || "QAR"} {l.pricing.discountedPrice}</span>
                                )}
                              </div>
                              {l.location?.city && (
                                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                  {l.location.city}
                                </p>
                              )}

                              {user?.role === "admin" && listingTab !== "active" && (
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                  <button
                                    onClick={() => navigate('/make-offer', { state: { listing: l } })}
                                    className="w-full flex items-center justify-center gap-2 bg-purple-50 text-purple-600 py-2 rounded-lg text-xs font-bold hover:bg-purple-100 transition"
                                  >
                                    Review & Activate <ExternalLink size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </>
              )}

              {/* Edit Listing Modal */}
              {showEditListingForm && editingListing && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/50 overflow-y-auto">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mb-8">
                    <div className="flex items-center justify-between p-5 border-b">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Edit2 size={18} className="text-blue-600" />
                        Edit Listing — #{(editingListing as any).id}
                      </h3>
                      <button
                        onClick={() => { setShowEditListingForm(false); setEditingListing(null); }}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="p-5">
                      <ListingForm
                        listingForm={listingForm}
                        setListingForm={setListingForm}
                        handleListingFormChange={handleListingFormChange}
                        handleListingUpload={handleListingUpdate}
                        listingPreview={listingPreview}
                        listingGalleryPreviews={listingGalleryPreviews}
                        removeGalleryImage={removeGalleryImage}
                        isAdmin={user?.role === "admin"}
                        isEdit={true}
                        updateImage={listingUpdateImage}
                        setUpdateImage={setListingUpdateImage}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* --- PROVIDERS TAB --- */}
          {activeTab === "providers" && (
            <div className="space-y-4 md:space-y-6">
              {/* Header row */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Building2 size={24} className="text-blue-500" />
                  Providers
                </h3>
                <button
                  onClick={() => { resetProviderForm(); setShowAddProviderForm(!showAddProviderForm); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition shadow-sm"
                >
                  {showAddProviderForm ? <X size={18} /> : <Plus size={18} />}
                  {showAddProviderForm ? "Cancel" : "Add Provider"}
                </button>
              </div>

              {/* Add / Edit Form */}
              {showAddProviderForm && (
                <div className="bg-white p-4 md:p-6 rounded-xl shadow border border-blue-100 animate-in slide-in-from-top-2">
                  <h4 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
                    {editingProvider ? `Edit Provider — ${editingProvider.name}` : "Register New Provider"}
                  </h4>
                  <ProviderForm
                    providerForm={providerForm}
                    setProviderForm={setProviderForm}
                    handleProviderFormChange={handleProviderFormChange}
                    handleProviderSubmit={handleProviderSubmit}
                    logoPreview={providerLogoPreview}
                    bannerPreview={providerBannerPreview}
                    isEditing={!!editingProvider}
                    isUploading={isUploading}
                  />
                </div>
              )}

              {/* Provider Cards */}
              {providers.length === 0 ? (
                <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                  <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm">No providers yet. Add your first provider above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {providers
                    .filter((p: any) => user?.role === "admin" || p.ownerLogin === user?.email)
                    .map((p: any) => (
                    <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                      {/* Banner */}
                      <div className="h-24 bg-gradient-to-r from-blue-50 to-indigo-100 relative">
                        {p.bannerUrl && (
                          <img src={p.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                        )}
                        {/* Logo */}
                        <div className="absolute -bottom-6 left-4">
                          {p.logoUrl ? (
                            <img src={p.logoUrl} alt={p.name} className="h-12 w-12 rounded-full border-2 border-white shadow object-cover" />
                          ) : (
                            <div className="h-12 w-12 rounded-full border-2 border-white shadow bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                              {p.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        {/* Action buttons */}
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button onClick={() => handleEditProvider(p)} className="bg-white/90 text-blue-600 p-1.5 rounded-full hover:bg-blue-600 hover:text-white transition shadow" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          {user?.role === "admin" && (
                            <button onClick={() => handleDeleteProvider(p.id)} className="bg-white/90 text-red-500 p-1.5 rounded-full hover:bg-red-500 hover:text-white transition shadow" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="pt-8 pb-4 px-4 flex-1 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-gray-800 truncate">{p.name}</h5>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold capitalize">{p.verticalId}</span>
                        </div>
                        <p className="text-xs text-gray-500 capitalize">{p.type}</p>
                        {p.phone && <p className="text-xs text-gray-500">{p.phone}</p>}
                        {p.email && <p className="text-xs text-gray-400 truncate">{p.email}</p>}
                        {p.address && <p className="text-xs text-gray-400 truncate mt-1">{p.address}</p>}
                        <div className="mt-2">
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            p.active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                          }`}>
                            {p.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}



          {/* --- MESSAGES TAB (NEW) --- */}
          {activeTab === "messages" && (
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <MessageSquare size={24} className="text-blue-500" />
                  Enquiries & Messages
                </h3>
              </div>

              {loadingMessages ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                  <MessageSquare size={48} className="mb-4 opacity-30" />
                  <p className="text-sm font-medium">No messages found.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                          <th className="px-6 py-4 font-semibold">Date</th>
                          <th className="px-6 py-4 font-semibold">Name</th>
                          <th className="px-6 py-4 font-semibold">Contact</th>
                          <th className="px-6 py-4 font-semibold w-1/3">Message</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          {user?.role === "admin" && <th className="px-6 py-4 font-semibold text-right">Action</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {messages.map((msg) => (
                          <tr key={msg._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {formatDate(msg.createdAt)}
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {msg.name}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span>{msg.email}/</span>
                                <span className="text-xs text-gray-500">{msg.phone}</span>
                              </div>
                            </td>
                            {/* ✅ UPDATED MESSAGE COLUMN WITH TOOLTIP */}
                            <td className="px-6 py-4 relative">
                              {msg.message.length > 10 ? (
                                <div className="group relative inline-block cursor-help">
                                  {/* The Visible Truncated Text */}
                                  <p className="line-clamp-2 text-gray-600">
                                    {msg.message}
                                  </p>

                                  {/* The Custom Tooltip Popup */}
                                  <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none">
                                    {/* Tooltip Text */}
                                    <p className="leading-relaxed">
                                      {msg.message}
                                    </p>

                                    {/* Tooltip Arrow (Optional Visual Flair) */}
                                    <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-600">{msg.message}</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                                ${msg.status === 'RESOLVED' ? 'bg-green-50 text-green-700 border border-green-200' :
                                  msg.status === 'IN_PROGRESS' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                                    msg.status === 'SEND_FAILED' ? 'bg-red-50 text-red-700 border border-red-200' :
                                      'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                                {msg.status === 'RESOLVED' && <CheckCircle size={12} />}
                                {msg.status === 'NEW' && <Clock size={12} />}
                                {msg.status === 'SEND_FAILED' && <XCircle size={12} />}
                                {msg.status}
                              </span>
                            </td>
                            {user?.role === "admin" && <td className="px-6 py-4 text-right">
                              {msg.status !== "RESOLVED" && (
                                <button
                                  onClick={() => handleResolveMessage(msg._id)}
                                  className="text-xs bg-white border border-gray-300 hover:bg-green-50 hover:text-green-700 hover:border-green-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors shadow-sm font-medium"
                                >
                                  Mark Resolved
                                </button>
                              )}
                            </td>
                            }
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <button
                      onClick={() => setMsgPage(p => Math.max(1, p - 1))}
                      disabled={msgPage === 1}
                      className="flex items-center gap-1 text-sm text-gray-600 disabled:opacity-50 hover:text-blue-600 disabled:hover:text-gray-600 transition"
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <span className="text-xs font-medium text-gray-500">
                      Page {msgPage} of {msgTotalPages}
                    </span>
                    <button
                      onClick={() => setMsgPage(p => Math.min(msgTotalPages, p + 1))}
                      disabled={msgPage === msgTotalPages}
                      className="flex items-center gap-1 text-sm text-gray-600 disabled:opacity-50 hover:text-blue-600 disabled:hover:text-gray-600 transition"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- BULK TAB --- */}
          {activeTab === "bulk" && (
            <div className="mt-6 md:mt-10">
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 text-center mx-auto max-w-lg">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600">
                  <UploadCloud size={32} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Bulk Import</h3>
                <p className="text-sm text-gray-500 mb-6">Process large datasets. Ensure your Key is set.</p>
                <button onClick={handleBulkProcessing} className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-200">
                  Start Processing
                </button>
              </div>
            </div>
          )}

        </main>
        {/* ===== Footer ===== */}
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-900">
            <p>© {new Date().getFullYear()} BrowseQatar Offers Platform. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <img src={'/meraki.webp'} alt="Meraki AI" className="w-3 h-3 object-contain" />
              <span>Powered by</span>
              <span className="font-medium text-slate-700">MerakiAi</span>
            </div>
          </div>
        </footer>
      </div>

      {/* ===== Loading Overlay ===== */}
      {isUploading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-gray-700">Processing...</p>
          </div>
        </div>
      )}

      {/* ===== EDIT OFFER MODAL ===== */}
      {showEditOfferForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Edit2 size={20} className="text-blue-600" />
                Edit Offer: {editingOffer?.title}
              </h3>
              <button
                onClick={() => { setShowEditOfferForm(false); setEditingOffer(null); setOfferPreview(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleOfferUpdate} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500">Offer Title</label>
                  <input
                    name="title"
                    value={offerForm.title}
                    onChange={handleOfferFormChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500">Category / Cuisine</label>
                  <select
                    name="category"
                    value={offerForm.category}
                    onChange={handleOfferFormChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Category</option>
                    {cuisineOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500">Offer Type</label>
                  <select
                    name="offerType"
                    value={offerForm.offerType}
                    onChange={handleOfferFormChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Discount">Discount</option>
                    <option value="Buffet">Buffet</option>
                    <option value="Combo">Combo</option>
                    <option value="Happy Hour">Happy Hour</option>
                    <option value="Special">Special</option>
                    <option value="Catering">Catering</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500">Original Price</label>
                  <input
                    name="originalPrice"
                    type="number"
                    value={offerForm.originalPrice}
                    onChange={handleOfferFormChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500">Discounted Price</label>
                  <input
                    name="discountedPrice"
                    type="number"
                    value={offerForm.discountedPrice}
                    onChange={handleOfferFormChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500">Valid From</label>
                  <input
                    name="validFrom"
                    type="date"
                    value={offerForm.validFrom ? offerForm.validFrom.split('T')[0] : ""}
                    onChange={handleOfferFormChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500">Valid To</label>
                  <input
                    name="validTo"
                    type="date"
                    value={offerForm.validTo ? offerForm.validTo.split('T')[0] : ""}
                    onChange={handleOfferFormChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    value={offerForm.description}
                    onChange={handleOfferFormChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="updateImage"
                        checked={updateImage}
                        onChange={(e) => setUpdateImage(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="updateImage" className="text-sm font-bold text-gray-700">Enable new image upload</label>
                    </div>

                    {user?.role === "admin" && (
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="offerActive"
                          checked={offerForm.active}
                          onChange={(e) => setOfferForm(prev => ({ ...prev, active: e.target.checked }))}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <label htmlFor="offerActive" className="text-sm font-bold text-gray-700">Set as Active</label>
                      </div>
                    )}
                  </div>

                  {(offerPreview || editingOffer?.imageUrl) && (
                    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-100 transition-all">
                      <img src={offerPreview || editingOffer.imageUrl} alt="Preview" className="h-16 w-24 object-cover rounded-md border shadow-sm" />
                      <div>
                        <p className="text-sm font-bold text-gray-800">{offerPreview ? "New Image Preview" : "Current Image"}</p>
                        <p className="text-[10px] text-gray-500">{offerPreview ? "This will replace the existing image" : "The current image will be kept unless you upload a new one"}</p>
                      </div>
                    </div>
                  )}

                  {updateImage && (
                    <div className="animate-in fade-in slide-in-from-top-2 border-t border-gray-100 pt-3">
                      <label className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-1 mb-2">
                        <Paperclip size={14} /> Upload New Image
                      </label>
                      <input
                        name="offerImg"
                        type="file"
                        accept="image/*"
                        onChange={handleOfferFormChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => { setShowEditOfferForm(false); setEditingOffer(null); }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                  Update Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Loading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <div className="text-center">
              <h3 className="font-bold text-gray-800">Processing Request</h3>
              <p className="text-sm text-gray-500">Please wait while we update your data...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}