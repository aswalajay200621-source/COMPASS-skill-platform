'use client';

import React, { useState } from 'react';
import { X, Send, CheckCircle2, UserCheck, Sparkles } from 'lucide-react';

const API_BASE = '/api';

export default function MentorshipModal({
  faculty,
  project,
  currentStudent,
  onClose,
  onRequestSent
}) {
  const [note, setNote] = useState('');
  const [status, setStatus] = useState({ loading: false, success: '', error: '' });

  if (!faculty || !project) return null;

  const projectSkills = project.required_skills || [];
  const facultySkills = faculty.skills || [];
  
  // Calculate match summary
  const matchedSkills = projectSkills.filter(ps => 
    facultySkills.some(fs => (typeof fs === 'string' ? fs : fs.name).toLowerCase() === ps.toLowerCase())
  );
  
  const matchSummary = `${matchedSkills.length} of ${projectSkills.length} skills match`;

  const handleSendRequest = async () => {
    if (!currentStudent?.id) {
      setStatus({ loading: false, success: '', error: 'Please log in as a student to request mentorship.' });
      return;
    }

    setStatus({ loading: true, success: '', error: '' });

    try {
      const res = await fetch(`${API_BASE}/mentorship/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentStudent.id,
          faculty_id: faculty.id,
          project_id: project.id,
          message: note
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatus({ loading: false, success: data.notification, error: '' });
        setTimeout(() => {
          onRequestSent && onRequestSent();
          onClose();
        }, 1600);
      } else {
        setStatus({ loading: false, success: '', error: data.error });
      }
    } catch (err) {
      setStatus({ loading: false, success: '', error: 'Failed to connect to backend server.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white font-extrabold text-lg border border-white/20">
              {faculty.name[0]}
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">{faculty.name}</h3>
              <p className="text-xs text-purple-200 font-medium">{faculty.department}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Status Alerts */}
          {status.error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {status.error}
            </div>
          )}

          {status.success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{status.success}</span>
            </div>
          )}

          {/* Project Details */}
          <div className="compass-subcard p-4 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Project Context</div>
            <div className="text-sm font-extrabold text-slate-900">{project.title}</div>
          </div>

          {/* Match Summary Highlight Banner */}
          <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2 text-purple-900 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Mentorship Skill Match</span>
            </div>

            <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-extrabold shadow-xs">
              {matchSummary}
            </span>
          </div>

          {/* Faculty Registered Skills */}
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Faculty's Registered Skillset ({facultySkills.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {facultySkills.map((s, i) => {
                const name = typeof s === 'string' ? s : s.name;
                const matchesProject = projectSkills.some(ps => ps.toLowerCase() === name.toLowerCase());
                return (
                  <span
                    key={i}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center space-x-1 ${
                      matchesProject
                        ? 'bg-purple-100 text-purple-900 border border-purple-300 font-bold'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {matchesProject && <CheckCircle2 className="w-3 h-3 text-purple-600" />}
                    <span>{name}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Note to Faculty */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Personal Note / Project Objectives
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              placeholder="Hi Dr. Thorne, I have completed the prerequisite Python & Data Structures courses and would appreciate your guidance on..."
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          
          <button
            type="button"
            disabled={status.loading}
            onClick={handleSendRequest}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Send className="w-4 h-4" />
            <span>{status.loading ? 'Sending Request...' : 'Send Request'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
