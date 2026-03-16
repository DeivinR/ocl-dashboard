import type { GetToken } from './client';
import { createAuthFetch } from './client';

export type CalendarProduct = 'cash' | 'reneg' | 'retomada';

export interface CalendarItem {
  product: string;
  calendar_date: string;
  calendar_du: number;
  calendar_month: number;
}

export interface CalendarResponse {
  totalBusinessDays: number;
  currentDU: number;
}

export async function fetchCalendar(
  getToken: GetToken,
  product: CalendarProduct,
  date: string,
): Promise<CalendarResponse> {
  const path = `/calendar?product=${encodeURIComponent(product)}&date=${encodeURIComponent(date)}`;
  const res = await createAuthFetch(getToken)(path);
  const raw = (await res.json()) as CalendarItem[];

  if (!Array.isArray(raw) || raw.length === 0) {
    return { totalBusinessDays: 22, currentDU: 1 };
  }

  const target = new Date(date);
  const targetYear = target.getUTCFullYear();
  const targetMonth = target.getUTCMonth();

  const sameMonth = raw.filter((item) => {
    const d = new Date(item.calendar_date);
    return d.getUTCFullYear() === targetYear && d.getUTCMonth() === targetMonth;
  });

  const monthItems = sameMonth.length > 0 ? sameMonth : raw;

  let currentDU = 1;
  const match = monthItems.find((item) => {
    const d = new Date(item.calendar_date);
    return (
      d.getUTCFullYear() === targetYear && d.getUTCMonth() === targetMonth && d.getUTCDate() === target.getUTCDate()
    );
  });
  if (match) currentDU = match.calendar_du || 1;

  const totalBusinessDays = monthItems.reduce((max, item) => Math.max(item.calendar_du, max), 1);

  return { totalBusinessDays, currentDU };
}
