import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GearAssignmentList from '@/components/gear/GearAssignmentList';
import { GearAssignment } from '@/types/gear';

describe('GearAssignmentList', () => {
  const mockAssignments: GearAssignment[] = [
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
    {
      id: 'assign-2',
      gearItemId: 'gear-1',
      familyId: 'family-2',
      quantityAssigned: 3,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      family: {
        id: 'family-2',
        name: 'משפחת לוי',
        members: [],
      },
    },
  ];

  it('should render empty state when no assignments', () => {
    render(<GearAssignmentList assignments={[]} />);

    expect(screen.getByText('אין משפחות שהתנדבו עדיין')).toBeInTheDocument();
  });

  it('should render list of assignments', () => {
    render(<GearAssignmentList assignments={mockAssignments} />);

    expect(screen.getByText('משפחת כהן')).toBeInTheDocument();
    expect(screen.getByText('משפחת לוי')).toBeInTheDocument();
  });

  it('should show assigned quantities', () => {
    render(<GearAssignmentList assignments={mockAssignments} />);

    expect(screen.getByText("2 יח'")).toBeInTheDocument();
    expect(screen.getByText("3 יח'")).toBeInTheDocument();
  });

  it('should use family name when available', () => {
    render(<GearAssignmentList assignments={mockAssignments} />);

    expect(screen.getByText('משפחת כהן')).toBeInTheDocument();
  });

  it('should use adult name when family has no name', () => {
    const assignmentsWithoutFamilyName: GearAssignment[] = [
      {
        id: 'assign-1',
        gearItemId: 'gear-1',
        familyId: 'family-1',
        quantityAssigned: 2,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        family: {
          id: 'family-1',
          members: [
            {
              id: 'member-1',
              type: 'adult',
              name: 'דוד כהן',
            },
          ],
        },
      },
    ];

    render(<GearAssignmentList assignments={assignmentsWithoutFamilyName} />);

    expect(screen.getByText('דוד כהן')).toBeInTheDocument();
  });

  it('should show fallback text when no name available', () => {
    const assignmentsWithoutNames: GearAssignment[] = [
      {
        id: 'assign-1',
        gearItemId: 'gear-1',
        familyId: 'family-1',
        quantityAssigned: 2,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        family: {
          id: 'family-1',
          members: [],
        },
      },
    ];

    render(<GearAssignmentList assignments={assignmentsWithoutNames} />);

    expect(screen.getByText('משפחה ללא שם')).toBeInTheDocument();
  });

  it('should render in compact mode when specified', () => {
    const { container } = render(
      <GearAssignmentList assignments={mockAssignments} compact={true} />,
    );

    // Check for compact styling (text-xs class)
    const compactElements = container.querySelectorAll('.text-xs');
    expect(compactElements.length).toBeGreaterThan(0);
  });

  it('should render in normal mode by default', () => {
    const { container } = render(
      <GearAssignmentList assignments={mockAssignments} />,
    );

    // Check for normal styling (text-sm class)
    const normalElements = container.querySelectorAll('.text-sm');
    expect(normalElements.length).toBeGreaterThan(0);
  });
});
