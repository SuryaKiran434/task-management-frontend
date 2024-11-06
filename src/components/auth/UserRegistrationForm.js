import React, { useState } from 'react';
import './UserRegistrationForm.css';
import userService from '../../services/userService';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting registration form with data:', formData); // Debugging log
    try {
      const response = await userService.registerUser(formData);
      console.log('User registered successfully:', response); // Debugging log
    } catch (error) {
      console.error('Registration failed:', error); // Debugging log
    }
  };

  return (
    <div className="registration-container">
      <h2>New User Registration</h2>
      <form className="registration-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First Name"
        />
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterForm;