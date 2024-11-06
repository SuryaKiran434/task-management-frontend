import React, { useState, useContext } from 'react';
import { TaskContext } from '../contexts/TaskContext';
import { useNavigate } from 'react-router-dom';
import './CreateTask.css';

function CreateTask() {
  const { createTask, setUnsavedChanges } = useContext(TaskContext);
  const [newTaskData, setNewTaskData] = useState({ title: '', description: '', priority: 'LOW', dueDate: '', status: 'To-Do' });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTaskData({ ...newTaskData, [name]: value });
    setUnsavedChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask(newTaskData);
      setUnsavedChanges(false);
      navigate('/dashboard');
    } catch {
      setErrorMessage("Failed to create task.");
    }
  };

  const handleBack = () => {
    if (window.confirm("You have unsaved changes. Do you want to go back?")) {
      setUnsavedChanges(false);
      navigate(-1);
    }
  };

  return (
    <div className="create-task-container">
      <h1>Create Task</h1>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" value={newTaskData.title} onChange={handleInputChange} placeholder="Title" required />
        <textarea name="description" value={newTaskData.description} onChange={handleInputChange} placeholder="Description" />
        <select name="priority" value={newTaskData.priority} onChange={handleInputChange}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <input type="date" name="dueDate" value={newTaskData.dueDate} onChange={handleInputChange} />
        <select name="status" value={newTaskData.status} onChange={handleInputChange}>
          <option value="To-Do">To-Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Complete">Complete</option>
        </select>
        <button type="submit">Add Task</button>
        <button type="button" onClick={handleBack}>Back</button>
      </form>
    </div>
  );
}

export default CreateTask;