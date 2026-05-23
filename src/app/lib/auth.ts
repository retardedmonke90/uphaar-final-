export const ADMIN_EMAIL =
  (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.trim().toLowerCase() || 'jsaksham2007@gmail.com';

export function isAdminEmail(email?: string | null) {
  return (email || '').trim().toLowerCase() === ADMIN_EMAIL;
}
