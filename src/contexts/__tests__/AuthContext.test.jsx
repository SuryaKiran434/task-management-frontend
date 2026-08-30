/**
 * AuthProvider's session lifecycle: what it does on mount with a stored
 * session, an expired token, a valid token, or nothing at all -- and what login
 * and logout leave behind.
 *
 * authService and jwt-decode are stubbed. These tests are about the provider's
 * branching, not about token cryptography, and each branch ends in a different
 * combination of state and localStorage that is easy to get subtly wrong.
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from '../AuthContext';
import authService from '../../services/authService';
import { jwtDecode } from 'jwt-decode';

vi.mock('../../services/authService', () => ({
  default: {
    getToken: vi.fn(), getRefreshToken: vi.fn(), isTokenExpired: vi.fn(),
    refreshToken: vi.fn(), login: vi.fn(), logout: vi.fn(),
  },
}));
vi.mock('jwt-decode', () => ({ jwtDecode: vi.fn() }));

const CLAIMS = { userId: 7, sub: 'ada@example.com', roles: ['ROLE_ADMIN'] };

let seen;
function Probe() {
  seen = useContext(AuthContext);
  return <div data-testid="probe">{seen.isAuthenticated ? 'in' : 'out'}</div>;
}
const draw = () => render(<AuthProvider><Probe /></AuthProvider>);

beforeEach(() => {
  localStorage.clear();
  seen = undefined;
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('on mount', () => {
  it('restores a stored session without calling the token service', async () => {
    localStorage.setItem('currentUser', JSON.stringify({ id: 7, email: 'ada@example.com' }));
    draw();
    expect(await screen.findByText('in')).toBeInTheDocument();
    expect(authService.getToken).not.toHaveBeenCalled();
  });

  it('signs in from a valid token when nothing is stored', async () => {
    authService.getToken.mockReturnValue('tok');
    authService.isTokenExpired.mockReturnValue(false);
    authService.getRefreshToken.mockReturnValue('ref');
    jwtDecode.mockReturnValue(CLAIMS);

    draw();
    expect(await screen.findByText('in')).toBeInTheDocument();
    expect(seen.currentUser).toMatchObject({ id: 7, email: 'ada@example.com', roles: ['ROLE_ADMIN'] });
    // The restored session is written back so the next mount can skip decoding.
    expect(JSON.parse(localStorage.getItem('currentUser')).id).toBe(7);
  });

  it('refreshes an expired token and signs in with the new one', async () => {
    authService.getToken.mockReturnValue('old');
    authService.isTokenExpired.mockReturnValue(true);
    authService.refreshToken.mockResolvedValue('fresh');
    authService.getRefreshToken.mockReturnValue('ref');
    jwtDecode.mockReturnValue(CLAIMS);

    draw();
    expect(await screen.findByText('in')).toBeInTheDocument();
    expect(authService.refreshToken).toHaveBeenCalled();
    expect(seen.currentUser.token).toBe('fresh');
  });

  it('logs out when the refresh fails', async () => {
    authService.getToken.mockReturnValue('old');
    authService.isTokenExpired.mockReturnValue(true);
    authService.refreshToken.mockRejectedValue(new Error('gone'));

    draw();
    expect(await screen.findByText('out')).toBeInTheDocument();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('logs out when the refresh returns nothing', async () => {
    authService.getToken.mockReturnValue('old');
    authService.isTokenExpired.mockReturnValue(true);
    authService.refreshToken.mockResolvedValue(undefined);

    draw();
    expect(await screen.findByText('out')).toBeInTheDocument();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('logs out when the token cannot be decoded', async () => {
    authService.getToken.mockReturnValue('garbage');
    authService.isTokenExpired.mockReturnValue(false);
    jwtDecode.mockImplementation(() => { throw new Error('bad token'); });

    draw();
    expect(await screen.findByText('out')).toBeInTheDocument();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('stays signed out when there is no token at all', async () => {
    authService.getToken.mockReturnValue(null);
    draw();
    expect(await screen.findByText('out')).toBeInTheDocument();
    expect(authService.logout).not.toHaveBeenCalled();
  });

  it('survives a corrupt stored session rather than failing to render', async () => {
    localStorage.setItem('currentUser', '{not json');
    authService.getToken.mockReturnValue(null);
    draw();
    await waitFor(() => expect(console.error).toHaveBeenCalled());
  });
});

describe('login', () => {
  it('stores the session and flips to authenticated', async () => {
    authService.getToken.mockReturnValue(null);
    draw();
    await screen.findByText('out');

    authService.login.mockResolvedValue({ token: 'tok', refreshToken: 'ref' });
    jwtDecode.mockReturnValue(CLAIMS);

    await act(async () => { await seen.login('ada@example.com', 'pw'); });

    expect(screen.getByText('in')).toBeInTheDocument();
    expect(seen.currentUser).toMatchObject({ id: 7, email: 'ada@example.com', refreshToken: 'ref' });
    expect(JSON.parse(localStorage.getItem('currentUser')).token).toBe('tok');
  });

  it('re-throws a failed login and stays signed out', async () => {
    authService.getToken.mockReturnValue(null);
    draw();
    await screen.findByText('out');

    authService.login.mockRejectedValue(new Error('Bad credentials'));
    await expect(act(async () => { await seen.login('a@b.c', 'pw'); }))
      .rejects.toThrow('Bad credentials');
    expect(screen.getByText('out')).toBeInTheDocument();
    expect(localStorage.getItem('currentUser')).toBeNull();
  });
});

describe('logout', () => {
  it('clears the service tokens, the stored session and the state', async () => {
    localStorage.setItem('currentUser', JSON.stringify({ id: 7 }));
    draw();
    await screen.findByText('in');

    act(() => seen.logout());

    expect(screen.getByText('out')).toBeInTheDocument();
    expect(localStorage.getItem('currentUser')).toBeNull();
    expect(authService.logout).toHaveBeenCalled();
  });
});
