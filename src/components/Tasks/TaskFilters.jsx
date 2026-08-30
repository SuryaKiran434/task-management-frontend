import React from 'react';

function TaskFilters({ onFilterChange }) {
  return (
    <div>
      <select onChange={(e) => onFilterChange('status', e.target.value)}>
        <option value="">All Statuses</option>
        <option value="To-Do">To-Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Complete">Complete</option>
      </select>
      <select onChange={(e) => onFilterChange('priority', e.target.value)}>
        <option value="">All Priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
    </div>
  );
}

export default TaskFilters;
