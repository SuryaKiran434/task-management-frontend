/**
 * userService: the path each method calls, what it unwraps, and the message it
 * raises on failure.
 *
 * Unlike taskService, most of these replace the underlying error with a fixed
 * message rather than re-throwing it. That is deliberate -- an axios error's
 * string can carry the backend's host and stack -- so the tests pin the
 * replacement text, not just that something threw.
 */

import userService from '../userService';
import axiosInstance from '../../utils/axiosInstance';

vi.mock('../../utils/axiosInstance', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const USER = { id: 1, firstName: 'Ada' };
const boom = new Error('network down');

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('paths and payloads', () => {
  it('registerUser POSTs to /users/register', async () => {
    axiosInstance.post.mockResolvedValue({ data: USER });
    await expect(userService.registerUser({ email: 'a@b.c' })).resolves.toEqual(USER);
    expect(axiosInstance.post).toHaveBeenCalledWith('/users/register', { email: 'a@b.c' });
  });

  it('adminCreateUser POSTs to /users', async () => {
    axiosInstance.post.mockResolvedValue({ data: USER });
    await userService.adminCreateUser({ email: 'a@b.c' });
    expect(axiosInstance.post).toHaveBeenCalledWith('/users', { email: 'a@b.c' });
  });

  it('assignAdmin and removeAdmin hit the id-scoped role paths', async () => {
    axiosInstance.post.mockResolvedValue({ data: USER });
    await userService.assignAdmin(4);
    expect(axiosInstance.post).toHaveBeenCalledWith('/users/4/assign-admin');
    await userService.removeAdmin(4);
    expect(axiosInstance.post).toHaveBeenCalledWith('/users/4/remove-admin');
  });

  it('getUserTasksById reads the task-side path, not the user-side one', async () => {
    axiosInstance.get.mockResolvedValue({ data: [] });
    await userService.getUserTasksById(9);
    expect(axiosInstance.get).toHaveBeenCalledWith('/tasks/user/9');
  });

  it('getUserInfo GETs the id-scoped user', async () => {
    axiosInstance.get.mockResolvedValue({ data: USER });
    await expect(userService.getUserInfo(1)).resolves.toEqual(USER);
    expect(axiosInstance.get).toHaveBeenCalledWith('/users/1');
  });

  it('getMe GETs /users/me', async () => {
    axiosInstance.get.mockResolvedValue({ data: USER });
    await expect(userService.getMe()).resolves.toEqual(USER);
    expect(axiosInstance.get).toHaveBeenCalledWith('/users/me');
  });

  it('deleteUser DELETEs and resolves undefined', async () => {
    axiosInstance.delete.mockResolvedValue({});
    await expect(userService.deleteUser(3)).resolves.toBeUndefined();
    expect(axiosInstance.delete).toHaveBeenCalledWith('/users/3');
  });

  it('updateUserInfo PUTs and returns the body on 200', async () => {
    axiosInstance.put.mockResolvedValue({ status: 200, data: USER });
    await expect(userService.updateUserInfo(1, { firstName: 'Ada' })).resolves.toEqual(USER);
    expect(axiosInstance.put).toHaveBeenCalledWith('/users/1', { firstName: 'Ada' });
  });

  it('updateUserInfo rejects a non-200 rather than returning its body', async () => {
    axiosInstance.put.mockResolvedValue({ status: 202, data: USER });
    await expect(userService.updateUserInfo(1, {})).rejects.toThrow('Failed to update user information');
  });

  it('forgotPassword percent-encodes the email into the query', async () => {
    axiosInstance.post.mockResolvedValue({ data: 'sent' });
    await userService.forgotPassword('a+b@example.com');
    expect(axiosInstance.post).toHaveBeenCalledWith('/users/forgot-password?email=a%2Bb%40example.com');
  });
});

describe('failures raise a fixed message rather than the axios error', () => {
  it.each([
    ['registerUser', () => userService.registerUser({}), 'post', 'Error registering user.'],
    ['assignAdmin', () => userService.assignAdmin(1), 'post', 'Failed to assign admin role.'],
    ['removeAdmin', () => userService.removeAdmin(1), 'post', 'Failed to remove admin role.'],
    ['getUserTasksById', () => userService.getUserTasksById(1), 'get', 'Failed to fetch user tasks.'],
    ['deleteUser', () => userService.deleteUser(1), 'delete', 'Failed to delete user.'],
    ['getUserInfo', () => userService.getUserInfo(1), 'get', 'Error fetching user info.'],
    ['updateUserInfo', () => userService.updateUserInfo(1, {}), 'put', 'Failed to update user information'],
    ['getMe', () => userService.getMe(), 'get', 'Error fetching current user.'],
  ])('%s', async (_n, call, verb, message) => {
    axiosInstance[verb].mockRejectedValue(boom);
    await expect(call()).rejects.toThrow(message);
    // The original error text must not survive into the thrown message.
    await expect(call()).rejects.not.toThrow('network down');
  });

  it('adminCreateUser deliberately lets the axios error through, for the dialog to read', async () => {
    axiosInstance.post.mockRejectedValue(boom);
    await expect(userService.adminCreateUser({})).rejects.toThrow('network down');
  });
});
