import React, { lazy, Suspense, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router';
import { Box, LinearProgress, Skeleton, Card, CardContent } from '@mui/material';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import { UserProvider } from './contexts/userContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

// Eager: the two cold-entry pages. Everything else is fetched on demand.
import Home from './pages/Home';
import Login from './components/auth/Login';

// Lazy public pages
const AdminLogin = lazy(() => import('./components/auth/AdminLogin'));
const UserRegistrationForm = lazy(() => import('./components/auth/UserRegistrationForm'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));

// The authenticated shell (sidebar, app bar, notification bell) is only ever
// rendered behind a login, so it does not belong in the initial download.
const AppLayout = lazy(() => import('./components/layout/AppLayout'));

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

/**
 * Fallback for a whole-page swap (public routes, and the authenticated shell
 * itself). The app already signals "work in progress" with a LinearProgress
 * bar on AllTasks / AdminDashboard / ManageUser, so this reuses that rather
 * than introducing a centred spinner the app never shows anywhere else.
 */
function PageFallback() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <LinearProgress />
    </Box>
  );
}

/**
 * Fallback for a route rendered inside AppLayout. Mirrors the Skeleton
 * treatment Dashboard and ManageUser already use while their data loads, so
 * the chunk fetch and the subsequent data fetch look like one continuous
 * loading state instead of a spinner followed by skeletons.
 */
function RouteFallback() {
  return (
    <Box>
      <Skeleton variant="text" width={220} height={44} />
      <Skeleton variant="text" width={140} height={20} sx={{ mb: 3 }} />
      <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        {[0, 1, 2, 3].map(i => (
          <Card key={i} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mb: 1.5 }} />
              <Skeleton width="60%" height={20} />
              <Skeleton width="40%" height={36} sx={{ mt: 0.5 }} />
            </CardContent>
          </Card>
        ))}
      </Box>
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <Skeleton key={i} variant="text" height={32} sx={{ mb: 1 }} />
          ))}
        </CardContent>
      </Card>
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
    <Suspense fallback={<PageFallback />}>
      <AppLayout>
        <Suspense fallback={<RouteFallback />}>
          <Component />
        </Suspense>
      </AppLayout>
    </Suspense>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
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
    </Suspense>
  );
}

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <UserProvider>
            <TaskProvider>
              {children}
            </TaskProvider>
          </UserProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AppProviders>
      {/*
        react-router v7 wraps every location update in React.startTransition by
        default. React deliberately does not show a Suspense fallback for a
        transition -- it keeps the current screen up until the new one is ready
        -- and since every route below is React.lazy, that silently retires the
        PageFallback and RouteFallback skeletons on client-side navigation:
        clicking a nav item would leave the old page on screen with no feedback
        until its chunk arrived. Declarative mode has no useNavigation() to
        build a pending indicator from, so opting out keeps the v6 behaviour the
        fallbacks were written for. Revisit if we ever move to a data router.
      */}
      <Router useTransitions={false}>
        <AppRoutes />
      </Router>
    </AppProviders>
  );
}
