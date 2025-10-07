import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TripStatusBadge } from '@/components/trip/TripStatusBadge';
import type { TripStatus } from '@/types/trip';

describe('TripStatusBadge', () => {
  it('renders draft status correctly', () => {
    render(<TripStatusBadge status="draft" />);
    expect(screen.getByText('טיוטה')).toBeInTheDocument();
  });

  it('renders upcoming status correctly', () => {
    render(<TripStatusBadge status="upcoming" />);
    expect(screen.getByText('קרוב')).toBeInTheDocument();
  });

  it('renders active status correctly', () => {
    render(<TripStatusBadge status="active" />);
    expect(screen.getByText('פעיל')).toBeInTheDocument();
  });

  it('renders past status correctly', () => {
    render(<TripStatusBadge status="past" />);
    expect(screen.getByText('הסתיים')).toBeInTheDocument();
  });

  it('renders published status correctly', () => {
    render(<TripStatusBadge status="published" />);
    expect(screen.getByText('פורסם')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TripStatusBadge status="draft" className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
