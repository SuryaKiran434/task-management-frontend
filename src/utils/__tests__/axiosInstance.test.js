/**
 * The axios instance's two interceptors.
 *
 * The response interceptor is the one that matters: a 401 triggers a single
 * token refresh and a replay of the original request, and the `_retry` flag is
 * what stops a failing refresh from looping. A regression there is invisible in
 * normal use and catastrophic under an expired session.
 */

import axios from 'axios';
import authService from '../../services/authService';

vi.mock('axios', () => {
  const instance = vi.fn();
  instance.defaults = { headers: { common: {} } };
  instance.interceptors = {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  };
  return { default: { create: vi.fn(() => instance) }, __instance: instance };
});
vi.mock('../../services/authService', () => ({
  default: { getToken: vi.fn(), refreshToken: vi.fn(), logout: vi.fn() },
}));

let instance, onRequest, onResponseError;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  await import('../axiosInstance');
  instance = axios.create.mock.results[0].value;
  onRequest = instance.interceptors.request.use.mock.calls[0][0];
  onResponseError = instance.interceptors.response.use.mock.calls[0][1];
});

describe('request interceptor', () => {
  it('attaches the bearer token when one is stored', () => {
    authService.getToken.mockReturnValue('tok');
    expect(onRequest({ headers: {} }).headers.Authorization).toBe('Bearer tok');
  });

  it('sends no Authorization header when there is no token', () => {
    authService.getToken.mockReturnValue(null);
    expect(onRequest({ headers: {} }).headers.Authorization).toBeUndefined();
  });
});

describe('response interceptor', () => {
  const unauthorized = () => ({
    response: { status: 401 },
    config: { headers: {}, url: '/tasks' },
  });

  it('refreshes once on a 401 and replays the original request', async () => {
    authService.refreshToken.mockResolvedValue('fresh');
    instance.mockResolvedValue({ data: 'replayed' });

    const error = unauthorized();
    await expect(onResponseError(error)).resolves.toEqual({ data: 'replayed' });

    expect(authService.refreshToken).toHaveBeenCalledTimes(1);
    expect(error.config._retry).toBe(true);
    expect(error.config.headers.Authorization).toBe('Bearer fresh');
    expect(instance.defaults.headers.common.Authorization).toBe('Bearer fresh');
  });

  it('does not refresh twice for the same request', async () => {
    const error = unauthorized();
    error.config._retry = true;
    await expect(onResponseError(error)).rejects.toBe(error);
    expect(authService.refreshToken).not.toHaveBeenCalled();
  });

  it('logs out and sends the user to /login when the refresh fails', async () => {
    authService.refreshToken.mockRejectedValue(new Error('expired'));
    const original = window.location;
    delete window.location;
    window.location = { href: '' };

    const error = unauthorized();
    await expect(onResponseError(error)).rejects.toBe(error);
    expect(authService.logout).toHaveBeenCalled();
    expect(window.location.href).toBe('/login');

    window.location = original;
  });

  it('passes other failures through untouched', async () => {
    const error = { response: { status: 500 }, config: { headers: {} } };
    await expect(onResponseError(error)).rejects.toBe(error);
    expect(authService.refreshToken).not.toHaveBeenCalled();
  });

  it('passes a network failure with no response through untouched', async () => {
    const error = { config: { headers: {} } };
    await expect(onResponseError(error)).rejects.toBe(error);
    expect(authService.refreshToken).not.toHaveBeenCalled();
  });
});
