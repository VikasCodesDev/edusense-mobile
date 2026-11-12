'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import StatCard from '@/components/StatCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  Award,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function PerformancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/students/me');
      if (res.data?.success) setData(res.data);
      else setError(res.data?.error || 'The backend did not return performance data.');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Could not load performance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6"><div className="h-40 bg-slate-800/50 rounded-2xl" /></div>;
  }

  if (!data) return <div className="mx-auto max-w-xl px-4 py-16 text-center"><AlertCircle className="mx-auto h-8 w-8 text-amber-400" /><h1 className="mt-4 text-xl font-bold text-white">Performance data unavailable</h1><p className="mt-2 text-sm text-slate-400">{error || 'The backend did not return a student record.'}</p><button onClick={() => void loadData()} className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Retry</button></div>;

  const student = data.student;
  const hasAcademicData = Boolean(student?.academicDataComplete || (student?.attendancePct != null && student?.internalTestAvg != null && student?.subjects?.length));
  if (!hasAcademicData) {
    return (
      <div className="max-w-xl mx-auto my-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">No Academic Data Yet</h2>
        <p className="text-sm text-slate-400">Update your academic data to view performance analytics.</p>
        <Link href="/student/profile" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium inline-flex">Update Academic Data</Link>
      </div>
    );
  }
  const subjects = student?.subjects || [];

  const comparisonData = subjects.map((s: any) => ({
    subject: s.name,
    fullName: s.name,
    score: s.score ?? s.internalScore
  }));

  const hasSubjectAttendance = subjects.some((s: any) => Number.isFinite(Number(s.attendance)));
  const hasSubjectAssignments = subjects.some((s: any) => Number.isFinite(Number(s.assignmentCompletion)));
  const radarData = subjects.map((s: any) => ({
    subject: s.name,
    student: s.score ?? s.internalScore,
    ...(hasSubjectAttendance && Number.isFinite(Number(s.attendance)) ? { attendance: Number(s.attendance) } : {}),
    ...(hasSubjectAssignments && Number.isFinite(Number(s.assignmentCompletion)) ? { assignments: Number(s.assignmentCompletion) } : {})
  }));
  const scoredSubjects = subjects.filter((s: any) => s.score != null || s.internalScore != null);
  const passingSubjectCount = scoredSubjects.filter((s: any) => (s.score ?? s.internalScore) >= 50).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">Academic Analytics</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">My Performance Breakdown</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          In-depth evaluation of continuous assessments, subject mastery, and comparative benchmarks.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Continuous Internal Average"
          value={student?.internalTestAvg != null ? `${student.internalTestAvg}%` : '—'}
          subtitle={student?.internalTestAvg != null ? 'All continuous tests' : 'Not reported'}
          progress={student?.internalTestAvg ?? undefined}
          color="indigo"
          icon={Target}
        />
        <StatCard
          title="Rule-of-Thumb Grade Estimate"
          value={student?.internalTestAvg == null ? '—' : student.internalTestAvg >= 80 ? '8.8 / 10' : student.internalTestAvg >= 65 ? '7.2 / 10' : '5.4 / 10'}
          subtitle="Illustrative only; not official SGPA"
          color="emerald"
          icon={Award}
        />
        <StatCard
          title="Passing Subjects"
          value={scoredSubjects.length ? `${passingSubjectCount} / ${scoredSubjects.length}` : '—'}
          subtitle="Passing of subjects with scores (≥ 50%)"
          color="blue"
          icon={CheckCircle2}
        />
        <StatCard
          title="Performance Trend"
          value={student?.performanceTrend != null ? `${student.performanceTrend > 0 ? '+' : ''}${student.performanceTrend}%` : '—'}
          subtitle={student?.performanceTrend != null ? 'Recent test variation' : 'Not reported'}
          color={student?.performanceTrend == null ? 'blue' : student.performanceTrend >= 0 ? 'emerald' : 'rose'}
          icon={student?.performanceTrend == null ? AlertCircle : student.performanceTrend >= 0 ? TrendingUp : TrendingDown}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Subject Score vs Benchmark Bar Chart */}
        <div className="subtle-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Subject Score vs Institutional Average</h3>
            <p className="text-xs text-slate-400">Your recorded score for each subject</p>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: '#1e293b', opacity: 0.35 }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="score" fill="#6366f1" name="My Score %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multi-Dimensional Radar Chart */}
        <div className="subtle-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Multi-Dimensional Subject Profile</h3>
            <p className="text-xs text-slate-400">Score, attendance and assignment submission distribution</p>
          </div>

          <div className="h-72 w-full pt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis stroke="#475569" fontSize={10} domain={[0, 100]} />
                <Radar name="Marks" dataKey="student" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                {hasSubjectAttendance && <Radar name="Attendance" dataKey="attendance" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />}
                {hasSubjectAssignments && <Radar name="Assignments" dataKey="assignments" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />}
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Detailed Subject Table */}
      <div className="subtle-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Course Assessment Roster</h3>
        <div role="region" aria-label="Scrollable subject performance table" tabIndex={0} className="overflow-x-auto overscroll-x-contain focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/60 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Subject Name</th>
                <th className="py-3 px-4">Current Score</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Assignments</th>
                <th className="py-3 px-4">Trend</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {subjects.map((s: any, idx: number) => {
                const score = s.score ?? s.internalScore;
                const isPassing = score == null ? null : score >= 50;
                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{s.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      <span className={score == null ? 'text-slate-400' : score < 50 ? 'text-rose-400' : score < 75 ? 'text-amber-400' : 'text-emerald-400'}>
                        {score == null ? '—' : `${score}%`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{s.attendance != null ? `${s.attendance}%` : '—'}</td>
                    <td className="py-3.5 px-4 font-mono">{s.assignmentCompletion != null ? `${s.assignmentCompletion}%` : '—'}</td>
                    <td className="py-3.5 px-4 capitalize text-slate-400">{s.trend ?? '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                        isPassing == null ? 'bg-slate-500/10 text-slate-400' : isPassing ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {isPassing == null ? 'Score unavailable' : isPassing ? 'Satisfactory' : 'Needs Attention'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
