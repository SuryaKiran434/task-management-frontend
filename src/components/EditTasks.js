// src/pages/EditTask.js
import React, { useContext, useEffect, useState } from 'react';
import { TaskContext } from '../contexts/TaskContext';
import { useParams, useNavigate } from 'react-router-dom';

function EditTask() {
  const { tasks, updateTask, setUnsavedChanges } = useContext(TaskContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [taskData, setTaskData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const task = tasks.find((task) => task.id === id);
    if (task) {
      setTaskData(task);
      console.log("Task data loaded:", task);
    } else {
      console.error("Task not found with ID:", id);
    }
  }, [tasks, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
    setUnsavedChanges(true);
    console.log("Field updated:", name, "New value:", value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting updated task data:", taskData);
      await updateTask(id, taskData);
      setUnsavedChanges(false);
      console.log("Task updated successfully, navigating to view tasks");
      navigate('/view-tasks');
    } catch (error) {
      console.error("Error updating task:", error);
      setErrorMessage('Failed to update task.');
    }
  };

  const handleBack = () => {
    if (window.confirm("You have unsaved changes. Do you want to go back?")) {
      setUnsavedChanges(false);
      navigate(-1);
    }
  };

  return (
    <div className="edit-task-container">
      <h1>Edit Task</h1>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {taskData ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={taskData.title}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="description"
            value={taskData.description}
            onChange={handleInputChange}
          />
          <select
            name="priority"
            value={taskData.priority}
            onChange={handleInputChange}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <input
            type="date"
            name="dueDate"
            value={taskData.dueDate ? taskData.dueDate.split('T')[0] : ''}
            onChange={handleInputChange}
          />
          <button type="submit">Save Task</button>
          <button type="button" onClick={handleBack}>Back</button>
        </form>
      ) : (
        <div>Loading task data...</div>
      )}
    </div>
  );
}

export default EditTask;
