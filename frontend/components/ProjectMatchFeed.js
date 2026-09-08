'use client';

import React, { useState, useEffect } from 'react';
import { Check, Send, Award, BookOpen } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function ProjectMatchFeed({ currentStudent, onOpenSkillGapModal, onProjectCompleted }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Mentorship Modal State
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [mentorshipNote, setMentorshipNote] = useState('');
  const [requestStatus, setRequestStatus] = useState({ loading: false, success: '', error: '' });

  // Completion Modal State
  const [completingProject, setCompletingProject] = useState(null);
  const [githubLink, setGithubLink] = useState('');
  const [completionStatus, setCompletionStatus] = useState({ loading: false, success: '', error: '' });

  const fetchMatchedProjects = async () => {
    if (!currentStudent?.id) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/projects/matched/${currentStudent.id}`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      } else {
        setError(data.error || 'Failed to fetch matched projects');
      }
    } catch (err) {
      setError('Cannot connect to backend server at http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchedProjects();
  }, [currentStudent]);

  const handleSendMentorshipRequest = async () => {
    if (!selectedFaculty || !selectedProject || !currentStudent) return;
    setRequestStatus({ loading: true, success: '', error: '' });

    try {
      const res = await fetch(`${API_BASE}/mentorship/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentStudent.id,
          faculty_id: selectedFaculty.id,
          project_id: selectedProject.id,
          message: mentorshipNote
        })
      });

      const data = await res.json();
      if (data.success) {
        setRequestStatus({ loading: false, success: data.notification, error: '' });
        setTimeout(() => {
          setSelectedFaculty(null);
          setSelectedProject(null);
          setMentorshipNote('');
          setRequestStatus({ loading: false, success: '', error: '' });
        }, 2000);
      } else {
        setRequestStatus({ loading: false, success: '', error: data.error });
      }
    } catch (err) {
      setRequestStatus({ loading: false, success: '', error: 'Failed to submit mentorship request.' });
    }
  };

  const handleCompleteProject = async () => {
    if (!completingProject || !currentStudent) return;
    setCompletionStatus({ loading: true, success: '', error: '' });

    try {
      const res = await fetch(`${API_BASE}/projects/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentStudent.id,
          project_id: completingProject.id,
          github_link: githubLink,
          skills_acquired: completingProject.required_skills
        })
      });

      const data = await res.json();
      if (data.success) {
        setCompletionStatus({ loading: false, success: data.message, error: '' });
        if (onProjectCompleted) onProjectCompleted();
        setTimeout(() => {
          setCompletingProject(null);
          setGithubLink('');
          setCompletionStatus({ loading: false, success: '', error: '' });
          fetchMatchedProjects();
        }, 1800);
      } else {
        setCompletionStatus({ loading: false, success: '', error: data.error });
      }
    } catch (err) {
      setCompletionStatus({ loading: false, success: '', error: 'Failed to record completion.' });
    }
  };

  const filteredProjects = projects.filter(p => {
    if (filterType === 'ALL') return true;
    if (filterType === 'FACULTY') return p.faculty_id !== null;
    return p.type.toUpperCase() === filterType;
  });

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      
      {/* Header & Minimalist Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-white/5 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Opportunities Feed
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Ranked by set-intersection skill match against profile of{' '}
            <span className="text-slate-200 font-medium">{currentStudent?.name}</span>.
          </p>
        </div>

        {/* Minimal Filters */}
        <div className="flex items-center space-x-1 bg-[#0E121B] p-1 rounded-lg border border-white/5">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'project', label: 'Projects' },
            { id: 'internship', label: 'Internships' },
            { id: 'RA_role', label: 'RA Roles' },
            { id: 'mini_project', label: 'Mini-Projects' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filterType === tab.id
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="py-20 text-center text-slate-500 text-sm">
          Calculating skill overlap...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 text-rose-300 text-sm mb-6">
          {error}
        </div>
      )}

      {!loading && !error && filteredProjects.length === 0 && (
        <div className="railway-card p-12 text-center rounded-xl text-slate-400 text-sm">
          No matching opportunities found for selected criteria.
        </div>
      )}

      {/* Project Cards List */}
      <div className="space-y-4">
        {!loading && filteredProjects.map(proj => (
          <div 
            key={proj.id}
            className="railway-card p-6 sm:p-7 rounded-xl space-y-5"
          >
            {/* Top Metadata Row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                
                {/* Consolidated Primary Badge: Match % */}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                  proj.matchPercentage >= 75
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : proj.matchPercentage >= 50
                    ? 'bg-indigo-500/15 text-indigo-400'
                    : 'bg-amber-500/15 text-amber-400'
                }`}>
                  {proj.matchPercentage}% Match
                </span>

                {/* Demoted Text Labels for Difficulty & Type */}
                <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                  {proj.difficulty}
                </span>

                <span className="text-slate-600">•</span>

                <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                  {proj.type.replace('_', ' ')}
                </span>
              </div>

              {proj.faculty_name && (
                <div className="text-xs text-slate-400">
                  Posted by <span className="text-slate-300 font-medium">{proj.faculty_name}</span> ({proj.faculty_dept})
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">{proj.title}</h2>
              <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">{proj.description}</p>
            </div>

            {/* Skill Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg railway-subcard">
              
              {/* Matched Skills */}
              <div>
                <span className="text-xs font-medium text-slate-400 block mb-2">
                  Matched Skills ({proj.matchedSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {proj.matchedSkills.length === 0 ? (
                    <span className="text-xs text-slate-600 italic">None</span>
                  ) : (
                    proj.matchedSkills.map((s, i) => (
                      <span key={i} className="text-xs text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded flex items-center space-x-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>{s}</span>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div>
                <span className="text-xs font-medium text-slate-400 block mb-2">
                  Skill Gaps ({proj.missingSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {proj.missingSkills.length === 0 ? (
                    <span className="text-xs text-emerald-400 font-medium">All required skills matched</span>
                  ) : (
                    proj.missingSkills.map((s, i) => (
                      <span key={i} className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Surfaced Faculty Mentors */}
            {proj.surfacedFaculties && proj.surfacedFaculties.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-medium text-slate-400 block mb-2">
                  Matching Faculty Mentors
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {proj.surfacedFaculties.map(faculty => (
                    <div key={faculty.id} className="p-3 rounded-lg railway-subcard flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-slate-200">{faculty.name}</div>
                        <div className="text-[11px] text-slate-500">{faculty.department || 'Faculty'}</div>
                      </div>
                      
                      {/* Ghost/Outline Secondary Button */}
                      <button
                        onClick={() => {
                          setSelectedFaculty(faculty);
                          setSelectedProject(proj);
                        }}
                        className="px-2.5 py-1 rounded text-xs font-medium text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
                      >
                        Request Mentorship
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
              
              {/* Secondary Ghost Button for Gap Filling */}
              {proj.missingSkills.length > 0 ? (
                <button
                  onClick={() => onOpenSkillGapModal(proj.id)}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-300 border border-slate-700 hover:bg-slate-800 flex items-center space-x-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Prerequisite Course Roadmap ({proj.missingSkills.length} Gaps)</span>
                </button>
              ) : (
                <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>100% Skill Overlap</span>
                </span>
              )}

              {/* Single Primary CTA Button */}
              <button
                onClick={() => setCompletingProject(proj)}
                className="px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm ml-auto"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Mark Project Completed</span>
              </button>

            </div>

          </div>
        ))}
      </div>

      {/* Mentorship Request Modal */}
      {selectedFaculty && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="railway-panel max-w-md w-full p-6 rounded-xl space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Request Mentorship from {selectedFaculty.name}
            </h3>
            
            <div className="text-xs text-slate-400 railway-subcard p-3 rounded-lg space-y-1">
              <div><strong className="text-slate-200">Project:</strong> {selectedProject.title}</div>
              <div><strong className="text-slate-200">Faculty:</strong> {selectedFaculty.name} ({selectedFaculty.department})</div>
            </div>

            {requestStatus.error && (
              <div className="p-3 rounded bg-rose-500/10 text-rose-300 text-xs">
                {requestStatus.error}
              </div>
            )}

            {requestStatus.success && (
              <div className="p-3 rounded bg-emerald-500/10 text-emerald-300 text-xs">
                {requestStatus.success}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Note to Faculty
              </label>
              <textarea
                rows={3}
                value={mentorshipNote}
                onChange={(e) => setMentorshipNote(e.target.value)}
                className="w-full bg-[#0E121B] border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="Briefly state why you want to collaborate..."
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedFaculty(null);
                  setSelectedProject(null);
                }}
                className="px-3.5 py-1.5 rounded text-slate-400 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={requestStatus.loading}
                onClick={handleSendMentorshipRequest}
                className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{requestStatus.loading ? 'Sending...' : 'Send Request'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {completingProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="railway-panel max-w-md w-full p-6 rounded-xl space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Mark Project Completed
            </h3>

            <p className="text-xs text-slate-400">
              Record completion of <strong className="text-slate-200">{completingProject.title}</strong> and auto-populate skills to portfolio.
            </p>

            {completionStatus.error && (
              <div className="p-3 rounded bg-rose-500/10 text-rose-300 text-xs">
                {completionStatus.error}
              </div>
            )}

            {completionStatus.success && (
              <div className="p-3 rounded bg-emerald-500/10 text-emerald-300 text-xs">
                {completionStatus.success}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                GitHub Repository / Link (Optional)
              </label>
              <input
                type="url"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                className="w-full bg-[#0E121B] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="https://github.com/..."
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCompletingProject(null)}
                className="px-3.5 py-1.5 rounded text-slate-400 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={completionStatus.loading}
                onClick={handleCompleteProject}
                className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>{completionStatus.loading ? 'Recording...' : 'Confirm Completion'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
