import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AttendanceMarker } from '@/components/trip/AttendanceMarker';
import * as api from '@/lib/api';
import type { Trip } from '@/types/trip';

vi.mock('@/lib/api');

const mockTrip: Trip = {
  id: '1',
  name: 'טיול לעין גדי',
  location: 'עין גדי',
  description: 'טיול משפחתי',
  startDate: '2024-12-15T00:00:00.000Z',
  endDate: '2024-12-16T00:00:00.000Z',
  attendanceCutoffDate: '2024-12-10T00:00:00.000Z',
  draft: false,
  createdAt: '2024-10-01T00:00:00.000Z',
  updatedAt: '2024-10-01T00:00:00.000Z',
  admins: [],
  attendees: [],
  gearItems: [],
};

describe('AttendanceMarker', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders attendance checkbox with initial value', () => {
    render(
      <AttendanceMarker
        trip={mockTrip}
        familyId="family1"
        isAttending={true}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('allows toggling attendance before cutoff date', async () => {
    const user = userEvent.setup();
    const futureTrip = {
      ...mockTrip,
      attendanceCutoffDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };

    render(
      <AttendanceMarker
        trip={futureTrip}
        familyId="family1"
        isAttending={false}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeDisabled();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('disables editing after cutoff date', () => {
    const pastTrip = {
      ...mockTrip,
      attendanceCutoffDate: new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };

    render(
      <AttendanceMarker
        trip={pastTrip}
        familyId="family1"
        isAttending={false}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();

    expect(
      screen.getByText(/תאריך הרשמה אחרון עבר/),
    ).toBeInTheDocument();
  });

  it('submits attendance update successfully', async () => {
    const user = userEvent.setup();
    const futureTrip = {
      ...mockTrip,
      attendanceCutoffDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };

    vi.mocked(api.markTripAttendance).mockResolvedValue(futureTrip);

    render(
      <AttendanceMarker
        trip={futureTrip}
        familyId="family1"
        isAttending={false}
        onUpdate={mockOnUpdate}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    const saveButton = screen.getByRole('button', {
      name: /שמירת סטטוס השתתפות/,
    });
    await user.click(saveButton);

    await waitFor(() => {
      expect(api.markTripAttendance).toHaveBeenCalledWith('1', {
        familyId: 'family1',
        attending: true,
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/סטטוס ההשתתפות נשמר בהצלחה!/)).toBeInTheDocument();
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('displays error message on submission failure', async () => {
    const user = userEvent.setup();
    const futureTrip = {
      ...mockTrip,
      attendanceCutoffDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };

    const errorMessage = 'שגיאת שרת';
    vi.mocked(api.markTripAttendance).mockRejectedValue(
      new Error(errorMessage),
    );

    render(
      <AttendanceMarker
        trip={futureTrip}
        familyId="family1"
        isAttending={false}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    const saveButton = screen.getByRole('button', {
      name: /שמירת סטטוס השתתפות/,
    });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('disables save button while submitting', async () => {
    const user = userEvent.setup();
    const futureTrip = {
      ...mockTrip,
      attendanceCutoffDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };

    let resolveSubmit: () => void;
    const submitPromise = new Promise<Trip>((resolve) => {
      resolveSubmit = () => resolve(futureTrip);
    });
    vi.mocked(api.markTripAttendance).mockReturnValue(submitPromise);

    render(
      <AttendanceMarker
        trip={futureTrip}
        familyId="family1"
        isAttending={false}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    const saveButton = screen.getByRole('button', {
      name: /שמירת סטטוס השתתפות/,
    });
    await user.click(saveButton);

    await waitFor(() => {
      expect(saveButton).toBeDisabled();
      expect(screen.getByText(/שומר.../)).toBeInTheDocument();
    });

    resolveSubmit!();

    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });
  });

  it('disables editing for draft trips', () => {
    const draftTrip = {
      ...mockTrip,
      draft: true,
      attendanceCutoffDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };

    render(
      <AttendanceMarker
        trip={draftTrip}
        familyId="family1"
        isAttending={false}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });
});
