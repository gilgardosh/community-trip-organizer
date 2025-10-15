import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GearItem from '@/components/gear/GearItem';
import { GearItem as GearItemType } from '@/types/gear';

// Mock child components
vi.mock('@/components/gear/GearStatusIndicator', () => ({
  default: () => <div data-testid="status-indicator">Status</div>,
}));

vi.mock('@/components/gear/GearEditDialog', () => ({
  default: ({ open, onUpdated }: any) =>
    open ? (
      <div data-testid="edit-dialog">
        <button onClick={() => onUpdated({ id: 'updated' })}>Update</button>
      </div>
    ) : null,
}));

vi.mock('@/components/gear/GearDeleteDialog', () => ({
  default: ({ open, onDeleted, gearItem }: any) =>
    open ? (
      <div data-testid="delete-dialog">
        <button onClick={() => onDeleted(gearItem.id)}>Delete</button>
      </div>
    ) : null,
}));

vi.mock('@/components/gear/GearAssignmentList', () => ({
  default: ({ assignments }: any) => (
    <div data-testid="assignment-list">{assignments.length} assignments</div>
  ),
}));

describe('GearItem', () => {
  const mockGearItem: GearItemType = {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render gear item name', () => {
    render(<GearItem gearItem={mockGearItem} />);

    expect(screen.getByText('אוהל משפחתי')).toBeInTheDocument();
  });

  it('should render status indicator', () => {
    render(<GearItem gearItem={mockGearItem} />);

    expect(screen.getByTestId('status-indicator')).toBeInTheDocument();
  });

  it('should show quantity needed and assigned', () => {
    render(<GearItem gearItem={mockGearItem} />);

    expect(screen.getByText(/נדרש:/)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText(/הוקצה:/)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should show remaining quantity when not fully assigned', () => {
    render(<GearItem gearItem={mockGearItem} />);

    expect(screen.getByText(/חסר:/)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should not show remaining quantity when fully assigned', () => {
    const fullyAssignedItem: GearItemType = {
      ...mockGearItem,
      assignments: [
        {
          ...mockGearItem.assignments[0],
          quantityAssigned: 5,
        },
      ],
    };

    render(<GearItem gearItem={fullyAssignedItem} />);

    expect(screen.queryByText(/חסר:/)).not.toBeInTheDocument();
  });

  it('should show assignments toggle button when has assignments', () => {
    render(<GearItem gearItem={mockGearItem} />);

    expect(screen.getByText(/הצג משפחות \(1\)/)).toBeInTheDocument();
  });

  it('should not show assignments toggle when no assignments', () => {
    const itemWithoutAssignments: GearItemType = {
      ...mockGearItem,
      assignments: [],
    };

    render(<GearItem gearItem={itemWithoutAssignments} />);

    expect(screen.queryByText(/הצג משפחות/)).not.toBeInTheDocument();
  });

  it('should toggle assignments visibility', async () => {
    const user = userEvent.setup();

    render(<GearItem gearItem={mockGearItem} />);

    // Initially hidden
    expect(screen.queryByTestId('assignment-list')).not.toBeInTheDocument();

    // Click to show
    await user.click(screen.getByText(/הצג משפחות/));

    await waitFor(() => {
      expect(screen.getByTestId('assignment-list')).toBeInTheDocument();
    });

    // Click to hide
    await user.click(screen.getByText(/הסתר משפחות/));

    await waitFor(() => {
      expect(screen.queryByTestId('assignment-list')).not.toBeInTheDocument();
    });
  });

  it('should not show management buttons when canManage is false', () => {
    render(<GearItem gearItem={mockGearItem} canManage={false} />);

    const editButtons = screen.queryAllByRole('button', { name: /edit/i });
    const deleteButtons = screen.queryAllByRole('button', { name: /trash/i });

    expect(editButtons.length).toBe(0);
    expect(deleteButtons.length).toBe(0);
  });

  it('should show management buttons when canManage is true', () => {
    render(<GearItem gearItem={mockGearItem} canManage={true} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should open edit dialog when edit button is clicked', async () => {
    const user = userEvent.setup();

    render(<GearItem gearItem={mockGearItem} canManage={true} />);

    const buttons = screen.getAllByRole('button');
    const editButton = buttons.find((btn) =>
      btn.querySelector('[class*="Edit"]'),
    );

    if (editButton) {
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('edit-dialog')).toBeInTheDocument();
      });
    }
  });

  it('should call onUpdate when item is updated', async () => {
    const mockOnUpdate = vi.fn();
    const user = userEvent.setup();

    render(
      <GearItem
        gearItem={mockGearItem}
        canManage={true}
        onUpdate={mockOnUpdate}
      />,
    );

    const buttons = screen.getAllByRole('button');
    const editButton = buttons.find((btn) =>
      btn.querySelector('[class*="Edit"]'),
    );

    if (editButton) {
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('edit-dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Update'));

      expect(mockOnUpdate).toHaveBeenCalledWith({ id: 'updated' });
    }
  });

  it('should call onDelete when item is deleted', async () => {
    const mockOnDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <GearItem
        gearItem={mockGearItem}
        canManage={true}
        onDelete={mockOnDelete}
      />,
    );

    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons.find((btn) =>
      btn.querySelector('[class*="Trash"]'),
    );

    if (deleteButton) {
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Delete'));

      expect(mockOnDelete).toHaveBeenCalledWith('gear-1');
    }
  });
});
