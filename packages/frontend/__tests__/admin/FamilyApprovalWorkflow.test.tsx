import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { FamilyApprovalWorkflow } from '@/components/admin/FamilyApprovalWorkflow';
import * as api from '@/lib/api';

vi.mock('@/lib/api');
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('FamilyApprovalWorkflow', () => {
  const mockPendingFamilies = [
    {
      id: '1',
      name: 'משפחת כהן',
      status: 'PENDING' as const,
      isActive: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      members: [
        {
          id: 'm1',
          familyId: '1',
          type: 'ADULT' as const,
          name: 'דוד כהן',
          email: 'david@example.com',
          role: 'FAMILY' as const,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'm2',
          familyId: '1',
          type: 'CHILD' as const,
          name: 'שרה כהן',
          age: 10,
          email: '',
          role: 'FAMILY' as const,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.getPendingFamilies).mockResolvedValue(mockPendingFamilies);
  });

  it('renders family approval workflow component', async () => {
    render(<FamilyApprovalWorkflow />);

    await waitFor(() => {
      expect(screen.getByText('אישור משפחות')).toBeInTheDocument();
    });
  });

  it('displays pending families', async () => {
    render(<FamilyApprovalWorkflow />);

    await waitFor(() => {
      expect(screen.getByText('משפחת כהן')).toBeInTheDocument();
      expect(screen.getByText('2 חברים')).toBeInTheDocument();
    });
  });

  it('shows badge with count of pending families', async () => {
    render(<FamilyApprovalWorkflow />);

    await waitFor(() => {
      expect(screen.getByText('1 ממתינות')).toBeInTheDocument();
    });
  });

  it('selects and deselects families', async () => {
    render(<FamilyApprovalWorkflow />);

    await waitFor(() => {
      expect(screen.getByText('משפחת כהן')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    const familyCheckbox = checkboxes[1]; // First checkbox is "select all"

    fireEvent.click(familyCheckbox);

    await waitFor(() => {
      expect(screen.getByText('1 משפחות נבחרו')).toBeInTheDocument();
    });

    fireEvent.click(familyCheckbox);

    await waitFor(() => {
      expect(screen.queryByText('1 משפחות נבחרו')).not.toBeInTheDocument();
    });
  });

  it('approves a single family', async () => {
    vi.mocked(api.adminApproveFamily).mockResolvedValue({
      ...mockPendingFamilies[0],
      status: 'APPROVED',
      isActive: true,
    });

    render(<FamilyApprovalWorkflow />);

    await waitFor(() => {
      expect(screen.getByText('משפחת כהן')).toBeInTheDocument();
    });

    const approveButton = screen.getByRole('button', { name: /אשר/ });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(screen.getByText('אישור משפחה')).toBeInTheDocument();
    });

    const confirmButton = screen.getAllByText('אשר')[1];
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(api.adminApproveFamily).toHaveBeenCalledWith('1');
    });
  });

  it('bulk approves selected families', async () => {
    vi.mocked(api.bulkApproveFamilies).mockResolvedValue({
      message: 'Success',
      approvedCount: 1,
    });

    render(<FamilyApprovalWorkflow />);

    await waitFor(() => {
      expect(screen.getByText('משפחת כהן')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);

    await waitFor(() => {
      expect(screen.getByText('1 משפחות נבחרו')).toBeInTheDocument();
    });

    const bulkApproveButton = screen.getByText('אשר נבחרות');
    fireEvent.click(bulkApproveButton);

    await waitFor(() => {
      expect(screen.getAllByText('אישור משפחות').length).toBeGreaterThan(0);
    });

    const confirmButton = screen.getByText('אשר הכל');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(api.bulkApproveFamilies).toHaveBeenCalledWith({
        familyIds: ['1'],
      });
    });
  });

  it('shows empty state when no pending families', async () => {
    vi.mocked(api.getPendingFamilies).mockResolvedValue([]);

    render(<FamilyApprovalWorkflow />);

    await waitFor(() => {
      expect(screen.getByText('אין משפחות ממתינות לאישור')).toBeInTheDocument();
    });
  });
});
