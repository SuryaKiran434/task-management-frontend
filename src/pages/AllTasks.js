import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, InputAdornment, Chip, Stack,
  IconButton, Tooltip, MenuItem, Checkbox, Paper,
  ToggleButtonGroup, ToggleButton, Card, CardContent,
  Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, Snackbar, LinearProgress,
} from '@mui/material';
import {
  Search, List, Columns, Trash2, Edit3, Download, GripVertical,
} from 'lucide-react';
import {
  DndContext, DragOverlay, PointerSensor, KeyboardSensor,
  useSensor, useSensors, useDraggable, useDroppable, closestCenter,
} from '@dnd-kit/core';
import { TaskContext } from '../contexts/TaskContext';
import { AuthContext } from '../contexts/AuthContext';
import { taskService } from '../services/taskService';
import { format, isPast, isToday } from 'date-fns';
import { parseDate } from '../utils/dates';
import TaskDetailDrawer from '../components/Tasks/TaskDetailDrawer';
import { PRIORITY_COLORS as PRIORITY_COLOR, STATUS_COLORS as STATUS_COLOR } from '../theme/taskColors';

const KANBAN_COLS = ['To-Do', 'In Progress', 'Complete'];

function DueDateBadge({ date }) {
  if (!date) return null;
  const d = parseDate(date);
  const overdue = isPast(d) && !isToday(d);
  const dueToday = isToday(d);
  return (
    <Typography variant="caption" sx={{ color: overdue ? 'error.main' : dueToday ? 'warning.main' : 'text.secondary', fontWeight: overdue || dueToday ? 600 : 400 }}>
      {overdue ? '⚠ ' : dueToday ? '⏰ ' : ''}
      {format(d, 'MMM d')}
    </Typography>
  );
}

function TaskCard({ task, selected, onSelect, onEdit, onDelete, draggable = false, isDragging = false }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dragHandle = useDraggable({ id: `task-${task.id}`, data: { task }, disabled: !draggable });
  const dragStyle = draggable && dragHandle.transform
    ? { transform: `translate3d(${dragHandle.transform.x}px, ${dragHandle.transform.y}px, 0)`, zIndex: 1000 }
    : undefined;
  return (
    <>
      <Card
        ref={draggable ? dragHandle.setNodeRef : undefined}
        style={dragStyle}
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: selected ? 'primary.main' : 'divider',
          borderLeft: `4px solid ${PRIORITY_COLOR[task.priority] || '#ccc'}`,
          borderRadius: 2,
          opacity: isDragging ? 0.4 : 1,
          transition: 'box-shadow 0.15s, border-color 0.15s, opacity 0.15s',
          '&:hover': { boxShadow: 2 },
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            {draggable && (
              <Box
                {...dragHandle.attributes}
                {...dragHandle.listeners}
                sx={{
                  cursor: 'grab',
                  color: 'text.disabled',
                  display: 'flex',
                  alignItems: 'center',
                  pt: 0.25,
                  '&:active': { cursor: 'grabbing' },
                  '&:hover': { color: 'text.secondary' },
                }}
                aria-label="Drag task"
              >
                <GripVertical size={14} />
              </Box>
            )}
            <Checkbox size="small" checked={selected} onChange={() => onSelect(task.id)} sx={{ p: 0, mt: 0.2 }} />
            <Box sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setDrawerOpen(true)}>
              <Typography variant="body2" fontWeight={600} noWrap title={task.title}>{task.title}</Typography>
              {task.description && (
                <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {task.description}
                </Typography>
              )}
              <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
                <Chip label={task.status} size="small" sx={{ fontSize: '0.65rem', backgroundColor: `${STATUS_COLOR[task.status]}18`, color: STATUS_COLOR[task.status], height: 20 }} />
                <Chip label={task.priority} size="small" sx={{ fontSize: '0.65rem', backgroundColor: `${PRIORITY_COLOR[task.priority]}18`, color: PRIORITY_COLOR[task.priority], height: 20 }} />
                {task.labels?.map(l => <Chip key={l.id} label={l.name} size="small" sx={{ fontSize: '0.65rem', height: 20, backgroundColor: l.color ? `${l.color}20` : undefined, color: l.color }} />)}
              </Stack>
            </Box>
            <Stack direction="row" spacing={0.25}>
              <Tooltip title="Edit"><IconButton size="small" onClick={() => onEdit(task)}><Edit3 size={14} /></IconButton></Tooltip>
              <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete(task.id)}><Trash2 size={14} /></IconButton></Tooltip>
            </Stack>
          </Box>
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <DueDateBadge date={task.dueDate} />
          </Box>
        </CardContent>
      </Card>
      <TaskDetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} task={task} />
    </>
  );
}

function KanbanColumn({ col, colTasks, selectedIds, onSelect, onEdit, onDelete, activeTaskId }) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${col}`, data: { status: col } });
  return (
    <Box
      ref={setNodeRef}
      sx={{
        minWidth: { xs: 240, sm: 280 },
        flex: 1,
        scrollSnapAlign: 'start',
        borderRadius: 2,
        backgroundColor: isOver ? 'action.hover' : 'transparent',
        transition: 'background-color 0.15s',
        p: 0.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, px: 0.5 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: STATUS_COLOR[col] }} />
        <Typography variant="subtitle2" fontWeight={600}>{col}</Typography>
        <Chip label={colTasks.length} size="small" sx={{ height: 18, fontSize: '0.7rem', ml: 'auto' }} />
      </Box>
      <Stack spacing={1.5}>
        {colTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            draggable
            isDragging={activeTaskId === task.id}
            selected={selectedIds.includes(task.id)}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {colTasks.length === 0 && (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">Drop tasks here</Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}

function KanbanBoard({ tasks, selectedIds, onSelect, onEdit, onDelete, onStatusChange }) {
  const [activeTask, setActiveTask] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = (e) => {
    setActiveTask(e.active.data.current?.task || null);
  };

  const handleDragEnd = (e) => {
    setActiveTask(null);
    const { active, over } = e;
    if (!over) return;
    const task = active.data.current?.task;
    const newStatus = over.data.current?.status;
    if (task && newStatus && task.status !== newStatus) {
      onStatusChange(task, newStatus);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveTask(null)}>
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, alignItems: 'flex-start', scrollSnapType: { xs: 'x mandatory', md: 'none' } }}>
        {KANBAN_COLS.map(col => (
          <KanbanColumn
            key={col}
            col={col}
            colTasks={tasks.filter(t => t.status === col)}
            selectedIds={selectedIds}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            activeTaskId={activeTask?.id}
          />
        ))}
      </Box>
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <Box sx={{ width: 280, opacity: 0.95, transform: 'rotate(2deg)', boxShadow: 6 }}>
            <TaskCard task={activeTask} selected={false} onSelect={() => {}} onEdit={() => {}} onDelete={() => {}} />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function TableView({ tasks, selectedIds, onSelect, onSelectAll, onEdit, onDelete }) {
  const allSelected = tasks.length > 0 && selectedIds.length === tasks.length;
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.1)', width: 40 }}>
              <Checkbox size="small" checked={allSelected} indeterminate={selectedIds.length > 0 && !allSelected} onChange={() => onSelectAll()} />
            </th>
            {['Title', 'Status', 'Priority', 'Due Date', 'Actions'].map(h => (
              <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid rgba(0,0,0,0.1)', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <TableRow key={task.id} task={task} selected={selectedIds.includes(task.id)} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
      {tasks.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">No tasks found.</Typography>
        </Box>
      )}
    </Box>
  );
}

function TableRow({ task, selected, onSelect, onEdit, onDelete }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <>
      <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', cursor: 'default' }}>
        <td style={{ padding: '10px 12px' }}>
          <Checkbox size="small" checked={selected} onChange={() => onSelect(task.id)} />
        </td>
        <td style={{ padding: '10px 12px', maxWidth: 220 }}>
          <Typography variant="body2" fontWeight={500} noWrap title={task.title} sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => setDrawerOpen(true)}>
            {task.title}
          </Typography>
        </td>
        <td style={{ padding: '10px 12px' }}>
          <Chip label={task.status} size="small" sx={{ fontSize: '0.7rem', backgroundColor: `${STATUS_COLOR[task.status]}18`, color: STATUS_COLOR[task.status] }} />
        </td>
        <td style={{ padding: '10px 12px' }}>
          <Chip label={task.priority} size="small" sx={{ fontSize: '0.7rem', backgroundColor: `${PRIORITY_COLOR[task.priority]}18`, color: PRIORITY_COLOR[task.priority] }} />
        </td>
        <td style={{ padding: '10px 12px' }}>
          <DueDateBadge date={task.dueDate} />
        </td>
        <td style={{ padding: '10px 12px' }}>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit"><IconButton size="small" onClick={() => onEdit(task)}><Edit3 size={14} /></IconButton></Tooltip>
            <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete(task.id)}><Trash2 size={14} /></IconButton></Tooltip>
          </Stack>
        </td>
      </tr>
      <TaskDetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} task={task} />
    </>
  );
}

export default function AllTasks({ userId }) {
  const { tasks, fetchUserTasks, fetchTasks, deleteTask, filterTasks, searchTasks, updateTask } = useContext(TaskContext);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [view, setView] = useState('table');
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const searchTimer = useRef(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      if (userId) {
        await fetchUserTasks(userId);
      } else if (currentUser?.roles?.includes('ROLE_ADMIN')) {
        await fetchTasks();
      } else if (currentUser?.id) {
        await fetchUserTasks(currentUser.id);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, currentUser, fetchUserTasks, fetchTasks]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      if (q.trim().length > 1) searchTasks(q.trim());
      else loadTasks();
    }, 350);
  };

  const handleStatusFilter = (e) => {
    const val = e.target.value;
    setStatusFilter(val);
    if (val || priorityFilter) filterTasks(val || null, priorityFilter || null);
    else loadTasks();
  };

  const handlePriorityFilter = (e) => {
    const val = e.target.value;
    setPriorityFilter(val);
    if (val || statusFilter) filterTasks(statusFilter || null, val || null);
    else loadTasks();
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    setSelectedIds(prev => prev.length === tasks.length ? [] : tasks.map(t => t.id));
  };

  const handleDelete = (taskId) => {
    setDeleteConfirm(taskId);
  };

  const confirmDelete = async () => {
    try {
      await deleteTask(deleteConfirm);
      setSnack({ message: 'Task deleted', severity: 'success' });
      setDeleteConfirm(null);
      loadTasks();
    } catch {
      setSnack({ message: 'Failed to delete task', severity: 'error' });
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    try {
      await taskService.bulkDelete(selectedIds);
      setSnack({ message: `${selectedIds.length} tasks deleted`, severity: 'success' });
      setSelectedIds([]);
      loadTasks();
    } catch {
      setSnack({ message: 'Bulk delete failed', severity: 'error' });
    }
  };

  const handleExport = async () => {
    try {
      const response = await taskService.exportCsv();
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tasks.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setSnack({ message: 'Export failed', severity: 'error' });
    }
  };

  const handleEdit = (task) => {
    navigate(`/edit-tasks/${task.id}`);
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTask(task.id, { ...task, status: newStatus });
      setSnack({ message: `Moved to ${newStatus}`, severity: 'success' });
    } catch {
      setSnack({ message: 'Failed to move task', severity: 'error' });
      loadTasks();
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>My Tasks</Typography>
          <Typography color="text.secondary" variant="body2" mt={0.5}>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Export CSV">
            <IconButton onClick={handleExport} size="small"><Download size={18} /></IconButton>
          </Tooltip>
          <Button variant="contained" size="small" onClick={() => navigate('/create-task')} sx={{ borderRadius: 2 }}>
            + New Task
          </Button>
        </Stack>
      </Box>

      {/* Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={handleStatusFilter}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="To-Do">To-Do</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Complete">Complete</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Priority</InputLabel>
          <Select value={priorityFilter} label="Priority" onChange={handlePriorityFilter}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
          </Select>
        </FormControl>
        <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small">
          <ToggleButton value="table"><Tooltip title="List view"><List size={16} /></Tooltip></ToggleButton>
          <ToggleButton value="kanban"><Tooltip title="Kanban view"><Columns size={16} /></Tooltip></ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 1.5, borderRadius: 2, backgroundColor: 'primary.main', color: 'white' }}>
          <Typography variant="body2" fontWeight={600}>{selectedIds.length} selected</Typography>
          <Button size="small" startIcon={<Trash2 size={14} />} onClick={handleBulkDelete} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', border: '1px solid' }}>
            Delete selected
          </Button>
          <Button size="small" onClick={() => setSelectedIds([])} sx={{ color: 'rgba(255,255,255,0.8)', ml: 'auto' }}>
            Clear
          </Button>
        </Box>
      )}

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Task views */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2 }}>
          {view === 'table'
            ? <TableView tasks={tasks} selectedIds={selectedIds} onSelect={handleSelect} onSelectAll={handleSelectAll} onEdit={handleEdit} onDelete={handleDelete} />
            : <KanbanBoard tasks={tasks} selectedIds={selectedIds} onSelect={handleSelect} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
          }
        </Box>
      </Paper>

      {/* Delete confirmation */}
      <Dialog open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Task?</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone. The task will be soft-deleted and can be restored.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {snack && <Alert severity={snack.severity} onClose={() => setSnack(null)}>{snack.message}</Alert>}
      </Snackbar>
    </Box>
  );
}
