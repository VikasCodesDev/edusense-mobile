import { describe, expect, test } from 'vitest';
import {
  getPrimaryNavigation,
  isNavigationLinkActive,
  roleNavigation,
} from './navigation';

describe('role-based mobile navigation', () => {
  test.each([
    ['student', ['/student/dashboard', '/student/subjects', '/student/risk-analysis', '/student/recommendations']],
    ['faculty', ['/faculty/dashboard', '/faculty/students', '/faculty/analytics']],
    ['admin', ['/admin/dashboard', '/admin/data-import', '/admin/users', '/admin/model-management']],
  ] as const)('shows the right primary destinations for %s', (role, expectedRoutes) => {
    expect(getPrimaryNavigation(role).map(({ href }) => href)).toEqual(expectedRoutes);
    expect(getPrimaryNavigation(role)).toHaveLength(role === 'faculty' ? 3 : 4);
  });

  test.each(Object.entries(roleNavigation))(
    'keeps every %s route in the secondary navigation',
    (role, links) => {
      const primaryRoutes = getPrimaryNavigation(role as keyof typeof roleNavigation).map(({ href }) => href);
      expect(new Set([...primaryRoutes, ...links.map(({ href }) => href)])).toEqual(
        new Set(links.map(({ href }) => href)),
      );
    },
  );

  test('keeps detail pages selected under their parent destination', () => {
    expect(isNavigationLinkActive('/faculty/students/EDU-1', '/faculty/students')).toBe(true);
    expect(isNavigationLinkActive('/student/profile', '/student/progress')).toBe(false);
  });
});
