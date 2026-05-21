export const PRIORITY_COLORS = {
  HIGH:   '#EF4444',
  MEDIUM: '#F59E0B',
  LOW:    '#10B981',
};

export const STATUS_COLORS = {
  'To-Do':       '#6366F1',
  'In Progress': '#F59E0B',
  'Complete':    '#10B981',
};

export const PRIORITY_OPTIONS = [
  { value: 'LOW',    label: 'Low',    color: PRIORITY_COLORS.LOW },
  { value: 'MEDIUM', label: 'Medium', color: PRIORITY_COLORS.MEDIUM },
  { value: 'HIGH',   label: 'High',   color: PRIORITY_COLORS.HIGH },
];

export const STATUS_OPTIONS = [
  { value: 'To-Do',       label: 'To-Do',       color: STATUS_COLORS['To-Do'] },
  { value: 'In Progress', label: 'In Progress', color: STATUS_COLORS['In Progress'] },
  { value: 'Complete',    label: 'Complete',    color: STATUS_COLORS['Complete'] },
];
