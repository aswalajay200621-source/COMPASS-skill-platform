'use client';

import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const SKILL_OPTIONS = [
  'HTML/CSS', 'JavaScript', 'React.js', 'Node.js', 'MongoDB', 
  'Python', 'Data Structures in Python', 'Machine Learning', 
  'Deep Learning & PyTorch', 'SQL & PostgreSQL', 'Docker & Kubernetes', 'Tailwind CSS'
];

export default function FacultyPortal({ currentFaculty, onFacultyOnboarded }) {
  const [activeSubTab, setActiveSubTab] = useState('onboard');

  // Onboarding State
  const [name, setName] = useState(currentFaculty?.name || 'Prof. Dr. Aris Thorne');
  const [email, setEmail] = useState(currentFaculty?.email || 'aris.thorne@apex.edu');
  const [department, setDepartment] = useState(currentFaculty?.department || 'Computer Science & AI');
  const [skills, setSkills] = useState(currentFaculty?.skills || ['Python', 'Data Structures in Python', 'Machine Learning', 'Deep Learning & PyTorch']);
  const [bio, setBio] = useState(currentFaculty?.bio || 'Lead Researcher in Computer Vision & Intelligent Systems. Open to mentoring students.');
  const [onboardStatus, setOnboardStatus] = useState({ loading: false, success: '', error: '' });

  // Post Opportunity State
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postType, setPostType] = useState('RA_role');
  const [postDifficulty, setPostDifficulty] = useState('Intermediate');
  const [postRequiredSkills, setPostRequiredSkills] = useState([]);
  const [postStatus, setPostStatus] = useState({ loading: false, success: '', error: '' });

  // Inbox Requests State
  const [requests, setRequests] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(false);

  const handleToggleSkill = (skillName) => {
    if (skills.includes(skillName)) {
      setSkills(skills.filter(s => s !== skillName));
    } else {
      setSkills([...skills, skillName]);
    }
  };

  const handleTogglePostSkill = (skillName) => {
    if (postRequiredSkills.includes(skillName)) {
      setPostRequiredSkills(postRequiredSkills.filter(s => s !== skillName));
    } else {
      setPostRequiredSkills([...postRequiredSkills, skillName]);
    }
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    setOnboardStatus({ loading: true, success: '', error: '' });

    try {
      const res = await fetch(`${API_BASE}/auth/faculty-onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          department,
          skills,
          bio
        })
      });

      const data = await res.json();
      if (data.success) {
        setOnboardStatus({ loading: false, success: 'Faculty record onboarded successfully!', error: '' });
        if (onFacultyOnboarded) onFacultyOnboarded(data.faculty);
      } else {
        setOnboardStatus({ loading: false, success: '', error: data.error });
      }
    } catch (err) {
      setOnboardStatus({ loading: false, success: '', error: 'Failed to connect to backend server.' });
    }
  };

  const handlePostOpportunity = async (e) => {
    e.preventDefault();
    if (!currentFaculty?.id) {
      setPostStatus({ loading: false, success: '', error: 'Please onboard or select a faculty profile first.' });
      return;
    }
    if (postRequiredSkills.length === 0) {
      setPostStatus({ loading: false, success: '', error: 'Please select at least one required skill.' });
      return;
    }

    setPostStatus({ loading: true, success: '', error: '' });

    try {
      const res = await fetch(`${API_BASE}/opportunities/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faculty_id: currentFaculty.id,
          title: postTitle,
          description: postDesc,
          required_skills: postRequiredSkills,
          difficulty: postDifficulty,
          type: postType
        })
      });

      const data = await res.json();
      if (data.success) {
        setPostStatus({ loading: false, success: 'Opportunity posted successfully!', error: '' });
        setPostTitle('');
        setPostDesc('');
        setPostRequiredSkills([]);
      } else {
        setPostStatus({ loading: false, success: '', error: data.error });
      }
    } catch (err) {
      setPostStatus({ loading: false, success: '', error: 'Failed to post opportunity.' });
    }
  };

  const fetchInboxRequests = async () => {
    if (!currentFaculty?.id) return;
    setInboxLoading(true);
    try {
      const res = await fetch(`${API_BASE}/mentorship/faculty/${currentFaculty.id}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInboxLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'inbox') {
      fetchInboxRequests();
    }
  }, [activeSubTab, currentFaculty]);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Faculty Portal
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Onboard faculty profiles, post student research opportunities, and handle mentorship requests.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center space-x-1 border-b border-white/5 mb-8 pb-3">
        {[
          { id: 'onboard', label: 'Faculty Onboarding' },
          { id: 'post', label: 'Post Opportunity' },
          { id: 'inbox', label: `Mentorship Inbox (${requests.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeSubTab === tab.id
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Onboarding Form */}
      {activeSubTab === 'onboard' && (
        <form onSubmit={handleOnboardSubmit} className="railway-panel p-6 sm:p-7 rounded-xl space-y-5">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Faculty Profile Details
          </h2>

          {onboardStatus.error && (
            <div className="p-3 rounded bg-rose-500/10 text-rose-300 text-xs">
              {onboardStatus.error}
            </div>
          )}

          {onboardStatus.success && (
            <div className="p-3 rounded bg-emerald-500/10 text-emerald-300 text-xs">
              {onboardStatus.success}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Faculty Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0E121B] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="Prof. Dr. Aris Thorne"
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
                placeholder="aris.thorne@apex.edu"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Department
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#0E121B] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="Computer Science & AI"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Bio / Research Focus
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#0E121B] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="Lead Researcher in Computer Vision..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Technical Expertise Tags
            </label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SKILL_OPTIONS.map(skill => {
                const isSelected = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggleSkill(skill)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-[#0E121B] text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{skill}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={onboardStatus.loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 px-6 rounded-md shadow-sm transition-colors"
            >
              {onboardStatus.loading ? 'Saving...' : 'Save Faculty Profile'}
            </button>
          </div>
        </form>
      )}

      {/* 2. Post Opportunity Form */}
      {activeSubTab === 'post' && (
        <form onSubmit={handlePostOpportunity} className="railway-panel p-6 sm:p-7 rounded-xl space-y-5">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Post Opportunity Details
          </h2>

          <div className="text-xs text-slate-400">
            Posting as: <span className="text-slate-200 font-medium">{currentFaculty?.name || 'Prof. Dr. Aris Thorne'}</span>
          </div>

          {postStatus.error && (
            <div className="p-3 rounded bg-rose-500/10 text-rose-300 text-xs">
              {postStatus.error}
            </div>
          )}

          {postStatus.success && (
            <div className="p-3 rounded bg-emerald-500/10 text-emerald-300 text-xs">
              {postStatus.success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Opportunity Title
              </label>
              <input
                type="text"
                required
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full bg-[#0E121B] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="Autonomous Drone Mapping System"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Type
                </label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className="w-full bg-[#0E121B] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="RA_role">Research Assistant (RA Role)</option>
                  <option value="internship">Faculty Internship</option>
                  <option value="mini_project">Mini-Project</option>
                  <option value="project">Capstone Project</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={postDifficulty}
                  onChange={(e) => setPostDifficulty(e.target.value)}
                  className="w-full bg-[#0E121B] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                required
                value={postDesc}
                onChange={(e) => setPostDesc(e.target.value)}
                className="w-full bg-[#0E121B] border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="Explain objectives and scope..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Required Prerequisite Skills
              </label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SKILL_OPTIONS.map(skill => {
                  const isSelected = postRequiredSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleTogglePostSkill(skill)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-[#0E121B] text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={postStatus.loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 px-6 rounded-md shadow-sm transition-colors"
            >
              {postStatus.loading ? 'Publishing...' : 'Publish Opportunity'}
            </button>
          </div>
        </form>
      )}

      {/* 3. Mentorship Inbox */}
      {activeSubTab === 'inbox' && (
        <div className="railway-panel p-6 sm:p-7 rounded-xl space-y-5">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Pending Mentorship Requests ({requests.length})
          </h2>

          {inboxLoading && (
            <div className="py-10 text-center text-slate-500 text-xs">
              Loading inbox...
            </div>
          )}

          {!inboxLoading && requests.length === 0 && (
            <div className="py-10 text-center text-slate-500 text-xs">
              No mentorship requests received yet.
            </div>
          )}

          <div className="space-y-3">
            {!inboxLoading && requests.map(req => (
              <div key={req.id} className="p-4 rounded-lg railway-subcard space-y-2 text-xs">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white">{req.student_name}</h3>
                    <div className="text-slate-400">{req.student_email} • {req.student_level}</div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Status: {req.status}
                  </span>
                </div>

                <div className="text-slate-300 bg-[#0B0E14] p-3 rounded border border-white/5">
                  <strong className="text-white block mb-1">Target: {req.project_title}</strong>
                  "{req.message}"
                </div>

                <div className="text-[11px] text-slate-500">
                  Skills: {req.student_skills.map(s => typeof s === 'string' ? s : s.name).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
