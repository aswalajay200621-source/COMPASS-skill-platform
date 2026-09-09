'use client';

import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';

const API_BASE = '/api';

const AVAILABLE_SKILL_OPTIONS = [
  'HTML/CSS', 'JavaScript', 'React.js', 'Node.js', 'MongoDB', 
  'Python', 'Data Structures in Python', 'Machine Learning', 
  'Deep Learning & PyTorch', 'SQL & PostgreSQL', 'Docker & Kubernetes', 'Tailwind CSS'
];

export default function StudentProfileForm({ currentStudent, onSaveSuccess }) {
  const [name, setName] = useState(currentStudent?.name || 'Aarav Patel');
  const [email, setEmail] = useState(currentStudent?.email || 'aarav.patel@student.apex.edu');
  const [level, setLevel] = useState(currentStudent?.level || 'TY (3rd Year)');
  const [careerGoal, setCareerGoal] = useState(currentStudent?.careerGoal || currentStudent?.career_goal || 'Full Stack Software Engineer');
  const [skills, setSkills] = useState(
    currentStudent?.skills?.map(s => typeof s === 'string' ? { name: s, level: 'Intermediate' } : s) || [
      { name: 'HTML/CSS', level: 'Intermediate' },
      { name: 'JavaScript', level: 'Intermediate' }
    ]
  );
  const [interestsInput, setInterestsInput] = useState(
    currentStudent?.interests?.join(', ') || 'Web Development, Cloud Systems'
  );

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddSkill = () => {
    if (!newSkillName) return;
    if (skills.some(s => s.name.toLowerCase() === newSkillName.toLowerCase())) {
      setError('Skill already added to profile.');
      return;
    }
    setSkills([...skills, { name: newSkillName, level: newSkillLevel }]);
    setNewSkillName('');
    setError('');
  };

  const handleRemoveSkill = (skillNameToRemove) => {
    setSkills(skills.filter(s => s.name !== skillNameToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const interestsArray = interestsInput.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const res = await fetch(`${API_BASE}/auth/signup-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          level,
          career_goal: careerGoal,
          skills,
          interests: interestsArray
        })
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to save student profile.');
      } else {
        setSuccess('Profile updated successfully.');
        if (onSaveSuccess) {
          onSaveSuccess(data.student);
        }
      }
    } catch (err) {
      setError('Cannot connect to COMPASS backend server on http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Student Skill Profile
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your academic identity and verified skill inventory.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-rose-500/10 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 text-emerald-300 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Identity Section */}
        <div className="railway-panel p-6 rounded-xl space-y-5">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Academic Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0E121B] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="Aarav Patel"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                College Email (*.edu / *.ac)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0E121B] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="aarav.patel@student.apex.edu"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Academic Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-[#0E121B] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="FY (1st Year)">FY (1st Year Undergraduate)</option>
                <option value="SY (2nd Year)">SY (2nd Year Undergraduate)</option>
                <option value="TY (3rd Year)">TY (3rd Year Undergraduate)</option>
                <option value="Final Year">Final Year Undergraduate</option>
                <option value="Postgraduate (M.Tech / M.S.)">Postgraduate (M.Tech / M.S.)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Target Career Goal
              </label>
              <input
                type="text"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="w-full bg-[#0E121B] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="Full Stack Software Engineer"
              />
            </div>
          </div>
        </div>

        {/* Skill Inventory Section */}
        <div className="railway-panel p-6 rounded-xl space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Skill Inventory ({skills.length})
            </h2>
          </div>

          {/* Grayscale Skill Tags */}
          <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-lg railway-subcard">
            {skills.length === 0 ? (
              <span className="text-xs text-slate-500 italic">No skills listed yet.</span>
            ) : (
              skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-2 bg-slate-800 px-2.5 py-1 rounded text-xs font-medium text-slate-200"
                >
                  <span>{skill.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {skill.level}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill.name)}
                    className="text-slate-400 hover:text-rose-400 transition-colors ml-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Skill Form Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
            <div className="sm:col-span-6">
              <select
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="w-full bg-[#0E121B] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Select Skill --</option>
                {AVAILABLE_SKILL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value)}
                className="w-full bg-[#0E121B] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Novice">Novice</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleAddSkill}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center space-x-1 border border-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Areas of Interest (Comma separated)
            </label>
            <input
              type="text"
              value={interestsInput}
              onChange={(e) => setInterestsInput(e.target.value)}
              className="w-full bg-[#0E121B] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="Web Development, Cloud Systems"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => {
              setName('Aarav Patel');
              setEmail('aarav.patel@student.apex.edu');
              setLevel('TY (3rd Year)');
              setSkills([
                { name: 'HTML/CSS', level: 'Intermediate' },
                { name: 'JavaScript', level: 'Intermediate' }
              ]);
            }}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            Reset to default test profile
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 px-6 rounded-md shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

      </form>
    </div>
  );
}
