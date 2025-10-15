import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GearDeleteDialog from '@/components/gear/GearDeleteDialog';
import { deleteGearItem } from '@/lib/api';
import { GearItem } from '@/types/gear';

// Mock the API
vi.mock('@/lib/api', () => ({
  deleteGearItem: vi.fn(),
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('GearDeleteDialog', () => {
  const mockGearItem: GearItem = {
    id: 'gear-1',
    tripId: 'trip-1',
    name: 'אוהל משפחתי',
    quantityNeeded: 5,
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
  };

  const mockOnDeleted = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    render(
      <GearDeleteDialog
        gearItem={mockGearItem}
        open={false}
        onOpenChange={mockOnOpenChange}
        onDeleted={mockOnDeleted}
      />,
    );

    expect(
      screen.queryByText('האם למחוק את פריט הציוד?'),
    ).not.toBeInTheDocument();
  });

  it('should render when open is true', () => {
    render(
      <GearDeleteDialog
        gearItem={mockGearItem}
        open={true}
        onOpenChange={mockOnOpenChange}
        onDeleted={mockOnDeleted}
      />,
    );

    expect(screen.getByText('האם למחוק את פריט הציוד?')).toBeInTheDocument();
  });

  it('should show gear item name in description', () => {
    render(
      <GearDeleteDialog
        gearItem={mockGearItem}
        open={true}
        onOpenChange={mockOnOpenChange}
        onDeleted={mockOnDeleted}
      />,
    );

    expect(
      screen.getByText(/פעולה זו תמחק את "אוהל משפחתי"/),
    ).toBeInTheDocument();
  });

  it('should show warning when item has assignments', () => {
    render(
      <GearDeleteDialog
        gearItem={mockGearItem}
        open={true}
        onOpenChange={mockOnOpenChange}
        onDeleted={mockOnDeleted}
      />,
    );

    expect(screen.getByText(/קיימות 1 הקצאות לפריט זה/)).toBeInTheDocument();
  });

  it('should not show warning when item has no assignments', () => {
    const gearItemWithoutAssignments = {
      ...mockGearItem,
      assignments: [],
    };

    render(
      <GearDeleteDialog
        gearItem={gearItemWithoutAssignments}
        open={true}
        onOpenChange={mockOnOpenChange}
        onDeleted={mockOnDeleted}
      />,
    );

    expect(screen.queryByText(/קיימות.*הקצאות/)).not.toBeInTheDocument();
  });

  it('should delete gear item when confirmed', async () => {
    vi.mocked(deleteGearItem).mockResolvedValue({ message: 'Deleted' });
    const user = userEvent.setup();

    render(
      <GearDeleteDialog
        gearItem={mockGearItem}
        open={true}
        onOpenChange={mockOnOpenChange}
        onDeleted={mockOnDeleted}
      />,
    );

    await user.click(screen.getByText('מחק'));

    await waitFor(() => {
      expect(deleteGearItem).toHaveBeenCalledWith('gear-1');
    });

    expect(mockOnDeleted).toHaveBeenCalledWith('gear-1');
    expect(mockToast).toHaveBeenCalledWith({
      title: 'פריט נמחק בהצלחה',
      description: 'פריט "אוהל משפחתי" הוסר מרשימת הציוד',
    });
  });

  it('should not delete when cancel is clicked', async () => {
    const user = userEvent.setup();

    render(
      <GearDeleteDialog
        gearItem={mockGearItem}
        open={true}
        onOpenChange={mockOnOpenChange}
        onDeleted={mockOnDeleted}
      />,
    );

    await user.click(screen.getByText('ביטול'));

    expect(deleteGearItem).not.toHaveBeenCalled();
    expect(mockOnDeleted).not.toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    vi.mocked(deleteGearItem).mockRejectedValue(new Error('API Error'));
    const user = userEvent.setup();

    render(
      <GearDeleteDialog
        gearItem={mockGearItem}
        open={true}
        onOpenChange={mockOnOpenChange}
        onDeleted={mockOnDeleted}
      />,
    );

    await user.click(screen.getByText('מחק'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'שגיאה',
        description: 'API Error',
        variant: 'destructive',
      });
    });

    expect(mockOnDeleted).not.toHaveBeenCalled();
  });

  it('should disable buttons while loading', async () => {
    vi.mocked(deleteGearItem).mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();

    render(
      <GearDeleteDialog
        gearItem={mockGearItem}
        open={true}
        onOpenChange={mockOnOpenChange}
        onDeleted={mockOnDeleted}
      />,
    );

    await user.click(screen.getByText('מחק'));

    await waitFor(() => {
      expect(screen.getByText('מוחק...')).toBeInTheDocument();
      expect(screen.getByText('ביטול')).toBeDisabled();
    });
  });
});
