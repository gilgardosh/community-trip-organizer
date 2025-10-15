import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import {
  NotificationProvider,
  useNotification,
} from '@/contexts/NotificationContext';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/test'),
}));

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
};

describe('Integration: Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it('should redirect unauthenticated users to login', async () => {
    const TestComponent = () => {
      const { isAuthenticated } = useAuth();
      return (
        <div>{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
      );
    };

    render(
      <AuthProvider>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
      );
    });
  });
});

describe('Integration: Notification System', () => {
  it('should display notifications through context', () => {
    const TestComponent = () => {
      const { showSuccess, showError, showWarning, showInfo } =
        useNotification();

      return (
        <div>
          <button onClick={() => showSuccess('Success message')}>
            Show Success
          </button>
          <button onClick={() => showError('Error message')}>Show Error</button>
          <button onClick={() => showWarning('Warning message')}>
            Show Warning
          </button>
          <button onClick={() => showInfo('Info message')}>Show Info</button>
        </div>
      );
    };

    const { getByText } = render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>,
    );

    expect(getByText('Show Success')).toBeInTheDocument();
    expect(getByText('Show Error')).toBeInTheDocument();
    expect(getByText('Show Warning')).toBeInTheDocument();
    expect(getByText('Show Info')).toBeInTheDocument();
  });
});

describe('Integration: Data Flow Between Components', () => {
  it('should share state across components using context', async () => {
    const ComponentA = () => {
      const { showSuccess } = useNotification();
      return (
        <button onClick={() => showSuccess('Message from A')}>
          Component A
        </button>
      );
    };

    const ComponentB = () => {
      const { showError } = useNotification();
      return (
        <button onClick={() => showError('Message from B')}>Component B</button>
      );
    };

    const { getByText } = render(
      <NotificationProvider>
        <ComponentA />
        <ComponentB />
      </NotificationProvider>,
    );

    expect(getByText('Component A')).toBeInTheDocument();
    expect(getByText('Component B')).toBeInTheDocument();
  });
});

describe('Integration: Full Provider Stack', () => {
  it('should render complete provider hierarchy', () => {
    const TestApp = () => {
      return <div data-testid="app-content">Integrated App</div>;
    };

    const { getByTestId } = render(
      <AuthProvider>
        <NotificationProvider>
          <AppProvider>
            <TestApp />
          </AppProvider>
        </NotificationProvider>
      </AuthProvider>,
    );

    expect(getByTestId('app-content')).toBeInTheDocument();
    expect(getByTestId('app-content')).toHaveTextContent('Integrated App');
  });

  it('should allow access to all contexts from nested components', () => {
    const NestedComponent = () => {
      const auth = useAuth();
      const notification = useNotification();
      const app = useApp();

      return (
        <div>
          <div data-testid="auth-loading">{String(auth.isLoading)}</div>
          <div data-testid="notification-available">
            {notification ? 'available' : 'unavailable'}
          </div>
          <div data-testid="app-trips-trigger">{app.refreshTriggers.trips}</div>
        </div>
      );
    };

    const { getByTestId } = render(
      <AuthProvider>
        <NotificationProvider>
          <AppProvider>
            <NestedComponent />
          </AppProvider>
        </NotificationProvider>
      </AuthProvider>,
    );

    expect(getByTestId('auth-loading')).toBeInTheDocument();
    expect(getByTestId('notification-available')).toHaveTextContent(
      'available',
    );
    expect(getByTestId('app-trips-trigger')).toHaveTextContent('0');
  });
});
