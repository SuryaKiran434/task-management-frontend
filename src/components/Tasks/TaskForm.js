import React, { useState, useEffect, useContext } from 'react';
import { TaskContext } from '../context/TaskContext';
import { format } from 'date-fns';

const TaskForm = ({ task }) => {
  const { createTask, updateTask } = useContext(TaskContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority?.toUpperCase() || ''); // Standardize to uppercase
      setDueDate(format(new Date(task.dueDate), 'yyyy-MM-dd'));
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskData = { title, description, priority: priority.toUpperCase(), dueDate: new Date(dueDate) };

    try {
      if (task && task.id) {
        await updateTask({ ...task, ...taskData });
      } else {
        await createTask(taskData);
      }
      // Clear form after submission
      setTitle('');
      setDescription('');
      setPriority('');
      setDueDate('');
      setError(null);
    } catch (err) {
      console.error('Error submitting task:', err);
      setError('Failed to submit task. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <select value={priority} onChange={(e) => setPriority(e.target.value)} required>
        <option value="">Select Priority</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
      <button type="submit">{task ? 'Update Task' : 'Create Task'}</button>
    </form>
  );
};

export default TaskForm;
