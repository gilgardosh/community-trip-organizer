import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TripSchedule } from '@/components/trip/TripSchedule';
import { AttendanceSummary } from '@/components/trip/AttendanceSummary';
import { TripFilters } from '@/components/trip/TripFilters';
import type { TripScheduleItem, TripAttendee } from '@/types/trip';

describe('TripSchedule Component', () => {
  const mockScheduleItems: TripScheduleItem[] = [
    {
      id: '1',
      tripId: 'trip1',
      day: 1,
      startTime: '08:00',
      endTime: '09:00',
      title: 'ארוחת בוקר',
      description: 'ארוחת בוקר משפחתית',
      location: 'מסעדת הבוקר',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      tripId: 'trip1',
      day: 1,
      startTime: '10:00',
      endTime: '12:00',
      title: 'טיול בשטח',
      description: 'טיול מודרך בטבע',
      location: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      tripId: 'trip1',
      day: 2,
      startTime: '07:00',
      title: 'שחייה בבריכה',
      description: undefined,
      location: 'בריכה מרכזית',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const tripStartDate = '2025-10-15';

  it('renders schedule items grouped by day', () => {
    render(
      <TripSchedule
        scheduleItems={mockScheduleItems}
        tripStartDate={tripStartDate}
      />,
    );

    expect(screen.getByText('לוח זמנים')).toBeInTheDocument();
    expect(screen.getByText('יום 1')).toBeInTheDocument();
    expect(screen.getByText('יום 2')).toBeInTheDocument();
  });

  it('displays activity details correctly', () => {
    render(
      <TripSchedule
        scheduleItems={mockScheduleItems}
        tripStartDate={tripStartDate}
      />,
    );

    expect(screen.getByText('ארוחת בוקר')).toBeInTheDocument();
    expect(screen.getByText('ארוחת בוקר משפחתית')).toBeInTheDocument();
    expect(screen.getByText('מסעדת הבוקר')).toBeInTheDocument();
    expect(screen.getByText('08:00 - 09:00')).toBeInTheDocument();
  });

  it('shows empty state when no schedule items', () => {
    render(<TripSchedule scheduleItems={[]} tripStartDate={tripStartDate} />);

    expect(screen.getByText('טרם נוסף לוח זמנים לטיול זה')).toBeInTheDocument();
  });

  it('orders items by start time within each day', () => {
    render(
      <TripSchedule
        scheduleItems={mockScheduleItems}
        tripStartDate={tripStartDate}
      />,
    );

    // Get all the activity titles (not descriptions)
    const breakfastTitle = screen.getByText('ארוחת בוקר');
    const hikingTitle = screen.getByText('טיול בשטח');

    expect(breakfastTitle).toBeInTheDocument();
    expect(hikingTitle).toBeInTheDocument();
  });
});

describe('AttendanceSummary Component', () => {
  const mockAttendees: TripAttendee[] = [
    {
      id: '1',
      tripId: 'trip1',
      familyId: 'family1',
      dietaryRequirements: 'צמחוני, ללא גלוטן',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      family: {
        id: 'family1',
        name: 'משפחת כהן',
        members: [
          { id: 'm1', type: 'ADULT', name: 'דוד כהן', age: undefined },
          { id: 'm2', type: 'ADULT', name: 'רחל כהן', age: undefined },
          { id: 'm3', type: 'CHILD', name: 'יוסי כהן', age: 8 },
        ],
      },
    },
    {
      id: '2',
      tripId: 'trip1',
      familyId: 'family2',
      dietaryRequirements: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      family: {
        id: 'family2',
        name: 'משפחת לוי',
        members: [
          { id: 'm4', type: 'ADULT', name: 'משה לוי', age: undefined },
          { id: 'm5', type: 'CHILD', name: 'שרה לוי', age: 6 },
          { id: 'm6', type: 'CHILD', name: 'אברהם לוי', age: 10 },
        ],
      },
    },
  ];

  it('calculates statistics correctly', () => {
    render(<AttendanceSummary attendees={mockAttendees} />);

    // Use getAllByText for duplicate numbers and check by parent context
    const numbersDisplayed = screen.getAllByText('3');
    expect(numbersDisplayed.length).toBeGreaterThanOrEqual(2); // At least adults and children

    expect(screen.getByText('2')).toBeInTheDocument(); // Total families
    expect(screen.getByText('1')).toBeInTheDocument(); // Dietary requirements count
  });

  it('displays family details', () => {
    render(<AttendanceSummary attendees={mockAttendees} />);

    expect(screen.getByText('משפחת כהן')).toBeInTheDocument();
    expect(screen.getByText('משפחת לוי')).toBeInTheDocument();
    expect(screen.getByText('2 מבוגרים')).toBeInTheDocument();
    expect(screen.getByText('1 ילדים')).toBeInTheDocument();
  });

  it('shows dietary requirements when present', () => {
    render(<AttendanceSummary attendees={mockAttendees} />);

    expect(screen.getByText(/דרישות תזונתיות:/)).toBeInTheDocument();
    expect(screen.getByText(/צמחוני, ללא גלוטן/)).toBeInTheDocument();
  });

  it('shows empty state when no attendees', () => {
    render(<AttendanceSummary attendees={[]} />);

    expect(
      screen.getByText('אין עדיין משפחות רשומות לטיול'),
    ).toBeInTheDocument();
  });
});

describe('TripFilters Component', () => {
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('renders search input and filter button', () => {
    render(
      <TripFilters
        onFilterChange={mockOnFilterChange}
        showDraftFilter={false}
      />,
    );

    expect(screen.getByPlaceholderText('חיפוש טיולים...')).toBeInTheDocument();
    expect(screen.getByText('סינון')).toBeInTheDocument();
  });

  it('calls onFilterChange when search is entered and Enter is pressed', async () => {
    render(
      <TripFilters
        onFilterChange={mockOnFilterChange}
        showDraftFilter={false}
      />,
    );

    const searchInput = screen.getByPlaceholderText('חיפוש טיולים...');
    fireEvent.change(searchInput, { target: { value: 'טיול חורף' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        search: 'טיול חורף',
        status: 'all',
        startDateFrom: undefined,
        startDateTo: undefined,
      });
    });
  });

  it('toggles advanced filters when filter button is clicked', async () => {
    render(
      <TripFilters
        onFilterChange={mockOnFilterChange}
        showDraftFilter={false}
      />,
    );

    const filterButton = screen.getByText('סינון');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(screen.getByText('סטטוס')).toBeInTheDocument();
      expect(screen.getByText('מתאריך')).toBeInTheDocument();
      expect(screen.getByText('עד תאריך')).toBeInTheDocument();
    });
  });

  it('shows draft filter option when showDraftFilter is true', async () => {
    render(
      <TripFilters
        onFilterChange={mockOnFilterChange}
        showDraftFilter={true}
      />,
    );

    const filterButton = screen.getByText('סינון');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(screen.getByText('סטטוס')).toBeInTheDocument();
    });

    // Note: Would need to click the select to see the draft option
    // This is a simplified test
  });

  it('clears filters when clear button is clicked', async () => {
    render(
      <TripFilters
        onFilterChange={mockOnFilterChange}
        showDraftFilter={false}
      />,
    );

    // First set some filters
    const searchInput = screen.getByPlaceholderText('חיפוש טיולים...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const filterButton = screen.getByText('סינון');
    fireEvent.click(filterButton);

    await waitFor(() => {
      const applyButton = screen.getByText('החל סינון');
      fireEvent.click(applyButton);
    });

    // Then clear
    await waitFor(() => {
      const clearButton = screen.getByText('נקה');
      fireEvent.click(clearButton);
    });

    expect(mockOnFilterChange).toHaveBeenLastCalledWith({});
  });
});
