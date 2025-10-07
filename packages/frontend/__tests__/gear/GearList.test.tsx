import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GearList from '@/components/gear/GearList';
import { getGearItemsByTrip } from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
  getGearItemsByTrip: vi.fn(),
}));

// Mock the auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', role: 'FAMILY' },
  }),
}));

// Mock child components
vi.mock('@/components/gear/GearItem', () => ({
  default: ({ gearItem }: any) => <div data-testid="gear-item">{gearItem.name}</div>,
}));

vi.mock('@/components/gear/GearCreateDialog', () => ({
  default: ({ open }: any) => open ? <div data-testid="create-dialog">Create Dialog</div> : null,
}));

describe('GearList', () => {
  const mockGearItems = [
    {
      id: 'gear-1',
      tripId: 'trip-1',
      name: 'אוהל משפחתי',
      quantityNeeded: 3,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      assignments: [],
    },
    {
      id: 'gear-2',
      tripId: 'trip-1',
      name: 'שק שינה',
      quantityNeeded: 10,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      assignments: [
        {
          id: 'assign-1',
          gearItemId: 'gear-2',
          familyId: 'family-1',
          quantityAssigned: 4,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          family: {
            id: 'family-1',
            name: 'משפחת כהן',
            members: [],
          },
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(getGearItemsByTrip).mockImplementation(() => new Promise(() => {}));
    
    render(<GearList tripId="trip-1" />);
    
    expect(screen.getByText('טוען ציוד...')).toBeInTheDocument();
  });

  it('should render gear items after loading', async () => {
    vi.mocked(getGearItemsByTrip).mockResolvedValue(mockGearItems);
    
    render(<GearList tripId="trip-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('רשימת ציוד')).toBeInTheDocument();
    });
    
    expect(screen.getAllByTestId('gear-item')).toHaveLength(2);
  });

  it('should render empty state when no gear items', async () => {
    vi.mocked(getGearItemsByTrip).mockResolvedValue([]);
    
    render(<GearList tripId="trip-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('אין פריטי ציוד עדיין')).toBeInTheDocument();
    });
  });

  it('should render error state on API failure', async () => {
    vi.mocked(getGearItemsByTrip).mockRejectedValue(new Error('API Error'));
    
    render(<GearList tripId="trip-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('שגיאה בטעינת פריטי הציוד')).toBeInTheDocument();
    });
  });

  it('should show add button when canManage is true', async () => {
    vi.mocked(getGearItemsByTrip).mockResolvedValue(mockGearItems);
    
    render(<GearList tripId="trip-1" canManage={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('הוסף פריט')).toBeInTheDocument();
    });
  });

  it('should not show add button when canManage is false', async () => {
    vi.mocked(getGearItemsByTrip).mockResolvedValue(mockGearItems);
    
    render(<GearList tripId="trip-1" canManage={false} />);
    
    await waitFor(() => {
      expect(screen.queryByText('הוסף פריט')).not.toBeInTheDocument();
    });
  });

  it('should open create dialog when add button is clicked', async () => {
    vi.mocked(getGearItemsByTrip).mockResolvedValue(mockGearItems);
    const user = userEvent.setup();
    
    render(<GearList tripId="trip-1" canManage={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('הוסף פריט')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('הוסף פריט'));
    
    await waitFor(() => {
      expect(screen.getByTestId('create-dialog')).toBeInTheDocument();
    });
  });
});
