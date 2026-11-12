import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Cpu,
  Database,
  History,
  LayoutDashboard,
  Lightbulb,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type AppRole = 'student' | 'faculty' | 'admin';

export interface NavigationLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const roleNavigation: Record<AppRole, NavigationLink[]> = {
  student: [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/performance', label: 'Performance', icon: BarChart3 },
    { href: '/student/subjects', label: 'Subjects', icon: BookOpen },
    { href: '/student/risk-analysis', label: 'Risk Analysis', icon: AlertTriangle },
    { href: '/student/recommendations', label: 'AI Guidance', icon: Lightbulb },
    { href: '/student/progress', label: 'Progress', icon: History },
    { href: '/student/profile', label: 'Academic Data', icon: User },
  ],
  faculty: [
    { href: '/faculty/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/faculty/students', label: 'Students Directory', icon: Users },
    { href: '/faculty/analytics', label: 'Cohort Analytics', icon: BarChart3 },
  ],
  admin: [
    { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/data-import', label: 'Data Ingestion', icon: Database },
    { href: '/admin/model-management', label: 'ML Model Hub', icon: Cpu },
    { href: '/admin/users', label: 'Accounts', icon: Users },
    { href: '/admin/bug-reports', label: 'Reported Bugs', icon: AlertTriangle },
  ],
};

const primaryRoutes: Record<AppRole, string[]> = {
  student: [
    '/student/dashboard',
    '/student/subjects',
    '/student/risk-analysis',
    '/student/recommendations',
  ],
  faculty: [
    '/faculty/dashboard',
    '/faculty/students',
    '/faculty/analytics',
  ],
  admin: [
    '/admin/dashboard',
    '/admin/data-import',
    '/admin/users',
    '/admin/model-management',
  ],
};

export function getPrimaryNavigation(role: AppRole): NavigationLink[] {
  return primaryRoutes[role].flatMap((href) =>
    roleNavigation[role].filter((link) => link.href === href),
  );
}

export function isNavigationLinkActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
