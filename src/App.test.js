import { render, screen } from '@testing-library/react';
import App from './App';
import { apiCalls, resetApiCalls } from './testUtils/mockApi';

jest.mock('./utils/axiosInstance', () => require('./testUtils/mockApi'));

beforeEach(() => {
  localStorage.clear();
  resetApiCalls();
});

test('renders the public landing page for an anonymous visitor', async () => {
  render(<App />);
  expect((await screen.findAllByText(/TaskFlow/i)).length).toBeGreaterThan(0);
});

test('does not request the user list before anyone has logged in', async () => {
  render(<App />);
  await screen.findAllByText(/TaskFlow/i);
  // UserProvider used to fetch /users on mount for every visitor, including
  // anonymous ones on the landing page.
  expect(apiCalls.map(c => c.url)).not.toContain('/users');
});
