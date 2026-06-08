export function formatDate(timestamp) {
  if (!timestamp) return '—';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatMonth(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function getPercentage(obtained, total) {
  if (!total || total === 0) return 0;
  return Math.round((obtained / total) * 100);
}

export function getAttendancePercentage(presentCount, totalCount) {
  if (!totalCount || totalCount === 0) return 0;
  return Math.round((presentCount / totalCount) * 100);
}

export function getCurrentMonthYear() {
  const now = new Date();
  return now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
