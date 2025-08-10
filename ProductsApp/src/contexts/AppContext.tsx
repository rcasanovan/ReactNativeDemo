import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppStore, appStore } from '../stores/AppStore';

interface AppContextType {
  store: AppStore;
  isInitialized: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await appStore.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Still set as initialized to show error state
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  const value: AppContextType = {
    store: appStore,
    isInitialized,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
