'use client';

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getPrimaryNavigation, isNavigationLinkActive, roleNavigation } from '@/lib/navigation';
import {
  ChevronDown, GraduationCap, LogOut, Menu, Settings2, X,
} from 'lucide-react';

const testAccounts = [
  { email: 'student1@edusense.edu', role: 'student', name: 'Student test account' },
  { email: 'student2@edusense.edu', role: 'student', name: 'Student test account 2' },
  { email: 'student3@edusense.edu', role: 'student', name: 'Student test account 3' },
  { email: 'faculty@edusense.edu', role: 'faculty', name: 'Faculty test account' },
  { email: 'admin@edusense.edu', role: 'admin', name: 'Administrator test account' },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [testMenuOpen, setTestMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const links = user ? roleNavigation[user.role] : [];
  const primaryLinks = user ? getPrimaryNavigation(user.role) : [];

  useEffect(() => {
    if (loading) return;
    const isStudentPath = pathname.startsWith('/student');
    const isFacultyPath = pathname.startsWith('/faculty');
    const isAdminPath = pathname.startsWith('/admin');
    if (!user && (isStudentPath || isFacultyPath || isAdminPath)) {
      router.replace('/login');
      return;
    }
    if (!user) return;
    if (isStudentPath && user.role !== 'student') router.replace(user.role === 'faculty' ? '/faculty/dashboard' : '/admin/dashboard');
    if (isFacultyPath && user.role !== 'faculty') router.replace(user.role === 'student' ? '/student/dashboard' : '/admin/dashboard');
    if (isAdminPath && user.role !== 'admin') router.replace(user.role === 'student' ? '/student/dashboard' : '/faculty/dashboard');
  }, [loading, pathname, router, user]);

  const chooseTestAccount = (email: string, role: string) => {
    setTestMenuOpen(false);
    setMobileMenuOpen(false);
    router.push(`/login?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`);
  };

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#090d16]/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-3 py-2">
          <div className="flex min-w-0 items-center gap-4 xl:gap-8">
            <Link to="/" className="flex shrink-0 items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/30"><GraduationCap className="h-5 w-5" /></div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white">EduSense</span>
                <span className="-mt-1 hidden text-[10px] font-mono uppercase tracking-widest text-slate-400 sm:block">Academic Intelligence</span>
              </div>
            </Link>
            {user && <nav className="hidden items-center space-x-1 xl:flex">
              {links.map(({ href, label, icon: Icon }) => (
                <Link key={href} to={href} aria-current={isNavigationLinkActive(pathname, href) ? 'page' : undefined} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${isNavigationLinkActive(pathname, href) ? 'border border-indigo-500/30 bg-indigo-600/15 text-indigo-300' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'}`}>
                  <Icon className="h-3.5 w-3.5" /><span>{label}</span>
                </Link>
              ))}
            </nav>}
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <Link to="/settings/api" aria-label="Backend settings" title="Backend settings" className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:bg-slate-800 hover:text-white"><Settings2 className="h-4 w-4" /></Link>
            <div className="relative">
              <button onClick={() => setTestMenuOpen(!testMenuOpen)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 text-xs font-medium text-slate-300 hover:bg-slate-700/80" aria-expanded={testMenuOpen}>
                <span className="hidden sm:inline">Test accounts</span><span className="sm:hidden">Test</span><ChevronDown className="h-3 w-3 opacity-60" />
              </button>
              {testMenuOpen && <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-700/80 bg-[#101726] py-2 text-xs text-slate-300 shadow-2xl">
                <div className="border-b border-slate-800 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Shortcuts only — no passwords stored</div>
                {testAccounts.map((account) => <button key={account.email} onClick={() => chooseTestAccount(account.email, account.role)} className="block w-full px-3 py-2 text-left hover:bg-slate-800/80">
                  <span className="block font-medium text-white">{account.name}</span><span className="block break-all text-[11px] text-slate-400">{account.email}</span>
                </button>)}
                <p className="border-t border-slate-800 px-3 pt-2 text-[10px] leading-4 text-slate-500">These are repository seed-account emails. They work only if the connected backend has matching test accounts.</p>
              </div>}
            </div>
            {user ? <div className="flex items-center gap-2">
              <div className="hidden max-w-36 flex-col text-right sm:flex"><span className="truncate text-xs font-semibold leading-tight text-white">{user.name}</span><span className="text-[10px] font-mono uppercase text-indigo-400">{user.role}</span></div>
              <button onClick={() => void logout()} title="Log out" aria-label="Log out" className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"><LogOut className="h-4 w-4" /></button>
            </div> : <Link to="/login" className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500">Sign In</Link>}
            {user && <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} className="rounded-lg p-2 text-slate-400 hover:text-white xl:hidden">{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>}
          </div>
        </div>
        {user && mobileMenuOpen && <nav aria-label={`${user.role} navigation and account links`} className="max-h-[min(70dvh,36rem)] space-y-1 overflow-y-auto border-t border-slate-800 py-3 xl:hidden">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">All {user.role} pages</p>
          {links.map(({ href, label, icon: Icon }) => <Link key={href} to={href} aria-current={isNavigationLinkActive(pathname, href) ? 'page' : undefined} onClick={() => setMobileMenuOpen(false)} className={`flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${isNavigationLinkActive(pathname, href) ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300 hover:bg-slate-800'}`}><Icon className="h-4 w-4" />{label}</Link>)}
          <div className="my-2 border-t border-slate-800" />
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">EduSense</p>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"><GraduationCap className="h-4 w-4" />Home</Link>
          <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"><LogOut className="h-4 w-4" />Sign in</Link>
          {user.role !== 'admin' && <Link to="/report-bug" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800">Report a Bug</Link>}
          <Link to="/settings/api" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"><Settings2 className="h-4 w-4" />Backend settings</Link>
          <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800">Privacy Policy</Link>
          <Link to="/terms" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800">Terms of Service</Link>
        </nav>}
      </div>
    </header>
      {user && <nav aria-label={`${user.role} quick navigation`} className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800/90 bg-[#090d16]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.2)] backdrop-blur-xl xl:hidden">
        <div className="mx-auto grid max-w-xl" style={{ gridTemplateColumns: `repeat(${primaryLinks.length}, minmax(0, 1fr))` }}>
          {primaryLinks.map(({ href, label, icon: Icon }) => {
            const active = isNavigationLinkActive(pathname, href);
            const shortLabel = href === '/faculty/students' ? 'Students'
              : href === '/faculty/analytics' ? 'Analytics'
                : href === '/admin/data-import' ? 'Import'
                  : href === '/admin/users' ? 'Users'
                    : href === '/admin/model-management' ? 'Models'
                      : href === '/student/recommendations' ? 'Guidance'
                        : href === '/student/risk-analysis' ? 'Risk'
                          : label;
            return <Link key={href} to={href} aria-current={active ? 'page' : undefined} className={`flex min-h-[3.75rem] flex-col items-center justify-center gap-1 px-1 text-center text-[10px] font-medium leading-tight transition-colors ${active ? 'text-indigo-300' : 'text-slate-400 hover:text-slate-200'}`}>
              <Icon aria-hidden="true" className={`h-5 w-5 ${active ? 'text-indigo-400' : ''}`} />
              <span className="max-w-full truncate">{shortLabel}</span>
            </Link>;
          })}
        </div>
      </nav>}
    </>
  );
}
