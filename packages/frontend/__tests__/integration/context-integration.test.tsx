import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

const TestComponent = () => {
  const {
    selectedTrip,
    selectedFamily,
    setSelectedTrip,
    setSelectedFamily,
    refreshTrips,
    refreshFamilies,
    refreshGear,
    refreshWhatsApp,
    refreshAll,
    refreshTriggers,
  } = useApp();

  return (
    <div>
      <div data-testid="trip-id">{selectedTrip?.id || 'none'}</div>
      <div data-testid="family-id">{selectedFamily?.id || 'none'}</div>
      <div data-testid="trips-trigger">{refreshTriggers.trips}</div>
      <div data-testid="families-trigger">{refreshTriggers.families}</div>
      <div data-testid="gear-trigger">{refreshTriggers.gear}</div>
      <div data-testid="whatsapp-trigger">{refreshTriggers.whatsapp}</div>
      <button onClick={() => setSelectedTrip({ id: 'trip-1' } as any)}>
        Set Trip
      </button>
      <button onClick={() => setSelectedFamily({ id: 'family-1' } as any)}>
        Set Family
      </button>
      <button onClick={refreshTrips}>Refresh Trips</button>
      <button onClick={refreshFamilies}>Refresh Families</button>
      <button onClick={refreshGear}>Refresh Gear</button>
      <button onClick={refreshWhatsApp}>Refresh WhatsApp</button>
      <button onClick={refreshAll}>Refresh All</button>
    </div>
  );
};

describe('Integration: App Context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide app state and methods', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>,
    );

    expect(screen.getByTestId('trip-id')).toHaveTextContent('none');
    expect(screen.getByTestId('family-id')).toHaveTextContent('none');
    expect(screen.getByTestId('trips-trigger')).toHaveTextContent('0');
  });

  it('should update selected trip', async () => {
    const { getByText, getByTestId } = render(
      <AppProvider>
        <TestComponent />
      </AppProvider>,
    );

    getByText('Set Trip').click();

    await waitFor(() => {
      expect(getByTestId('trip-id')).toHaveTextContent('trip-1');
    });
  });

  it('should update selected family', async () => {
    const { getByText, getByTestId } = render(
      <AppProvider>
        <TestComponent />
      </AppProvider>,
    );

    getByText('Set Family').click();

    await waitFor(() => {
      expect(getByTestId('family-id')).toHaveTextContent('family-1');
    });
  });

  it('should trigger refresh for trips', async () => {
    const { getByText, getByTestId } = render(
      <AppProvider>
        <TestComponent />
      </AppProvider>,
    );

    getByText('Refresh Trips').click();

    await waitFor(() => {
      expect(getByTestId('trips-trigger')).toHaveTextContent('1');
    });
  });

  it('should trigger refresh for all entities', async () => {
    const { getByText, getByTestId } = render(
      <AppProvider>
        <TestComponent />
      </AppProvider>,
    );

    getByText('Refresh All').click();

    await waitFor(() => {
      expect(getByTestId('trips-trigger')).toHaveTextContent('1');
      expect(getByTestId('families-trigger')).toHaveTextContent('1');
      expect(getByTestId('gear-trigger')).toHaveTextContent('1');
      expect(getByTestId('whatsapp-trigger')).toHaveTextContent('1');
    });
  });
});

describe('Integration: Provider Composition', () => {
  it('should render all providers without errors', () => {
    const { container } = render(
      <AuthProvider>
        <NotificationProvider>
          <AppProvider>
            <div>Test Content</div>
          </AppProvider>
        </NotificationProvider>
      </AuthProvider>,
    );

    expect(container).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
