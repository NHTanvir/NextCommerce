import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import LoginPage from '@/app/auth/login/page';
import { renderWithStore } from '@/test/renderWithStore';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
  usePathname: () => '/auth/login',
}));

describe('LoginPage', () => {
  it('renders the email and password fields with autocomplete hints', () => {
    renderWithStore(<LoginPage />);
    const email = screen.getByPlaceholderText('you@example.com') as HTMLInputElement;
    const password = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    expect(email.type).toBe('email');
    expect(email.autocomplete).toBe('email');
    expect(password.type).toBe('password');
    expect(password.autocomplete).toBe('current-password');
  });

  it('renders a "Continue with Google" link to the OAuth start endpoint', () => {
    renderWithStore(<LoginPage />);
    const googleLink = screen.getByRole('link', { name: /continue with google/i });
    expect(googleLink.getAttribute('href')).toMatch(/\/api\/auth\/google$/);
  });

  it('shows validation errors when the form is submitted empty', async () => {
    renderWithStore(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('shows an email-format error when the email is malformed', async () => {
    renderWithStore(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'longenough' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('links to the register page', () => {
    renderWithStore(<LoginPage />);
    expect(screen.getByRole('link', { name: /create one/i })).toHaveAttribute('href', '/auth/register');
  });
});
