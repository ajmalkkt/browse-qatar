import { Suspense } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Home from "./components/home";
import ModernHome from "./components/ModernHome";
import { ModernMarketplaceDetail, ModernMarketplaceHome, ModernMarketplaceListing } from "./components/ModernMarketplace";
import AdminImageManager from "./components/AdminImageManager";
import ModernListing from "./components/ModernListing";
import About from "./components/About";
import MakeOffer from "./components/MakeOffer";
import Favourites from "./components/Favourites";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminRoute from "./auth/AdminRoute";
import LoginModal from "./components/LoginModal";
import ManageOffers from "./components/ManageOffers";
import OfferDetails from "./components/OfferDetails";
import TermsAndConditions from "./components/TermsAndConditions";
import AllRestaurants from "./components/AllRestaurants";
import AdminUserGuide from "./components/AdminUserGuide";
import CuisinesPage from "./components/CuisinesPage";
import ListingDetail from "./components/verticals/shared/ListingDetail";
import VerticalLayout from "./components/verticals/shared/VerticalLayout";
import { VerticalProvider } from "./contexts/VerticalContext";
import NotFound from "./components/NotFound";
import Features from "./components/Feature";
import FAQ from "./components/FAQ";
import RestaurantDetails from "./components/RestaurantDetails";

function App() {
  // Modern view flag is controlled only via Vite environment variable
  // Set VITE_MODERN_VIEW=true in your .env to enable the modern experience.
  const isModernViewEnabled = import.meta.env.VITE_MODERN_VIEW === "true";

  return (
    <VerticalProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <div className={`min-h-screen ${isModernViewEnabled ? "bg-[#f5f6f7]" : "bg-gradient-to-br from-blue-50 via-white to-blue-100"} ${isModernViewEnabled ? "" : "flex items-center justify-center"}`}>
          <div className={isModernViewEnabled ? "w-full" : "max-w-screen-lg w-full mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-xl shadow-xl border border-gray-200"}>
            <LoginModal /> {/* Add this here, outside Routes */}
            <Routes>
              <Route path="/" element={isModernViewEnabled ? <ModernMarketplaceHome /> : <Home />} />
              <Route path="/modern-home" element={<ModernHome />} />
              <Route path="/marketplace/:vertical/:id" element={isModernViewEnabled ? <ModernMarketplaceDetail /> : <ListingDetail />} />
              <Route path="/marketplace/:vertical" element={isModernViewEnabled ? <ModernMarketplaceListing /> : <ModernListing />} />
              <Route path="/modern/:vertical/:id" element={<LegacyMarketplaceRedirect />} />
              <Route path="/modern/:vertical" element={<LegacyMarketplaceRedirect />} />
              <Route path="/cuisines" element={<CuisinesPage />} />
              <Route path="/offer/:id" element={<OfferDetails />} />
              <Route path="/admin" element={<ProtectedRoute><AdminImageManager /></ProtectedRoute>} />
              <Route path="/about" element={<About />} />
              <Route path="/features" element={<Features />} />
              <Route path="/faq" element={<FAQ />} />
              {/*<Route path="/login" element={<LoginPage />} /> */}
              <Route path="/make-offer" element={<AdminRoute><MakeOffer /></AdminRoute>} />
              <Route path="/admin-guide" element={<ProtectedRoute><AdminUserGuide /></ProtectedRoute>} />
              <Route path="/favourites" element={<Favourites />} />
              <Route path="/manage-offers" element={<ProtectedRoute><ManageOffers /></ProtectedRoute>} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/all-restaurants" element={<AllRestaurants />} />
              <Route path="/restaurant/:id" element={<RestaurantDetails />} />
              
              <Route path="/restaurants-offers" element={<Home />} />
              
              {/* NEW: Dynamic vertical routes */}
              <Route path="/:vertical" element={<VerticalLayout />} />
              <Route path="/:vertical/:id" element={<ListingDetail />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* Toast container must be here */}
            <ToastContainer
              position="top-center"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              pauseOnHover
              draggable
              theme="colored"
            />
          </div>
        </div>
      </Suspense>
    </VerticalProvider>
  );
}

function LegacyMarketplaceRedirect() {
  const { vertical, id } = useParams();
  const destination = id ? `/marketplace/${vertical}/${id}` : `/marketplace/${vertical}`;
  return <Navigate to={`${destination}${window.location.search}`} replace />;
}

export default App;
