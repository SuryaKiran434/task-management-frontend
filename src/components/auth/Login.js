// Login.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Email or password is incorrect.'); // Universal error message
    }
  };

  return (
    <div className="login-container">
      <div className="login-box centered">
        <h2 className="login-title">Login</h2>
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

        {/* Forgot Password link */}
        <div className="forgot-password">
          <a href="/reset-password">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
