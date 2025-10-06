import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/LoginForm'
import { AuthProvider } from '@/contexts/AuthContext'
import * as authLib from '@/lib/auth'

// Mock the auth library
vi.mock('@/lib/auth', () => ({
  loginWithCredentials: vi.fn(),
  getStoredTokens: vi.fn(),
  getStoredUser: vi.fn(),
  getStoredFamily: vi.fn(),
  getCurrentUser: vi.fn(),
}))

describe('LoginForm', () => {
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderLoginForm = () => {
    return render(
      <AuthProvider>
        <LoginForm onSuccess={mockOnSuccess} />
      </AuthProvider>
    )
  }

  it('renders login form with email and password fields', () => {
    renderLoginForm()
    
    expect(screen.getByLabelText(/דוא״ל/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/סיסמה/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /התחבר/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    renderLoginForm()
    
    const submitButton = screen.getByRole('button', { name: /התחבר/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      const errors = screen.getAllByText(/שדה חובה/i)
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    renderLoginForm()
    
    const emailInput = screen.getByLabelText(/דוא״ל/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/סיסמה/i)
    
    // Type invalid email with @ to pass HTML5 validation but fail Zod
    await user.type(emailInput, 'invalid@domain')
    await user.type(passwordInput, 'SomePassword123')
    
    // Blur the email field to trigger validation
    await user.tab()
    
    const submitButton = screen.getByRole('button', { name: /התחבר/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/כתובת דוא״ל לא תקינה/i)).toBeInTheDocument()
    })
  })

  it('submits valid credentials', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      user: {
        id: '1',
        familyId: '1',
        type: 'adult' as const,
        name: 'Test User',
        email: 'test@example.com',
        role: 'family' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      family: {
        id: '1',
        name: 'Test Family',
        members: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      tokens: {
        accessToken: 'test-token',
        refreshToken: 'test-refresh-token',
      },
    }
    
    vi.mocked(authLib.loginWithCredentials).mockResolvedValue(mockResponse)
    
    renderLoginForm()
    
    const emailInput = screen.getByLabelText(/דוא״ל/i)
    const passwordInput = screen.getByLabelText(/סיסמה/i)
    const submitButton = screen.getByRole('button', { name: /התחבר/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'Password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(authLib.loginWithCredentials).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
      })
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('displays error message on login failure', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Invalid credentials'
    
    vi.mocked(authLib.loginWithCredentials).mockRejectedValue(new Error(errorMessage))
    
    renderLoginForm()
    
    const emailInput = screen.getByLabelText(/דוא״ל/i)
    const passwordInput = screen.getByLabelText(/סיסמה/i)
    const submitButton = screen.getByRole('button', { name: /התחבר/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    renderLoginForm()
    
    const passwordInput = screen.getByLabelText(/סיסמה/i) as HTMLInputElement
    expect(passwordInput.type).toBe('password')
    
    const toggleButton = screen.getByRole('button', { name: '' })
    await user.click(toggleButton)
    
    expect(passwordInput.type).toBe('text')
    
    await user.click(toggleButton)
    expect(passwordInput.type).toBe('password')
  })

  it('disables form during submission', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      user: {
        id: '1',
        familyId: '1',
        type: 'adult' as const,
        name: 'Test User',
        email: 'test@example.com',
        role: 'family' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      family: {
        id: '1',
        name: 'Test Family',
        members: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      tokens: {
        accessToken: 'test-token',
        refreshToken: 'test-refresh-token',
      },
    }
    
    vi.mocked(authLib.loginWithCredentials).mockImplementation(
      () => new Promise<typeof mockResponse>((resolve) => setTimeout(() => resolve(mockResponse), 1000))
    )
    
    renderLoginForm()
    
    const emailInput = screen.getByLabelText(/דוא״ל/i)
    const passwordInput = screen.getByLabelText(/סיסמה/i)
    const submitButton = screen.getByRole('button', { name: /התחבר/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'Password123')
    await user.click(submitButton)
    
    expect(submitButton).toBeDisabled()
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
  })
})
