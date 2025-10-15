import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DataExport } from '@/components/admin/DataExport';
import * as api from '@/lib/api';

vi.mock('@/lib/api');
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock window.URL.createObjectURL and related functions
global.URL.createObjectURL = vi.fn();
global.URL.revokeObjectURL = vi.fn();

describe('DataExport', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders data export component', () => {
    render(<DataExport />);

    expect(screen.getByText('ייצוא נתונים')).toBeInTheDocument();
    expect(
      screen.getByText('ייצא נתוני מערכת לקובץ לצורכי גיבוי או ניתוח'),
    ).toBeInTheDocument();
  });

  it('allows selecting data type', () => {
    render(<DataExport />);

    const dataTypeSelect = screen.getAllByRole('combobox')[0];
    expect(dataTypeSelect).toBeInTheDocument();
  });

  it('allows selecting file format', () => {
    render(<DataExport />);

    const jsonButton = screen.getByRole('button', { name: /JSON/i });
    const csvButton = screen.getByRole('button', { name: /CSV/i });

    expect(jsonButton).toBeInTheDocument();
    expect(csvButton).toBeInTheDocument();
  });

  it('switches between JSON and CSV formats', () => {
    render(<DataExport />);

    const jsonButton = screen.getByRole('button', { name: /JSON/i });
    const csvButton = screen.getByRole('button', { name: /CSV/i });

    fireEvent.click(csvButton);
    expect(csvButton).toHaveClass('bg-primary');

    fireEvent.click(jsonButton);
    expect(jsonButton).toHaveClass('bg-primary');
  });

  it('displays export summary', () => {
    render(<DataExport />);

    expect(screen.getByText('סיכום ייצוא')).toBeInTheDocument();
    expect(screen.getAllByText('כל הנתונים').length).toBeGreaterThan(0);
    expect(screen.getAllByText('JSON').length).toBeGreaterThan(0);
  });

  it('exports data successfully', async () => {
    const mockExportData = {
      filename: 'export-2024-01-01.json',
      data: JSON.stringify({ test: 'data' }),
      contentType: 'application/json',
    };

    vi.mocked(api.exportData).mockResolvedValue(mockExportData);

    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    // Mock document.createElement to return a proper link element
    const originalCreateElement = document.createElement.bind(document);
    const mockClick = vi.fn();
    vi.spyOn(document, 'createElement').mockImplementation(
      (tagName: string) => {
        if (tagName === 'a') {
          const link = originalCreateElement('a');
          link.click = mockClick;
          return link;
        }
        return originalCreateElement(tagName);
      },
    );

    render(<DataExport />);

    const exportButton = screen.getByRole('button', { name: /ייצא נתונים/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(api.exportData).toHaveBeenCalledWith({
        dataType: 'all',
        format: 'json',
      });
    });

    await waitFor(() => {
      expect(mockClick).toHaveBeenCalled();
    });
  });

  it('shows loading state while exporting', async () => {
    vi.mocked(api.exportData).mockImplementation(() => new Promise(() => {}));

    render(<DataExport />);

    const exportButton = screen.getByRole('button', { name: /ייצא נתונים/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText('מייצא נתונים...')).toBeInTheDocument();
    });
  });

  it('displays security warning', () => {
    render(<DataExport />);

    expect(
      screen.getByText(/הנתונים המיוצאים כוללים מידע רגיש/),
    ).toBeInTheDocument();
  });
});
