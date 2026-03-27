import type { UserReadDto } from '@/types/auth';

export const META_DOT = '·';

export function formatFeedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatAuthor(user: UserReadDto): string {
  return `${user.firstName} ${user.lastName}`.trim() || user.email;
}

export function snippetBody(content: string, maxLen = 200): string {
  const t = content.replace(/\s+/g, ' ').trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen).trim()}…`;
}
