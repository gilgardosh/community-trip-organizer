'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Trip } from '@/types/trip';
import type { GearItem } from '@/types/gear';
import type { Family } from '@/types/family';

interface AppState {
  selectedTrip: Trip | null;
  selectedFamily: Family | null;
  refreshTriggers: {
    trips: number;
    families: number;
    gear: number;
    whatsapp: number;
  };
}

interface AppContextType extends AppState {
  setSelectedTrip: (trip: Trip | null) => void;
  setSelectedFamily: (family: Family | null) => void;
  refreshTrips: () => void;
  refreshFamilies: () => void;
  refreshGear: () => void;
  refreshWhatsApp: () => void;
  refreshAll: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    selectedTrip: null,
    selectedFamily: null,
    refreshTriggers: {
      trips: 0,
      families: 0,
      gear: 0,
      whatsapp: 0,
    },
  });

  const setSelectedTrip = useCallback((trip: Trip | null) => {
    setState((prev) => ({ ...prev, selectedTrip: trip }));
  }, []);

  const setSelectedFamily = useCallback((family: Family | null) => {
    setState((prev) => ({ ...prev, selectedFamily: family }));
  }, []);

  const refreshTrips = useCallback(() => {
    setState((prev) => ({
      ...prev,
      refreshTriggers: {
        ...prev.refreshTriggers,
        trips: prev.refreshTriggers.trips + 1,
      },
    }));
  }, []);

  const refreshFamilies = useCallback(() => {
    setState((prev) => ({
      ...prev,
      refreshTriggers: {
        ...prev.refreshTriggers,
        families: prev.refreshTriggers.families + 1,
      },
    }));
  }, []);

  const refreshGear = useCallback(() => {
    setState((prev) => ({
      ...prev,
      refreshTriggers: {
        ...prev.refreshTriggers,
        gear: prev.refreshTriggers.gear + 1,
      },
    }));
  }, []);

  const refreshWhatsApp = useCallback(() => {
    setState((prev) => ({
      ...prev,
      refreshTriggers: {
        ...prev.refreshTriggers,
        whatsapp: prev.refreshTriggers.whatsapp + 1,
      },
    }));
  }, []);

  const refreshAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      refreshTriggers: {
        trips: prev.refreshTriggers.trips + 1,
        families: prev.refreshTriggers.families + 1,
        gear: prev.refreshTriggers.gear + 1,
        whatsapp: prev.refreshTriggers.whatsapp + 1,
      },
    }));
  }, []);

  const value: AppContextType = {
    ...state,
    setSelectedTrip,
    setSelectedFamily,
    refreshTrips,
    refreshFamilies,
    refreshGear,
    refreshWhatsApp,
    refreshAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
