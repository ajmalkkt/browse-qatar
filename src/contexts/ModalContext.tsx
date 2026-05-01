import React, { createContext, useContext, useState } from 'react';

interface ModalContextType {
  isLoginOpen: boolean;
  openLogin: (onSuccess?: () => void) => void; // ✅ Accept a callback
  closeLogin: () => void;
  onLoginSuccess: () => void; // Internal use
}

const ModalContext = createContext<ModalContextType>({} as ModalContextType);

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoginOpen, setLoginOpen] = useState(false);
  // Store the callback in state
  const [successCallback, setSuccessCallback] = useState<(() => void) | null>(null);

  const openLogin = (onSuccess?: () => void) => {
    if (onSuccess) setSuccessCallback(() => onSuccess);
    setLoginOpen(true);
  };

  const closeLogin = () => {
    setLoginOpen(false);
    setSuccessCallback(null); // Clear callback on close
  };

  // ✅ New function called by LoginModal when auth is done
  const onLoginSuccess = () => {
    if (successCallback) {
      successCallback();
    }
    closeLogin();
  };

  return (
    <ModalContext.Provider value={{ isLoginOpen, openLogin, closeLogin, onLoginSuccess }}>
      {children}
    </ModalContext.Provider>
  );
};