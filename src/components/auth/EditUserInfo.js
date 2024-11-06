import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import './UserInfo.css'; // Reuse the CSS file

const EditUserInfo = () => {
  const { userId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const id = userId || currentUser?.id;
    if (id) {
      fetchUserData(id);
    } else {
      setError('User ID is not available');
    }
  }, [userId, currentUser]);

  const fetchUserData = async (id) => {
    try {
      const response = await userService.getUserInfo(id);
      setFormData({
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
      });
    } catch (error) {
      setError('Failed to fetch user information');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.updateUserInfo(userId, formData);
      navigate(`/view-information/${userId}`);
    } catch (error) {
      setError('Failed to update user information');
    }
  };

  return (
    <div className="user-info-container">
      {error && <div>{error}</div>}
      <form onSubmit={handleFormSubmit}>
        <div className="user-info-field">
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="user-info-field">
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="user-info-field">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">Save</button>
        <button type="button" onClick={() => navigate(`/view-information/${userId}`)}>Cancel</button>
      </form>
    </div>
  );
};

export default EditUserInfo;