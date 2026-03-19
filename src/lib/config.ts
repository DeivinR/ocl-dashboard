export const getAppUrl = (): string => {
  const envUrl = import.meta.env.VITE_APP_URL || '';
  const url = envUrl || globalThis.location.origin;
  return url.replace(/\/$/, '');
};
