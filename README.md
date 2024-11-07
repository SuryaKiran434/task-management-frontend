
# Task Management Tool

This Task Management Tool is a full-featured web application for managing tasks and user information, supporting role-based access control with secure JWT-based authentication. The application includes an admin dashboard, task management capabilities, and theming options.

## Features
- **Task Management**: Create, update, delete, and view tasks. Filter tasks by priority and status.
- **User Management**: Register new users, view user profiles, and manage user information. Admins can assign roles and manage all users and tasks.
- **Authentication**: JWT-based user authentication with refresh token support.
- **Authorization**: Role-based access control to restrict certain pages and actions to specific roles (e.g., admin access).
- **Responsive Design**: Styled with a dynamic theme for light and dark modes.

## Project Structure
The project follows a structured organization of files and directories:

- **components/**: Contains reusable components, including authentication forms, user information pages, and task management features.
- **contexts/**: Provides React Contexts for global state management, including authentication, user data, task data, and theming.
- **pages/**: Includes page-level components such as Home, Login, Admin Dashboard, and various task and user management screens.
- **services/**: Contains services for API interactions, handling authentication, user data, and task data.

## Key Components

### Authentication
- `AuthContext`: Manages user authentication state, login/logout functionality, and token refresh.
- `authService.js`: Handles login, logout, token refresh, and token management with local storage.

### User Management
- `UserContext`: Fetches and manages user data, updating roles, and deleting users.
- `userService.js`: Provides functions to register new users, assign admin roles, fetch user info, and update user data.

### Task Management
- `TaskContext`: Manages task data, fetching tasks for specific users or all tasks for admin, and task CRUD operations.
- `taskService.js`: Provides API calls to fetch, create, update, and delete tasks.

### Theming
- `ThemeContext`: Provides light and dark themes, with local storage to remember user preferences.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd task-management-tool
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application runs on `http://localhost:3000` by default.

## API Documentation
This application interacts with a backend API hosted at `http://localhost:8081/api`. The API follows RESTful principles, and includes endpoints for user registration, authentication, task management, and user management.

### Example Endpoints
- **User Authentication**: `/authenticate`, `/refresh-token`
- **User Management**: `/users`, `/users/:id`, `/users/:id/assign-admin`
- **Task Management**: `/tasks`, `/tasks/:id`

## License
This project is licensed under the MIT License. See the LICENSE file for more details.
