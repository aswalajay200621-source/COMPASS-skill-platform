'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, ExternalLink, Printer, Share2, Award, FolderKanban, Users, Compass, Sparkles } from 'lucide-react';

const API_BASE = '/api';

export default function PortfolioView({ studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchPortfolio = async () => {
    if (!studentId) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/portfolio/${studentId}`);
      const result = await res.json();
      if (result.success) {
        setData(result.portfolio);
      } else {
        setError(result.error || 'Failed to fetch portfolio data.');
      }
    } catch (err) {
      setError('Cannot connect to backend server at http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [studentId]);

  const handlePrintPdf = () => {
    window.print();
  };

  const handleShareLink = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm max-w-4xl mx-auto">
        Compiling graduation-ready portfolio...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 text-center">
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error || 'No portfolio records found.'}
        </div>
      </div>
    );
  }

  const { student, stats, completedProjects, mentorships } = data;

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      
      {/* Top Action Bar (Hidden during PDF print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Graduation Portfolio
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Auto-fed continuously across your time in college from completed projects and faculty mentorships.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShareLink}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{copied ? 'Link Copied!' : 'Share Portfolio'}</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center space-x-1.5 transition-all shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Generate Portfolio (PDF)</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Surface */}
      <div className="compass-card p-8 sm:p-10 space-y-8 print:p-0 print:border-none print:shadow-none bg-white">
        
        {/* Document Header & Institution Crest */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-indigo-600 text-xs font-mono font-bold uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>COMPASS Official Academic Record</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{student.name}</h2>
            <p className="text-xs text-slate-600 font-medium">{student.email} • {student.level}</p>
            <p className="text-xs text-slate-500">
              Career Target: <strong className="text-slate-800">{student.careerGoal || 'Software Engineer'}</strong>
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="text-sm font-extrabold text-slate-900">Apex Institute of Technology</div>
            <div className="text-xs text-slate-500 font-mono">College Verified Skills Portfolio</div>
            <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded inline-block">
              ✓ Verified Record
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="compass-subcard p-4 text-center">
            <div className="text-2xl font-black text-slate-900 font-mono">{stats.totalCompletedProjects}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projects Built</div>
          </div>

          <div className="compass-subcard p-4 text-center">
            <div className="text-2xl font-black text-slate-900 font-mono">{stats.totalSkillsMastered}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skills Mastered</div>
          </div>

          <div className="compass-subcard p-4 text-center">
            <div className="text-2xl font-black text-slate-900 font-mono">{stats.totalFacultyMentorships}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty Mentorships</div>
          </div>
        </div>

        {/* Mastered Skills Inventory */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Verified Technical Competencies</span>
          </h3>

          <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            {student.skills.map((skill, idx) => {
              const skillName = typeof skill === 'string' ? skill : skill.name;
              const skillLevel = typeof skill === 'string' ? 'Intermediate' : skill.level;
              return (
                <span key={idx} className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-bold flex items-center space-x-1.5 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{skillName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({skillLevel})</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Completed Projects Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <FolderKanban className="w-4 h-4 text-indigo-600" />
            <span>Completed Projects & Demonstrated Code</span>
          </h3>

          {completedProjects.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 text-slate-500 text-xs text-center border border-slate-200">
              No completed projects recorded yet. Complete projects in your dashboard to auto-populate this section.
            </div>
          ) : (
            <div className="space-y-3">
              {completedProjects.map((cp) => (
                <div key={cp.id} className="compass-subcard p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{cp.title}</h4>
                      <p className="text-xs text-slate-600 mt-1">{cp.description}</p>
                    </div>

                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Completed</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-slate-500 font-semibold">Skills Verified:</span>
                      {cp.skills_acquired.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-bold">
                          {s}
                        </span>
                      ))}
                    </div>

                    {cp.github_link && (
                      <a
                        href={cp.github_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center space-x-1"
                      >
                        <span>GitHub Repository</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verified Faculty Mentorships */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-purple-600" />
            <span>Faculty Mentorship Milestones</span>
          </h3>

          {mentorships.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 text-slate-500 text-xs text-center border border-slate-200">
              No faculty mentorship requests recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mentorships.map((m) => (
                <div key={m.id} className="compass-subcard p-4 text-xs space-y-1">
                  <div className="font-extrabold text-purple-950">{m.faculty_name}</div>
                  <div className="text-slate-500">{m.department} ({m.faculty_email})</div>
                  <div className="text-slate-700 pt-1 font-medium">
                    Project Guided: <strong className="text-slate-900">{m.project_title}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
