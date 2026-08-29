import React, { useRef } from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';
import { TaskProvider, useTaskActions, useTaskData, TaskContext } from './TaskContext';

jest.mock('../utils/axiosInstance', () => require('../testUtils/mockApi'));

function renderCounter() {
  const counts = { value: 0 };
  return [counts, () => { counts.value += 1; }];
}

describe('TaskContext is split so UI churn does not re-render data-only consumers', () => {
  it('keeps the actions context referentially stable while task data changes', async () => {
    const [actionCounts, bumpActions] = renderCounter();
    const [dataCounts, bumpData] = renderCounter();
    let actions;
    const actionIdentities = new Set();

    function ActionsOnly() {
      bumpActions();
      actions = useTaskActions();
      actionIdentities.add(actions);
      return <div>actions</div>;
    }

    function DataOnly() {
      bumpData();
      const { tasks } = useTaskData();
      return <div data-testid="count">{tasks.length}</div>;
    }

    render(
      <ToastProvider>
        <TaskProvider>
          <ActionsOnly />
          <DataOnly />
        </TaskProvider>
      </ToastProvider>
    );

    expect(actionCounts.value).toBe(1);
    expect(dataCounts.value).toBe(1);

    await act(async () => { await actions.fetchTasks(); });

    // Data landed, so the data consumer re-rendered...
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('3'));
    expect(dataCounts.value).toBeGreaterThan(1);

    // ...but the actions-only consumer never did, and the actions object it
    // received was created exactly once.
    expect(actionCounts.value).toBe(1);
    expect(actionIdentities.size).toBe(1);
  });

  it('still exposes the original combined TaskContext API', async () => {
    let value;
    function Legacy() {
      value = React.useContext(TaskContext);
      return null;
    }
    render(
      <ToastProvider>
        <TaskProvider>
          <Legacy />
        </TaskProvider>
      </ToastProvider>
    );

    for (const key of [
      'tasks', 'error', 'fetchTasks', 'fetchUserTasks', 'createTask',
      'updateTask', 'deleteTask', 'filterTasks', 'searchTasks', 'setUnsavedChanges',
    ]) {
      expect(value).toHaveProperty(key);
    }
  });
});

describe('ToastContext exposes a stable API', () => {
  it('does not hand out a new toast API when a toast is shown', async () => {
    let toast;
    const identities = new Set();
    const renders = { value: 0 };

    function Consumer() {
      renders.value += 1;
      toast = useToast();
      identities.add(toast);
      // A ref so we can prove the component instance was not remounted.
      useRef(null);
      return null;
    }

    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>
    );

    const before = toast;
    act(() => { toast.error('boom'); });
    await screen.findByText('boom');
    act(() => { toast.info('again'); });

    // This is the regression that made TaskContext's fetchTasks (and therefore
    // AllTasks' loadTasks effect) unstable: every toast used to produce a new
    // API object and re-trigger the task fetch.
    expect(toast).toBe(before);
    expect(identities.size).toBe(1);
  });
});
