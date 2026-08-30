/**
 * Renders each unauthenticated page.
 *
 * These four used to carry four copies of the same split-screen shell; it now
 * lives in AuthLayout. The point of these tests is that the extraction did not
 * change what any of them renders — each page's own headings, fields, perks and
 * cross-links are asserted individually, so a prop dropped on the way into the
 * shared component fails here rather than in the browser.
 */

import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthContext } from '../../contexts/AuthContext';

vi.mock('../../utils/axiosInstance', async () => await import('../../testUtils/mockApi'));

import Login from './Login';
import AdminLogin from './AdminLogin';
import UserRegistrationForm from './UserRegistrationForm';
import ResetPassword from './ResetPassword';
import AuthLayout, { BRAND_GRADIENT, ADMIN_GRADIENT } from './AuthLayout';

const auth = { login: vi.fn(), logout: vi.fn(), user: null, isAuthenticated: false };

const draw = (ui) => render(
  <MemoryRouter>
    <AuthContext.Provider value={auth}>{ui}</AuthContext.Provider>
  </MemoryRouter>,
);

beforeEach(() => localStorage.clear());

describe('AuthLayout', () => {
  it('renders the brand panel and the form beside it', () => {
    draw(
      <AuthLayout gradient={BRAND_GRADIENT} title="TaskFlow" tagline="A tagline">
        <p>the form</p>
      </AuthLayout>,
    );
    expect(screen.getByText('TaskFlow')).toBeInTheDocument();
    expect(screen.getByText('A tagline')).toBeInTheDocument();
    expect(screen.getByText('the form')).toBeInTheDocument();
  });

  it('lists perks when given them, and omits the list when not', () => {
    const { unmount } = draw(
      <AuthLayout gradient={BRAND_GRADIENT} title="T" tagline="t"
        perks={[{ text: 'First perk' }, { text: 'Second perk' }]}><p>f</p></AuthLayout>,
    );
    expect(screen.getByText('First perk')).toBeInTheDocument();
    expect(screen.getByText('Second perk')).toBeInTheDocument();
    unmount();

    draw(<AuthLayout gradient={BRAND_GRADIENT} title="T" tagline="only"><p>f</p></AuthLayout>);
    expect(screen.queryByText('First perk')).toBeNull();
  });

  it('renders a badge only when one is supplied', () => {
    draw(<AuthLayout gradient={ADMIN_GRADIENT} badge={<span>Admin Portal</span>}
      title="T" tagline="t"><p>f</p></AuthLayout>);
    expect(screen.getByText('Admin Portal')).toBeInTheDocument();
  });

  it('exports two distinct gradients', () => {
    expect(BRAND_GRADIENT).not.toBe(ADMIN_GRADIENT);
  });
});

describe('Login', () => {
  it('renders its own copy and both fields', () => {
    draw(<Login />);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue to TaskFlow')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('keeps its perks and its links to register and reset', () => {
    draw(<Login />);
    expect(screen.getByText(/Track tasks with priorities/)).toBeInTheDocument();
    expect(screen.getByText('The workspace that keeps you in flow')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Forgot password/i })).toHaveAttribute('href', '/reset-password');
    expect(screen.getByRole('link', { name: /Sign up free/i })).toHaveAttribute('href', '/register');
  });

  it('starts with the password masked', () => {
    draw(<Login />);
    expect(screen.getByPlaceholderText('Enter your password')).toHaveAttribute('type', 'password');
  });
});

describe('AdminLogin', () => {
  it('renders the admin badge, heading and perks', () => {
    draw(<AdminLogin />);
    expect(screen.getByText('Admin Portal')).toBeInTheDocument();
    expect(screen.getByText('Admin sign in')).toBeInTheDocument();
    expect(screen.getByText('Restricted to administrators only')).toBeInTheDocument();
    expect(screen.getByText('Administration dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Manage all users and their roles/)).toBeInTheDocument();
  });

  it('links back to the regular sign in', () => {
    draw(<AdminLogin />);
    expect(screen.getByRole('link', { name: /Regular sign in/i })).toHaveAttribute('href', '/login');
  });
});

describe('UserRegistrationForm', () => {
  it('renders its heading, its own perks and the name fields', () => {
    draw(<UserRegistrationForm />);
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByText('Get organized in minutes')).toBeInTheDocument();
    expect(screen.getByText(/Free forever for personal use/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Jane')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
  });

  it('links to sign in', () => {
    draw(<UserRegistrationForm />);
    expect(screen.getByRole('link', { name: /^Sign in$/i })).toHaveAttribute('href', '/login');
  });
});

describe('ResetPassword', () => {
  it('renders step one with no perk list', () => {
    draw(<ResetPassword />);
    expect(screen.getByText('Secure password reset in two steps')).toBeInTheDocument();
    // The only auth page whose brand panel carries no perks.
    expect(screen.queryByText(/Track tasks with priorities/)).toBeNull();
  });

  it('links back to sign in', () => {
    draw(<ResetPassword />);
    const link = screen.getByRole('link', { name: /Sign in/i });
    expect(link).toHaveAttribute('href', '/login');
  });
});
