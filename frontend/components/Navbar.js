'use client';

import React from 'react';
import { Compass } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentStudent }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0E14]/90 backdrop-blur-md border-b border-white/5 no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Brand & College Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Compass className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm tracking-tight text-white">
              COMPASS
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-xs text-slate-400 font-normal">Apex Institute</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1">
          {[
            { id: 'match-feed', label: 'Opportunities' },
            { id: 'student-profile', label: 'Student Profile' },
            { id: 'faculty-portal', label: 'Faculty Portal' },
            { id: 'portfolio', label: 'Portfolio' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* User Context Badge */}
        <div className="flex items-center space-x-2 text-xs">
          {currentStudent ? (
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-slate-200">{currentStudent.name}</span>
              <span className="text-slate-500">({currentStudent.level})</span>
            </div>
          ) : (
            <span className="text-slate-500">Guest</span>
          )}
        </div>

      </div>
    </header>
  );
}
