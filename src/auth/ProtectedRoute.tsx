import React from "react";
import useAuth from "./useAuth";
import { useLocation, useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Keep hook order stable: always register the effect, but run its body
  // conditionally after auth initialization.
  const isAuthenticated = !!auth.user;
  const next = location.pathname + location.search;

  React.useEffect(() => {
    if (!auth.initialized) return;
    if (!isAuthenticated) {
      // Redirect to login page and preserve where the user wanted to go.
      //The Login Page read the ?next= parameter and navigated them
      // back to respective protected page.
      navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
    }
  }, [auth.initialized, isAuthenticated, navigate, next]);

  if (!auth.initialized) return null;
  if (!isAuthenticated) return null;

  return children;
}
