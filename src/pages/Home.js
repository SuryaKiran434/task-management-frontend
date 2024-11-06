import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Task Management Tool</h1>
        <p>Your all-in-one solution to manage tasks efficiently</p>
      </header>

      <div className="features-section">
        <h2>Key Features</h2>
        <ul>
          <li>Create, update, and delete tasks with ease</li>
          <li>Filter tasks by priority and status</li>
          <li>Secure user authentication (JWT-based)</li>
          <li>Role-based access control for team collaboration</li>
          <li>Rate-limiting for optimized performance</li>
          <li>OpenAPI documentation for seamless integration</li>
          <li>Robust error handling and logging for reliability</li>
        </ul>
      </div>

      <div className="cta-section">
        <Link to="/login">
          <button className="btn-primary">User Login</button>
        </Link>
        <Link to="/admin-login">
          <button className="btn-primary">Admin Login</button>
        </Link>
        <Link to="/register">
          <button className="btn-primary">Register</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;