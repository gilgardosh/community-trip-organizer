import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GearCreateDialog from '@/components/gear/GearCreateDialog';
import { createGearItem } from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
  createGearItem: vi.fn(),
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('GearCreateDialog', () => {
  const mockOnCreated = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    render(
      <GearCreateDialog
        tripId="trip-1"
        open={false}
        onOpenChange={mockOnOpenChange}
        onCreated={mockOnCreated}
      />
    );
    
    expect(screen.queryByText('הוסף פריט ציוד')).not.toBeInTheDocument();
  });

  it('should render when open is true', () => {
    render(
      <GearCreateDialog
        tripId="trip-1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onCreated={mockOnCreated}
      />
    );
    
    expect(screen.getByText('הוסף פריט ציוד')).toBeInTheDocument();
  });

  it('should have name and quantity inputs', () => {
    render(
      <GearCreateDialog
        tripId="trip-1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onCreated={mockOnCreated}
      />
    );
    
    expect(screen.getByLabelText(/שם הפריט/)).toBeInTheDocument();
    expect(screen.getByLabelText(/כמות נדרשת/)).toBeInTheDocument();
  });

  it('should create gear item on form submit', async () => {
    const newGearItem = {
      id: 'gear-1',
      tripId: 'trip-1',
      name: 'אוהל משפחתי',
      quantityNeeded: 3,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      assignments: [],
    };
    
    vi.mocked(createGearItem).mockResolvedValue(newGearItem);
    const user = userEvent.setup();
    
    render(
      <GearCreateDialog
        tripId="trip-1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onCreated={mockOnCreated}
      />
    );
    
    const nameInput = screen.getByLabelText(/שם הפריט/);
    const quantityInput = screen.getByLabelText(/כמות נדרשת/);
    
    await user.clear(nameInput);
    await user.type(nameInput, 'אוהל משפחתי');
    
    // Triple-click to select all, then type to replace
    await user.tripleClick(quantityInput);
    await user.keyboard('3');
    
    await user.click(screen.getByText('צור פריט'));
    
    await waitFor(() => {
      expect(createGearItem).toHaveBeenCalledWith({
        tripId: 'trip-1',
        name: 'אוהל משפחתי',
        quantityNeeded: 3,
      });
    });
    
    expect(mockOnCreated).toHaveBeenCalledWith(newGearItem);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'פריט נוצר בהצלחה',
      description: 'פריט "אוהל משפחתי" נוסף לרשימת הציוד',
    });
  });

  it('should not submit when name is empty (HTML5 validation)', async () => {
    const user = userEvent.setup();
    
    render(
      <GearCreateDialog
        tripId="trip-1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onCreated={mockOnCreated}
      />
    );
    
    const submitButton = screen.getByText('צור פריט');
    await user.click(submitButton);
    
    // Form should not submit due to HTML5 required validation
    expect(createGearItem).not.toHaveBeenCalled();
  });

  it('should validate quantity is at least 1', async () => {
    const user = userEvent.setup();
    
    render(
      <GearCreateDialog
        tripId="trip-1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onCreated={mockOnCreated}
      />
    );
    
    const nameInput = screen.getByLabelText(/שם הפריט/);
    const quantityInput = screen.getByLabelText(/כמות נדרשת/) as HTMLInputElement;
    
    await user.clear(nameInput);
    await user.type(nameInput, 'אוהל');
    
    // Verify the input has min="1" constraint
    expect(quantityInput).toHaveAttribute('min', '1');
    expect(quantityInput).toHaveAttribute('type', 'number');
  });

  it('should handle API errors', async () => {
    vi.mocked(createGearItem).mockRejectedValue(new Error('API Error'));
    const user = userEvent.setup();
    
    render(
      <GearCreateDialog
        tripId="trip-1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onCreated={mockOnCreated}
      />
    );
    
    await user.type(screen.getByLabelText(/שם הפריט/), 'אוהל');
    await user.click(screen.getByText('צור פריט'));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'שגיאה',
        description: 'API Error',
        variant: 'destructive',
      });
    });
  });
});
