/**
 * Every taskService method: the URL it calls, the verb, the body or params it
 * sends, what it unwraps from the response, and what it does when the request
 * fails.
 *
 * The failure half matters as much as the success half. Each method logs and
 * re-throws rather than returning undefined, and callers depend on that -- a
 * method that swallowed its error would hand a component `undefined` where it
 * expected a list.
 */

import { taskService } from '../taskService';
import axiosInstance from '../../utils/axiosInstance';

vi.mock('../../utils/axiosInstance', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const TASKS = [{ id: 1, title: 'Write report' }];
const boom = new Error('network down');

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('reads', () => {
  it('getUserTasks GETs /tasks and unwraps data', async () => {
    axiosInstance.get.mockResolvedValue({ data: TASKS });
    await expect(taskService.getUserTasks()).resolves.toEqual(TASKS);
    expect(axiosInstance.get).toHaveBeenCalledWith('/tasks');
  });

  it('getAllTasks GETs /tasks', async () => {
    axiosInstance.get.mockResolvedValue({ data: TASKS });
    await expect(taskService.getAllTasks()).resolves.toEqual(TASKS);
    expect(axiosInstance.get).toHaveBeenCalledWith('/tasks');
  });

  it('getStats GETs /tasks/stats', async () => {
    axiosInstance.get.mockResolvedValue({ data: { total: 3 } });
    await expect(taskService.getStats()).resolves.toEqual({ total: 3 });
    expect(axiosInstance.get).toHaveBeenCalledWith('/tasks/stats');
  });

  it('getTaskActivity GETs the task-scoped activity feed', async () => {
    axiosInstance.get.mockResolvedValue({ data: [] });
    await taskService.getTaskActivity(42);
    expect(axiosInstance.get).toHaveBeenCalledWith('/tasks/42/activity');
  });

  it('searchTasks passes the query as a param, not in the path', async () => {
    axiosInstance.get.mockResolvedValue({ data: TASKS });
    await taskService.searchTasks('report');
    expect(axiosInstance.get).toHaveBeenCalledWith('/tasks/search', { params: { q: 'report' } });
  });

  it('exportCsv asks for a blob', async () => {
    axiosInstance.get.mockResolvedValue({ data: '' });
    await taskService.exportCsv();
    expect(axiosInstance.get).toHaveBeenCalledWith('/tasks/export', { responseType: 'blob' });
  });
});

describe('filterTasks', () => {
  it('sends only the filters that were supplied', async () => {
    axiosInstance.get.mockResolvedValue({ data: TASKS });
    await taskService.filterTasks('To-Do', undefined);
    expect(axiosInstance.get).toHaveBeenCalledWith('/tasks/filter', { params: { status: 'To-Do' } });
  });

  it('sends both when both are supplied', async () => {
    axiosInstance.get.mockResolvedValue({ data: TASKS });
    await taskService.filterTasks('To-Do', 'HIGH');
    expect(axiosInstance.get).toHaveBeenCalledWith('/tasks/filter',
      { params: { status: 'To-Do', priority: 'HIGH' } });
  });

  it('sends an empty params object when neither is supplied', async () => {
    axiosInstance.get.mockResolvedValue({ data: TASKS });
    await taskService.filterTasks();
    expect(axiosInstance.get).toHaveBeenCalledWith('/tasks/filter', { params: {} });
  });
});

describe('writes', () => {
  it('createTask POSTs the task', async () => {
    axiosInstance.post.mockResolvedValue({ data: { id: 9 } });
    await expect(taskService.createTask({ title: 'New' })).resolves.toEqual({ id: 9 });
    expect(axiosInstance.post).toHaveBeenCalledWith('/tasks', { title: 'New' });
  });

  it('updateTask PUTs to the id-scoped path', async () => {
    axiosInstance.put.mockResolvedValue({ data: { id: 5 } });
    await taskService.updateTask(5, { title: 'Edited' });
    expect(axiosInstance.put).toHaveBeenCalledWith('/tasks/5', { title: 'Edited' });
  });

  it('deleteTask DELETEs and resolves undefined', async () => {
    axiosInstance.delete.mockResolvedValue({});
    await expect(taskService.deleteTask(7)).resolves.toBeUndefined();
    expect(axiosInstance.delete).toHaveBeenCalledWith('/tasks/7');
  });

  it('restoreTask PUTs to the restore path', async () => {
    axiosInstance.put.mockResolvedValue({ data: {} });
    await taskService.restoreTask(7);
    expect(axiosInstance.put).toHaveBeenCalledWith('/tasks/7/restore');
  });

  it('bulkUpdate sends ids under taskIds', async () => {
    axiosInstance.post.mockResolvedValue({ data: {} });
    await taskService.bulkUpdate([1, 2], 'Complete', 'LOW');
    expect(axiosInstance.post).toHaveBeenCalledWith('/tasks/bulk-update',
      { taskIds: [1, 2], status: 'Complete', priority: 'LOW' });
  });

  it('bulkDelete sends ids under taskIds and resolves undefined', async () => {
    axiosInstance.post.mockResolvedValue({});
    await expect(taskService.bulkDelete([3, 4])).resolves.toBeUndefined();
    expect(axiosInstance.post).toHaveBeenCalledWith('/tasks/bulk-delete', { taskIds: [3, 4] });
  });
});

describe('failures re-throw rather than resolving undefined', () => {
  it.each([
    ['getUserTasks', () => taskService.getUserTasks(), 'get'],
    ['getAllTasks', () => taskService.getAllTasks(), 'get'],
    ['getStats', () => taskService.getStats(), 'get'],
    ['searchTasks', () => taskService.searchTasks('x'), 'get'],
    ['filterTasks', () => taskService.filterTasks('To-Do'), 'get'],
    ['getTaskActivity', () => taskService.getTaskActivity(1), 'get'],
    ['createTask', () => taskService.createTask({}), 'post'],
    ['bulkUpdate', () => taskService.bulkUpdate([1]), 'post'],
    ['bulkDelete', () => taskService.bulkDelete([1]), 'post'],
    ['updateTask', () => taskService.updateTask(1, {}), 'put'],
    ['restoreTask', () => taskService.restoreTask(1), 'put'],
    ['deleteTask', () => taskService.deleteTask(1), 'delete'],
  ])('%s', async (_name, call, verb) => {
    axiosInstance[verb].mockRejectedValue(boom);
    await expect(call()).rejects.toThrow('network down');
    expect(console.error).toHaveBeenCalled();
  });
});
