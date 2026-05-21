import { parseDate } from './dates';

export const formatDate = (date) => {
  if (!date) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return parseDate(date).toLocaleDateString(undefined, options);
};
