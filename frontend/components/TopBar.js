'use client';

import React, { useState } from 'react';
import { Search, Bell, User, ChevronDown, RefreshCw, UserCheck, ShieldCheck, LogOut, Sun, Moon } from 'lucide-react';

export default function TopBar({
  currentStudent,
  currentFaculty,
  activePOV,
  setActivePOV,
  onOpenMentorRegister,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  theme = 'light',
  onToggleTheme
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isMentorRegistered = !!currentFaculty?.id || !!currentStudent?.is_mentor;

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-6 flex items-center justify-between shadow-xs">
      
      {/* Global Search Bar */}
      <div className="flex-1 max-w-md relative">
        <form onSubmit={(e) => { e.preventDefault(); onSearchSubmit && onSearchSubmit(searchQuery); }}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, mentors, courses..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            />
          </div>
        </form>
      </div>

      {/* Right Controls: Notifications, POV Switcher, User Profile */}
      <div className="flex items-center space-x-4">
        
        {/* POV Switcher Button */}
        {isMentorRegistered ? (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActivePOV('STUDENT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activePOV === 'STUDENT'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Student POV</span>
            </button>
            
            <button
              onClick={() => setActivePOV('MENTOR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activePOV === 'MENTOR'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Mentor POV</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenMentorRegister}
            className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Register as Faculty / Mentor</span>
          </button>
        )}

        {/* Notification Bell */}
        <button className="relative w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-indigo-600 absolute top-2 right-2 ring-2 ring-white" />
        </button>

        {/* Theme Switcher Toggle */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-2xs"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20 animate-spin-slow" />
              <span className="hidden md:inline text-amber-300">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600 fill-indigo-600/20" />
              <span className="hidden md:inline text-indigo-700">Dark</span>
            </>
          )}
        </button>

        {/* User Avatar + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-xs">
              {activePOV === 'MENTOR' ? (currentFaculty?.name ? currentFaculty.name[0] : 'F') : (currentStudent?.name ? currentStudent.name[0] : 'S')}
            </div>
            
            <div className="text-left hidden sm:block pr-1">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {activePOV === 'MENTOR' ? (currentFaculty?.name || 'Dr. Aris Thorne') : (currentStudent?.name || 'Aarav Patel')}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {activePOV === 'MENTOR' ? (currentFaculty?.department || 'Faculty') : (currentStudent?.level || 'TY - 3rd Year')}
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Signed in as</p>
                <p className="text-xs text-slate-500 truncate">
                  {activePOV === 'MENTOR' ? (currentFaculty?.email || 'aris.thorne@apex.edu') : (currentStudent?.email || 'aarav.patel@student.apex.edu')}
                </p>
              </div>

              {!isMentorRegistered && (
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenMentorRegister();
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 flex items-center space-x-2"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Register as Mentor</span>
                </button>
              )}

              {isMentorRegistered && (
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setActivePOV(activePOV === 'STUDENT' ? 'MENTOR' : 'STUDENT');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 flex items-center space-x-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Switch to {activePOV === 'STUDENT' ? 'Mentor POV' : 'Student POV'}</span>
                </button>
              )}

              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
