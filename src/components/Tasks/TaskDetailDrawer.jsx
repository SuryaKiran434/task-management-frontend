import React, { useState, useEffect, useContext } from 'react';
import {
  Drawer, Box, Typography, Divider, IconButton, Chip, Stack,
  TextField, Button, List, ListItem, ListItemText, Checkbox,
  CircularProgress, Avatar, Tabs, Tab, LinearProgress,
} from '@mui/material';
import { X, Send, Trash2, Edit3, Plus, MessageSquare, Activity, CheckSquare } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { parseDate } from '../../utils/dates';
import commentService from '../../services/commentService';
import subtaskService from '../../services/subtaskService';
import activityService from '../../services/activityService';
import { AuthContext } from '../../contexts/AuthContext';
import { PRIORITY_COLORS as PRIORITY_COLOR, STATUS_COLORS as STATUS_COLOR } from '../../theme/taskColors';

function CommentSection({ taskId }) {
  const { currentUser } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    commentService.getComments(taskId)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [taskId]);

  const handleAdd = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const c = await commentService.addComment(taskId, newComment.trim());
      setComments(prev => [...prev, c]);
      setNewComment('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    await commentService.deleteComment(taskId, id);
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const handleEdit = async (id) => {
    await commentService.updateComment(taskId, id, editText);
    setComments(prev => prev.map(c => c.id === id ? { ...c, content: editText } : c));
    setEditId(null);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>;

  return (
    <Box>
      <List disablePadding>
        {comments.map(c => (
          <ListItem key={c.id} alignItems="flex-start" disableGutters sx={{ py: 1.5 }}>
            <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: 'primary.main', mr: 1.5, mt: 0.3, flexShrink: 0 }}>
              {c.authorEmail?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" fontWeight={600}>{c.authorEmail}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : ''}
                </Typography>
              </Box>
              {editId === c.id ? (
                <Box sx={{ mt: 0.5 }}>
                  <TextField size="small" fullWidth multiline value={editText} onChange={e => setEditText(e.target.value)} />
                  <Stack direction="row" spacing={1} mt={1}>
                    <Button size="small" variant="contained" onClick={() => handleEdit(c.id)}>Save</Button>
                    <Button size="small" onClick={() => setEditId(null)}>Cancel</Button>
                  </Stack>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ mt: 0.25 }}>{c.content}</Typography>
              )}
            </Box>
            {c.authorEmail === currentUser?.email && editId !== c.id && (
              <Stack direction="row" sx={{ ml: 1 }}>
                <IconButton size="small" onClick={() => { setEditId(c.id); setEditText(c.content); }}><Edit3 size={13} /></IconButton>
                <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}><Trash2 size={13} /></IconButton>
              </Stack>
            )}
          </ListItem>
        ))}
      </List>
      {comments.length === 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', py: 2 }}>No comments yet.</Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <TextField size="small" fullWidth placeholder="Add a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAdd()} multiline maxRows={3} />
        <IconButton color="primary" onClick={handleAdd} disabled={submitting || !newComment.trim()}>
          {submitting ? <CircularProgress size={18} /> : <Send size={18} />}
        </IconButton>
      </Box>
    </Box>
  );
}

function SubtaskSection({ taskId }) {
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    subtaskService.getSubtasks(taskId)
      .then(setSubtasks)
      .catch(() => setSubtasks([]))
      .finally(() => setLoading(false));
  }, [taskId]);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    const s = await subtaskService.createSubtask(taskId, { title: newTitle.trim() });
    setSubtasks(prev => [...prev, s]);
    setNewTitle('');
  };

  const handleToggle = async (s) => {
    try {
      const updated = await subtaskService.toggleSubtask(taskId, s.id);
      setSubtasks(prev => prev.map(x => x.id === s.id ? updated : x));
    } catch { /* ignore */ }
  };

  const handleDelete = async (id) => {
    await subtaskService.deleteSubtask(taskId, id);
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  const done = subtasks.filter(s => s.completed).length;
  const pct = subtasks.length ? Math.round((done / subtasks.length) * 100) : 0;

  if (loading) return <CircularProgress size={20} />;

  return (
    <Box>
      {subtasks.length > 0 && (
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">{done}/{subtasks.length} complete</Typography>
            <Typography variant="caption" color="primary.main" fontWeight={600}>{pct}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3 }} />
        </Box>
      )}
      <List disablePadding>
        {subtasks.map(s => (
          <ListItem key={s.id} disableGutters sx={{ py: 0.5 }} secondaryAction={
            <IconButton size="small" color="error" edge="end" onClick={() => handleDelete(s.id)}><Trash2 size={13} /></IconButton>
          }>
            <Checkbox size="small" checked={s.completed} onChange={() => handleToggle(s)} sx={{ p: 0.5 }} />
            <ListItemText
              primary={s.title}
              primaryTypographyProps={{ variant: 'body2', sx: { textDecoration: s.completed ? 'line-through' : 'none', color: s.completed ? 'text.disabled' : 'text.primary' } }}
            />
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <TextField size="small" fullWidth placeholder="Add subtask..." value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        <IconButton color="primary" onClick={handleAdd} disabled={!newTitle.trim()}><Plus size={18} /></IconButton>
      </Box>
    </Box>
  );
}

function ActivitySection({ taskId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    activityService.getTaskActivity(taskId)
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [taskId]);

  if (loading) return <CircularProgress size={20} />;
  if (!logs.length) return <Typography variant="caption" color="text.secondary" sx={{ display: 'block', py: 2, textAlign: 'center' }}>No activity yet.</Typography>;

  return (
    <List disablePadding>
      {logs.map(log => (
        <ListItem key={log.id} disableGutters alignItems="flex-start" sx={{ py: 0.75 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', bgcolor: 'secondary.main', mr: 1.5, mt: 0.25, flexShrink: 0 }}>
            {log.userEmail?.[0]?.toUpperCase() || 'S'}
          </Avatar>
          <Box>
            <Typography variant="body2">{log.description}</Typography>
            <Typography variant="caption" color="text.secondary">
              {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : ''}
            </Typography>
          </Box>
        </ListItem>
      ))}
    </List>
  );
}

export default function TaskDetailDrawer({ open, onClose, onExited, task }) {
  const [tab, setTab] = useState(0);

  if (!task) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      SlideProps={onExited ? { onExited } : undefined}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, p: 3 } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ flex: 1, pr: 2 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>{task.title}</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={task.status} size="small" sx={{ backgroundColor: `${STATUS_COLOR[task.status]}18`, color: STATUS_COLOR[task.status] }} />
            <Chip label={task.priority} size="small" sx={{ backgroundColor: `${PRIORITY_COLOR[task.priority]}18`, color: PRIORITY_COLOR[task.priority] }} />
            {task.labels?.map(l => <Chip key={l.id} label={l.name} size="small" sx={{ backgroundColor: l.color ? `${l.color}20` : undefined, color: l.color }} />)}
          </Stack>
        </Box>
        <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
      </Box>

      {task.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>{task.description}</Typography>
      )}

      <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
        {task.dueDate && (
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">Due date</Typography>
            <Typography variant="body2" fontWeight={500}>{format(parseDate(task.dueDate), 'MMM d, yyyy')}</Typography>
          </Box>
        )}
        {task.createdAt && (
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">Created</Typography>
            <Typography variant="body2" fontWeight={500}>{format(new Date(task.createdAt), 'MMM d, yyyy')}</Typography>
          </Box>
        )}
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, minHeight: 36 }} TabIndicatorProps={{ sx: { height: 2 } }}>
        <Tab label="Subtasks" icon={<CheckSquare size={14} />} iconPosition="start" sx={{ minHeight: 36, fontSize: '0.8rem', py: 0 }} />
        <Tab label="Comments" icon={<MessageSquare size={14} />} iconPosition="start" sx={{ minHeight: 36, fontSize: '0.8rem', py: 0 }} />
        <Tab label="Activity" icon={<Activity size={14} />} iconPosition="start" sx={{ minHeight: 36, fontSize: '0.8rem', py: 0 }} />
      </Tabs>

      {tab === 0 && <SubtaskSection taskId={task.id} />}
      {tab === 1 && <CommentSection taskId={task.id} />}
      {tab === 2 && <ActivitySection taskId={task.id} />}
    </Drawer>
  );
}
