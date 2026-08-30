import React, { useCallback, useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { TaskCard, TaskTableRow } from './AllTasks';
import { UserTaskRow } from '../components/ManageUser';

vi.mock('../utils/axiosInstance', async () => await import('../testUtils/mockApi'));

const TASK = {
  id: 11, title: 'Write report', description: 'Q3 numbers',
  status: 'To-Do', priority: 'HIGH', dueDate: '2026-09-01',
};

const MEMO_TYPE = Symbol.for('react.memo');

/**
 * Wraps the component under test in an identical React.memo shell whose render
 * function is spied on. `Component.type` is the raw render function inside
 * React.memo, so `Spied` runs exactly the same body under exactly the same
 * default shallow-prop comparison — it just counts how often it runs.
 */
function spyOn(Component) {
  const inner = Component.type;
  const spy = vi.fn();
  const Spied = React.memo(function Spied(props) {
    spy();
    return inner(props);
  });
  return [Spied, spy];
}

describe('row components are memoised', () => {
  it.each([
    ['TaskCard', TaskCard],
    ['TaskTableRow', TaskTableRow],
    ['UserTaskRow', UserTaskRow],
  ])('%s is wrapped in React.memo', (_name, Component) => {
    expect(Component.$$typeof).toBe(MEMO_TYPE);
  });
});

describe('TaskTableRow', () => {
  function Harness({ onRenderSpy: Row }) {
    const [unrelated, setUnrelated] = useState(0);
    const [selected, setSelected] = useState(false);

    // These mirror exactly what AllTasks passes: useCallback-stable handlers.
    const onSelect = useCallback(() => {}, []);
    const onEdit = useCallback(() => {}, []);
    const onDelete = useCallback(() => {}, []);
    const onOpenDetail = useCallback(() => {}, []);

    return (
      <>
        <button onClick={() => setUnrelated(n => n + 1)}>bump parent {unrelated}</button>
        <button onClick={() => setSelected(s => !s)}>toggle selected</button>
        <table><tbody>
          <Row
            task={TASK}
            selected={selected}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpenDetail={onOpenDetail}
          />
        </tbody></table>
      </>
    );
  }

  it('does not re-render when the parent re-renders with unchanged row props', () => {
    const [Row, spy] = spyOn(TaskTableRow);
    render(<Harness onRenderSpy={Row} />);
    expect(spy).toHaveBeenCalledTimes(1);

    act(() => { screen.getByText(/bump parent/).click(); });
    act(() => { screen.getByText(/bump parent/).click(); });

    // Parent rendered twice more; the row's props were identical each time.
    expect(screen.getByText('bump parent 2')).toBeInTheDocument();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does re-render when one of its own props actually changes', () => {
    const [Row, spy] = spyOn(TaskTableRow);
    render(<Harness onRenderSpy={Row} />);
    expect(spy).toHaveBeenCalledTimes(1);

    act(() => { screen.getByText('toggle selected').click(); });

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('memoisation is defeated by a fresh arrow function, which is why the callbacks are stabilised', () => {
    const [Row, spy] = spyOn(TaskTableRow);
    function UnstableHarness() {
      const [n, setN] = useState(0);
      return (
        <>
          <button onClick={() => setN(x => x + 1)}>bump</button>
          <table><tbody>
            <Row
              task={TASK}
              selected={false}
              onSelect={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
              onOpenDetail={() => {}}
            />
          </tbody></table>
        </>
      );
    }
    render(<UnstableHarness />);
    act(() => { screen.getByText('bump').click(); });
    expect(spy).toHaveBeenCalledTimes(2);
  });
});

describe('TaskCard', () => {
  function Harness({ Row }) {
    const [unrelated, setUnrelated] = useState(0);
    const onSelect = useCallback(() => {}, []);
    const onEdit = useCallback(() => {}, []);
    const onDelete = useCallback(() => {}, []);
    const onOpenDetail = useCallback(() => {}, []);
    return (
      <DndContext>
        <button onClick={() => setUnrelated(n => n + 1)}>bump {unrelated}</button>
        <Row
          task={TASK}
          selected={false}
          draggable
          isDragging={false}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenDetail={onOpenDetail}
        />
      </DndContext>
    );
  }

  it('does not re-render when the parent re-renders with unchanged props', () => {
    const [Row, spy] = spyOn(TaskCard);
    render(<Harness Row={Row} />);
    const initial = spy.mock.calls.length;

    act(() => { screen.getByText(/bump/).click(); });

    expect(screen.getByText('bump 1')).toBeInTheDocument();
    expect(spy).toHaveBeenCalledTimes(initial);
  });
});

describe('UserTaskRow', () => {
  function Harness({ Row }) {
    const [unrelated, setUnrelated] = useState(0);
    return (
      <>
        <button onClick={() => setUnrelated(n => n + 1)}>bump {unrelated}</button>
        <table><tbody><Row task={TASK} /></tbody></table>
      </>
    );
  }

  it('does not re-render when ManageUser re-renders for an unrelated reason', () => {
    const [Row, spy] = spyOn(UserTaskRow);
    render(<Harness Row={Row} />);
    expect(spy).toHaveBeenCalledTimes(1);

    act(() => { screen.getByText(/bump/).click(); });

    expect(screen.getByText('bump 1')).toBeInTheDocument();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('renders the task it is given', () => {
    render(<table><tbody><UserTaskRow task={TASK} /></tbody></table>);
    expect(screen.getByText('Write report')).toBeInTheDocument();
    expect(screen.getByText('To-Do')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });
});
