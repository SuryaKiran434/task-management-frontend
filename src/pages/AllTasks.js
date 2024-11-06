import React, { useContext, useEffect, useState } from 'react';
import { TaskContext } from '../contexts/TaskContext';
import { AuthContext } from '../contexts/AuthContext';
import './AllTasks.css';

function AllTasks({ userId }) {
  const { tasks, fetchUserTasks, fetchTasks, updateTask, deleteTask, error } = useContext(TaskContext);
  const { currentUser } = useContext(AuthContext);
  const [editingTask, setEditingTask] = useState(null);
  const [taskData, setTaskData] = useState({ title: '', status: '', description: '', priority: '', dueDate: '' });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchTasksForUser = async () => {
      if (userId) {
        console.log('Fetching tasks for user:', userId);
        await fetchUserTasks(userId);
      } else if (currentUser) {
        if (currentUser.role === 'ADMIN') {
          console.log('Admin accessing all tasks');
          await fetchTasks();
        } else {
          console.log('Fetching tasks for user:', currentUser.id);
          await fetchUserTasks(currentUser.id);
        }
      } else {
        console.log('No current user found');
      }
    };

    fetchTasksForUser();
  }, [userId, currentUser, fetchUserTasks, fetchTasks]);

  const handleEditClick = (task) => {
    setEditingTask(task.id);
    setTaskData({ ...task });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleSaveClick = async () => {
    if (!editingTask) {
      setErrorMessage('No task is being edited.');
      return;
    }

    const taskDataWithId = { ...taskData, id: editingTask };

    try {
      await updateTask(taskDataWithId);
      setEditingTask(null);
      if (userId) {
        await fetchUserTasks(userId);
      } else if (currentUser?.id) {
        await fetchUserTasks(currentUser.id);
      }
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating task:', error);
      setErrorMessage('Failed to update task. Please try again later.');
    }
  };

  const handleDiscardClick = () => {
    setEditingTask(null);
    setTaskData({ title: '', status: '', description: '', priority: '', dueDate: '' });
  };

  const handleDeleteClick = async (taskId) => {
    try {
      await deleteTask(taskId);
      if (userId) {
        await fetchUserTasks(userId);
      } else if (currentUser?.id) {
        await fetchUserTasks(currentUser.id);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setErrorMessage('Failed to delete task. Please try again later.');
    }
  };

  return (
    <div className="all-tasks-container">
      <h1>All Tasks</h1>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {error && <div className="error-message">{error}</div>}
      <table className="tasks-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Description</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="task-row">
              <td>{task.id}</td>
              <td>{editingTask === task.id ? <input type="text" name="title" value={taskData.title} onChange={handleInputChange} /> : task.title}</td>
              <td>{editingTask === task.id ? (
                <select name="status" value={taskData.status} onChange={handleInputChange}>
                  <option value="To-Do">To-Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                </select>
              ) : task.status}</td>
              <td>{editingTask === task.id ? <input type="text" name="description" value={taskData.description} onChange={handleInputChange} /> : task.description}</td>
              <td className={task.priority.toLowerCase()}>{editingTask === task.id ? (
                <select name="priority" value={taskData.priority} onChange={handleInputChange}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              ) : task.priority}</td>
              <td>{editingTask === task.id ? <input type="date" name="dueDate" value={taskData.dueDate.split('T')[0]} onChange={handleInputChange} /> : new Date(task.dueDate).toLocaleDateString()}</td>
              <td>{editingTask === task.id ? (
                <>
                  <button onClick={handleSaveClick}>Save</button>
                  <button onClick={handleDiscardClick}>Discard</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEditClick(task)}>Edit</button>
                  <button onClick={() => handleDeleteClick(task.id)}>Delete</button>
                </>
              )}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AllTasks;