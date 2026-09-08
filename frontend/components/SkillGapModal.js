'use client';

import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function SkillGapModal({ projectId, studentId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId || !studentId) return;

    const fetchSkillGapAndChain = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/skill-gap?studentId=${studentId}&projectId=${projectId}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to analyze skill gaps');
        }
      } catch (err) {
        setError('Cannot connect to COMPASS backend server.');
      } finally {
        setLoading(false);
      }
    };

    fetchSkillGapAndChain();
  }, [projectId, studentId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="railway-panel max-w-2xl w-full p-6 sm:p-7 rounded-xl space-y-6 my-8 shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Prerequisite Course Roadmap
            </h2>
            {data && (
              <p className="text-slate-400 text-xs mt-0.5">
                Staged learning path for <span className="text-slate-200 font-medium">{data.projectTitle}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading && (
          <div className="py-12 text-center text-slate-500 text-sm">
            Retrieving prerequisite chain...
          </div>
        )}

        {error && (
          <div className="p-4 rounded bg-rose-500/10 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <div className="space-y-6">

            {/* Gap Summary */}
            <div className="p-4 rounded-lg railway-subcard flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400 font-medium block mb-1">
                  Missing Skill Gaps ({data.gapSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.gapSkills.map((gap, i) => (
                    <span key={i} className="text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded font-mono">
                      {gap}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Required Step Count</span>
                <span className="text-sm font-semibold text-slate-200">{data.prerequisiteChain.length} Courses</span>
              </div>
            </div>

            {/* Deterministic Staged Prerequisite Path List */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Staged Prerequisite Chain (One Step at a Time)
              </h3>

              {data.prerequisiteChain.length === 0 ? (
                <div className="p-4 rounded bg-emerald-500/10 text-emerald-300 text-xs">
                  All prerequisite skills satisfied.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.prerequisiteChain.map((step) => (
                    <div key={step.stepNumber} className="p-4 rounded-lg railway-subcard space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center space-x-2">
                            <span className="text-indigo-400 font-mono">Step {step.stepNumber}.</span>
                            <span>Learn {step.skillName}</span>
                            {step.studentHasPrerequisite && (
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                                Prerequisite Satisfied
                              </span>
                            )}
                          </div>
                          {step.prerequisiteSkillName && (
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Prerequisite: {step.prerequisiteSkillName}
                            </p>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400 font-mono">
                          {step.course.provider} ({step.course.duration})
                        </span>
                      </div>

                      {/* Course Link */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">{step.course.title}</span>
                        <a
                          href={step.course.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
                        >
                          <span>Course Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 font-mono text-center">
              Deterministic SQL prerequisite lookup (`skills.prerequisite_skill_id`). Zero AI calls.
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
