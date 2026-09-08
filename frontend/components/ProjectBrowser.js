'use client';

import React, { useState } from 'react';
import { Search, Filter, CheckCircle2, AlertCircle, ArrowRight, BookOpen, Users } from 'lucide-react';

export default function ProjectBrowser({
  projects = [],
  currentStudent,
  onSelectProject,
  searchQuery,
  setSearchQuery
}) {
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredProjects = projects.filter((proj) => {
    if (levelFilter !== 'ALL' && proj.difficulty.toLowerCase() !== levelFilter.toLowerCase()) return false;
    if (categoryFilter !== 'ALL' && proj.type.toLowerCase() !== categoryFilter.toLowerCase()) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = proj.title.toLowerCase().includes(q);
    const descMatch = proj.description.toLowerCase().includes(q);
    const skillMatch = proj.required_skills.some(s => s.toLowerCase().includes(q));
    return titleMatch || descMatch || skillMatch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Browse Projects</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time skill match analysis against profile of <strong className="text-slate-800">{currentStudent?.name || 'Aarav Patel'}</strong>
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-xs"
          >
            <option value="ALL">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-xs"
          >
            <option value="ALL">All Types</option>
            <option value="project">Projects</option>
            <option value="internship">Internships</option>
            <option value="RA_role">RA Roles</option>
            <option value="mini_project">Mini-Projects</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="compass-card p-12 text-center text-slate-400 text-sm">
          No projects found matching your search criteria. Try adjusting filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((proj) => (
            <div key={proj.id} className="compass-card p-6 space-y-5 flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Top Badge Row */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                    proj.matchPercentage >= 75
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : proj.matchPercentage >= 50
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {proj.matchPercentage}% Match
                  </span>

                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {proj.difficulty}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{proj.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{proj.description}</p>
                </div>

                {/* Explicit Skill Breakdown Box */}
                <div className="compass-subcard p-4 space-y-3">
                  
                  {/* Skills You Have */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Skills You Have ({proj.matchedSkills?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.matchedSkills?.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">None yet</span>
                      ) : (
                        proj.matchedSkills?.map((s, i) => (
                          <span key={i} className="text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{s}</span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Skills You Lack */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Skills You Lack ({proj.missingSkills?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.missingSkills?.length === 0 ? (
                        <span className="text-xs font-semibold text-emerald-600">No skill gaps! Ready to build.</span>
                      ) : (
                        proj.missingSkills?.map((s, i) => (
                          <span key={i} className="text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>{s}</span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* Matched Mentor Info */}
                {proj.bestMentor && (
                  <div className="flex items-center space-x-2 text-xs text-slate-600 bg-purple-50/70 border border-purple-100 p-2.5 rounded-xl">
                    <Users className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Matched Faculty Mentor: <strong className="text-purple-950 font-bold">{proj.bestMentor.name}</strong> ({proj.bestMentor.summaryLine})</span>
                  </div>
                )}

              </div>

              {/* Card Footer CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {proj.missingSkills?.length > 0 ? (
                    <span className="flex items-center space-x-1 text-slate-600">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{proj.missingSkills.length} staged prerequisite course{proj.missingSkills.length > 1 ? 's' : ''}</span>
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-semibold">Ready to apply</span>
                  )}
                </span>

                <button
                  onClick={() => onSelectProject(proj)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <span>View Project & Path</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
