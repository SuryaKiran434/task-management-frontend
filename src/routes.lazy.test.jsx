import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders, AppRoutes } from './App';
import { USER } from './testUtils/mockApi';

vi.mock('./utils/axiosInstance', async () => await import('./testUtils/mockApi'));

// jsdom has no layout, so recharts' ResponsiveContainer logs width/height
// warnings on the Dashboard route. Not what these smoke tests are about.
const originalWarn = console.warn;
beforeAll(() => { console.warn = () => {}; });
afterAll(() => { console.warn = originalWarn; });

function renderAt(path) {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AppProviders>
  );
}

describe('lazy public routes mount', () => {
  beforeEach(() => localStorage.clear());

  const publicRoutes = [
    ['/', /Built for productivity/i],
    ['/login', /Welcome back/i],
    ['/admin-login', /Admin sign in/i],
    ['/register', /Create your account/i],
    ['/reset-password', /Secure password reset/i],
    ['/definitely-not-a-route', /404/],
  ];

  it.each(publicRoutes)('%s resolves its chunk and renders', async (path, matcher) => {
    renderAt(path);
    const found = await screen.findAllByText(matcher, {}, { timeout: 5000 });
    expect(found.length).toBeGreaterThan(0);
  });
});

describe('lazy private routes mount behind auth', () => {
  beforeEach(() => {
    localStorage.clear();
    // AuthProvider hydrates from localStorage, so this authenticates the
    // suite as an admin without touching jwt-decode or the network.
    localStorage.setItem('currentUser', JSON.stringify({ ...USER, token: 'test-token' }));
  });

  // Every private route, including the ones that read route params.
  const privateRoutes = [
    ['/dashboard', /dashboard|welcome/i],
    ['/admin-dashboard', /admin dashboard/i],
    ['/view-tasks', /my tasks/i],
    ['/create-task', /task/i],
    ['/edit-tasks/11', /task/i],
    ['/view-information', /ada|profile|information/i],
    ['/view-information/1', /ada|profile|information/i],
    ['/edit-user-info/1', /ada|edit|save/i],
    ['/edit-user/1', /edit|user/i],
    ['/manage-user-tasks/1', /manage tasks for user 1/i],
    ['/manage-user/1', /manage user/i],
  ];

  it.each(privateRoutes)('%s resolves its chunk and renders inside AppLayout', async (path, matcher) => {
    renderAt(path);
    // The authenticated shell (itself lazy) must resolve...
    expect(await screen.findAllByText(/TaskFlow/i, {}, { timeout: 5000 })).not.toHaveLength(0);
    // ...and then the route's own chunk.
    await waitFor(
      () => expect(screen.getAllByText(matcher).length).toBeGreaterThan(0),
      { timeout: 5000 }
    );
  });

  it('redirects an unauthenticated visitor away from a private route', async () => {
    localStorage.clear();
    renderAt('/view-tasks');
    expect(await screen.findByText(/Welcome back/i, {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it('redirects a non-admin away from an admin-only route', async () => {
    localStorage.setItem('currentUser', JSON.stringify({ ...USER, roles: ['ROLE_USER'], token: 't' }));
    renderAt('/admin-dashboard');
    // Bounced to /dashboard, so the admin heading must never appear.
    await waitFor(() => expect(screen.queryByText(/admin dashboard/i)).not.toBeInTheDocument());
  });
});
