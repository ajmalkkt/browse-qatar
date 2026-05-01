import React from "react";
import { HelmetProvider } from "react-helmet-async";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./auth/AuthProvider";
import { ModalProvider } from "./contexts/ModalContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter basename={basename}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true, // You might need this one too soon
        }}
      >
        <AuthProvider>
          <ModalProvider>
            <FavoritesProvider>
              <App />
            </FavoritesProvider>
          </ModalProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
