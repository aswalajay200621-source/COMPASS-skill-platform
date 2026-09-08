'use client';

import React, { useEffect, useState } from 'react';
import { Compass, GraduationCap, Code2, Users, Briefcase } from 'lucide-react';

export default function LoadingScreen({ onFinish }) {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onFinish && onFinish(), 400);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 10;
      });
    }, 250);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-6 text-white selection:bg-indigo-500">
      
      {/* Brand & Wordmark */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <Compass className="w-7 h-7 text-white animate-spin-slow" />
        </div>
        <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
          COMPASS
        </span>
      </div>

      <p className="text-slate-400 text-sm font-medium tracking-wide mb-12">
        Your skills. A clear path.
      </p>

      {/* Illustrated Dotted Path Stepper */}
      <div className="relative w-full max-w-lg mb-12 px-4">
        
        {/* SVG Animated Dotted Connector Line */}
        <svg className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-8 z-0 overflow-visible" preserveAspectRatio="none">
          <line
            x1="10%"
            y1="50%"
            x2="90%"
            y2="50%"
            stroke="#475569"
            strokeWidth="3"
            strokeDasharray="6 6"
          />
          <line
            x1="10%"
            y1="50%"
            x2={`${Math.max(10, Math.min(90, progress * 0.8 + 10))}%`}
            y2="50%"
            stroke="#818CF8"
            strokeWidth="3"
            className="animate-dash transition-all duration-300"
          />
        </svg>

        {/* Path Node Icons */}
        <div className="relative z-10 flex items-center justify-between">
          
          {/* Step 1: College / Student */}
          <div className="flex flex-col items-center space-y-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
              progress >= 25 ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">College</span>
          </div>

          {/* Step 2: Projects & Skills */}
          <div className="flex flex-col items-center space-y-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
              progress >= 50 ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              <Code2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Projects</span>
          </div>

          {/* Step 3: Faculty Mentorship */}
          <div className="flex flex-col items-center space-y-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
              progress >= 75 ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Mentors</span>
          </div>

          {/* Step 4: Career & Portfolio */}
          <div className="flex flex-col items-center space-y-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
              progress >= 100 ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Portfolio</span>
          </div>

        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full max-w-xs space-y-2">
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/50">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span className="font-medium">Loading your journey...</span>
          <span className="font-mono text-indigo-300 font-bold">{progress}%</span>
        </div>
      </div>

    </div>
  );
}
