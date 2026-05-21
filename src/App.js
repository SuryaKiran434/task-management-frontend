import React, { lazy, Suspense, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import { UserProvider } from './contexts/userContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import AppLayout from './components/layout/AppLayout';

// Public pages
import Home from './pages/Home';
import Login from './components/auth/Login';
import AdminLogin from './components/auth/AdminLogin';
import UserRegistrationForm from './components/auth/UserRegistrationForm';
import ResetPassword from './components/auth/ResetPassword';
import NotFound from './pages/NotFound';

// Lazy-loaded private pages
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const AdminDashboard = lazy(() => import('./components/Dashboard/AdminDashboard'));
const AllTasks = lazy(() => import('./pages/AllTasks'));
const CreateTask = lazy(() => import('./pages/CreateTask'));
const EditTasks = lazy(() => import('./components/EditTasks'));
const UserInfo = lazy(() => import('./components/auth/UserInfo'));
const EditUserInfo = lazy(() => import('./components/auth/EditUserInfo'));
const EditUser = lazy(() => import('./components/EditUser'));
const ManageUserTasks = lazy(() => import('./components/ManageUserTasks'));
const ManageUser = lazy(() => import('./components/ManageUser'));

function LoadingFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );
}

function PrivateRoute({ component: Component, roles }) {
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles?.length) {
    const hasRole = roles.some(r => currentUser?.roles?.includes(r));
    if (!hasRole) return <Navigate to="/dashboard" replace />;
  }
  return (
    <AppLayout>
      <Suspense fallback={<LoadingFallback />}>
        <Component />
      </Suspense>
    </AppLayout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/register" element={<UserRegistrationForm />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Private */}
      <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} />
      <Route path="/admin-dashboard" element={<PrivateRoute component={AdminDashboard} roles={['ROLE_ADMIN']} />} />
      <Route path="/view-tasks" element={<PrivateRoute component={AllTasks} />} />
      <Route path="/create-task" element={<PrivateRoute component={CreateTask} />} />
      <Route path="/edit-tasks/:taskId" element={<PrivateRoute component={EditTasks} />} />
      <Route path="/view-information/:userId?" element={<PrivateRoute component={UserInfo} />} />
      <Route path="/edit-user-info/:userId" element={<PrivateRoute component={EditUserInfo} />} />
      <Route path="/edit-user/:userId" element={<PrivateRoute component={EditUser} roles={['ROLE_ADMIN']} />} />
      <Route path="/manage-user-tasks/:userId" element={<PrivateRoute component={ManageUserTasks} roles={['ROLE_ADMIN']} />} />
      <Route path="/manage-user/:userId" element={<PrivateRoute component={ManageUser} roles={['ROLE_ADMIN']} />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <UserProvider>
            <TaskProvider>
              <Router>
                <AppRoutes />
              </Router>
            </TaskProvider>
          </UserProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
