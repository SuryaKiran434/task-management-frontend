import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/userContext'; // Import UserContext

function ManageUser() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { assignAdmin } = useContext(UserContext); // Use UserContext to get assignAdmin

  return (
    <div>
      <h1>Manage User {userId}</h1>
      <button onClick={() => navigate(`/edit-user/${userId}`)}>Edit User Information</button>
      <button onClick={() => navigate(`/manage-user-tasks/${userId}`)}>Manage User's Tasks</button>
      <button onClick={() => assignAdmin(userId)}>Assign Admin</button>
    </div>
  );
}

export default ManageUser;