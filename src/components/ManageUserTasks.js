import React, { useContext, useEffect, useState } from 'react';
import { TaskContext } from '../contexts/TaskContext';
import { useParams, useNavigate } from 'react-router-dom';
import AllTasks from '../pages/AllTasks';

function ManageUserTasks() {
  const { fetchUserTasks } = useContext(TaskContext);
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        await fetchUserTasks(userId);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setErrorMessage('Error fetching tasks.');
        setLoading(false);
      }
    };
    fetchTasks();
  }, [userId, fetchUserTasks]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="manage-user-tasks-container">
      <h1>Manage Tasks for User {userId}</h1>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {loading ? (
        <div>Loading task data...</div>
      ) : (
        <AllTasks userId={userId} />
      )}
      <button type="button" onClick={handleBack}>Back</button>
    </div>
  );
}

export default ManageUserTasks;