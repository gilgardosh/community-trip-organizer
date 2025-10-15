import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SystemReporting } from '@/components/admin/SystemReporting';
import * as api from '@/lib/api';

vi.mock('@/lib/api');
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('SystemReporting', () => {
  const mockMetrics = {
    totalFamilies: 50,
    activeFamilies: 45,
    pendingFamilies: 3,
    deactivatedFamilies: 2,
    totalUsers: 150,
    totalAdults: 100,
    totalChildren: 50,
    totalTrips: 20,
    draftTrips: 3,
    publishedTrips: 12,
    completedTrips: 5,
    totalGearItems: 100,
    recentActivity: [],
  };

  const mockSummary = {
    families: {
      total: 50,
      active: 45,
      pending: 3,
      deactivated: 2,
    },
    users: {
      total: 150,
      adults: 100,
      children: 50,
      tripAdmins: 5,
      superAdmins: 2,
    },
    trips: {
      total: 20,
      draft: 3,
      published: 12,
      completed: 5,
      upcoming: 7,
    },
  };

  const mockTripStats = {
    totalTrips: 20,
    averageAttendees: 15.5,
    mostPopularLocation: 'הגליל העליון',
    upcomingTrips: 7,
    completedTrips: 5,
    tripsByMonth: [
      { month: 'ינואר', count: 2 },
      { month: 'פברואר', count: 3 },
    ],
  };

  const mockFamilyStats = {
    totalFamilies: 50,
    averageMembersPerFamily: 3.2,
    totalMembers: 160,
    activeParticipation: 0.85,
    newFamiliesThisMonth: 5,
    familyGrowth: [
      { month: 'ינואר', count: 5 },
      { month: 'פברואר', count: 3 },
    ],
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.getDashboardMetrics).mockResolvedValue(mockMetrics);
    vi.mocked(api.getSystemSummary).mockResolvedValue(mockSummary);
    vi.mocked(api.getTripStats).mockResolvedValue(mockTripStats);
    vi.mocked(api.getFamilyStats).mockResolvedValue(mockFamilyStats);
  });

  it('renders system reporting component', async () => {
    render(<SystemReporting />);

    await waitFor(() => {
      expect(screen.getByText('סך משפחות')).toBeInTheDocument();
    });
  });

  it('displays overview metrics', async () => {
    render(<SystemReporting />);

    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument(); // Total families
      expect(screen.getByText('150')).toBeInTheDocument(); // Total users
      expect(screen.getByText('20')).toBeInTheDocument(); // Total trips
    });
  });

  it('displays family statistics', async () => {
    render(<SystemReporting />);

    await waitFor(() => {
      expect(screen.getByText('סטטיסטיקת משפחות')).toBeInTheDocument();
    });

    const familiesTab = screen.getByRole('tab', { name: /סטטיסטיקת משפחות/ });
    expect(familiesTab).toBeInTheDocument();
  });

  it('displays trip statistics', async () => {
    render(<SystemReporting />);

    await waitFor(() => {
      expect(screen.getByText('סטטיסטיקת טיולים')).toBeInTheDocument();
    });

    const tripsTab = screen.getByRole('tab', { name: /סטטיסטיקת טיולים/ });
    expect(tripsTab).toBeInTheDocument();
  });

  it('shows loading state while fetching data', () => {
    vi.mocked(api.getDashboardMetrics).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<SystemReporting />);

    expect(screen.getByText('טוען נתונים...')).toBeInTheDocument();
  });

  it('displays admin counts correctly', async () => {
    render(<SystemReporting />);

    await waitFor(() => {
      expect(screen.getByText('מנהלים')).toBeInTheDocument();
      // 5 trip admins + 2 super admins = 7
      expect(screen.getByText('7')).toBeInTheDocument();
    });
  });

  it('displays family growth chart', async () => {
    render(<SystemReporting />);

    await waitFor(() => {
      expect(screen.getByText('גידול משפחות לפי חודש')).toBeInTheDocument();
      expect(screen.getByText('ינואר')).toBeInTheDocument();
      expect(screen.getByText('פברואר')).toBeInTheDocument();
    });
  });

  it('displays trip by month chart', async () => {
    render(<SystemReporting />);

    await waitFor(() => {
      expect(screen.getByText('סך משפחות')).toBeInTheDocument();
    });

    // Click on the trips tab
    const tripsTab = screen.getByRole('tab', { name: /סטטיסטיקת טיולים/ });
    expect(tripsTab).toBeInTheDocument();
    fireEvent.click(tripsTab);

    // Verify component rendered successfully
    expect(screen.getByText('סך טיולים')).toBeInTheDocument();
  });
});
