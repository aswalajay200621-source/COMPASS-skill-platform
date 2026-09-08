'use client';

import React from 'react';
import { 
  Award, 
  FolderKanban, 
  GitMerge, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  ChevronRight,
  BookOpen
} from 'lucide-react';

export default function StudentDashboard({
  currentStudent,
  recommendedProjects = [],
  onSelectProject,
  onViewAllProjects,
  onViewLearningPaths
}) {
  const studentSkills = currentStudent?.skills || [];

  return (
    <div className="space-y-8">
      
      {/* Personalized Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-900/10">
        <div>
          <div className="flex items-center space-x-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Welcome back to COMPASS</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Good morning, {currentStudent?.name || 'Aarav'}!
          </h1>
          <p className="text-indigo-100 text-sm mt-2 max-w-xl leading-relaxed">
            Your skill profile matches <strong className="text-white font-semibold">{recommendedProjects.length} real-world projects</strong> in your department. Complete projects to automatically feed your graduation portfolio.
          </p>
        </div>

        <button
          onClick={onViewAllProjects}
          className="px-5 py-3 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all flex items-center space-x-2 shrink-0 self-start md:self-auto"
        >
          <span>Explore Recommended Projects</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Soft Pastel Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Stat 1: Verified Skills */}
        <div className="bg-emerald-50/70 border border-emerald-100 p-5 rounded-2xl flex items-center space-x-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-950 font-mono">
              {studentSkills.length} Verified
            </div>
            <div className="text-xs font-semibold text-emerald-700">Verified Skills</div>
          </div>
        </div>

        {/* Stat 2: Active Projects */}
        <div className="bg-blue-50/70 border border-blue-100 p-5 rounded-2xl flex items-center space-x-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-blue-950 font-mono">3 Active</div>
            <div className="text-xs font-semibold text-blue-700">Active Projects</div>
          </div>
        </div>

        {/* Stat 3: Learning Path */}
        <div className="bg-amber-50/70 border border-amber-100 p-5 rounded-2xl flex items-center space-x-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <GitMerge className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-950 font-mono">Step 2 / 4</div>
            <div className="text-xs font-semibold text-amber-700">Learning Path Progress</div>
          </div>
        </div>

        {/* Stat 4: Mentors */}
        <div className="bg-purple-50/70 border border-purple-100 p-5 rounded-2xl flex items-center space-x-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-purple-950 font-mono">2 Mentors</div>
            <div className="text-xs font-semibold text-purple-700">Faculty Mentors</div>
          </div>
        </div>

      </div>

      {/* Main Grid: Recommended Projects & Learning Path + Sidebar Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Recommended Projects & Learning Path Stepper */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Horizontal Learning Path Stepper */}
          <div className="compass-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Active Learning Path</h3>
                <p className="text-xs text-slate-500">Staged prerequisite progress for Full Stack Web Engineering</p>
              </div>
              
              <button 
                onClick={onViewLearningPaths}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
              >
                <span>Full Roadmap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stepper Horizontal Indicator */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              
              {/* Step 1: Completed */}
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Step 1</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xs font-bold text-emerald-950">HTML & CSS</div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Completed
                </span>
              </div>

              {/* Step 2: In Progress */}
              <div className="bg-indigo-50 border-2 border-indigo-500 p-3.5 rounded-xl space-y-2 relative shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Step 2</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                </div>
                <div className="text-xs font-bold text-indigo-950">JavaScript (ES6+)</div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-200 text-indigo-900">
                  In Progress
                </span>
              </div>

              {/* Step 3: Next */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2 opacity-75">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 3</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xs font-bold text-slate-700">Node.js Express</div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                  Next Step
                </span>
              </div>

              {/* Step 4: Next */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2 opacity-60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 4</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xs font-bold text-slate-700">MongoDB / Postgres</div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                  Locked
                </span>
              </div>

            </div>
          </div>

          {/* Recommended Projects Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Recommended for You</h2>
                <p className="text-xs text-slate-500">Matched to your verified skills with deterministic overlap</p>
              </div>

              <button
                onClick={onViewAllProjects}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
              >
                <span>View All ({recommendedProjects.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {recommendedProjects.slice(0, 3).map((proj) => (
              <div key={proj.id} className="compass-card p-6 space-y-4">
                
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    
                    {/* Match Score Badge */}
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                      proj.matchPercentage >= 75
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : proj.matchPercentage >= 50
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {proj.matchPercentage}% Skill Match
                    </span>

                    {/* Level Badge */}
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 uppercase tracking-wider font-mono">
                      {proj.difficulty}
                    </span>
                  </div>

                  {proj.faculty_name && (
                    <span className="text-xs text-slate-500 font-medium">
                      Faculty Mentor: <strong className="text-slate-700">{proj.faculty_name}</strong>
                    </span>
                  )}
                </div>

                {/* Project Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{proj.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{proj.description}</p>
                </div>

                {/* Required Skills Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.required_skills.map((skill, idx) => {
                    const isMatched = proj.matchedSkills?.includes(skill);
                    return (
                      <span
                        key={idx}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center space-x-1 border ${
                          isMatched
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isMatched && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        <span>{skill}</span>
                      </span>
                    );
                  })}
                </div>

                {/* Footer Action Row */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    {proj.missingSkills?.length === 0 ? (
                      <span className="text-emerald-600 font-semibold">Ready to start — 100% matched!</span>
                    ) : (
                      <span>{proj.missingSkills?.length} skill gap{proj.missingSkills?.length > 1 ? 's' : ''} staged in path</span>
                    )}
                  </span>

                  <button
                    onClick={() => onSelectProject(proj)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
                  >
                    <span>View Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Right Column (1 Col): Upcoming Milestones Vertical Timeline */}
        <div className="space-y-6">
          
          <div className="compass-card p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-900">Upcoming Milestones</h3>
            
            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              
              {/* Milestone 1 */}
              <div className="relative pl-8 space-y-1">
                <div className="absolute left-2 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                <div className="text-xs font-bold text-slate-900">Complete JavaScript Course</div>
                <div className="text-[11px] text-emerald-700 font-medium">NPTEL Module 4 • Completed</div>
              </div>

              {/* Milestone 2 */}
              <div className="relative pl-8 space-y-1">
                <div className="absolute left-2 top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                <div className="text-xs font-bold text-slate-900">Campus Event Management Portal</div>
                <div className="text-[11px] text-indigo-600 font-medium">Start Project • In Progress</div>
              </div>

              {/* Milestone 3 */}
              <div className="relative pl-8 space-y-1">
                <div className="absolute left-2 top-1 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-white" />
                <div className="text-xs font-bold text-slate-900">Request Mentorship</div>
                <div className="text-[11px] text-amber-700 font-medium">Target: Prof. Meera Nair</div>
              </div>

              {/* Milestone 4 */}
              <div className="relative pl-8 space-y-1">
                <div className="absolute left-2 top-1 w-3.5 h-3.5 rounded-full bg-slate-300 ring-4 ring-white" />
                <div className="text-xs font-bold text-slate-600">Auto-Add to Portfolio</div>
                <div className="text-[11px] text-slate-400">Graduation Portfolio Feeder</div>
              </div>

            </div>
          </div>

          {/* Quick Course Resource Banner */}
          <div className="compass-card p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 space-y-3">
            <div className="flex items-center space-x-2 text-purple-700 text-xs font-bold">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>NPTEL & Open Courseware</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every missing skill automatically maps to free NPTEL & Coursera prerequisite modules carefully staged to build your foundation.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
