export function isCurrentMonth(period: string | null): boolean {
  if (!period) return false;
  const d = new Date(period);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function isPreviousMonth(period: string | null): boolean {
  if (!period) return false;
  const d = new Date(period);
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1);
  return d.getFullYear() === prev.getFullYear() && d.getMonth() === prev.getMonth();
}

export function monthsAgoISO(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}
