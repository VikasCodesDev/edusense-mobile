import React, { Suspense, lazy, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import type { User } from '@/context/AuthContext';

const HomePage = lazy(() => import('@/app/page'));
const LoginPage = lazy(() => import('@/app/login/page'));
const PrivacyPage = lazy(() => import('@/app/privacy/page'));
const TermsPage = lazy(() => import('@/app/terms/page'));
const ReportBugPage = lazy(() => import('@/app/report-bug/page'));
const ApiSettingsPage = lazy(() => import('@/app/settings/api/page'));
const StudentDashboard = lazy(() => import('@/app/student/dashboard/page'));
const StudentPerformance = lazy(() => import('@/app/student/performance/page'));
const StudentSubjects = lazy(() => import('@/app/student/subjects/page'));
const StudentRiskAnalysis = lazy(() => import('@/app/student/risk-analysis/page'));
const StudentRecommendations = lazy(() => import('@/app/student/recommendations/page'));
const StudentProgress = lazy(() => import('@/app/student/progress/page'));
const StudentProfile = lazy(() => import('@/app/student/profile/page'));
const FacultyDashboard = lazy(() => import('@/app/faculty/dashboard/page'));
const FacultyStudents = lazy(() => import('@/app/faculty/students/page'));
const FacultyStudentDetail = lazy(() => import('@/app/faculty/students/[id]/page'));
const FacultyAnalytics = lazy(() => import('@/app/faculty/analytics/page'));
const AdminDashboard = lazy(() => import('@/app/admin/dashboard/page'));
const AdminDataImport = lazy(() => import('@/app/admin/data-import/page'));
const AdminModelManagement = lazy(() => import('@/app/admin/model-management/page'));
const AdminUsers = lazy(() => import('@/app/admin/users/page'));
const AdminBugReports = lazy(() => import('@/app/admin/bug-reports/page'));

function LoadingScreen() {
  return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-400" role="status">Loading EduSense…</div>;
}

function homeForRole(role: User['role']): string {
  if (role === 'student') return '/student/dashboard';
  if (role === 'faculty') return '/faculty/dashboard';
  return '/admin/dashboard';
}

function RequireRole({ roles, children }: { roles: User['role'][]; children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={homeForRole(user.role)} replace />;
  return <>{children}</>;
}

function NativeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    void StatusBar.setStyle({ style: Style.Light }).catch(() => undefined);
    void StatusBar.setBackgroundColor({ color: '#090d16' }).catch(() => undefined);
    let removeListener: (() => void) | undefined;
    let disposed = false;
    void CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack && location.pathname !== '/') navigate(-1);
      else if (location.pathname !== '/') navigate('/');
      else void CapacitorApp.exitApp();
    }).then((listener) => {
      if (disposed) void listener.remove();
      else removeListener = () => { void listener.remove(); };
    }).catch(() => undefined);
    return () => {
      disposed = true;
      removeListener?.();
    };
  }, [location.pathname, navigate]);

  return null;
}

function AppFrame() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />
      <main className={user ? 'min-w-0 flex-1 pb-[calc(5.25rem+env(safe-area-inset-bottom))] xl:pb-8' : 'min-w-0 flex-1 pb-8'}>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/settings/api" element={<ApiSettingsPage />} />
            <Route path="/report-bug" element={<RequireRole roles={['student', 'faculty']}><ReportBugPage /></RequireRole>} />

            <Route path="/student/dashboard" element={<RequireRole roles={['student']}><StudentDashboard /></RequireRole>} />
            <Route path="/student/performance" element={<RequireRole roles={['student']}><StudentPerformance /></RequireRole>} />
            <Route path="/student/subjects" element={<RequireRole roles={['student']}><StudentSubjects /></RequireRole>} />
            <Route path="/student/risk-analysis" element={<RequireRole roles={['student']}><StudentRiskAnalysis /></RequireRole>} />
            <Route path="/student/recommendations" element={<RequireRole roles={['student']}><StudentRecommendations /></RequireRole>} />
            <Route path="/student/progress" element={<RequireRole roles={['student']}><StudentProgress /></RequireRole>} />
            <Route path="/student/profile" element={<RequireRole roles={['student']}><StudentProfile /></RequireRole>} />

            <Route path="/faculty/dashboard" element={<RequireRole roles={['faculty']}><FacultyDashboard /></RequireRole>} />
            <Route path="/faculty/students" element={<RequireRole roles={['faculty', 'admin']}><FacultyStudents /></RequireRole>} />
            <Route path="/faculty/students/:id" element={<RequireRole roles={['faculty', 'admin']}><FacultyStudentDetail /></RequireRole>} />
            <Route path="/faculty/analytics" element={<RequireRole roles={['faculty', 'admin']}><FacultyAnalytics /></RequireRole>} />

            <Route path="/admin/dashboard" element={<RequireRole roles={['admin']}><AdminDashboard /></RequireRole>} />
            <Route path="/admin/data-import" element={<RequireRole roles={['admin']}><AdminDataImport /></RequireRole>} />
            <Route path="/admin/model-management" element={<RequireRole roles={['admin']}><AdminModelManagement /></RequireRole>} />
            <Route path="/admin/users" element={<RequireRole roles={['admin']}><AdminUsers /></RequireRole>} />
            <Route path="/admin/bug-reports" element={<RequireRole roles={['admin']}><AdminBugReports /></RequireRole>} />

            <Route path="*" element={<div className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="text-3xl font-bold text-white">Page not found</h1><p className="mt-3 text-slate-400">This EduSense route does not exist.</p><Link to="/" className="mt-6 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Return home</Link></div>} />
          </Routes>
        </Suspense>
      </main>
      <Footer className={user ? 'hidden xl:block' : ''} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NativeNavigation />
        <AppFrame />
      </AuthProvider>
    </BrowserRouter>
  );
}
