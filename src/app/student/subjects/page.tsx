'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { BookOpen, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function SubjectsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/students/me');
      if (res.data?.success) setData(res.data);
      else setError(res.data?.error || 'The backend did not return subject data.');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Could not load subject data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse"><div className="h-40 bg-slate-800/50 rounded-2xl" /></div>;
  }

  if (!data) return <div className="mx-auto max-w-xl px-4 py-16 text-center"><AlertCircle className="mx-auto h-8 w-8 text-amber-400" /><h1 className="mt-4 text-xl font-bold text-white">Subject data unavailable</h1><p className="mt-2 text-sm text-slate-400">{error || 'The backend did not return a student record.'}</p><button onClick={() => void loadData()} className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Retry</button></div>;

  const student = data.student;
  const hasAcademicData = Boolean(student?.academicDataComplete || (student?.attendancePct != null && student?.internalTestAvg != null && student?.subjects?.length));
  if (!hasAcademicData) {
    return (
      <div className="max-w-xl mx-auto my-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">No Subject Records Yet</h2>
        <p className="text-sm text-slate-400">Add subject-wise marks, attendance, and assignment completion to view diagnostics.</p>
        <Link href="/student/profile" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium inline-flex">Update Academic Data</Link>
      </div>
    );
  }
  const subjects = student?.subjects || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">Course Registry</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Enrolled Subjects & Diagnostics</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Module-level progress, attendance compliance, and subject-specific academic recommendations.
        </p>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((sub: any, idx: number) => {
          const score = sub.score ?? sub.internalScore;
          const att = sub.attendance;
          const comp = sub.assignmentCompletion;
          const isAtRisk = (score != null && score < 50) || (att != null && att < 65);

          return (
            <div
              key={idx}
              className={`subtle-card rounded-2xl p-6 border transition-all ${
                isAtRisk ? 'border-rose-500/40 bg-[#16121f]' : 'border-slate-800 hover:border-slate-700'
              } space-y-5`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-base font-bold text-white">{sub.name}</h3>
                  </div>
                  <span className="text-xs text-slate-400">{sub.courseCode || 'Legacy course code'} • {sub.credits ?? 4} Credits</span>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${score == null ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' : score >= 75 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : score >= 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {score == null ? 'Score unavailable' : score >= 75 ? 'Proficient' : score >= 50 ? 'Average' : 'Critical Focus'}
                </span>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Internal Assessment Marks</span>
                    <span className="font-mono font-bold text-white">{score != null ? `${score}%` : '—'}</span>
                  </div>
                  {score != null && <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div className={`h-full ${score < 50 ? 'bg-rose-500' : score < 75 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(100, Math.max(0, score))}%` }} /></div>}
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Classroom & Lab Attendance</span>
                    <span className="font-mono font-bold text-white">{att != null ? `${att}%` : '—'}</span>
                  </div>
                  {att != null && <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div className={`h-full ${att < 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, Math.max(0, att))}%` }} /></div>}
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Assignment & Lab Completion</span>
                    <span className="font-mono font-bold text-white">{comp != null ? `${comp}%` : '—'}</span>
                  </div>
                  {comp != null && <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div className="h-full bg-sky-500" style={{ width: `${Math.min(100, Math.max(0, comp))}%` }} /></div>}
                </div>
              </div>

              {/* Guidance is generated by the existing backend, not by a mobile-only rule. */}
              <div className="bg-[#0c1322] p-3.5 rounded-xl border border-slate-800/80 text-xs space-y-2">
                <span className="text-[10px] uppercase font-mono text-indigo-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Personalized Server Guidance</span>
                </span>
                <p className="text-slate-300">Open your current EduSense study plan for recommendations returned by the existing backend.</p>
                <Link href="/student/recommendations" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-indigo-500/30 px-3 text-indigo-300 hover:bg-indigo-500/10">
                  Open personalized plan <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
