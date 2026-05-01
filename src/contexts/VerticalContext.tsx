// src/contexts/VerticalContext.tsx
// Global context for managing current vertical and vertical switching

import React, { createContext, useContext, useState, useCallback } from 'react';
import { verticalConfig, getEnabledVerticals } from '../config/verticalConfig';
import { VerticalContextType, VerticalConfig } from '../types/vertical';

export const VerticalContext = createContext<VerticalContextType | null>(null);

interface VerticalProviderProps {
  children: React.ReactNode;
  defaultVertical?: string;
}

/**
 * Provider component that wraps the app to provide vertical context
 */
export function VerticalProvider({ 
  children, 
  defaultVertical = 'restaurants' 
}: VerticalProviderProps) {
  const [currentVertical, setCurrentVertical] = useState<string>(defaultVertical);
  const verticals = getEnabledVerticals();
  const currentConfig = verticalConfig[currentVertical] || null;

  const switchVertical = useCallback((verticalId: string) => {
    const config = verticalConfig[verticalId];
    if (config && config.enabled) {
      setCurrentVertical(verticalId);
      // Scroll to top when switching verticals
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      console.warn(`Vertical ${verticalId} is not enabled`);
    }
  }, []);

  const value: VerticalContextType = {
    currentVertical,
    currentConfig: currentConfig as VerticalConfig,
    verticals,
    switchVertical
  };

  return (
    <VerticalContext.Provider value={value}>
      {children}
    </VerticalContext.Provider>
  );
}

/**
 * Hook to use vertical context
 * Must be called within a VerticalProvider
 */
export function useVertical(): VerticalContextType {
  const context = useContext(VerticalContext);
  if (!context) {
    throw new Error('useVertical must be used within a VerticalProvider');
  }
  return context;
}

export default VerticalContext;
