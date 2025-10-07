import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GearSummary from '@/components/gear/GearSummary';
import { getGearSummary } from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
  getGearSummary: vi.fn(),
}));

describe('GearSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    vi.mocked(getGearSummary).mockImplementation(() => new Promise(() => {}));
    
    render(<GearSummary tripId="trip-1" />);
    
    expect(screen.getByText('טוען סיכום...')).toBeInTheDocument();
  });

  it('should render summary data', async () => {
    const mockSummary = {
      totalItems: 10,
      totalQuantityNeeded: 50,
      totalQuantityAssigned: 30,
      fullyAssignedItems: 3,
      partiallyAssignedItems: 4,
      unassignedItems: 2,
      items: [],
    };
    
    vi.mocked(getGearSummary).mockResolvedValue(mockSummary);
    
    render(<GearSummary tripId="trip-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // total items
      expect(screen.getByText('הוקצה במלואו')).toBeInTheDocument();
      expect(screen.getByText('הוקצה חלקית')).toBeInTheDocument();
      expect(screen.getByText('לא הוקצה')).toBeInTheDocument();
    });
  });

  it('should calculate completion rate correctly', async () => {
    const mockSummary = {
      totalItems: 10,
      totalQuantityNeeded: 100,
      totalQuantityAssigned: 75,
      fullyAssignedItems: 5,
      partiallyAssignedItems: 3,
      unassignedItems: 2,
      items: [],
    };
    
    vi.mocked(getGearSummary).mockResolvedValue(mockSummary);
    
    render(<GearSummary tripId="trip-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  it('should show 0% completion when totalQuantityNeeded is 0', async () => {
    const mockSummary = {
      totalItems: 0,
      totalQuantityNeeded: 0,
      totalQuantityAssigned: 0,
      fullyAssignedItems: 0,
      partiallyAssignedItems: 0,
      unassignedItems: 0,
      items: [],
    };
    
    vi.mocked(getGearSummary).mockResolvedValue(mockSummary);
    
    render(<GearSummary tripId="trip-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  it('should display quantity text correctly', async () => {
    const mockSummary = {
      totalItems: 5,
      totalQuantityNeeded: 20,
      totalQuantityAssigned: 15,
      fullyAssignedItems: 2,
      partiallyAssignedItems: 2,
      unassignedItems: 1,
      items: [],
    };
    
    vi.mocked(getGearSummary).mockResolvedValue(mockSummary);
    
    render(<GearSummary tripId="trip-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('15 מתוך 20 יחידות')).toBeInTheDocument();
    });
  });

  it('should not render on error', async () => {
    vi.mocked(getGearSummary).mockRejectedValue(new Error('API Error'));
    
    const { container } = render(<GearSummary tripId="trip-1" />);
    
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });
});
