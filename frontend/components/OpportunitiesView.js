'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, CheckCircle2, AlertCircle, Users, ArrowRight } from 'lucide-react';

const API_BASE = '/api';

export default function OpportunitiesView({
  currentStudent,
  onSelectOpportunity
}) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentStudent?.id) return;
    const fetchOpportunities = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/opportunities/matched/${currentStudent.id}`);
        const data = await res.json();
        if (data.success) {
          setOpportunities(data.opportunities);
        }
      } catch (err) {
        console.error('Failed to load opportunities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunities();
  }, [currentStudent]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faculty Opportunities Feed</h1>
        <p className="text-xs text-slate-500 mt-1">
          Research Assistantships, Summer Internships, and Mini-Projects posted by Apex Institute faculty mentors.
        </p>
      </div>

      {loading ? (
        <div className="compass-card p-12 text-center text-xs text-slate-400">Loading opportunities...</div>
      ) : opportunities.length === 0 ? (
        <div className="compass-card p-12 text-center text-xs text-slate-500">
          No active faculty opportunities posted right now. Check back soon!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunities.map((opp) => (
            <div key={opp.id} className="compass-card p-6 space-y-5 flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-purple-100 text-purple-900 border border-purple-200">
                    {opp.type.replace('_', ' ')}
                  </span>

                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {opp.matchPercentage}% Skill Match
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{opp.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{opp.description}</p>
                </div>

                {/* Faculty Post Info */}
                <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <Users className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Posted by: <strong className="text-slate-900 font-bold">{opp.faculty_name || 'Dr. Aris Thorne'}</strong> ({opp.faculty_dept || 'Computer Science'})</span>
                </div>

                {/* Skill Overlap Breakdown */}
                <div className="compass-subcard p-3.5 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Required Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {opp.required_skills?.map((skill, idx) => {
                      const isMatched = opp.matchedSkills?.includes(skill);
                      return (
                        <span
                          key={idx}
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center space-x-1 border ${
                            isMatched
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {isMatched ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-amber-600" />}
                          <span>{skill}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Footer Deadline & Apply CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-bold">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Apply by: <strong className="text-slate-900">{opp.apply_by_date || 'Oct 15, 2026'}</strong></span>
                </div>

                <button
                  onClick={() => onSelectOpportunity(opp)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <span>Apply / Request</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
