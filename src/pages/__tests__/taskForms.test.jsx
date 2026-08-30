/**
 * The two task forms: CreateTask and EditTasks.
 *
 * Both are plain controlled forms over a context mutator, so they are driven
 * directly with a stubbed context rather than through the router and providers.
 * What is worth pinning is the behaviour that is easy to break silently --
 * client-side validation, the unsaved-changes guard, and that a failed save
 * reports the failure instead of navigating away as though it had worked.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskActionsContext, TaskContext } from '../../contexts/TaskContext';

// A fresh spy per test, not one shared across the file. Both forms navigate
// from inside a setTimeout after a successful save (1000ms and 900ms), and that
// timer outlives the test that scheduled it. A single shared spy would be
// called by the previous test's timer partway through the next one; because the
// mock factory reads this binding at call time, each component captures the spy
// that existed when it rendered, so a late timer can only reach the old one.
let navigate;
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
  useParams: () => ({ taskId: '11' }),
}));

import CreateTask from '../CreateTask';
import EditTask from '../../components/EditTasks';

const TASK = {
  id: 11, title: 'Write report', description: 'Q3 numbers',
  priority: 'HIGH', status: 'To-Do', dueDate: '2026-09-01T00:00:00Z',
};

const field = (label) => screen.getByLabelText(new RegExp(label, 'i'));

// The title and due-date inputs carry the native `required` attribute, so a
// browser -- and jsdom -- refuses to fire submit while they are empty, and the
// component's own validate() never runs. Submitting the form element directly
// bypasses constraint validation, which is the only way to reach the
// second-line JS validation these tests are about.
const submitForm = (container) => fireEvent.submit(container.querySelector('form'));

beforeEach(() => { vi.clearAllMocks(); navigate = vi.fn(); });

describe('CreateTask', () => {
  const draw = (createTask = vi.fn().mockResolvedValue({})) => {
    const { container } = render(
      <TaskActionsContext.Provider value={{ createTask }}>
        <CreateTask />
      </TaskActionsContext.Provider>,
    );
    return { createTask, container };
  };

  it('renders every field the backend requires', () => {
    draw();
    expect(field('Task Title')).toBeInTheDocument();
    expect(field('Description')).toBeInTheDocument();
    expect(field('Due Date')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('refuses to submit without a title or a due date, and says why', async () => {
    const { createTask, container } = draw();
    submitForm(container);
    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Due date is required')).toBeInTheDocument();
    expect(createTask).not.toHaveBeenCalled();
  });

  it('treats a whitespace-only title as missing', async () => {
    const { createTask, container } = draw();
    fireEvent.change(field('Task Title'), { target: { name: 'title', value: '   ' } });
    submitForm(container);
    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(createTask).not.toHaveBeenCalled();
  });

  it('clears a field error as soon as that field is corrected', async () => {
    const { container } = draw();
    submitForm(container);
    await screen.findByText('Title is required');
    fireEvent.change(field('Task Title'), { target: { name: 'title', value: 'Real title' } });
    await waitFor(() => expect(screen.queryByText('Title is required')).toBeNull());
    expect(screen.getByText('Due date is required')).toBeInTheDocument();
  });

  it('submits the form values and confirms', async () => {
    const { createTask } = draw();
    fireEvent.change(field('Task Title'), { target: { name: 'title', value: 'Ship it' } });
    fireEvent.change(field('Description'), { target: { name: 'description', value: 'the thing' } });
    fireEvent.change(field('Due Date'), { target: { name: 'dueDate', value: '2026-09-30' } });
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => expect(createTask).toHaveBeenCalledWith({
      title: 'Ship it', description: 'the thing', priority: 'LOW',
      dueDate: '2026-09-30', status: 'To-Do',
    }));
    expect(await screen.findByText(/created successfully/i)).toBeInTheDocument();
  });

  it('reports a failed save rather than navigating away', async () => {
    draw(vi.fn().mockRejectedValue(new Error('nope')));
    fireEvent.change(field('Task Title'), { target: { name: 'title', value: 'Ship it' } });
    fireEvent.change(field('Due Date'), { target: { name: 'dueDate', value: '2026-09-30' } });
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));
    expect(await screen.findByText(/failed to create task/i)).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalledWith('/view-tasks');
  });

  it('goes back when Back is pressed', () => {
    draw();
    fireEvent.click(screen.getByRole('button', { name: /^back$/i }));
    expect(navigate).toHaveBeenCalledWith(-1);
  });
});

describe('EditTask', () => {
  const draw = (tasks = [TASK], updateTask = vi.fn().mockResolvedValue({})) => {
    render(
      <TaskContext.Provider value={{ tasks, updateTask }}>
        <EditTask />
      </TaskContext.Provider>,
    );
    return updateTask;
  };

  it('shows a loading line until the task is found in context', () => {
    draw([]);
    expect(screen.getByText(/loading task/i)).toBeInTheDocument();
  });

  it('prefills from the task, trimming the time off the due date', async () => {
    draw();
    expect(await screen.findByDisplayValue('Write report')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Q3 numbers')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-09-01')).toBeInTheDocument();
  });

  it('matches on loose id equality, so a numeric id still resolves a string param', async () => {
    draw([{ ...TASK, id: 11 }]);
    expect(await screen.findByDisplayValue('Write report')).toBeInTheDocument();
  });

  it('saves the edited values', async () => {
    const updateTask = draw();
    await screen.findByDisplayValue('Write report');
    fireEvent.change(field('^Title'), { target: { name: 'title', value: 'Edited' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(updateTask).toHaveBeenCalledWith('11',
      expect.objectContaining({ title: 'Edited' })));
    expect(await screen.findByText(/updated successfully/i)).toBeInTheDocument();
  });

  it('reports a failed save', async () => {
    draw([TASK], vi.fn().mockRejectedValue(new Error('nope')));
    await screen.findByDisplayValue('Write report');
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(await screen.findByText(/failed to update task/i)).toBeInTheDocument();
  });

  it('leaves immediately when nothing has been edited', async () => {
    draw();
    await screen.findByDisplayValue('Write report');
    fireEvent.click(screen.getByRole('button', { name: /^back$/i }));
    expect(navigate).toHaveBeenCalledWith(-1);
  });

  it('asks before discarding unsaved edits', async () => {
    draw();
    await screen.findByDisplayValue('Write report');
    fireEvent.change(field('^Title'), { target: { name: 'title', value: 'Edited' } });
    fireEvent.click(screen.getByRole('button', { name: /^back$/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });
});
