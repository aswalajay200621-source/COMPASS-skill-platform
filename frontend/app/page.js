'use client';

import React, { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import StudentDashboard from '../components/StudentDashboard';
import ProjectBrowser from '../components/ProjectBrowser';
import ProjectDetailModal from '../components/ProjectDetailModal';
import MentorshipModal from '../components/MentorshipModal';
import MentorDashboard from '../components/MentorDashboard';
import MentorRegistrationModal from '../components/MentorRegistrationModal';
import OpportunitiesView from '../components/OpportunitiesView';
import OnboardingModal from '../components/OnboardingModal';
import PortfolioView from '../components/PortfolioView';
import { Award, CheckCircle2, Send, ExternalLink, Plus } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function Home() {
  const [loadingApp, setLoadingApp] = useState(true);
  const [activePOV, setActivePOV] = useState('STUDENT'); // 'STUDENT' | 'MENTOR'
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Domain State
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentFaculty, setCurrentFaculty] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [projects, setProjects] = useState([]);

  // Theme State ('light' | 'dark')
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('compass_theme') || 'dark';
    setTheme(saved);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('compass_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Modals State
  const [selectedProjectDetail, setSelectedProjectDetail] = useState(null);
  const [mentorshipTargetFaculty, setMentorshipTargetFaculty] = useState(null);
  const [mentorshipTargetProject, setMentorshipTargetProject] = useState(null);
  const [mentorRegisterModalOpen, setMentorRegisterModalOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);

  // Completion Modal State
  const [completingProject, setCompletingProject] = useState(null);
  const [githubLink, setGithubLink] = useState('');
  const [completionStatus, setCompletionStatus] = useState({ loading: false, success: '', error: '' });

  // Backend connection error
  const [backendError, setBackendError] = useState(false);

  // Initial Data Fetching
  const loadInitialData = async () => {
    try {
      setBackendError(false);

      // 1. Fetch Skills Taxonomy
      const skillsRes = await fetch(`${API_BASE}/skills`);
      const skillsData = await skillsRes.json();
      if (skillsData.success) {
        setAllSkills(skillsData.skills);
      }

      // 2. Fetch Initial Student (Aarav Patel)
      const studentRes = await fetch(`${API_BASE}/students`);
      const studentData = await studentRes.json();
      if (studentData.success && studentData.students.length > 0) {
        const student = studentData.students[0];
        setCurrentStudent(student);
        fetchMatchedProjects(student.id);

        // Check if student has registered as mentor
        if (student.is_mentor && student.faculty_id) {
          const facRes = await fetch(`${API_BASE}/faculties`);
          const facData = await facRes.json();
          if (facData.success) {
            const fac = facData.faculties.find(f => f.id === student.faculty_id);
            if (fac) setCurrentFaculty(fac);
          }
        }
      } else {
        // Trigger onboarding for new student
        setOnboardingModalOpen(true);
      }

      // 3. Fetch Faculty List
      const facultyRes = await fetch(`${API_BASE}/faculties`);
      const facultyData = await facultyRes.json();
      if (facultyData.success && facultyData.faculties.length > 0 && !currentFaculty) {
        setCurrentFaculty(facultyData.faculties[0]);
      }
    } catch (err) {
      console.error('Error fetching initial COMPASS data:', err);
      setBackendError(true);
      // Show onboarding so user can attempt manual entry
      setOnboardingModalOpen(true);
    }
  };

  const fetchMatchedProjects = async (studentId) => {
    try {
      const res = await fetch(`${API_BASE}/projects/matched/${studentId}`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Failed to fetch matched projects:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleStudentSaved = (savedStudent) => {
    setCurrentStudent(savedStudent);
    setOnboardingModalOpen(false);
    fetchMatchedProjects(savedStudent.id);
  };

  const handleMentorRegistered = (registeredFaculty) => {
    setCurrentFaculty(registeredFaculty);
    if (currentStudent) {
      setCurrentStudent({ ...currentStudent, is_mentor: 1, faculty_id: registeredFaculty.id });
    }
    setActivePOV('MENTOR');
    setActiveTab('home');
  };

  const handleCompleteProjectSubmit = async () => {
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
        setTimeout(() => {
          setCompletingProject(null);
          setGithubLink('');
          setCompletionStatus({ loading: false, success: '', error: '' });
          if (selectedProjectDetail) setSelectedProjectDetail(null);
          fetchMatchedProjects(currentStudent.id);
        }, 1600);
      } else {
        setCompletionStatus({ loading: false, success: '', error: data.error });
      }
    } catch (err) {
      setCompletionStatus({ loading: false, success: '', error: 'Failed to record completion.' });
    }
  };

  if (loadingApp) {
    return <LoadingScreen onFinish={() => setLoadingApp(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row">
      
      {/* Left Sidebar Shell */}
      <Sidebar
        activePOV={activePOV}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'projects' || tab === 'home') {
            setSearchQuery('');
          }
        }}
      />

      {/* Main App Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <TopBar
          currentStudent={currentStudent}
          currentFaculty={currentFaculty}
          activePOV={activePOV}
          setActivePOV={(pov) => {
            setActivePOV(pov);
            setActiveTab('home');
          }}
          onOpenMentorRegister={() => setMentorRegisterModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={() => setActiveTab('projects')}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Backend Connection Error Banner */}
        {backendError && (
          <div className="mx-8 mt-4 flex items-center justify-between gap-3 bg-rose-50 border border-rose-200 text-rose-800 px-5 py-3.5 rounded-2xl text-xs font-semibold shadow-sm">
            <span>⚠️ <strong>Backend unreachable</strong> — Make sure the Express server is running: <code className="font-mono bg-rose-100 px-1.5 py-0.5 rounded">cd backend && node server.js</code></span>
            <button
              onClick={() => { setBackendError(false); loadInitialData(); }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shrink-0 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* View Router Main Container */}
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* STUDENT POV VIEWS */}
          {activePOV === 'STUDENT' && (
            <>
              {activeTab === 'home' && (
                <StudentDashboard
                  currentStudent={currentStudent}
                  recommendedProjects={projects}
                  onSelectProject={(proj) => setSelectedProjectDetail(proj)}
                  onViewAllProjects={() => setActiveTab('projects')}
                  onViewLearningPaths={() => setActiveTab('learning-paths')}
                />
              )}

              {(activeTab === 'projects' || activeTab === 'learning-paths') && (
                <ProjectBrowser
                  projects={projects}
                  currentStudent={currentStudent}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onSelectProject={(proj) => setSelectedProjectDetail(proj)}
                />
              )}

              {activeTab === 'my-skills' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-900">My Verified Skills Profile</h1>
                      <p className="text-xs text-slate-500">Edit your skill set to update project recommendations in real time.</p>
                    </div>
                    <button
                      onClick={() => setOnboardingModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                    >
                      Update Profile
                    </button>
                  </div>

                  <div className="compass-card p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">Current Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentStudent?.skills?.map((s, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{typeof s === 'string' ? s : s.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'mentorship' && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-extrabold text-slate-900">My Mentorship Requests</h1>
                  <div className="compass-card p-8 text-center text-xs text-slate-500">
                    Select any project from the Recommended list to request mentorship from matched faculty!
                  </div>
                </div>
              )}

              {activeTab === 'opportunities' && (
                <OpportunitiesView
                  currentStudent={currentStudent}
                  onSelectOpportunity={(opp) => {
                    if (opp.faculty_name) {
                      setMentorshipTargetFaculty({
                        id: opp.faculty_id,
                        name: opp.faculty_name,
                        department: opp.faculty_dept || 'Faculty',
                        skills: opp.required_skills
                      });
                      setMentorshipTargetProject(opp);
                    } else {
                      setSelectedProjectDetail(opp);
                    }
                  }}
                />
              )}

              {activeTab === 'portfolio' && (
                <PortfolioView studentId={currentStudent?.id || 1} />
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-extrabold text-slate-900">Account Settings</h1>
                  <div className="compass-card p-6 space-y-3">
                    <div className="text-sm font-bold text-slate-900">Institution Scope</div>
                    <div className="text-xs text-slate-600">Apex Institute of Technology (.edu domain)</div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* MENTOR POV VIEWS */}
          {activePOV === 'MENTOR' && (
            <>
              {(activeTab === 'home' || activeTab === 'mentor-requests' || activeTab === 'mentor-skills' || activeTab === 'posted-opportunities' || activeTab === 'mentor-profile') && (
                <MentorDashboard
                  currentFaculty={currentFaculty}
                  allSkills={allSkills}
                  onFacultyUpdated={(updated) => setCurrentFaculty(updated)}
                />
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-extrabold text-slate-900">Mentor Settings</h1>
                  <div className="compass-card p-6 space-y-3">
                    <div className="text-sm font-bold text-slate-900">Faculty Role & Scope</div>
                    <div className="text-xs text-slate-600">{currentFaculty?.department || 'Department Head'} • Apex Institute</div>
                  </div>
                </div>
              )}
            </>
          )}

        </main>

      </div>

      {/* MODALS */}
      {selectedProjectDetail && (
        <ProjectDetailModal
          project={selectedProjectDetail}
          currentStudent={currentStudent}
          onClose={() => setSelectedProjectDetail(null)}
          onRequestMentorship={(fac, proj) => {
            setMentorshipTargetFaculty(fac);
            setMentorshipTargetProject(proj);
          }}
          onCompleteProject={(proj) => setCompletingProject(proj)}
        />
      )}

      {mentorshipTargetFaculty && mentorshipTargetProject && (
        <MentorshipModal
          faculty={mentorshipTargetFaculty}
          project={mentorshipTargetProject}
          currentStudent={currentStudent}
          onClose={() => {
            setMentorshipTargetFaculty(null);
            setMentorshipTargetProject(null);
          }}
          onRequestSent={() => {
            if (currentStudent) fetchMatchedProjects(currentStudent.id);
          }}
        />
      )}

      {mentorRegisterModalOpen && (
        <MentorRegistrationModal
          currentStudent={currentStudent}
          allSkills={allSkills}
          onClose={() => setMentorRegisterModalOpen(false)}
          onMentorRegistered={handleMentorRegistered}
        />
      )}

      {onboardingModalOpen && (
        <OnboardingModal
          allSkills={allSkills}
          onSaveSuccess={handleStudentSaved}
        />
      )}

      {/* Mark Project Complete Modal */}
      {completingProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <h3 className="text-lg font-black text-slate-900">Mark Project Completed</h3>
            <p className="text-xs text-slate-600">
              Record completion of <strong className="text-slate-900">{completingProject.title}</strong> and auto-populate skills to your graduation portfolio.
            </p>

            {completionStatus.error && <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold">{completionStatus.error}</div>}
            {completionStatus.success && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold">{completionStatus.success}</div>}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Repository Link (Optional)</label>
              <input
                type="url"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                placeholder="https://github.com/aaravpatel/project"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button onClick={() => setCompletingProject(null)} className="px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
              <button
                onClick={handleCompleteProjectSubmit}
                disabled={completionStatus.loading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-extrabold shadow-sm flex items-center space-x-1.5"
              >
                <Award className="w-4 h-4" />
                <span>{completionStatus.loading ? 'Recording...' : 'Confirm Completion'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
