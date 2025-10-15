import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GearEditDialog from '@/components/gear/GearEditDialog';
import { updateGearItem } from '@/lib/api';
import { GearItem } from '@/types/gear';

// Mock the API
vi.mock('@/lib/api', () => ({
  updateGearItem: vi.fn(),
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('GearEditDialog', () => {
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

  const mockOnUpdated = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    render(
      <GearEditDialog
        gearItem={mockGearItem}
        open={false}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    expect(screen.queryByText('ערוך פריט ציוד')).not.toBeInTheDocument();
  });

  it('should render when open is true', () => {
    render(
      <GearEditDialog
        gearItem={mockGearItem}
        open={true}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    expect(screen.getByText('ערוך פריט ציוד')).toBeInTheDocument();
  });

  it('should populate form with current values', () => {
    render(
      <GearEditDialog
        gearItem={mockGearItem}
        open={true}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    const nameInput = screen.getByLabelText(/שם הפריט/) as HTMLInputElement;
    const quantityInput = screen.getByLabelText(
      /כמות נדרשת/,
    ) as HTMLInputElement;

    expect(nameInput.value).toBe('אוהל משפחתי');
    expect(quantityInput.value).toBe('5');
  });

  it('should update gear item on form submit', async () => {
    const updatedGearItem = {
      ...mockGearItem,
      name: 'אוהל גדול',
      quantityNeeded: 7,
    };

    vi.mocked(updateGearItem).mockResolvedValue(updatedGearItem);
    const user = userEvent.setup();

    render(
      <GearEditDialog
        gearItem={mockGearItem}
        open={true}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    const nameInput = screen.getByLabelText(/שם הפריט/);
    const quantityInput = screen.getByLabelText(/כמות נדרשת/);

    await user.clear(nameInput);
    await user.type(nameInput, 'אוהל גדול');

    await user.tripleClick(quantityInput);
    await user.keyboard('7');

    await user.click(screen.getByText('עדכן'));

    await waitFor(() => {
      expect(updateGearItem).toHaveBeenCalledWith('gear-1', {
        name: 'אוהל גדול',
        quantityNeeded: 7,
      });
    });

    expect(mockOnUpdated).toHaveBeenCalledWith(updatedGearItem);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'פריט עודכן בהצלחה',
      description: 'פריט "אוהל גדול" עודכן',
    });
  });

  it('should prevent reducing quantity below assigned amount', async () => {
    const user = userEvent.setup();

    render(
      <GearEditDialog
        gearItem={mockGearItem}
        open={true}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    const quantityInput = screen.getByLabelText(
      /כמות נדרשת/,
    ) as HTMLInputElement;

    // Should have min set to totalAssigned (2)
    expect(quantityInput).toHaveAttribute('min', '2');
  });

  it('should show warning about assigned quantity', () => {
    render(
      <GearEditDialog
        gearItem={mockGearItem}
        open={true}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    expect(
      screen.getByText(/כבר הוקצו 2 יחידות - לא ניתן להקטין מתחת לכמות זו/),
    ).toBeInTheDocument();
  });

  it('should not show warning when no assignments', () => {
    const gearItemWithoutAssignments = {
      ...mockGearItem,
      assignments: [],
    };

    render(
      <GearEditDialog
        gearItem={gearItemWithoutAssignments}
        open={true}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    expect(screen.queryByText(/כבר הוקצו.*יחידות/)).not.toBeInTheDocument();
  });

  it('should handle API errors', async () => {
    vi.mocked(updateGearItem).mockRejectedValue(new Error('API Error'));
    const user = userEvent.setup();

    render(
      <GearEditDialog
        gearItem={mockGearItem}
        open={true}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    await user.click(screen.getByText('עדכן'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'שגיאה',
        description: 'API Error',
        variant: 'destructive',
      });
    });

    expect(mockOnUpdated).not.toHaveBeenCalled();
  });

  it('should disable inputs while loading', async () => {
    vi.mocked(updateGearItem).mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();

    render(
      <GearEditDialog
        gearItem={mockGearItem}
        open={true}
        onOpenChange={mockOnOpenChange}
        onUpdated={mockOnUpdated}
      />,
    );

    await user.click(screen.getByText('עדכן'));

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/שם הפריט/);
      const quantityInput = screen.getByLabelText(/כמות נדרשת/);

      expect(nameInput).toBeDisabled();
      expect(quantityInput).toBeDisabled();
    });
  });
});
