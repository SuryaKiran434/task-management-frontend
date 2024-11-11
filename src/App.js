// App.js
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './components/auth/Login';
import AdminLogin from './components/auth/AdminLogin';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import Dashboard from './components/Dashboard/Dashboard';
import CreateTask from './pages/CreateTask';
import AllTasks from './pages/AllTasks';
import PrivateRoute from './components/auth/PrivateRoute';
import NotFound from './pages/NotFound';
import UserRegistrationForm from './components/auth/UserRegistrationForm';
import UserInfo from './components/auth/UserInfo';
import EditUser from './components/EditUser';
import EditUserInfo from './components/auth/EditUserInfo';
import EditTasks from './components/EditTasks';
import ManageUserTasks from './components/ManageUserTasks';
import ManageUser from './components/ManageUser';
import ThemeSwitcher from './components/ThemeSwitcher';
import DropdownMenu from './components/DropdownMenu';
import ResetPassword from './components/auth/ResetPassword'; // Import ResetPassword component
import { AuthProvider } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import { UserProvider } from './contexts/userContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

function AppContent() {
  const location = useLocation();
  const hideDropdownPaths = ['/', '/login', '/admin-login', '/register'];

  return (
    <div className="App">
      <ThemeSwitcher />
      {!hideDropdownPaths.includes(location.pathname) && <DropdownMenu />}
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<PrivateRoute component={AdminDashboard} roles={['ADMIN']} />} />
        <Route path="/dashboard" element={<PrivateRoute component={Dashboard} roles={['USER']} />} />
        <Route path="/create-task" element={<PrivateRoute component={CreateTask} />} />
        <Route path="/view-tasks" element={<PrivateRoute component={AllTasks} />} />
        <Route path="/register" element={<UserRegistrationForm />} />
        <Route path="/view-information/:userId?" element={<PrivateRoute component={UserInfo} />} />
        <Route path="/edit-user-info/:userId" element={<PrivateRoute component={EditUserInfo} />} />
        <Route path="/edit-user/:userId" element={<PrivateRoute component={EditUser} roles={['ADMIN']} />} />
        <Route path="/edit-tasks/:taskId" element={<PrivateRoute component={EditTasks} />} />
        <Route path="/manage-user-tasks/:userId" element={<PrivateRoute component={ManageUserTasks} roles={['ADMIN']} />} />
        <Route path="/manage-user/:userId" element={<PrivateRoute component={ManageUser} roles={['ADMIN']} />} />
        <Route path="/reset-password" element={<ResetPassword />} /> {/* Add route for reset password */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <TaskProvider>
          <ThemeProvider>
            <Router>
              <AppContent />
            </Router>
          </ThemeProvider>
        </TaskProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
