import React from "react";
import useAuth from "./useAuth";
import { useLocation, useNavigate } from "react-router-dom";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initialized = auth.initialized;
  const isAuthenticated = !!auth.user;
  // Check if role is admin (adjust 'admin' string if your DB uses 'Administrator' etc.)
  const isAdmin = auth.user?.role === 'admin'; 
  
  const next = location.pathname + location.search;

  React.useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated) {
      // Case 1: Not logged in at all -> Send to Login
      navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
    } else if (!isAdmin) {
      // Case 2: Logged in, but NOT an admin -> Send to Home (or specific 403 page)
      // We use replace: true so they can't click 'Back' into the restricted page
      navigate("/", { replace: true }); 
      // Optional: alert("Access Denied: Admins only.");
    }
  }, [initialized, isAuthenticated, isAdmin, navigate, next]);

  // While loading auth state
  if (!initialized) return null; 

  // If failed checks (prevents flashing content before redirect)
  if (!isAuthenticated || !isAdmin) return null;

  // Happy Path: User is Logged In AND is Admin
  return children;
}