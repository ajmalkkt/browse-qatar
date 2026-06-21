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
  EyeOff, // Added icon for Inactive Offers
  AlertCircle, // Added icon for status
  ExternalLink,
  MessageSquare, // Added for Messages
  CheckCircle,   // Added for Actions
  XCircle,       // Added for Status
  Clock,         // Added for Status
  ChevronLeft,    // Added for Pagination
  HelpCircle,     // Added for User Guide
  Edit2,          // Added for Edit action
  List,           // Added for Listings
  Building2,
  CheckSquare,
  Filter,
  Mail,
  MailOpen,
  Calendar,
  PlusCircle,
  CreditCard,
  PlayCircle,
  Eye,
  RefreshCw,
  Smartphone,
  Monitor,
  Share2,
  Download
} from "lucide-react";

// Mock Services (Keep your existing imports here)
import {
  getAllOwnerRestaurants,
  uploadRestaurant,
  uploadBulkData,
  deleteRestaurant, // New import
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

import { getEnquiries, updateEnquiryStatus, sendAccountCreationEmail } from "../services/enquiryService";

// Auth Hook
import useAuth from "../auth/useAuth";
import { getAuthToken } from '../auth/firebaseClient';

// App Config
import { cuisineOptions, countryMap,REQUIRE_API_KEY_FOR_ADS } from "../config/appConfig";
import ListingForm from "./common/ListingForm";
import ProviderForm from "./common/ProviderForm";

// --- Local Types ---
interface Offer { id: number; title: string; restaurantId?: number; cuisine?: string; validTo?: string; active?: boolean; ownerLogin?: string; originalPrice?: string | number; discountedPrice?: string | number; imageUrl?: string; category?: string; }
interface Provider { id: number; name: string; verticalId?: string; type?: string; email?: string; ownerLogin?: string; logoUrl?: string; }
interface Listing { id: number; title: string; verticalId?: string; description?: string; active?: boolean; ownerLogin?: string; providerId?: number; pricing?: { originalPrice?: number; discountedPrice?: number; currency?: string; unit?: string }; validity?: { from?: string; to?: string }; location?: { city?: string; country?: string; address?: string }; imageUrl?: string; galleryUrls?: string[]; attributes?: any; category?: string; subcategory?: string; }

export default function ManageOffers() {
  const navigate = useNavigate();
  const offerInputRef = useRef(null);
  const { user, initialized } = useAuth();

  // Fallback user display if not logged in
  const displayUser = user ? {
    name: user.displayName || user.email || "User",
    email: user.email || "",
    role: user.role || "user" // Accessed directly
  } : {
    name: "Guest",
    email: "",
    role: "user"
  };

  // ===== Navigation State =====
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, restaurants, offers, bulk
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showAddRestaurantForm, setShowAddRestaurantForm] = useState(false);
  const [showAddOfferForm, setShowAddOfferForm] = useState(false);

  // ===== Data States =====
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [offers, setOffers] = useState([]);
  const [inactiveOffers, setInactiveOffers] = useState<Offer[]>([]);
  const [inactiveListings, setInactiveListings] = useState<Listing[]>([]);
  
  const [logoPreview, setLogoPreview] = useState(null);
  const [brandPreview, setBrandPreview] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [offerPreview, setOfferPreview] = useState(null);
  const [offerTab, setOfferTab] = useState("active"); // active, inactive
  const [showEditOfferForm, setShowEditOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [updateImage, setUpdateImage] = useState(false);

  // -- Listings States --
  const [showAddListingForm, setShowAddListingForm] = useState(false);
  const [listings, setListings] = useState([]);
  const [listingPreview, setListingPreview] = useState(null);
  const [listingGalleryPreviews, setListingGalleryPreviews] = useState([]);
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
    verticalId: "", type: "", name: "", email: "", phone: "",
    address: "", country: "Qatar", logo: null, banner: null,
  });

  // Add this near your other useState definitions
  const [isUploading, setIsUploading] = useState(false);

  // -- Message States --
  const [messages, setMessages] = useState([]);
  const [msgPage, setMsgPage] = useState(1);
  const [msgTotalPages, setMsgTotalPages] = useState(1);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // -- Account Creation Modal States --
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [sendingAccountEmail, setSendingAccountEmail] = useState(false);

  // -- Search State --
  const [tabSearchTerm, setTabSearchTerm] = useState("");
  // --------------------


  // ===== Forms =====
  // Helper to get today's date in YYYY-MM-DD format
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
    validFrom: getTodayDate(), validTo: getTomorrowDate(), city: "", country: "Qatar", address: "",
    attributes: {}, active: false, image: null, gallery: []
  });

  // ===== Helpers =====
  const getAuthHeaders = () => ({ "x-api-token": apiKey || "" });

  // Filter restaurants based on user role and ownership
  const getFilteredRestaurants = (allRestaurants) => {
    let filtered = allRestaurants;
    if (user?.role !== "admin") {
      filtered = allRestaurants.filter((r) => r.ownerLogin === user?.email);
    }
    if (tabSearchTerm) {
      const q = tabSearchTerm.toLowerCase();
      filtered = filtered.filter(r => r.name?.toLowerCase().includes(q) || r.address?.toLowerCase().includes(q));
    }
    return filtered;
  };

  // Filter offers based on user role and ownership
  const getFilteredOffers = (allOffers) => {
    let filtered = allOffers;
    if (user?.role !== "admin") {
      filtered = allOffers.filter((o) => o.ownerLogin === user?.email);
    }
    if (tabSearchTerm) {
      const q = tabSearchTerm.toLowerCase();
      filtered = filtered.filter(o => o.title?.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q) || o.category?.toLowerCase().includes(q));
    }
    return filtered;
  };

  // Filter providers based on user role and ownership
  const getFilteredProviders = (allProviders) => {
    let filtered = allProviders;
    if (user?.role !== "admin") {
      filtered = allProviders.filter((p) => p.ownerLogin === user?.email || p.email === user?.email);
    }
    if (tabSearchTerm) {
      const q = tabSearchTerm.toLowerCase();
      filtered = filtered.filter(p => p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q));
    }
    return filtered;
  };

  // Filter listings based on user role and ownership
  const getFilteredListings = (allListings) => {
    let filtered = allListings;
    if (user?.role !== "admin") {
      filtered = allListings.filter((l) => l.ownerLogin === user?.email);
    }
    if (tabSearchTerm) {
      const q = tabSearchTerm.toLowerCase();
      filtered = filtered.filter(l => l.title?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q));
    }
    return filtered;
  };

  const getFilteredMessages = (allMessages) => {
    if (!tabSearchTerm) return allMessages;
    const q = tabSearchTerm.toLowerCase();
    return allMessages.filter(m => m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.subject?.toLowerCase().includes(q));
  };

  // ===== Effects =====
  useEffect(() => {
    getAllOwnerRestaurants().then(setRestaurants).catch(console.error);
    getAllProviders().then(setProviders).catch(console.error);
    getAllListings().then(setListings).catch(console.error);
  }, []);

  // Fetch inactive offers and listings when tab is switched
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
    // Fetch Messages when tab is switched
    if (activeTab === "messages") {
      fetchMessages(msgPage);
    }
    // Fetch Providers when tab is switched
    if (activeTab === "providers") {
      getAllProviders().then(setProviders).catch(console.error);
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

  // ===== Provider Handlers =====
  const handleProviderFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setProviderForm(prev => ({ ...prev, [name]: file }));
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (name === "logo") setProviderLogoPreview(reader.result as string);
          if (name === "banner") setProviderBannerPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
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

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(providerForm).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== "") {
        formData.append(key, val as any);
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
    } catch (err: any) {
      console.error(err);
      alert("Error saving provider: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditProvider = (p: any) => {
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
      banner: null,
    });
    setProviderLogoPreview(p.logoUrl || null);
    setProviderBannerPreview(p.bannerUrl || null);
    setShowAddProviderForm(true);
  };

  const handleDeleteProvider = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this provider?")) return;
    try {
      await deleteProvider(id);
      setProviders(prev => prev.filter((p: any) => p.id !== id));
    } catch (err: any) {
      alert("Error deleting provider: " + err.message);
    }
  };
  // =============================

  useEffect(() => {
    // When switching to offers tab, if no restaurant selected, select first one
    if (activeTab === 'offers' && !selectedRestaurant && restaurants.length > 0) {
      handleSelectRestaurant({ target: { value: restaurants[0].id } });
    }
  }, [activeTab, restaurants]);

  // ===== Handlers (Preserved Logic) =====
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
    if (!apiKey) return alert("Please enter your Key in the top bar.");
    if (!form.name || !form.address || !form.logo || !form.country) return alert("Missing required fields.");

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => { if (val) formData.append(key, val); });

    setIsUploading(true); // <--- START LOADING

    try {
      await uploadRestaurant(formData, { headers: getAuthHeaders() });
      alert("Restaurant saved!");
      setRestaurants(await getAllOwnerRestaurants());
      setForm({ id: "", name: "", address: "", phone: "", rating: "", cuisine: "", logo: null, brand: null, country: "Qatar" });
      setLogoPreview(null);
      setBrandPreview(null);
      setShowAddRestaurantForm(false);
    } catch (err) { console.error(err); alert("Error saving restaurant"); }
    finally {
      setIsUploading(false); // <--- STOP LOADING
    }
  };

  const handleDeleteRestaurant = async (id: string, name: string) => {
    if (REQUIRE_API_KEY_FOR_ADS === true && !apiKey) return alert("Please enter your Key in the top bar.");
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

    setIsUploading(true);
    try {
      await deleteRestaurant(id, { headers: getAuthHeaders() });
      setRestaurants(await getAllOwnerRestaurants());
      // If the deleted restaurant was selected, clear selection
      if (selectedRestaurant === id) {
        setSelectedRestaurant("");
        setOffers([]);
      }
      alert("Restaurant deleted successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete restaurant: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectRestaurant = async (e) => {
    const id = e.target.value;
    setSelectedRestaurant(id);
    if (id) {
      const activeData = await getOffersByOwnerRestaurantId(id);
      setOffers(activeData);
      // Also fetch inactive offers to ensure they are available for the selected restaurant
      getInactiveOffers().then(setInactiveOffers).catch(console.error);
    } else {
      setOffers([]);
    }
  };

  const handleOfferUpload = async (e) => {
    e.preventDefault();
    if (!apiKey) return alert("Please enter your Key in the top bar.");
    if (!selectedRestaurant) return alert("Select a restaurant first.");

    const formData = new FormData();
    formData.set("restaurantId", selectedRestaurant);
    const rName = restaurants.find(r => String(r.id) === String(selectedRestaurant))?.name || "";
    formData.set("restaurantName", rName);

    // Populate cuisine with category value
    const offerData = { ...offerForm, cuisine: offerForm.category };
    Object.entries(offerData).forEach(([key, val]) => { if (val) formData.set(key, val); });

    setIsUploading(true); // <--- START LOADING

    try {
      await uploadOffer(formData, { headers: getAuthHeaders() });
      alert("Offer uploaded!");
      setOffers(await getOffersByOwnerRestaurantId(selectedRestaurant));
      // Refresh inactive offers as well
      getInactiveOffers().then(setInactiveOffers).catch(console.error);
      setOfferForm({ title: "", description: "", cuisine: "", originalPrice: "", discountedPrice: "", offerType: "Discount", validFrom: getTodayDate(), validTo: getTomorrowDate(), location: "", country: "Qatar", category: "", image: null, active: false }); // Reset to inactive by default as per user change
      if (offerInputRef.current) offerInputRef.current.value = "";
      setShowAddOfferForm(false);
    } catch (err) { console.error(err); alert("Error uploading offer: " + err.message); }
    finally {
      setIsUploading(false); // <--- STOP LOADING
    }
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
    if (REQUIRE_API_KEY_FOR_ADS === true && !apiKey) return alert("Please enter your Key in the top bar.");

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
    formData.set("location", JSON.stringify({ city: listingForm.city, country: listingForm.country, address: listingForm.address }));
    formData.set("validity", JSON.stringify({ from: listingForm.validFrom, to: listingForm.validTo }));
    formData.set("attributes", JSON.stringify(listingForm.attributes));

    if (listingForm.image) formData.append("image", listingForm.image);
    if (listingForm.gallery && listingForm.gallery.length > 0) {
      listingForm.gallery.forEach(file => formData.append("galleryUrls", file));
    }

    setIsUploading(true);
    try {
      await uploadListing(formData, { headers: getAuthHeaders() });
      alert("Listing uploaded successfully!");
      const allListings = await getAllListings();
      setListings(allListings);
      // also refresh inactive
      getInactiveListings().then(setInactiveListings).catch(console.error);
      setListingForm({ verticalId: "", title: "", description: "", category: "", subcategory: "", originalPrice: "", discountedPrice: "", unit: "", currency: "QAR", validFrom: getTodayDate(), validTo: getTomorrowDate(), city: "", country: "Qatar", address: "", attributes: {}, image: null, gallery: [] });
      setListingPreview(null);
      setListingGalleryPreviews([]);
      setShowAddListingForm(false);
    } catch (err) { 
      console.error(err); 
      alert("Error uploading listing: " + err.message); 
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteListing = async (id: number, title: string) => {
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
    if (REQUIRE_API_KEY_FOR_ADS === true && !apiKey) return alert("Please enter your Key in the top bar.");
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

  const handleOfferUpdate = async (e) => {
    e.preventDefault();
    if (!apiKey) return alert("Please enter your Key in the top bar.");
    if (!editingOffer) return;

    const formData = new FormData();
    formData.set("restaurantId", editingOffer.restaurantId);
    //formData.set("restaurantName", editingOffer.restaurantName);

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
    setIsUploading(true); // <--- START LOADING
    try {
      await uploadBulkData({ headers: getAuthHeaders() });
      alert("Bulk processing completed!");
    } catch (err) { console.error(err); alert("Error in bulk processing"); }
    finally {
      setIsUploading(false); // <--- STOP LOADING
    }
  };
  // --- Message Handlers ---
  const handleResolveMessage = async (id) => {
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

  const handleOpenAccountModal = (id) => {
    setSelectedEnquiryId(id);
    setTempPassword("");
    setShowAccountModal(true);
  };

  const handleSendAccountEmail = async () => {
    if (!tempPassword) {
      alert("Please enter a temporary password.");
      return;
    }

    setSendingAccountEmail(true);
    try {
      await sendAccountCreationEmail(selectedEnquiryId, tempPassword);
      alert("Account creation email sent successfully!");
      setShowAccountModal(false);
      setSelectedEnquiryId("");
      setTempPassword("");
    } catch (error) {
      console.error("Error sending account creation email:", error);
      alert("Failed to send email: " + error.message);
    } finally {
      setSendingAccountEmail(false);
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
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === id
        ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
        : "text-gray-600 hover:bg-gray-50"
        }`}
    >
      {icon}
      {isSidebarOpen && <span>{label}</span>}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">

      {/* ===== Sidebar ===== */}
      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${isSidebarOpen ? "w-64" : "w-20"}`}>
        <div className="h-16 flex items-center justify-center border-b border-gray-200 gap-2">
          <img src="/bqLogo.jpg" alt="Logo" className="h-5 w-auto object-contain" />
          {isSidebarOpen && <span className="text-xl font-bold text-blue-600 tracking-tight">Browse<span className="text-slate-800">Qatar</span></span>}
        </div>

        <nav className="flex-1 py-6 space-y-1">
          {renderSidebarItem("dashboard", <LayoutDashboard size={20} />, "Dashboard")}
          {renderSidebarItem("restaurants", <Store size={20} />, "Restaurants")}
          {renderSidebarItem("offers", <Tag size={20} />, "Restaurant offers")}
          {renderSidebarItem("providers", <Building2 size={20} />, "Ads Providers")}
          {renderSidebarItem("listings", <List size={20} />, "Manage Your Ads")}
          {/* New Messages Item */}
          {renderSidebarItem("messages", <MessageSquare size={20} />, "Messages")}
          {user?.role === "admin" && renderSidebarItem("bulk", <UploadCloud size={20} />, "Bulk Import")}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <button onClick={() => navigate("/admin-guide")} className="flex items-center gap-3 text-gray-500 hover:text-blue-600 transition-colors w-full p-2 rounded-md hover:bg-blue-50">
            <HelpCircle size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">User Guide</span>}
          </button>
          <button onClick={() => navigate("/")} className="flex items-center gap-3 text-gray-500 hover:text-red-600 transition-colors w-full p-2 rounded-md hover:bg-red-50">
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">Exit</span>}
          </button>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ===== Top Header ===== */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-700 capitalize truncate hidden md:block">{activeTab === "inactive" ? "Inactive Offers" : activeTab}</h2>
          </div>

          {activeTab !== "dashboard" && activeTab !== "bulk" && (
            <div className="flex-1 max-w-md mx-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`} 
                value={tabSearchTerm} 
                onChange={(e) => setTabSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              {tabSearchTerm && (
                <button onClick={() => setTabSearchTerm("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-6 ml-auto">
            {/* User Profile */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-none">{displayUser.name}</p>
                <button onClick={() => navigate("/")} className="flex items-center gap-2 text-blue-500 hover:text-blue-800">
                  <ArrowLeft size={20} /> <span className="font-semibold">Back to Home</span>
                </button>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                {displayUser.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* ===== Scrollable Content Area ===== */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* --- DASHBOARD TAB --- */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stat Cards — row 1: Restaurants, Offers, Inactive Offers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Store size={24} /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Restaurants</p>
                    <h3 className="text-2xl font-bold text-gray-800">{getFilteredRestaurants(restaurants).length}</h3>
                  </div>
                </div>
                 <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><Building2 size={24} /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Ad Providers</p>
                    <h3 className="text-2xl font-bold text-gray-800">{providers.length}</h3>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="p-3 bg-teal-100 text-teal-600 rounded-lg"><List size={24} /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Ad Listings</p>
                    <h3 className="text-2xl font-bold text-gray-800">{listings.length}</h3>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-lg">
                  <h3 className="text-lg font-bold mb-1">Manage Your Restaurants</h3>
                  <p className="text-blue-100 mb-3 text-xs">Add, edit, or update branding for your partner restaurants.</p>
                  <button onClick={() => setActiveTab('restaurants')} className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition">Go to Restaurants</button>
                </div>
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-5 text-white shadow-lg">
                  <h3 className="text-lg font-bold mb-1">Manage Your Restaurant Offers</h3>
                  <p className="text-slate-300 mb-3 text-xs">Create seasonal offers and manage pricing strategies.</p>
                  <button onClick={() => setActiveTab('offers')} className="bg-white text-slate-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition">Go to  Offers</button>
                </div>
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-5 text-white shadow-lg">
                  <h3 className="text-lg font-bold mb-1">Manage Your Ad Provider/Business</h3>
                  <p className="text-indigo-100 mb-3 text-xs">Register your company or provider for grouping ads.</p>
                  <button onClick={() => setActiveTab('providers')} className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition">Go to Ad Providers</button>
                </div>
                <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl p-5 text-white shadow-lg">
                  <h3 className="text-lg font-bold mb-1">Manage Your Ads </h3>
                  <p className="text-teal-100 mb-3 text-xs">Post and manage listings for vehicles, accommodation, services.</p>
                  <button onClick={() => setActiveTab('listings')} className="bg-white text-teal-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-50 transition">Go to Ad Listings</button>
                </div>
              </div>
            </div>
          )}

          {/* --- RESTAURANTS TAB --- */}
          {activeTab === "restaurants" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">All Restaurants</h3>
                <button
                  onClick={() => setShowAddRestaurantForm(!showAddRestaurantForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition shadow-sm"
                >
                  {showAddRestaurantForm ? <X size={18} /> : <Plus size={18} />}
                  {showAddRestaurantForm ? "Cancel" : "Add New Restaurant"}
                </button>
              </div>

              {/* Add Restaurant Form (Collapsible) */}
              {showAddRestaurantForm && (
                <div className="bg-white p-6 rounded-xl shadow border border-blue-100 animate-in fade-in slide-in-from-top-4">
                  <h4 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">New Restaurant Details</h4>
                  <form onSubmit={handleRestaurantSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase text-gray-500">Restaurant Name *</label>
                      <input name="name" value={form.name} onChange={handleFormChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Burger King" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase text-gray-500">Address *</label>
                      <input name="address" value={form.address} onChange={handleFormChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Doha, West Bay" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase text-gray-500">Phone</label>
                      <input name="phone" type="tel" value={form.phone} onChange={handleFormChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+974 1234 5678" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase text-gray-500">Cuisine(comma separated)</label>
                      <input name="cuisine" value={form.cuisine} onChange={handleFormChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Indian, Arabic,..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase text-gray-500">Rating</label>
                        <input name="rating" type="number" step="1" value={form.rating} onChange={handleFormChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="4" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase text-gray-500">Country</label>
                        <select name="country" value={form.country} onChange={handleFormChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
                          {Object.values(countryMap).map((country) => (
                            <option key={country as string} value={country as string}>{country as string}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase text-gray-500">Enter Your Key *</label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter API Key..."
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>

                    {/* File Inputs Styled */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <Paperclip size={14} /> Logo Image *
                      </label>
                      <input name="logo" type="file" accept="image/*" onChange={handleFormChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required />
                      {logoPreview && <img src={logoPreview} alt="Preview" className="h-10 w-10 rounded-full object-cover border mt-2" />}
                    </div>

                    <div className="col-span-full pt-4">
                      <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2">
                        <Save size={18} /> Save Restaurant
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Restaurant List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredRestaurants(restaurants).map((r) => (
                  <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group">
                    <div className="h-24 bg-gray-100 flex items-center justify-center relative">
                      {/* Placeholder for Brand Image if available, else pattern */}
                      <div className="absolute inset-0 opacity-10 bg-blue-600 pattern-grid-lg"></div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteRestaurant(r.id, r.name); }}
                        className="absolute top-2 right-2 p-2 bg-white/90 text-red-500 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Restaurant"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="px-5 pb-5 -mt-10 relative z-10">
                      <img src={r.logoUrl || "https://via.placeholder.com/150"} alt={r.name} className="h-20 w-20 rounded-lg border-4 border-white shadow bg-white object-contain" />
                      <div className="mt-3">
                        <h4 className="font-bold text-lg text-gray-800">{r.name}</h4>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Store size={14} /> {r.address}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">{r.cuisine || "General"}</span>
                          <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded border border-yellow-100">★ {r.rating || "N/A"}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => { setSelectedRestaurant(r.id); setActiveTab("offers"); }}
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg border border-gray-200 text-sm font-medium transition"
                        >
                          Manage Offers <ChevronRight size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/restaurant/${r.id}?edit=true`)}
                          className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 px-3 py-2 rounded-lg text-sm font-medium transition"
                          title="Manage Menu Pages"
                        >
                          📖 Menu
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- OFFERS TAB --- */}
          {activeTab === "offers" && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 md:items-end justify-between">
                <div className="flex items-end gap-2 w-full md:w-auto">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Store size={20} /></div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 font-semibold block mb-1">SELECT RESTAURANT</label>
                    <select
                      value={selectedRestaurant}
                      onChange={handleSelectRestaurant}
                      className="bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                    >
                      <option value="">-- Choose a Restaurant --</option>
                      {getFilteredRestaurants(restaurants).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                </div>

                {selectedRestaurant && (
                  <button
                    onClick={toggleAddOfferForm}
                    className="w-full md:w-auto flex-shrink-0 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition shadow-sm whitespace-nowrap"
                  >
                    {showAddOfferForm ? <X size={18} /> : <Plus size={18} />}
                    {showAddOfferForm ? "Cancel" : "Add New Offer"}
                  </button>
                )}
              </div>

              {/* Add Offer Form */}
              {showAddOfferForm && selectedRestaurant && (
                <div className="bg-white p-6 rounded-xl shadow border border-green-100">
                  <h4 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Create New Offer</h4>
                  <form onSubmit={handleOfferUpload} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Fields reused from logic, styled better */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Offer Title</label>
                      <input name="title" value={offerForm.title} onChange={handleOfferFormChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Arabic Mandi" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Category/Cuisine</label>
                      <select name="category" value={offerForm.category} onChange={handleOfferFormChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="">Select Cuisine</option>
                        {cuisineOptions.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Offer Type</label>
                      <select name="offerType" value={offerForm.offerType} onChange={handleOfferFormChange} className="w-full border p-2 rounded-lg">
                        <option value="All">All</option>
                        <option value="Buffet">Buffet</option>
                        <option value="Combo">Combo</option>
                        <option value="Happy Hour">Happy Hour</option>
                        <option value="Special">Special</option>
                        <option value="Catering">Catering</option>
                        <option value="Discount">Discount</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Original Price</label>
                      <input name="originalPrice" type="number" value={offerForm.originalPrice} onChange={handleOfferFormChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Discounted Price</label>
                      <input name="discountedPrice" type="number" value={offerForm.discountedPrice} onChange={handleOfferFormChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <Paperclip size={14} />
                        Offer Image *
                      </label>
                      <input name="offerImg" type="file" accept="image/*" onChange={handleOfferFormChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" required />
                      {offerPreview && <img src={offerPreview} alt="Preview" className="h-10 w-10 rounded-full object-cover border mt-2" />}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Valid From</label>
                      <input name="validFrom" type="date" value={offerForm.validFrom} onChange={handleOfferFormChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Valid To</label>
                      <input name="validTo" type="date" value={offerForm.validTo} onChange={handleOfferFormChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Country *</label>
                      <select
                        name="country"
                        value={offerForm.country || "Qatar"}
                        onChange={handleOfferFormChange}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                      >
                        {Object.values(countryMap).map((c) => (
                          <option key={c as string} value={c as string}>{c as string}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Enter Your Key *</label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter API Key..."
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        required
                      />
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Description</label>
                      <textarea name="description" rows={2} value={offerForm.description} onChange={handleOfferFormChange} className="w-full border p-2 rounded-lg" />
                    </div>
                    <div className="md:col-span-3">
                      <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 w-full md:w-auto">Upload Offer</button>
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

              {/* Offers Display */}
              {!selectedRestaurant ? (
                <div className="text-center py-20 text-gray-400">
                  <Store size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Please select a restaurant to view or manage offers.</p>
                </div>
              ) : (offerTab === "active" ? (
                offers.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <Tag size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No active offers found. Create one above!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {getFilteredOffers(offers).map((o) => (
                      <div key={o.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition group">
                        <div className="relative h-40">
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
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {o.offerType || "Discount"}
                          </div>
                        </div>
                        <div className="p-4">
                          <h5 className="font-bold text-gray-800 line-clamp-1" title={o.title}>{o.title}</h5>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{o.description}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-end gap-2">
                              <span className="text-lg font-bold text-green-600">{o.discountedPrice} QAR</span>
                              {o.originalPrice && <span className="text-xs text-gray-400 line-through mb-1">{o.originalPrice} QAR</span>}
                            </div>
                            <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-100 italic">
                              Exp: {o.validTo ? o.validTo.split("T")[0] : ""}
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
                              <span>Valid From:</span>
                              <span className="font-medium text-gray-700">{formatDate(o.validFrom)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Valid To:</span>
                              <span className="font-medium text-gray-700">{formatDate(o.validTo)}</span>
                            </div>
                          </div>

                          {user?.role === "admin" && <div className="mt-4 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => navigate('/make-offer', { state: { offer: o } })}
                              className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                            >
                              Review & Activate <ExternalLink size={14} />
                            </button>
                          </div>
                          }
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
                    isAdmin={user?.role === "admin"}
                    apiKey={apiKey}
                    setApiKey={setApiKey}
                  />
                </div>
              )}

              {!selectedRestaurant ? (
                <div className="text-center py-20 text-gray-400">
                  <List size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Please select a provider to manage listings. 
                    If you do not have registered the provider/business yet, go to Ads Providers menu to do so first.</p>
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
                        <p>{listingTab === "active" ? "No active listings. Add your ads to get started" : "No inactive listings."}</p>
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
                                    });
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
                        apiKey={apiKey}
                        setApiKey={setApiKey}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- PROVIDERS TAB --- */}
          {activeTab === "providers" && (
            <div className="space-y-6">
              {/* Header row */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Building2 size={24} className="text-blue-500" />
                  Ads Providers
                </h3>
                <button
                  onClick={() => { resetProviderForm(); setShowAddProviderForm(!showAddProviderForm); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition shadow-sm"
                >
                  {showAddProviderForm ? <X size={18} /> : <Plus size={18} />}
                  {showAddProviderForm ? "Cancel" : "Add New Provider"}
                </button>
              </div>

              {/* Add / Edit Form */}
              {showAddProviderForm && (
                <div className="bg-white p-6 rounded-xl shadow border border-blue-100">
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
                    apiKey={apiKey}
                    setApiKey={setApiKey}
                  />
                </div>
              )}

              {/* Provider Cards */}
              {providers.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No providers yet. Add your first provider above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {providers
                    .filter((p: any) => user?.role === "admin" || p.ownerLogin === user?.email)
                    .map((p: any) => (
                    <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
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
                        {getFilteredMessages(messages).map((msg) => (
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
                            {user?.role === "admin" && (
                              <td className="px-6 py-4 text-right flex flex-col gap-2 items-end">
                                <button
                                  onClick={() => handleOpenAccountModal(msg._id)}
                                  disabled={msg.status !== 'NEW'}
                                  className={`text-xs border px-3 py-1.5 rounded-lg transition-colors shadow-sm font-medium w-full flex items-center justify-center gap-1 
                                    ${msg.status === 'NEW'
                                      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`}
                                >
                                  <User size={12} /> Account Created
                                </button>
                              </td>
                            )}
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
            <div className="max-w-xl mx-auto mt-10">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600">
                  <UploadCloud size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Bulk Data Import</h3>
                <p className="text-gray-500 mb-8">Process large datasets directly from your source. Ensure your Key is set.</p>
                <button onClick={handleBulkProcessing} className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-200">
                  Start Bulk Processing
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
      {/* ===== FULL SCREEN SPINNER OVERLAY ===== */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-3" />
            <h3 className="text-lg font-bold text-gray-800">Processing...</h3>
            <p className="text-sm text-gray-500">Please wait while we upload your data.</p>
          </div>
        </div>
      )}

      {/* ===== ACCOUNT CREATION MODAL ===== */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Send Account Details</h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Enter the temporary password created for this user. An email will be sent to them with login instructions.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="text-xs font-semibold uppercase text-gray-500 block mb-1">Temporary Password</label>
                <input
                  type="text"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter temp password..."
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowAccountModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                disabled={sendingAccountEmail}
              >
                Cancel
              </button>
              <button
                onClick={handleSendAccountEmail}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                disabled={sendingAccountEmail}
              >
                {sendingAccountEmail ? <Loader2 size={16} className="animate-spin" /> : <User size={16} />}
                {sendingAccountEmail ? "Sending..." : "Send Email"}
              </button>
            </div>
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

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500">Country *</label>
                  <select
                    name="country"
                    value={offerForm.country || "Qatar"}
                    onChange={handleOfferFormChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {Object.values(countryMap).map((c) => (
                      <option key={c as string} value={c as string}>{c as string}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500">Enter Your Key *</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API Key..."
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
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