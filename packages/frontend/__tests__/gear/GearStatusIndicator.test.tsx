import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GearStatusIndicator from '@/components/gear/GearStatusIndicator';
import { GearItem } from '@/types/gear';

describe('GearStatusIndicator', () => {
  const baseGearItem: GearItem = {
    id: 'gear-1',
    tripId: 'trip-1',
    name: 'אוהל',
    quantityNeeded: 5,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    assignments: [],
  };

  it('should show "לא הוקצה" for unassigned gear', () => {
    render(<GearStatusIndicator gearItem={baseGearItem} />);

    expect(screen.getByText('לא הוקצה')).toBeInTheDocument();
  });

  it('should show "הוקצה חלקית" for partially assigned gear', () => {
    const gearItem: GearItem = {
      ...baseGearItem,
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

    render(<GearStatusIndicator gearItem={gearItem} />);

    expect(screen.getByText('הוקצה חלקית')).toBeInTheDocument();
  });

  it('should show "הוקצה במלואו" for fully assigned gear', () => {
    const gearItem: GearItem = {
      ...baseGearItem,
      assignments: [
        {
          id: 'assign-1',
          gearItemId: 'gear-1',
          familyId: 'family-1',
          quantityAssigned: 5,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          family: {
            id: 'family-1',
            members: [],
          },
        },
      ],
    };

    render(<GearStatusIndicator gearItem={gearItem} />);

    expect(screen.getByText('הוקצה במלואו')).toBeInTheDocument();
  });

  it('should show "הוקצה במלואו" for over-assigned gear', () => {
    const gearItem: GearItem = {
      ...baseGearItem,
      assignments: [
        {
          id: 'assign-1',
          gearItemId: 'gear-1',
          familyId: 'family-1',
          quantityAssigned: 7,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          family: {
            id: 'family-1',
            members: [],
          },
        },
      ],
    };

    render(<GearStatusIndicator gearItem={gearItem} />);

    expect(screen.getByText('הוקצה במלואו')).toBeInTheDocument();
  });

  it('should not show icon when showIcon is false', () => {
    const { container } = render(
      <GearStatusIndicator gearItem={baseGearItem} showIcon={false} />,
    );

    const icons = container.querySelectorAll('svg');
    expect(icons).toHaveLength(0);
  });

  it('should show icon by default', () => {
    const { container } = render(
      <GearStatusIndicator gearItem={baseGearItem} />,
    );

    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
});
