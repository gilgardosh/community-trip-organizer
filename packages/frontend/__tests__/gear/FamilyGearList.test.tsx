import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FamilyGearList from '@/components/gear/FamilyGearList';
import { getGearItemsByTrip } from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
  getGearItemsByTrip: vi.fn(),
}));

// Mock child components
vi.mock('@/components/gear/GearVolunteerDialog', () => ({
  default: ({ open, gearItem }: any) =>
    open ? <div data-testid="volunteer-dialog">{gearItem.name}</div> : null,
}));

vi.mock('@/components/gear/GearStatusIndicator', () => ({
  default: () => <div>Status</div>,
}));

describe('FamilyGearList', () => {
  const mockGearItems = [
    {
      id: 'gear-1',
      tripId: 'trip-1',
      name: 'אוהל משפחתי',
      quantityNeeded: 3,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      assignments: [
        {
          id: 'assign-1',
          gearItemId: 'gear-1',
          familyId: 'family-1',
          quantityAssigned: 2,
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
    {
      id: 'gear-2',
      tripId: 'trip-1',
      name: 'שק שינה',
      quantityNeeded: 10,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      assignments: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    vi.mocked(getGearItemsByTrip).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<FamilyGearList tripId="trip-1" familyId="family-1" />);

    expect(screen.getByText('טוען ציוד...')).toBeInTheDocument();
  });

  it('should render my volunteer commitments section', async () => {
    vi.mocked(getGearItemsByTrip).mockResolvedValue(mockGearItems);

    render(<FamilyGearList tripId="trip-1" familyId="family-1" />);

    await waitFor(() => {
      expect(screen.getByText('ההתנדבויות שלי')).toBeInTheDocument();
    });
  });

  it('should show family assignments in my commitments', async () => {
    vi.mocked(getGearItemsByTrip).mockResolvedValue(mockGearItems);

    render(<FamilyGearList tripId="trip-1" familyId="family-1" />);

    await waitFor(() => {
      expect(screen.getByText('ההתנדבויות שלי')).toBeInTheDocument();
      expect(screen.getByText('התנדבת ל-2 יחידות')).toBeInTheDocument();
    });
  });

  it('should not show my commitments section when no assignments', async () => {
    vi.mocked(getGearItemsByTrip).mockResolvedValue(mockGearItems);

    render(<FamilyGearList tripId="trip-1" familyId="family-2" />);

    await waitFor(() => {
      expect(screen.queryByText('ההתנדבויות שלי')).not.toBeInTheDocument();
    });
  });

  it('should show available gear items', async () => {
    vi.mocked(getGearItemsByTrip).mockResolvedValue(mockGearItems);

    render(<FamilyGearList tripId="trip-1" familyId="family-1" />);

    await waitFor(() => {
      expect(screen.getByText('פריטי ציוד זמינים')).toBeInTheDocument();
      expect(screen.getAllByText('אוהל משפחתי').length).toBeGreaterThan(0);
      expect(screen.getByText('שק שינה')).toBeInTheDocument();
    });
  });

  it('should enable volunteer button for available items', async () => {
    vi.mocked(getGearItemsByTrip).mockResolvedValue(mockGearItems);

    render(<FamilyGearList tripId="trip-1" familyId="family-2" />);

    await waitFor(() => {
      const volunteerButtons = screen.getAllByText('התנדב');
      expect(volunteerButtons.length).toBeGreaterThan(0);
      expect(volunteerButtons[0]).not.toBeDisabled();
    });
  });

  it('should show update button for family assignments', async () => {
    vi.mocked(getGearItemsByTrip).mockResolvedValue(mockGearItems);

    render(<FamilyGearList tripId="trip-1" familyId="family-1" />);

    await waitFor(() => {
      const updateButtons = screen.getAllByText('עדכן');
      expect(updateButtons.length).toBeGreaterThan(0);
    });
  });

  it('should open volunteer dialog when clicking volunteer button', async () => {
    vi.mocked(getGearItemsByTrip).mockResolvedValue(mockGearItems);
    const user = userEvent.setup();

    render(<FamilyGearList tripId="trip-1" familyId="family-2" />);

    await waitFor(() => {
      expect(screen.getByText('שק שינה')).toBeInTheDocument();
    });

    const volunteerButton = screen.getAllByText('התנדב')[0];
    await user.click(volunteerButton);

    await waitFor(() => {
      expect(screen.getByTestId('volunteer-dialog')).toBeInTheDocument();
    });
  });

  it('should show empty state when no gear items', async () => {
    vi.mocked(getGearItemsByTrip).mockResolvedValue([]);

    render(<FamilyGearList tripId="trip-1" familyId="family-1" />);

    await waitFor(() => {
      expect(screen.getByText('אין פריטי ציוד עדיין')).toBeInTheDocument();
    });
  });
});
