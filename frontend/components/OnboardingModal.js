'use client';

import React, { useState } from 'react';
import { Compass, X, Plus, ArrowRight } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function OnboardingModal({ onSaveSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState('TY (3rd Year)');
  const [careerGoal, setCareerGoal] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: '' });

  // Add a skill tag from the input field
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkillInput('');
      return; // no duplicates
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
      // Remove last skill on backspace when input is empty
      setSkills(skills.slice(0, -1));
    }
  };

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !level) {
      setStatus({ loading: false, error: 'Name, College Email, and Academic Year are required.' });
      return;
    }

    setStatus({ loading: true, error: '' });

    try {
      const skillsArray = skills.map(s => ({ name: s, level: 'Intermediate' }));
      const res = await fetch(`${API_BASE}/auth/signup-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          level,
          career_goal: careerGoal.trim(),
          skills: skillsArray,
          interests: selectedInterests
        })
      });

      const data = await res.json();
      if (data.success) {
        onSaveSuccess && onSaveSuccess(data.student);
      } else {
        setStatus({ loading: false, error: data.error || 'Failed to save profile.' });
      }
    } catch (err) {
      setStatus({ loading: false, error: 'Cannot connect to COMPASS backend. Please ensure the server is running on http://localhost:5000.' });
    }
  };

  // "Skip" — use demo student from backend directly
  const handleSkip = async () => {
    try {
      const res = await fetch(`${API_BASE}/students`);
      const data = await res.json();
      if (data.success && data.students.length > 0) {
        onSaveSuccess && onSaveSuccess(data.students[0]);
      } else {
        setStatus({ loading: false, error: 'Could not load demo profile. Ensure backend is running.' });
      }
    } catch {
      setStatus({ loading: false, error: 'Cannot connect to backend at http://localhost:5000' });
    }
  };

  const INTERESTS = ['Web Development', 'Artificial Intelligence', 'Data Science', 'Cloud & DevOps', 'Cybersecurity', 'Mobile Apps', 'Machine Learning', 'Embedded Systems'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">

        {/* Header */}
        <div className="p-8 bg-gradient-to-r from-indigo-900 to-purple-900 text-white relative">
          {/* Skip / Close button */}
          <button
            type="button"
            onClick={handleSkip}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
            title="Skip onboarding and use demo account"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Welcome to COMPASS</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Create Your Skill Profile</h2>
          <p className="text-xs text-indigo-200 mt-1.5 max-w-md">
            Enter the skills you know today — your profile drives real-world project matches and staged learning paths.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* Error message */}
          {status.error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              ⚠️ {status.error}
            </div>
          )}

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav Patel"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">College Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@student.college.edu"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Academic Level & Career Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Academic Year / Level *</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="FY (1st Year)">FY (1st Year)</option>
                <option value="SY (2nd Year)">SY (2nd Year)</option>
                <option value="TY (3rd Year)">TY (3rd Year)</option>
                <option value="B.Tech Final Year">B.Tech Final Year</option>
                <option value="M.Tech / PG">M.Tech / PG</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Career Goal</label>
              <input
                type="text"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g. AI Engineer, Full Stack Dev"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Skills — Free Text Tag Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Your Current Skills
              <span className="ml-2 font-normal text-slate-400">(type and press Enter or comma to add)</span>
            </label>

            {/* Tag Input Box */}
            <div
              className="min-h-[52px] w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex flex-wrap gap-2 items-center cursor-text focus-within:border-indigo-600 focus-within:bg-white transition-colors"
              onClick={() => document.getElementById('skill-text-input')?.focus()}
            >
              {/* Existing tags */}
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="flex items-center space-x-1 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeSkill(idx); }}
                    className="ml-1 hover:text-indigo-200 flex items-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {/* Type input */}
              <input
                id="skill-text-input"
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder={skills.length === 0 ? 'e.g. JavaScript, Python, React.js...' : ''}
                className="flex-1 min-w-[140px] bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none border-none"
              />
            </div>

            {/* Add button + hint */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-slate-400">Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">Enter</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">,</kbd> after each skill</span>
              {skillInput.trim() && (
                <button
                  type="button"
                  onClick={addSkill}
                  className="flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add "{skillInput.trim()}"</span>
                </button>
              )}
            </div>
          </div>

          {/* Domain Interests */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Domain Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const isSel = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`text-xs px-3.5 py-1.5 rounded-full font-semibold border transition-all ${
                      isSel
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Skip — use demo account
            </button>

            <button
              type="submit"
              disabled={status.loading}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold shadow-md transition-all flex items-center space-x-2 disabled:opacity-60"
            >
              <span>{status.loading ? 'Saving...' : 'Save & Launch COMPASS'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
