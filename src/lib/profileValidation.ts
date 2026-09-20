/**
 * Shared Profile Validation & Name Parsing Utilities
 * Enforces mandatory Title Prefix, First Name, Last Name, and Student ID for students.
 */

export interface ParsedThaiName {
  prefix: string;
  first: string;
  last: string;
}

/**
 * Parses Thai full name into prefix, first name, and last name.
 * Handles prefixes like นาย, นางสาว, นาง, ด.ช., ด.ญ.
 */
export function parseFullName(raw: string | undefined | null): ParsedThaiName {
  let prefix = 'นาย';
  let clean = (raw || '').trim();

  if (clean.startsWith('นางสาว')) {
    prefix = 'นางสาว';
    clean = clean.slice(6).trim();
  } else if (clean.startsWith('นาง')) {
    prefix = 'นาง';
    clean = clean.slice(3).trim();
  } else if (clean.startsWith('นาย')) {
    prefix = 'นาย';
    clean = clean.slice(3).trim();
  } else if (clean.startsWith('ด.ช.')) {
    prefix = 'ด.ช.';
    clean = clean.slice(4).trim();
  } else if (clean.startsWith('ด.ญ.')) {
    prefix = 'ด.ญ.';
    clean = clean.slice(4).trim();
  }

  // Remove any repeated prefix (e.g. if user wrote นาย into the first name field)
  clean = clean.replace(/^(นาย|นางสาว|นาง|ด\.ช\.|ด\.ญ\.)\s*/i, '').trim();

  const parts = clean.split(/\s+/).filter(Boolean);
  const first = parts[0] || '';
  const last = parts.slice(1).join(' ') || '';

  return { prefix, first, last };
}

/**
 * Validates that the full name contains BOTH a real first name (>= 2 chars)
 * AND a real last name (>= 2 chars), and does not contain email '@'.
 */
export function isFullNameComplete(fullName: string | undefined | null): boolean {
  if (!fullName) return false;
  const clean = fullName.trim();
  if (clean.length < 4 || clean.includes('@')) return false;

  const { first, last } = parseFullName(clean);
  return first.trim().length >= 2 && last.trim().length >= 2;
}

/**
 * Validates student ID:
 * - Not empty
 * - Not placeholder ('-', '65123456789')
 * - Must be 10-15 characters (e.g. 653321102001-1 or 11-13 digits)
 */
export function isStudentIdComplete(studentId: string | undefined | null): boolean {
  if (!studentId) return false;
  const clean = studentId.trim();
  if (!clean || clean === '-' || clean === '65123456789') return false;
  return /^[0-9A-Za-z-]{10,15}$/.test(clean);
}

/**
 * Checks whether a user's profile is fully complete.
 * Admins are always complete. Students require valid Title + First Name + Last Name + Student ID.
 */
export function isProfileComplete(user: {
  role?: string;
  fullName?: string;
  studentId?: string;
  isProfileCompleted?: boolean;
} | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return Boolean(
    user.isProfileCompleted &&
    isFullNameComplete(user.fullName) &&
    isStudentIdComplete(user.studentId)
  );
}
