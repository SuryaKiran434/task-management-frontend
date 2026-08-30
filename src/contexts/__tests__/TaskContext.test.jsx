/**
 * TaskProvider's mutators and their failure paths.
 *
 * contexts.test.jsx already covers the identity-stability contract between
 * TaskActionsContext and TaskDataContext. This covers what the actions
 * actually do: which service call each makes, how the local task list changes
 * afterwards, and what happens when the call fails -- every mutator sets an
 * error, raises a toast and re-throws, and callers such as CreateTask depend on
 * that re-throw to know the save did not happen.
 */

import { render, screen, act } from '@testing-library/react';
import { TaskProvider, useTaskActions, useTaskData } from '../TaskContext';
import { taskService } from '../../services/taskService';

vi.mock('../../services/taskService', () => ({
  taskService: {
    getAllTasks: vi.fn(), getUserTasks: vi.fn(), createTask: vi.fn(),
    updateTask: vi.fn(), deleteTask: vi.fn(), filterTasks: vi.fn(), searchTasks: vi.fn(),
  },
}));

const toast = { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() };
vi.mock('../ToastContext', () => ({ useToast: () => toast }));

const A = { id: 1, title: 'A' };
const B = { id: 2, title: 'B' };

let actions, data;
function Probe() {
  actions = useTaskActions();
  data = useTaskData();
  return <div data-testid="count">{data.tasks.length}</div>;
}
const draw = () => render(<TaskProvider><Probe /></TaskProvider>);

beforeEach(() => { vi.clearAllMocks(); actions = data = undefined; });

describe('fetchTasks', () => {
  it('reads every task for an admin and only the user\'s otherwise', async () => {
    taskService.getAllTasks.mockResolvedValue([A, B]);
    taskService.getUserTasks.mockResolvedValue([A]);
    draw();

    await act(async () => { await actions.fetchTasks(true); });
    expect(taskService.getAllTasks).toHaveBeenCalled();
    expect(screen.getByTestId('count')).toHaveTextContent('2');

    await act(async () => { await actions.fetchUserTasks(9); });
    expect(taskService.getUserTasks).toHaveBeenCalledWith(9);
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('retries before giving up, and reports only after the last attempt', async () => {
    taskService.getUserTasks
      .mockRejectedValueOnce(new Error('x'))
      .mockRejectedValueOnce(new Error('x'))
      .mockResolvedValue([A]);
    draw();

    await act(async () => { await actions.fetchTasks(); });
    expect(taskService.getUserTasks).toHaveBeenCalledTimes(3);
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('reports after exhausting every retry', async () => {
    taskService.getUserTasks.mockRejectedValue(new Error('x'));
    draw();

    await act(async () => { await actions.fetchTasks(); });
    expect(taskService.getUserTasks).toHaveBeenCalledTimes(3);
    expect(data.error).toBe('Failed to load tasks.');
    expect(toast.error).toHaveBeenCalledWith('Failed to load tasks.');
  });
});

describe('mutations update the local list', () => {
  it('createTask appends the created task', async () => {
    taskService.createTask.mockResolvedValue(B);
    draw();
    await act(async () => { await actions.createTask({ title: 'B' }); });
    expect(data.tasks).toEqual([B]);
  });

  it('updateTask replaces the matching task and leaves the rest alone', async () => {
    taskService.getAllTasks.mockResolvedValue([A, B]);
    taskService.updateTask.mockResolvedValue({ id: 1, title: 'A edited' });
    draw();
    await act(async () => { await actions.fetchTasks(true); });
    await act(async () => { await actions.updateTask(1, { title: 'A edited' }); });
    expect(data.tasks).toEqual([{ id: 1, title: 'A edited' }, B]);
  });

  it('deleteTask removes only the deleted task', async () => {
    taskService.getAllTasks.mockResolvedValue([A, B]);
    taskService.deleteTask.mockResolvedValue(undefined);
    draw();
    await act(async () => { await actions.fetchTasks(true); });
    await act(async () => { await actions.deleteTask(1); });
    expect(data.tasks).toEqual([B]);
  });

  it('filterTasks and searchTasks replace the list wholesale', async () => {
    taskService.filterTasks.mockResolvedValue([B]);
    taskService.searchTasks.mockResolvedValue([A]);
    draw();

    await act(async () => { await actions.filterTasks('To-Do', 'HIGH'); });
    expect(taskService.filterTasks).toHaveBeenCalledWith('To-Do', 'HIGH');
    expect(data.tasks).toEqual([B]);

    await act(async () => { await actions.searchTasks('a'); });
    expect(data.tasks).toEqual([A]);
  });
});

describe('failures', () => {
  it.each([
    ['createTask', () => actions.createTask({}), 'createTask', 'Failed to create task.'],
    ['updateTask', () => actions.updateTask(1, {}), 'updateTask', 'Failed to update task.'],
    ['deleteTask', () => actions.deleteTask(1), 'deleteTask', 'Failed to delete task.'],
  ])('%s sets the error, toasts, and re-throws', async (_n, call, method, message) => {
    taskService[method].mockRejectedValue(new Error('boom'));
    draw();
    // Caught inside act() rather than letting the act promise reject: a
    // rejected act skips React's flush, so the state set in the catch block
    // would not be visible to the assertions below.
    let thrown;
    await act(async () => { await call().catch((e) => { thrown = e; }); });
    expect(thrown).toBeInstanceOf(Error);
    expect(thrown.message).toBe('boom');
    expect(data.error).toBe(message);
    expect(toast.error).toHaveBeenCalledWith(message);
  });

  it.each([
    ['filterTasks', () => actions.filterTasks('To-Do'), 'filterTasks', 'Failed to filter tasks.'],
    ['searchTasks', () => actions.searchTasks('x'), 'searchTasks', 'Failed to search tasks.'],
  ])('%s reports without re-throwing, since the list simply stays put', async (_n, call, method, message) => {
    taskService[method].mockRejectedValue(new Error('boom'));
    draw();
    await act(async () => { await call(); });
    expect(data.error).toBe(message);
    expect(toast.error).toHaveBeenCalledWith(message);
  });
});

describe('unsaved-changes guard', () => {
  it('warns before unload only while changes are pending', async () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    draw();
    expect(add).not.toHaveBeenCalledWith('beforeunload', expect.any(Function));

    act(() => actions.setUnsavedChanges(true));
    expect(add).toHaveBeenCalledWith('beforeunload', expect.any(Function));

    act(() => actions.setUnsavedChanges(false));
    expect(remove).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('a successful save clears the pending flag', async () => {
    taskService.createTask.mockResolvedValue(A);
    const remove = vi.spyOn(window, 'removeEventListener');
    draw();
    act(() => actions.setUnsavedChanges(true));
    await act(async () => { await actions.createTask({}); });
    expect(remove).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });
});
