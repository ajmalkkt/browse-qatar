import React from "react";
import { AUTH_PROVIDER } from "../config/appConfig";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import Keycloak from "keycloak-js";
import { getFirebaseAuth } from "./firebaseClient";

interface Props {
  children: React.ReactNode;
}

export function FirebaseProvider({ children }: Props) {
  const [user, setUser] = React.useState<any>(null);
  React.useEffect(() => {
    const unsub = getFirebaseAuth().onAuthStateChanged((u: any) => setUser(u));
    return () => unsub();
  }, []);

  return <>{children}</>;
}

export default function AuthProvider({ children }: Props) {
  if (AUTH_PROVIDER === "FIREBASE") {
    return <FirebaseProvider>{children}</FirebaseProvider>;
  }

  // Keycloak provider
  // Create a stable Keycloak client
  const clientRef = React.useRef<any>(null);
  if (!clientRef.current) {
    const kcUrl = import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080";
    const kcRealm = import.meta.env.VITE_KEYCLOAK_REALM || "browseqatar";
    const kcClient = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "dinedeal";

    if (!import.meta.env.VITE_KEYCLOAK_URL || !import.meta.env.VITE_KEYCLOAK_REALM || !import.meta.env.VITE_KEYCLOAK_CLIENT_ID) {
      // eslint-disable-next-line no-console
      console.warn("Keycloak environment variables not fully set. Using defaults:", { kcUrl, kcRealm, kcClient });
    }

    clientRef.current = new Keycloak({
      url: kcUrl,
      realm: kcRealm,
      clientId: kcClient,
    });
  }

  const initOptions = { onLoad: "check-sso", pkceMethod: "S256", checkLoginIframe: false } as any;

  return (
    <ReactKeycloakProvider authClient={clientRef.current} initOptions={initOptions}>
      {children}
    </ReactKeycloakProvider>
  );
}
