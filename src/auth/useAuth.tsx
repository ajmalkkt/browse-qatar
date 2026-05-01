import React, { useCallback } from "react";
import { AUTH_PROVIDER } from "../config/appConfig";
import { useKeycloak } from "@react-keycloak/web";
import { 
  firebaseLogin, 
  firebaseLogout, 
  getFirebaseAuth, 
  firebaseLoginWithEmail 
} from "./firebaseClient";

// Defining a loose type for User to include the role
type User = any; 

export function useAuth() {
  
  // ==============================
  // 1. FIREBASE PROVIDER LOGIC
  // ==============================
  if (AUTH_PROVIDER === "FIREBASE") {
    const [user, setUser] = React.useState<User | null>(null);
    const [initialized, setInitialized] = React.useState(false);

    // Helper: Fetch Role and update User state
    const refreshUserRole = useCallback(async (firebaseUser: any) => {
      if (!firebaseUser) {
        setUser(null);
        return;
      }
      try {
        // Force refresh (true) to ensure we get the latest claims (e.g. just after admin promotion)
        const idTokenResult = await firebaseUser.getIdTokenResult(true);
        const role = idTokenResult.claims.role || "user"; // Default to 'user' if undefined

        // We create a new object merging the Firebase User + The Role
        // This allows you to access user.role directly in your components
        const userWithRole = {
          ...firebaseUser,
          role: role, 
          // You can also attach the whole claims object if needed:
          // claims: idTokenResult.claims 
        };
        
        setUser(userWithRole);
      } catch (error) {
        console.error("Error fetching user role:", error);
        // Fallback: set user without role if fetch fails
        setUser(firebaseUser);
      }
    }, []);

    React.useEffect(() => {
      const auth = getFirebaseAuth();
      const unsub = auth.onAuthStateChanged(async (u: any) => {
        if (u) {
          // User is logged in, fetch their role
          await refreshUserRole(u);
        } else {
          // User is logged out
          setUser(null);
        }
        setInitialized(true);
      });
      return () => unsub();
    }, [refreshUserRole]);

    return {
      provider: "FIREBASE",
      user,              // Now contains user.role
      role: user?.role,  // Helper to access role directly
      login: firebaseLogin,
      loginWithEmail: firebaseLoginWithEmail,
      logout: firebaseLogout,
      refreshRole: () => refreshUserRole(getFirebaseAuth().currentUser), // Expose function to manually refresh
      initialized,
    };
  }

  // ==============================
  // 2. KEYCLOAK PROVIDER LOGIC
  // ==============================
  const { keycloak, initialized } = useKeycloak();

  // Try to extract role from Keycloak token (adjust path based on your Keycloak config)
  // standard path: user.realm_access.roles or user.resource_access.client.roles
  const kUser = keycloak?.tokenParsed as any;
  const kRole = kUser?.realm_access?.roles?.includes("admin") ? "admin" : "user";

  return {
    provider: "KEYCLOAK",
    user: kUser ? { ...kUser, role: kRole } : null,
    role: kRole,
    login: (opts?: any) => keycloak?.login(opts),
    logout: (opts?: any) => keycloak?.logout(opts),
    refreshRole: () => keycloak?.updateToken(5), // Keycloak specific refresh
    initialized,
  } as const;
}

export default useAuth;