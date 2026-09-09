'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Check, Plus } from 'lucide-react';

const API_BASE = '/api';

export default function MentorRegistrationModal({
  currentStudent,
  onClose,
  onMentorRegistered
}) {
  const [name, setName] = useState(currentStudent?.name || '');
  const [email, setEmail] = useState(currentStudent?.email || '');
  const [department, setDepartment] = useState('Computer Science & AI');
  const [bio, setBio] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [status, setStatus] = useState({ loading: false, success: '', error: '' });

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkillInput('');
      return;
    }
    setSkills([...skills, trimmed]);
    setSkillInput('');
  };

  const removeSkill = (idx) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    } else if (e.key === 'Backspace' && skillInput === '' && skills.length > 0) {
      setSkills(skills.slice(0, -1));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !department) {
      setStatus({ loading: false, success: '', error: 'Name, College Email, and Department are required.' });
      return;
    }
    if (skills.length === 0) {
      setStatus({ loading: false, success: '', error: 'Please add at least one skill you can mentor in.' });
      return;
    }

    setStatus({ loading: true, success: '', error: '' });

    try {
      const res = await fetch(`${API_BASE}/auth/faculty-onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          department,
          skills,
          bio,
          studentId: currentStudent?.id
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatus({ loading: false, success: data.message, error: '' });
        setTimeout(() => {
          onMentorRegistered && onMentorRegistered(data.faculty);
          onClose();
        }, 1200);
      } else {
        setStatus({ loading: false, success: '', error: data.error });
      }
    } catch (err) {
      setStatus({ loading: false, success: '', error: 'Cannot connect to backend server at http://localhost:5000' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">

        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-900 to-indigo-900 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1.5 text-purple-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Faculty Registration</span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-white">Register as Faculty / Mentor</h3>
          <p className="text-xs text-purple-200 mt-1">Unlock the Mentor POV and get matched to students based on your skills.</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

          {status.error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              ⚠️ {status.error}
            </div>
          )}

          {status.success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{status.success}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name & Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Prof. Dr. Aris Thorne"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">College Email (.edu / .ac) *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aris.thorne@apex.edu"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Academic Department / Role *</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-purple-600"
            >
              <option value="Computer Science & AI">Computer Science & AI</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Data Science & Cloud">Data Science & Cloud</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>

          {/* Skills — Free Text Tag Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Skills You Can Mentor In *
              <span className="ml-2 font-normal text-slate-400">(type and press Enter to add)</span>
            </label>

            <div
              className="min-h-[52px] w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex flex-wrap gap-2 items-center cursor-text focus-within:border-purple-600 focus-within:bg-white transition-colors"
              onClick={() => document.getElementById('mentor-skill-input')?.focus()}
            >
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="flex items-center space-x-1 bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeSkill(idx); }}
                    className="ml-1 hover:text-purple-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <input
                id="mentor-skill-input"
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder={skills.length === 0 ? 'e.g. Python, Machine Learning, React.js...' : ''}
                className="flex-1 min-w-[160px] bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none border-none"
              />
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-slate-400">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">Enter</kbd> after each skill
              </span>
              {skillInput.trim() && (
                <button
                  type="button"
                  onClick={addSkill}
                  className="flex items-center space-x-1 text-xs font-bold text-purple-600 hover:text-purple-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add "{skillInput.trim()}"</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Short Bio / Research Focus <span className="font-normal text-slate-400">(Optional)</span></label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Lead researcher in Intelligent Systems, mentoring undergraduates on CV projects..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status.loading}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-extrabold shadow-sm transition-all disabled:opacity-60"
            >
              {status.loading ? 'Registering...' : 'Complete Registration & Unlock Mentor POV'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
