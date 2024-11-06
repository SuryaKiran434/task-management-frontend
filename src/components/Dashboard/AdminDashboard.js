import React, { useEffect, useContext } from 'react';
import { UserContext } from '../../contexts/userContext';
import { TaskContext } from '../../contexts/TaskContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css'; // Import the CSS file

function AdminDashboard() {
  const { users, fetchAllUsers, deleteUser } = useContext(UserContext);
  const { tasks, fetchTasks, deleteTask } = useContext(TaskContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAllUsers();
        await fetchTasks(true); // Fetch all tasks as admin
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run only once

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTask(taskId);
      // Optionally re-fetch tasks after deletion if necessary
      fetchTasks(true);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUser(userId);
      // Optionally re-fetch users after deletion
      fetchAllUsers();
    }
  };

  const handleManageUser = (userId) => {
    navigate(`/manage-user/${userId}`);
  };

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>
      <h2>Manage Users</h2>
      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>
                  <button onClick={() => handleManageUser(user.id)}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;