import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import useAuth from "../auth/useAuth";
import { useModal } from "../contexts/ModalContext"; // 1. Import the Context
import { ENABLE_SIGNUP } from "../config/appConfig";

interface MenuOptionsProps {
  onAddBusiness: () => void;
  setMenuOpen: (open: boolean) => void;
}

export default function MenuOptions({ onAddBusiness, setMenuOpen }: MenuOptionsProps) {
  const navigate = useNavigate();
  const auth = useAuth();
  const { openLogin } = useModal(); // 2. Get the open function

  // ✅ Helper to navigate safely after menu closes
  const safeNavigate = (path: string) => {
    setMenuOpen(false);
    // Small timeout ensures DOM unmount before route change (important for mobile)
    setTimeout(() => {
      navigate(path);
    }, 120);
  };

  // 3. New Handler for Login Click
  const handleAuthClick = () => {
    setMenuOpen(false); // Close the dropdown menu
    
    if (auth.provider === "FIREBASE") {
      // Open the new Modal Popup
      openLogin();
    } else {
      // Fallback for Keycloak
      auth.login();
    }
  };

  // ✅ NEW Helper: Checks Auth before navigating
  const handleProtectedNavigation = (path: string) => {
    setMenuOpen(false); // Close the menu immediately

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
  const onManageOffersClick = () => {
    // Mobile (< 768px) goes to simple form, others go to Admin Dashboard
    if (window.innerWidth < 768) {
      handleProtectedNavigation("/admin");
    } else {
      handleProtectedNavigation("/manage-offers");
    }
  };

  return (
    <div
      className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-30 overflow-hidden"
      onClick={(e) => e.stopPropagation()} // ✅ Prevent parent close trigger
    >
      {/* --- About Us --- */}
      <button
        onClick={() => safeNavigate("/about")}
        className="block w-full text-left px-5 py-3 hover:bg-blue-50 border-b border-gray-200 text-gray-700 font-medium"
      >
        About Us
      </button>

      {/* --- Favourites --- */}
      <button
        onClick={() => safeNavigate("/favourites")}
        className="block w-full text-left px-5 py-3 hover:bg-blue-50 border-b border-gray-200 text-gray-700 font-medium flex items-center gap-2"
      >
        Favourites
      </button>

      {/* --- Register Business --- */}
      <button
        onClick={() => {
          setMenuOpen(false);
          setTimeout(() => onAddBusiness(), 120);
        }}
        className="block w-full text-left px-5 py-3 hover:bg-blue-50 border-b border-gray-200 text-gray-700 font-medium"
      >
        Register Your Business
      </button>

      {/* --- Manage offers (Add Offers) --- */}
      <button
        onClick={onManageOffersClick}
        className="block w-full text-left px-5 py-3 hover:bg-blue-50 border-b border-gray-200 text-gray-700 font-medium"
      >
        Manage Offers
      </button>

      {/* --- Make Offer --- */}
      {auth.user && auth.user.role === "admin" && (
      <button
        onClick={() => handleProtectedNavigation("/make-offer")}
        className="block w-full text-left px-5 py-3 hover:bg-blue-50 border-b border-gray-200 text-gray-700 font-medium"
      >
        Approve Offers
      </button>
      )}

      {/* --- Contact Us --- */}
      <button
        onClick={() => {
          setMenuOpen(false);
          setTimeout(() => onAddBusiness(), 120);
        }}
        className="block w-full text-left px-5 py-3 hover:bg-blue-50 border-b border-gray-200 text-gray-700 font-medium"
      >
        Contact Us
      </button>

      {/* --- Login / Sign Up Section --- */}
      {!auth.initialized || !auth.user ? (
        <button
          onClick={handleAuthClick}
          className="block w-full text-left px-5 py-3 hover:bg-blue-50 border-b border-gray-200 text-gray-700 font-medium"
        >
          {ENABLE_SIGNUP ? "Login / Sign Up" : "Login"}
        </button>
      ) : (
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-semibold">Signed in as:</span>
            <span className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
              {auth.user?.email || auth.user?.displayName || "User"}
            </span>
          </div>
          <button
            onClick={() => {
              setMenuOpen(false);
              auth.logout({ redirectUri: window.location.origin } as any);
            }}
            aria-label="Logout"
            title="Logout"
            className="ml-3 text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />Log out
          </button>
        </div>
      )}

      {/* --- Mobile App Section --- */}
      <div className="flex justify-around items-center py-4 bg-gray-50">
        <div
          className="flex flex-col items-center text-gray-600 cursor-pointer hover:text-black transition-colors"
          onClick={() => alert("Launching soon! We appreciate your patience.")}
        >
          <img src={'/android.png'} alt="android-link" className="w-6 h-6 object-contain" />
          <span className="text-xs font-medium">Android</span>
        </div>
        <div
          className="flex flex-col items-center text-gray-600 cursor-pointer hover:text-black transition-colors"
          onClick={() => alert("Launching soon! We appreciate your patience.")}
        >
          <img src={'/apple.png'} alt="apple-link" className="w-6 h-6 object-contain" />
          <span className="text-xs font-medium">iOS</span>
        </div>
      </div>
    </div>
  );
}