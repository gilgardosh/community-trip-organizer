import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { UserRoleManagement } from '@/components/admin/UserRoleManagement';
import * as api from '@/lib/api';

// Mock the API
vi.mock('@/lib/api');
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('UserRoleManagement', () => {
  const mockUsers = [
    {
      id: '1',
      name: 'משתמש ראשון',
      email: 'user1@example.com',
      role: 'FAMILY' as const,
      familyId: 'family1',
      type: 'adult' as const,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'מנהל טיול',
      email: 'admin@example.com',
      role: 'TRIP_ADMIN' as const,
      familyId: 'family2',
      type: 'adult' as const,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.getAllUsers).mockResolvedValue(mockUsers);
  });

  it('renders user role management component', async () => {
    render(<UserRoleManagement />);

    await waitFor(() => {
      expect(screen.getByText('ניהול תפקידי משתמשים')).toBeInTheDocument();
    });
  });

  it('displays list of users', async () => {
    render(<UserRoleManagement />);

    await waitFor(() => {
      expect(screen.getByText('משתמש ראשון')).toBeInTheDocument();
      expect(screen.getAllByText('מנהל טיול').length).toBeGreaterThan(0);
    });
  });

  it('filters users by search term', async () => {
    render(<UserRoleManagement />);

    await waitFor(() => {
      expect(screen.getByText('משתמש ראשון')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'חיפוש לפי שם או אימייל...',
    );
    fireEvent.change(searchInput, { target: { value: 'admin' } });

    await waitFor(() => {
      expect(screen.queryByText('משתמש ראשון')).not.toBeInTheDocument();
      expect(screen.getAllByText('מנהל טיול').length).toBeGreaterThan(0);
    });
  });

  it('opens role update dialog when clicking change role', async () => {
    render(<UserRoleManagement />);

    await waitFor(() => {
      expect(screen.getByText('משתמש ראשון')).toBeInTheDocument();
    });

    const changeRoleButtons = screen.getAllByText('שנה תפקיד');
    fireEvent.click(changeRoleButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('עדכון תפקיד משתמש')).toBeInTheDocument();
    });
  });

  it('updates user role successfully', async () => {
    vi.mocked(api.updateUserRole).mockResolvedValue({
      ...mockUsers[0],
      role: 'TRIP_ADMIN',
    });

    render(<UserRoleManagement />);

    await waitFor(() => {
      expect(screen.getByText('משתמש ראשון')).toBeInTheDocument();
    });

    const changeRoleButtons = screen.getAllByText('שנה תפקיד');
    fireEvent.click(changeRoleButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('עדכון תפקיד משתמש')).toBeInTheDocument();
    });

    // Select the dropdown trigger and click it
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    // Wait for options to appear and select one
    await waitFor(() => {
      const tripAdminOption = screen.getByRole('option', { name: 'מנהל טיול' });
      fireEvent.click(tripAdminOption);
    });

    // Now the update button should be enabled and we can click it
    const updateButton = screen.getByText('עדכן תפקיד');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(api.updateUserRole).toHaveBeenCalledWith('1', expect.any(Object));
    });
  });

  it('shows loading state while fetching users', () => {
    vi.mocked(api.getAllUsers).mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    render(<UserRoleManagement />);

    expect(screen.getByText('טוען משתמשים...')).toBeInTheDocument();
  });

  it('displays role badges correctly', async () => {
    render(<UserRoleManagement />);

    await waitFor(() => {
      expect(screen.getAllByText('משפחה').length).toBeGreaterThan(0);
      expect(screen.getAllByText('מנהל טיול').length).toBeGreaterThan(0);
    });
  });
});
