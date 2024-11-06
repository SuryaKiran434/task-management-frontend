import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService'; // Import authService
import './AdminLogin.css';

function AdminLogin() {
  const { login, refreshToken } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous error
    try {
      const response = await login(email, password);
      if (response.roles && response.roles.includes('ADMIN')) {
        navigate('/admin-dashboard');
      } else {
        setError('You do not have the privilege to access the admin portal.');
      }
    } catch (err) {
      // Check for specific error messages
      if (err.message.includes('Token expired')) {
        // Attempt to refresh the token
        try {
          await refreshToken();
          // Optionally, retry the login here if needed or simply show a success message
          const retryResponse = await login(email, password);
          if (retryResponse.roles && retryResponse.roles.includes('ADMIN')) {
            navigate('/admin-dashboard');
          } else {
            setError('You do not have the privilege to access the admin portal.');
          }
        } catch (refreshError) {
          setError('Your session has expired. Please log in again.'); // Message for expired sessions
          authService.logout(); // Log out if refresh fails
          navigate('/login'); // Redirect to login
        }
      } else {
        setError('Email or password is incorrect.'); // Default error message
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box centered">
        <h2 className="login-title">Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className={`eye-icon ${showPassword ? 'show' : ''}`}
                onClick={() => setShowPassword(!showPassword)}
              >
                👁️
              </span>
            </div>
            {error && <p className="error-message">{error}</p>} {/* Show error message below password */}
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
