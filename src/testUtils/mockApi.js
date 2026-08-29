/**
 * Shared axios stub for tests. Every service module goes through
 * `utils/axiosInstance`, so mocking that one module keeps the whole app
 * offline without having to stub each service individually.
 *
 * Deliberately NOT built from `jest.fn()`: create-react-app's jest config sets
 * `resetMocks: true`, which strips the implementation off every jest mock
 * before each test and would make each stub return `undefined`. Calls are
 * recorded in `apiCalls` instead.
 */
const USER = {
  id: 1,
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  roles: ['ROLE_ADMIN'],
  createdAt: '2026-01-01T00:00:00Z',
};

const TASKS = [
  { id: 11, title: 'Write report', description: 'Q3 numbers', status: 'To-Do', priority: 'HIGH', dueDate: '2026-09-01' },
  { id: 12, title: 'Review PR', description: '', status: 'In Progress', priority: 'MEDIUM', dueDate: '2026-09-05' },
  { id: 13, title: 'Ship release', description: '', status: 'Complete', priority: 'LOW', dueDate: null },
];

const STATS = {
  total: 3, inProgress: 1, complete: 1, overdue: 0,
  highPriority: 1, mediumPriority: 1, lowPriority: 1,
};

/** Every request made through the stub: { method, url }. */
const apiCalls = [];

function resetApiCalls() {
  apiCalls.length = 0;
}

function body(url = '') {
  if (url.includes('/notifications/count')) return { count: 0 };
  if (url.includes('/notifications')) return [];
  if (url.includes('/tasks/stats')) return STATS;
  if (url.includes('/tasks/export')) return '';
  if (url.includes('/activity') || url.includes('/subtasks') || url.includes('/comments')) return [];
  if (url.includes('/tasks')) return TASKS;
  if (url === '/users') return [USER];
  if (url.startsWith('/users')) return USER;
  return [];
}

function request(method) {
  return (url) => {
    apiCalls.push({ method, url });
    return Promise.resolve({ data: body(url) });
  };
}

const axiosInstance = {
  get: request('get'),
  post: request('post'),
  put: request('put'),
  delete: request('delete'),
  patch: request('patch'),
  defaults: { headers: { common: {} } },
  interceptors: { request: { use: () => {} }, response: { use: () => {} } },
};

export { USER, TASKS, STATS, apiCalls, resetApiCalls };
export default axiosInstance;
