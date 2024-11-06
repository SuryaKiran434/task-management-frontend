    // src/components/Dashboard/Dashboard.js
    import React from 'react';
    import { useNavigate } from 'react-router-dom';

    function Dashboard() {
      const navigate = useNavigate();

      return (
        <div>
          <h1>Dashboard</h1>
          <button onClick={() => navigate('/create-task')}>Create Task</button>
          <button onClick={() => navigate('/view-tasks')}>View All Tasks</button>
          <button onClick={() => navigate('/view-information')}>View Personal Information</button>
        </div>
      );
    }

    export default Dashboard;
