/**
 * authService: token storage, refresh, and the JWT claim readers.
 *
 * jwt-decode is stubbed rather than fed real tokens -- these tests are about
 * what authService does with the decoded claims, not about the decoder.
 */

import authService from '../authService';
import axiosInstance from '../../utils/axiosInstance';
import { jwtDecode } from 'jwt-decode';

vi.mock('../../utils/axiosInstance', () => ({ default: { post: vi.fn() } }));
vi.mock('jwt-decode', () => ({ jwtDecode: vi.fn() }));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('login', () => {
  it('stores both tokens and returns the claims from the access token', async () => {
    axiosInstance.post.mockResolvedValue({ data: { token: 't', refreshToken: 'r' } });
    jwtDecode.mockReturnValue({ id: 7, roles: ['ROLE_ADMIN'] });

    await expect(authService.login('a@b.c', 'pw')).resolves.toEqual({
      id: 7, roles: ['ROLE_ADMIN'], token: 't', refreshToken: 'r',
    });
    expect(axiosInstance.post).toHaveBeenCalledWith('/authenticate', { email: 'a@b.c', password: 'pw' });
    expect(localStorage.getItem('token')).toBe('t');
    expect(localStorage.getItem('refreshToken')).toBe('r');
  });

  it('defaults roles to an empty array when the token carries none', async () => {
    axiosInstance.post.mockResolvedValue({ data: { token: 't', refreshToken: 'r' } });
    jwtDecode.mockReturnValue({ id: 7 });
    await expect(authService.login('a@b.c', 'pw')).resolves.toMatchObject({ roles: [] });
  });

  it('stores nothing when the response is missing a token', async () => {
    axiosInstance.post.mockResolvedValue({ data: { token: 't' } });
    await expect(authService.login('a@b.c', 'pw')).rejects.toThrow();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('surfaces the backend message when there is one', async () => {
    axiosInstance.post.mockRejectedValue({ response: { data: { message: 'Bad credentials' } } });
    await expect(authService.login('a@b.c', 'pw')).rejects.toThrow('Bad credentials');
  });

  it('falls back to a generic message when the failure carries no response', async () => {
    axiosInstance.post.mockRejectedValue(new Error('offline'));
    await expect(authService.login('a@b.c', 'pw')).rejects.toThrow(/unexpected error/i);
  });
});

describe('refreshToken', () => {
  it('exchanges the stored refresh token and saves the new access token', async () => {
    localStorage.setItem('refreshToken', 'r');
    axiosInstance.post.mockResolvedValue({ data: { token: 'new' } });
    await expect(authService.refreshToken()).resolves.toBe('new');
    expect(axiosInstance.post).toHaveBeenCalledWith('/refresh-token', { refreshToken: 'r' });
    expect(localStorage.getItem('token')).toBe('new');
  });

  it('logs out and rejects when there is no refresh token to send', async () => {
    localStorage.setItem('token', 't');
    // jsdom refuses a real navigation assignment; the property is replaced so
    // the redirect can be observed instead of throwing.
    const original = window.location;
    delete window.location;
    window.location = { href: '' };

    await expect(authService.refreshToken()).rejects.toThrow('No refresh token available.');
    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('/login');

    window.location = original;
  });

  it('rejects when the exchange fails', async () => {
    localStorage.setItem('refreshToken', 'r');
    axiosInstance.post.mockRejectedValue(new Error('nope'));
    await expect(authService.refreshToken()).rejects.toThrow('Failed to refresh token.');
  });

  it('rejects when the response carries no new token', async () => {
    localStorage.setItem('refreshToken', 'r');
    axiosInstance.post.mockResolvedValue({ data: {} });
    await expect(authService.refreshToken()).rejects.toThrow('Failed to refresh token.');
  });
});

describe('storage helpers', () => {
  it('logout clears both tokens', () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('refreshToken', 'r');
    authService.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('getToken and getRefreshToken read what login stored', () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('refreshToken', 'r');
    expect(authService.getToken()).toBe('t');
    expect(authService.getRefreshToken()).toBe('r');
  });

  it('both return null when nothing is stored', () => {
    expect(authService.getToken()).toBeNull();
    expect(authService.getRefreshToken()).toBeNull();
  });
});

describe('claim readers', () => {
  it('isTokenExpired compares exp, in seconds, against now', () => {
    jwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) - 60 });
    expect(authService.isTokenExpired('t')).toBe(true);

    jwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(authService.isTokenExpired('t')).toBe(false);
  });

  it('getUserIdFromToken reads id', () => {
    jwtDecode.mockReturnValue({ id: 12 });
    expect(authService.getUserIdFromToken('t')).toBe(12);
  });

  it('getUserRolesFromToken reads roles, defaulting to empty', () => {
    jwtDecode.mockReturnValue({ roles: ['ROLE_USER'] });
    expect(authService.getUserRolesFromToken('t')).toEqual(['ROLE_USER']);
    jwtDecode.mockReturnValue({});
    expect(authService.getUserRolesFromToken('t')).toEqual([]);
  });
});
