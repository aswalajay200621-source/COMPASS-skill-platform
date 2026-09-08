'use client';

import React from 'react';
import { 
  Compass, 
  Home, 
  Award, 
  FolderKanban, 
  GitMerge, 
  Users, 
  Briefcase, 
  FileText, 
  Settings,
  UserCheck,
  PlusCircle,
  Inbox
} from 'lucide-react';

export default function Sidebar({ activePOV, activeTab, setActiveTab, pendingRequestCount = 0 }) {
  const isMentorPOV = activePOV === 'MENTOR';

  const studentNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'my-skills', label: 'My Skills', icon: Award },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'learning-paths', label: 'Learning Paths', icon: GitMerge },
    { id: 'mentorship', label: 'Mentorship', icon: Users },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'portfolio', label: 'Portfolio', icon: FileText },
  ];

  const mentorNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'mentor-requests', label: 'Mentor Requests', icon: Inbox, badge: pendingRequestCount },
    { id: 'mentor-skills', label: 'My Skills', icon: UserCheck },
    { id: 'posted-opportunities', label: 'Posted Opportunities', icon: PlusCircle },
    { id: 'mentor-profile', label: 'Profile', icon: Users },
  ];

  const navItems = isMentorPOV ? mentorNavItems : studentNavItems;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-30">
      
      {/* Top Header & Brand */}
      <div>
        <div className="p-6 flex items-center space-x-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 font-mono">
                COMPASS
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                {isMentorPOV ? 'Faculty' : 'Student'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Apex Institute</p>
          </div>
        </div>

        {/* POV Context Banner */}
        <div className="px-4 py-3">
          <div className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between font-medium ${
            isMentorPOV ? 'bg-purple-50 text-purple-800 border border-purple-100' : 'bg-indigo-50/70 text-indigo-900 border border-indigo-100'
          }`}>
            <span>Viewing as: <strong className="font-semibold">{isMentorPOV ? 'Faculty / Mentor' : 'Student'}</strong></span>
          </div>
        </div>

        {/* Main Navigation Items */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-rose-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Pinned Bottom Settings */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
        >
          <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white' : 'text-slate-400'}`} />
          <span>Settings</span>
        </button>
      </div>

    </aside>
  );
}
