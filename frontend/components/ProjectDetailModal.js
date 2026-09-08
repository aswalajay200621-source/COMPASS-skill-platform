'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Users, ExternalLink, Award, BookOpen, ArrowRight, Send } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function ProjectDetailModal({
  project,
  currentStudent,
  onClose,
  onRequestMentorship,
  onCompleteProject
}) {
  const [gapData, setGapData] = useState(null);
  const [loadingGap, setLoadingGap] = useState(true);

  useEffect(() => {
    if (!project || !currentStudent) return;
    const fetchSkillGap = async () => {
      setLoadingGap(true);
      try {
        const res = await fetch(`${API_BASE}/skill-gap?studentId=${currentStudent.id}&projectId=${project.id}`);
        const data = await res.json();
        if (data.success) {
          setGapData(data.data);
        }
      } catch (err) {
        console.error('Failed to load skill gap data:', err);
      } finally {
        setLoadingGap(false);
      }
    };
    fetchSkillGap();
  }, [project, currentStudent]);

  if (!project) return null;

  const bestFaculty = project.bestMentor || (project.surfacedFaculties && project.surfacedFaculties[0]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-start justify-between relative">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <span>{project.difficulty} Level</span>
              <span>•</span>
              <span>{project.matchPercentage}% Match</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">{project.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Project Description</h4>
            <p className="text-sm text-slate-700 leading-relaxed font-normal">{project.description}</p>
          </div>

          {/* Explicit Skill Gap Analysis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 compass-subcard p-4">
            
            {/* Matched Skills */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Skills You Already Have ({project.matchedSkills?.length || 0})</span>
              </span>

              <div className="flex flex-wrap gap-1.5">
                {project.matchedSkills?.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">None yet</span>
                ) : (
                  project.matchedSkills?.map((skill, idx) => (
                    <span key={idx} className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full">
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Skills You Need to Learn ({project.missingSkills?.length || 0})</span>
              </span>

              <div className="flex flex-wrap gap-1.5">
                {project.missingSkills?.length === 0 ? (
                  <span className="text-xs font-bold text-emerald-600">All required skills matched!</span>
                ) : (
                  project.missingSkills?.map((skill, idx) => (
                    <span key={idx} className="text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-full">
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Staged Prerequisite Learning Path */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Staged Prerequisite Learning Path (NPTEL / Coursera)</span>
            </h4>

            {loadingGap ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading prerequisite course roadmap...</div>
            ) : gapData?.missingSkills?.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                You possess all prerequisite skills for this project! You can request mentorship or start building immediately.
              </div>
            ) : (
              <div className="space-y-2.5">
                {gapData?.prerequisiteChain?.map((step, idx) => (
                  <div key={idx} className="compass-card p-4 flex items-center justify-between hover:border-indigo-200 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          Step {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{step.skillName}</span>
                      </div>
                      
                      <div className="text-xs text-slate-600">
                        Course: <strong className="text-slate-800">{step.courseTitle}</strong> ({step.provider} • {step.duration})
                      </div>
                    </div>

                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center space-x-1 transition-colors shrink-0"
                    >
                      <span>Enroll</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auto-Matched Faculty Mentor Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Matched Faculty Mentor</span>
            </h4>

            {bestFaculty ? (
              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {bestFaculty.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-purple-950">{bestFaculty.name}</div>
                    <div className="text-xs text-purple-700 font-medium">{bestFaculty.department}</div>
                    <div className="text-[11px] text-purple-600 font-semibold mt-0.5">
                      {bestFaculty.summaryLine || `${bestFaculty.matchedSkills?.length || 4} of ${project.required_skills?.length} skills match`}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRequestMentorship(bestFaculty, project)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Request Mentorship</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                No matching faculty mentor registered for these exact skills yet.
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>

          <button
            onClick={() => onCompleteProject(project)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center space-x-2"
          >
            <Award className="w-4 h-4" />
            <span>Mark Project Completed</span>
          </button>
        </div>

      </div>
    </div>
  );
}
