import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GearVolunteerDialog from '@/components/gear/GearVolunteerDialog';
import { assignGear, removeGearAssignment } from '@/lib/api';
import { GearItem } from '@/types/gear';

// Mock the API
vi.mock('@/lib/api', () => ({
  assignGear: vi.fn(),
  removeGearAssignment: vi.fn(),
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('GearVolunteerDialog', () => {
  const mockGearItem: GearItem = {
    id: 'gear-1',
    tripId: 'trip-1',
    name: 'אוהל משפחתי',
    quantityNeeded: 5,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    assignments: [],
  };

  const mockOnUpdated = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    render(
      <GearVolunteerDialog
        gearItem={mockGearItem}
        familyId="family-1"
        open={false}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    expect(screen.queryByText('התנדב לציוד')).not.toBeInTheDocument();
  });

  it('should render when open is true', () => {
    render(
      <GearVolunteerDialog
        gearItem={mockGearItem}
        familyId="family-1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    expect(screen.getByText('התנדב לציוד')).toBeInTheDocument();
  });

  it('should show gear item name and availability', () => {
    render(
      <GearVolunteerDialog
        gearItem={mockGearItem}
        familyId="family-1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    expect(screen.getByText('אוהל משפחתי')).toBeInTheDocument();
    expect(screen.getByText(/נדרש: 5/)).toBeInTheDocument();
    expect(screen.getByText(/נותר: 5/)).toBeInTheDocument();
  });

  it('should assign gear when form is submitted', async () => {
    const updatedGearItem = {
      ...mockGearItem,
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
    };

    vi.mocked(assignGear).mockResolvedValue(updatedGearItem);
    const user = userEvent.setup();

    render(
      <GearVolunteerDialog
        gearItem={mockGearItem}
        familyId="family-1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    const quantityInput = screen.getByLabelText(/כמות להתנדבות/);
    await user.tripleClick(quantityInput);
    await user.keyboard('2');

    await user.click(screen.getByText('התנדב'));

    await waitFor(() => {
      expect(assignGear).toHaveBeenCalledWith('gear-1', {
        familyId: 'family-1',
        quantityAssigned: 2,
      });
    });

    expect(mockOnUpdated).toHaveBeenCalledWith(updatedGearItem);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'התנדבות נשמרה',
      description: 'התנדבת ל-2 יחידות של "אוהל משפחתי"',
    });
  });

  it('should show update mode when family already volunteered', () => {
    const gearItemWithAssignment: GearItem = {
      ...mockGearItem,
      assignments: [
        {
          id: 'assign-1',
          gearItemId: 'gear-1',
          familyId: 'family-1',
          quantityAssigned: 3,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          family: {
            id: 'family-1',
            name: 'משפחת כהן',
            members: [],
          },
        },
      ],
    };

    render(
      <GearVolunteerDialog
        gearItem={gearItemWithAssignment}
        familyId="family-1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    expect(screen.getByText('עדכן התנדבות')).toBeInTheDocument();
    expect(screen.getByText(/כרגע התנדבת ל-3 יחידות/)).toBeInTheDocument();
    expect(screen.getByText('עדכן')).toBeInTheDocument();
  });

  it('should show remove button when family has assignment', () => {
    const gearItemWithAssignment: GearItem = {
      ...mockGearItem,
      assignments: [
        {
          id: 'assign-1',
          gearItemId: 'gear-1',
          familyId: 'family-1',
          quantityAssigned: 3,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          family: {
            id: 'family-1',
            name: 'משפחת כהן',
            members: [],
          },
        },
      ],
    };

    render(
      <GearVolunteerDialog
        gearItem={gearItemWithAssignment}
        familyId="family-1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    expect(screen.getByText('בטל התנדבות')).toBeInTheDocument();
  });

  it('should remove assignment when remove button is clicked', async () => {
    const gearItemWithAssignment: GearItem = {
      ...mockGearItem,
      assignments: [
        {
          id: 'assign-1',
          gearItemId: 'gear-1',
          familyId: 'family-1',
          quantityAssigned: 3,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          family: {
            id: 'family-1',
            name: 'משפחת כהן',
            members: [],
          },
        },
      ],
    };

    vi.mocked(removeGearAssignment).mockResolvedValue({ message: 'Removed' });
    const user = userEvent.setup();

    render(
      <GearVolunteerDialog
        gearItem={gearItemWithAssignment}
        familyId="family-1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    await user.click(screen.getByText('בטל התנדבות'));

    await waitFor(() => {
      expect(removeGearAssignment).toHaveBeenCalledWith('gear-1', 'family-1');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'ההתנדבות בוטלה',
      description: 'בוטלה ההתנדבות ל-"אוהל משפחתי"',
    });
  });

  it('should validate quantity constraints', () => {
    render(
      <GearVolunteerDialog
        gearItem={mockGearItem}
        familyId="family-1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    const quantityInput = screen.getByLabelText(
      /כמות להתנדבות/,
    ) as HTMLInputElement;

    expect(quantityInput).toHaveAttribute('min', '1');
    expect(quantityInput).toHaveAttribute('max', '5');
    expect(quantityInput).toHaveAttribute('type', 'number');
  });

  it('should handle API errors on assignment', async () => {
    vi.mocked(assignGear).mockRejectedValue(new Error('API Error'));
    const user = userEvent.setup();

    render(
      <GearVolunteerDialog
        gearItem={mockGearItem}
        familyId="family-1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    await user.click(screen.getByText('התנדב'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'שגיאה',
        description: 'API Error',
        variant: 'destructive',
      });
    });
  });

  it('should handle API errors on removal', async () => {
    const gearItemWithAssignment: GearItem = {
      ...mockGearItem,
      assignments: [
        {
          id: 'assign-1',
          gearItemId: 'gear-1',
          familyId: 'family-1',
          quantityAssigned: 3,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          family: {
            id: 'family-1',
            members: [],
          },
        },
      ],
    };

    vi.mocked(removeGearAssignment).mockRejectedValue(new Error('API Error'));
    const user = userEvent.setup();

    render(
      <GearVolunteerDialog
        gearItem={gearItemWithAssignment}
        familyId="family-1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    await user.click(screen.getByText('בטל התנדבות'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'שגיאה',
        description: 'API Error',
        variant: 'destructive',
      });
    });
  });
});
