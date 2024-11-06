import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import './UserInfo.css'; // Import the CSS file

const UserInfo = () => {
  const { userId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const id = userId || currentUser?.id;
    console.log('useEffect called with id:', id);

    if (!userId && currentUser?.id) {
      console.log('Navigating to /view-information/', currentUser.id);
      navigate(`/view-information/${currentUser.id}`, { replace: true });
    } else if (id) {
      console.log('Fetching user data for id:', id);
      fetchUserData(id);
    } else {
      console.log('User ID is not available');
      setError('User ID is not available');
    }
  }, [userId, currentUser, navigate]);

  const fetchUserData = async (id) => {
    try {
      console.log('Fetching user data for id:', id);
      const response = await userService.getUserInfo(id);
      console.log('User data fetched:', response);
      setUserInfo(response);
    } catch (error) {
      console.error('Failed to fetch user information:', error);
      setError('Failed to fetch user information');
    }
  };

  return (
    <div className="user-info-container">
      {error && <div>{error}</div>}
      {userInfo ? (
        <div className="user-info">
          <h1>User Information</h1>
          <div className="user-info-field">
            <label>First Name:</label>
            <div className="user-info-value">{userInfo.firstName}</div>
          </div>
          <div className="user-info-field">
            <label>Last Name:</label>
            <div className="user-info-value">{userInfo.lastName}</div>
          </div>
          <div className="user-info-field">
            <label>Email:</label>
            <div className="user-info-value">{userInfo.email}</div>
          </div>
          <button onClick={() => navigate(`/edit-user-info/${userId}`)}>Edit</button>
        </div>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
};

export default UserInfo;