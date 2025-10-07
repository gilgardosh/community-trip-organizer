import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TripForm } from '@/components/trip/TripForm';
import type { Trip, CreateTripData } from '@/types/trip';

// Mock trip data
const mockTrip: Trip = {
  id: '1',
  name: 'טיול לעין גדי',
  location: 'עין גדי, ים המלח',
  description: 'טיול משפחתי מרגש',
  startDate: '2024-12-15T00:00:00.000Z',
  endDate: '2024-12-16T00:00:00.000Z',
  attendanceCutoffDate: '2024-12-10T00:00:00.000Z',
  photoAlbumLink: 'https://photos.google.com/share/example',
  draft: true,
  createdAt: '2024-10-01T00:00:00.000Z',
  updatedAt: '2024-10-01T00:00:00.000Z',
  admins: [],
  attendees: [],
  gearItems: [],
};

describe('TripForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty form for creating new trip', () => {
    render(<TripForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('יצירת טיול חדש')).toBeInTheDocument();
    expect(screen.getByLabelText(/שם הטיול/)).toHaveValue('');
    expect(screen.getByLabelText(/מיקום/)).toHaveValue('');
  });

  it('renders form with trip data for editing', () => {
    render(<TripForm trip={mockTrip} onSubmit={mockOnSubmit} isEditing={true} />);

    expect(screen.getByText('עריכת טיול')).toBeInTheDocument();
    expect(screen.getByLabelText(/שם הטיול/)).toHaveValue(mockTrip.name);
    expect(screen.getByLabelText(/מיקום/)).toHaveValue(mockTrip.location);
    expect(screen.getByLabelText(/תיאור/)).toHaveValue(mockTrip.description);
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<TripForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /שמירה/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('שם הטיול הוא שדה חובה')).toBeInTheDocument();
      expect(screen.getByText('מיקום הוא שדה חובה')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates date range', async () => {
    const user = userEvent.setup();
    render(<TripForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/שם הטיול/), 'טיול בדיקה');
    await user.type(screen.getByLabelText(/מיקום/), 'תל אביב');
    await user.type(screen.getByLabelText(/תאריך התחלה/), '2024-12-20');
    await user.type(screen.getByLabelText(/תאריך סיום/), '2024-12-15');

    const submitButton = screen.getByRole('button', { name: /שמירה/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('תאריך הסיום חייב להיות אחרי תאריך ההתחלה'),
      ).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates attendance cutoff date', async () => {
    const user = userEvent.setup();
    render(<TripForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/שם הטיול/), 'טיול בדיקה');
    await user.type(screen.getByLabelText(/מיקום/), 'תל אביב');
    await user.type(screen.getByLabelText(/תאריך התחלה/), '2024-12-15');
    await user.type(screen.getByLabelText(/תאריך סיום/), '2024-12-20');
    await user.type(screen.getByLabelText(/תאריך הרשמה אחרון/), '2024-12-16');

    const submitButton = screen.getByRole('button', { name: /שמירה/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'תאריך הרשמה אחרון חייב להיות לפני תאריך התחלת הטיול',
        ),
      ).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates URL format', async () => {
    const user = userEvent.setup();
    render(<TripForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/שם הטיול/), 'טיול בדיקה');
    await user.type(screen.getByLabelText(/מיקום/), 'תל אביב');
    await user.type(screen.getByLabelText(/תאריך התחלה/), '2024-12-15');
    await user.type(screen.getByLabelText(/תאריך סיום/), '2024-12-20');
    await user.type(
      screen.getByLabelText(/קישור לאלבום תמונות/),
      'invalid url',
    );

    const submitButton = screen.getByRole('button', { name: /שמירה/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('כתובת URL לא תקינה')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid form data', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(<TripForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/שם הטיול/), 'טיול חדש');
    await user.type(screen.getByLabelText(/מיקום/), 'ירושלים');
    await user.type(screen.getByLabelText(/תיאור/), 'טיול מעניין');
    await user.type(screen.getByLabelText(/תאריך התחלה/), '2024-12-15');
    await user.type(screen.getByLabelText(/תאריך סיום/), '2024-12-20');
    await user.type(screen.getByLabelText(/תאריך הרשמה אחרון/), '2024-12-10');
    await user.type(
      screen.getByLabelText(/קישור לאלבום תמונות/),
      'https://photos.google.com/share/example',
    );

    const submitButton = screen.getByRole('button', { name: /שמירה/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'טיול חדש',
        location: 'ירושלים',
        description: 'טיול מעניין',
        startDate: '2024-12-15',
        endDate: '2024-12-20',
        attendanceCutoffDate: '2024-12-10',
        photoAlbumLink: 'https://photos.google.com/share/example',
      });
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<TripForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /ביטול/ });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('displays error message on submission failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'שגיאת שרת';
    mockOnSubmit.mockRejectedValue(new Error(errorMessage));

    render(<TripForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/שם הטיול/), 'טיול חדש');
    await user.type(screen.getByLabelText(/מיקום/), 'ירושלים');
    await user.type(screen.getByLabelText(/תאריך התחלה/), '2024-12-15');
    await user.type(screen.getByLabelText(/תאריך סיום/), '2024-12-20');

    const submitButton = screen.getByRole('button', { name: /שמירה/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    mockOnSubmit.mockReturnValue(submitPromise);

    render(<TripForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/שם הטיול/), 'טיול חדש');
    await user.type(screen.getByLabelText(/מיקום/), 'ירושלים');
    await user.type(screen.getByLabelText(/תאריך התחלה/), '2024-12-15');
    await user.type(screen.getByLabelText(/תאריך סיום/), '2024-12-20');

    const submitButton = screen.getByRole('button', { name: /שמירה/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/שומר.../)).toBeInTheDocument();
    });

    resolveSubmit!();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
