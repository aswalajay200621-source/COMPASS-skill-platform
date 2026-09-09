'use client';

import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Users, 
  Award, 
  Check, 
  X, 
  Plus, 
  Edit3, 
  Calendar, 
  PlusCircle, 
  CheckCircle2, 
  Clock,
  Sparkles
} from 'lucide-react';

const API_BASE = '/api';

export default function MentorDashboard({
  currentFaculty,
  allSkills = [],
  onFacultyUpdated
}) {
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Edit Skills Modal State
  const [editSkillsModal, setEditSkillsModal] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  // Post Opportunity Modal State
  const [postOppModal, setPostOppModal] = useState(false);
  const [oppForm, setOppForm] = useState({
    title: '',
    description: '',
    difficulty: 'Intermediate',
    type: 'internship',
    apply_by_date: '',
    required_skills: []
  });
  const [oppSkillInput, setOppSkillInput] = useState('');
  const [oppStatus, setOppStatus] = useState({ loading: false, success: '', error: '' });

  // Fetch Requests for Faculty
  const fetchFacultyRequests = async () => {
    if (!currentFaculty?.id) return;
    setLoadingRequests(true);
    try {
      const res = await fetch(`${API_BASE}/mentorship/faculty/${currentFaculty.id}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error('Failed to fetch faculty requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchFacultyRequests();
    if (currentFaculty?.skills) {
      setSelectedSkills(currentFaculty.skills.map(s => typeof s === 'string' ? s : s.name));
    }
  }, [currentFaculty]);

  // Tag input helpers for Edit Skills
  const addSkill = () => {
    const t = skillInput.trim();
    if (!t || selectedSkills.includes(t)) { setSkillInput(''); return; }
    setSelectedSkills([...selectedSkills, t]);
    setSkillInput('');
  };
  const removeSkill = (idx) => setSelectedSkills(selectedSkills.filter((_, i) => i !== idx));
  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); }
    else if (e.key === 'Backspace' && skillInput === '' && selectedSkills.length > 0) setSelectedSkills(selectedSkills.slice(0, -1));
  };

  // Tag input helpers for Post Opportunity Skills
  const addOppSkill = () => {
    const t = oppSkillInput.trim();
    if (!t || oppForm.required_skills.includes(t)) { setOppSkillInput(''); return; }
    setOppForm({ ...oppForm, required_skills: [...oppForm.required_skills, t] });
    setOppSkillInput('');
  };
  const removeOppSkill = (idx) => setOppForm({ ...oppForm, required_skills: oppForm.required_skills.filter((_, i) => i !== idx) });
  const handleOppSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addOppSkill(); }
    else if (e.key === 'Backspace' && oppSkillInput === '' && oppForm.required_skills.length > 0) setOppForm({ ...oppForm, required_skills: oppForm.required_skills.slice(0, -1) });
  };

  // Handle Accept / Decline Mentorship Request
  const handleRespondRequest = async (requestId, status) => {
    try {
      const res = await fetch(`${API_BASE}/mentorship/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, status })
      });
      const data = await res.json();
      if (data.success) {
        fetchFacultyRequests();
      }
    } catch (err) {
      console.error('Failed to respond to request:', err);
    }
  };

  // Save Skills
  const handleSaveSkills = async () => {
    if (!currentFaculty?.id) return;
    try {
      const res = await fetch(`${API_BASE}/faculties/${currentFaculty.id}/skills`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: selectedSkills })
      });
      const data = await res.json();
      if (data.success) {
        setEditSkillsModal(false);
        setSkillInput('');
        if (onFacultyUpdated) onFacultyUpdated(data.faculty);
      }
    } catch (err) {
      console.error('Failed to update faculty skills:', err);
    }
  };

  // Submit New Opportunity
  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    if (!currentFaculty?.id) return;
    setOppStatus({ loading: true, success: '', error: '' });

    try {
      const res = await fetch(`${API_BASE}/opportunities/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faculty_id: currentFaculty.id,
          ...oppForm
        })
      });
      const data = await res.json();
      if (data.success) {
        setOppStatus({ loading: false, success: data.message, error: '' });
        setTimeout(() => {
          setPostOppModal(false);
          setOppForm({ title: '', description: '', difficulty: 'Intermediate', type: 'internship', apply_by_date: '', required_skills: [] });
          setOppSkillInput('');
          setOppStatus({ loading: false, success: '', error: '' });
        }, 1500);
      } else {
        setOppStatus({ loading: false, success: '', error: data.error });
      }
    } catch (err) {
      setOppStatus({ loading: false, success: '', error: 'Failed to post opportunity.' });
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const acceptedRequests = requests.filter(r => r.status === 'accepted');
  const facultySkills = currentFaculty?.skills || [];

  return (
    <div className="space-y-8">
      
      {/* Mentor Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-purple-900/10">
        <div>
          <div className="flex items-center space-x-2 text-purple-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Faculty Mentorship Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {currentFaculty?.name || 'Dr. Aris Thorne'}!
          </h1>
          <p className="text-purple-100 text-sm mt-2 max-w-xl leading-relaxed">
            You have <strong className="text-white font-semibold">{pendingRequests.length} pending mentorship requests</strong> from Apex Institute students matching your registered skill set.
          </p>
        </div>

        <button
          onClick={() => setPostOppModal(true)}
          className="px-5 py-3 rounded-2xl bg-white text-purple-950 hover:bg-purple-50 font-extrabold text-xs shadow-md transition-all flex items-center space-x-2 shrink-0 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-purple-700" />
          <span>Post New Opportunity</span>
        </button>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Stat 1: Mentorship Requests */}
        <div className="bg-purple-50/70 border border-purple-100 p-5 rounded-2xl flex items-center space-x-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-purple-950 font-mono">{requests.length} Requests</div>
            <div className="text-xs font-semibold text-purple-700">{pendingRequests.length} Pending Approval</div>
          </div>
        </div>

        {/* Stat 2: Active Mentees */}
        <div className="bg-emerald-50/70 border border-emerald-100 p-5 rounded-2xl flex items-center space-x-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-950 font-mono">{acceptedRequests.length} Mentees</div>
            <div className="text-xs font-semibold text-emerald-700">Active Student Mentees</div>
          </div>
        </div>

        {/* Stat 3: Registered Skills */}
        <div className="bg-indigo-50/70 border border-indigo-100 p-5 rounded-2xl flex items-center space-x-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-950 font-mono">{facultySkills.length} Skills</div>
            <div className="text-xs font-semibold text-indigo-700">Registered Tech Skills</div>
          </div>
        </div>

      </div>

      {/* Main Grid: Mentorship Requests & Faculty Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Recent Mentorship Requests Inbox */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Recent Mentorship Requests</h2>
            <span className="text-xs font-semibold text-slate-500">{requests.length} total</span>
          </div>

          {loadingRequests ? (
            <div className="compass-card p-8 text-center text-xs text-slate-400">Loading inbox...</div>
          ) : requests.length === 0 ? (
            <div className="compass-card p-12 text-center text-xs text-slate-500">
              No mentorship requests received yet. Students will appear here when they request your guidance on matched projects.
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="compass-card p-6 space-y-4">
                  
                  {/* Student & Project Row */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                        {req.student_name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{req.student_name}</div>
                        <div className="text-xs text-slate-500 font-medium">{req.student_email} • {req.student_level}</div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase ${
                      req.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : req.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Project Context */}
                  <div className="compass-subcard p-3.5 space-y-1.5">
                    <div className="text-xs font-bold text-indigo-900">Project: {req.project_title}</div>
                    {req.message && (
                      <p className="text-xs text-slate-600 italic">"{req.message}"</p>
                    )}
                  </div>

                  {/* Action Buttons for Pending */}
                  {req.status === 'pending' && (
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleRespondRequest(req.id, 'declined')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold transition-colors flex items-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>

                      <button
                        onClick={() => handleRespondRequest(req.id, 'accepted')}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-xs flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Mentorship</span>
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Registered Skills Panel */}
        <div className="space-y-6">
          
          <div className="compass-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Your Registered Skills</h3>
              <button
                onClick={() => {
                  // Pre-populate with current skills
                  setSelectedSkills(facultySkills.map(s => typeof s === 'string' ? s : s.name));
                  setSkillInput('');
                  setEditSkillsModal(true);
                }}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center space-x-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">
              The matching engine uses your registered skills to auto-surface your profile when students view matching projects.
            </p>

            <div className="flex flex-wrap gap-1.5">
              {facultySkills.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No skills registered yet.</span>
              ) : (
                facultySkills.map((skill, idx) => (
                  <span key={idx} className="text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1 rounded-full flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-purple-600" />
                    <span>{typeof skill === 'string' ? skill : skill.name}</span>
                  </span>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Edit Skills Modal */}
      {editSkillsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Update Your Registered Skills</h3>
              <button onClick={() => setEditSkillsModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <p className="text-xs text-slate-500">Type the skills you can mentor students in — press <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">Enter</kbd> or comma to add each one.</p>

            {/* Tag Input */}
            <div
              className="min-h-[52px] w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex flex-wrap gap-2 items-center cursor-text focus-within:border-purple-600 focus-within:bg-white transition-colors"
              onClick={() => document.getElementById('edit-skill-input')?.focus()}
            >
              {selectedSkills.map((skill, idx) => (
                <span key={idx} className="flex items-center space-x-1 bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  <span>{skill}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeSkill(idx); }} className="ml-0.5 hover:text-purple-200">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                id="edit-skill-input"
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder={selectedSkills.length === 0 ? 'e.g. Python, Machine Learning, React.js...' : ''}
                className="flex-1 min-w-[150px] bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none border-none"
              />
            </div>
            {skillInput.trim() && (
              <button type="button" onClick={addSkill} className="flex items-center space-x-1 text-xs font-bold text-purple-600 hover:text-purple-800 mt-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Add "{skillInput.trim()}"</span>
              </button>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button onClick={() => { setEditSkillsModal(false); setSkillInput(''); }} className="px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
              <button onClick={handleSaveSkills} className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-extrabold shadow-sm">Save Skills</button>
            </div>
          </div>
        </div>
      )}

      {/* Post Opportunity Modal */}
      {postOppModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Post New Faculty Opportunity</h3>
              <button onClick={() => setPostOppModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            {oppStatus.error && <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold">{oppStatus.error}</div>}
            {oppStatus.success && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold">{oppStatus.success}</div>}

            <form onSubmit={handleCreateOpportunity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={oppForm.title}
                  onChange={(e) => setOppForm({ ...oppForm, title: e.target.value })}
                  placeholder="e.g. Computer Vision RA Position"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={oppForm.description}
                  onChange={(e) => setOppForm({ ...oppForm, description: e.target.value })}
                  placeholder="Brief summary of research or project scope..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={oppForm.type}
                    onChange={(e) => setOppForm({ ...oppForm, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="internship">Summer Internship</option>
                    <option value="RA_role">Research Assistant (RA)</option>
                    <option value="mini_project">Mini-Project</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Apply By Date</label>
                  <input
                    type="date"
                    required
                    value={oppForm.apply_by_date}
                    onChange={(e) => setOppForm({ ...oppForm, apply_by_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Required Skills
                  <span className="ml-2 font-normal text-slate-400">(type and press Enter to add)</span>
                </label>
                <div
                  className="min-h-[48px] w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex flex-wrap gap-2 items-center cursor-text focus-within:border-purple-600 focus-within:bg-white transition-colors"
                  onClick={() => document.getElementById('opp-skill-input')?.focus()}
                >
                  {oppForm.required_skills.map((skill, idx) => (
                    <span key={idx} className="flex items-center space-x-1 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      <span>{skill}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeOppSkill(idx); }} className="ml-0.5 hover:text-indigo-200">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    id="opp-skill-input"
                    type="text"
                    value={oppSkillInput}
                    onChange={(e) => setOppSkillInput(e.target.value)}
                    onKeyDown={handleOppSkillKeyDown}
                    placeholder={oppForm.required_skills.length === 0 ? 'e.g. Python, React.js, Docker...' : ''}
                    className="flex-1 min-w-[130px] bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none border-none"
                  />
                </div>
                {oppSkillInput.trim() && (
                  <button type="button" onClick={addOppSkill} className="flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add "{oppSkillInput.trim()}"</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setPostOppModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
                <button type="submit" disabled={oppStatus.loading} className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-extrabold shadow-sm">
                  {oppStatus.loading ? 'Posting...' : 'Post Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
