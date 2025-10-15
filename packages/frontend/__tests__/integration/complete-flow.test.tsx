import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AppProvider } from '@/contexts/AppContext';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/'),
}));

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
};

describe('Integration: Complete Application Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it('should render the complete provider hierarchy without errors', () => {
    const TestApp = () => <div>Complete App</div>;

    const { getByText } = render(
      <ErrorBoundary>
        <AuthProvider>
          <NotificationProvider>
            <AppProvider>
              <TestApp />
            </AppProvider>
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>,
    );

    expect(getByText('Complete App')).toBeInTheDocument();
  });

  it('should handle errors gracefully with ErrorBoundary', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    const { getByText } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    expect(getByText('אירעה שגיאה')).toBeInTheDocument();
  });

  it('should provide custom fallback for errors', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    const CustomFallback = () => <div>Custom Error Message</div>;

    const { getByText } = render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    expect(getByText('Custom Error Message')).toBeInTheDocument();
  });
});

describe('Integration: Component Communication', () => {
  it('should allow components to communicate via shared contexts', async () => {
    const ParentComponent = ({ children }: { children: React.ReactNode }) => {
      return <div data-testid="parent">{children}</div>;
    };

    const ChildComponent = () => {
      return <div data-testid="child">Child Content</div>;
    };

    const { getByTestId } = render(
      <ErrorBoundary>
        <AuthProvider>
          <NotificationProvider>
            <AppProvider>
              <ParentComponent>
                <ChildComponent />
              </ParentComponent>
            </AppProvider>
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>,
    );

    expect(getByTestId('parent')).toBeInTheDocument();
    expect(getByTestId('child')).toBeInTheDocument();
  });
});

describe('Integration: Async Operations', () => {
  it('should handle async operations with loading states', async () => {
    const AsyncComponent = () => {
      const [loading, setLoading] = React.useState(true);
      const [data, setData] = React.useState<string | null>(null);

      React.useEffect(() => {
        setTimeout(() => {
          setData('Loaded Data');
          setLoading(false);
        }, 100);
      }, []);

      if (loading) {
        return <div data-testid="loading">Loading...</div>;
      }

      return <div data-testid="data">{data}</div>;
    };

    const { getByTestId } = render(
      <ErrorBoundary>
        <AuthProvider>
          <NotificationProvider>
            <AppProvider>
              <AsyncComponent />
            </AppProvider>
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>,
    );

    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(
      () => {
        expect(getByTestId('data')).toBeInTheDocument();
        expect(getByTestId('data')).toHaveTextContent('Loaded Data');
      },
      { timeout: 200 },
    );
  });
});
