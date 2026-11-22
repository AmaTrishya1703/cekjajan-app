const pad = (n) => String(n).padStart(2, '0');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const startOfDay = (ts) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

// 10.20 (format jam Indonesia)
export const formatTime = (ts) => {
  const d = new Date(ts);
  return `${pad(d.getHours())}.${pad(d.getMinutes())}`;
};

// 0 = hari ini, 1 = kemarin, dst.
export const daysAgo = (ts, now = Date.now()) =>
  Math.round((startOfDay(now) - startOfDay(ts)) / 86400000);

export const isToday = (ts) => daysAgo(ts) === 0;

export const dayLabel = (ts, now = Date.now()) => {
  const diff = daysAgo(ts, now);
  if (diff === 0) return 'Hari ini';
  if (diff === 1) return 'Kemarin';
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
