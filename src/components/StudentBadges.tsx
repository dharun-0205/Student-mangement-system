import React from 'react';
import { Department } from '../types.ts';

export const DepartmentBadge: React.FC<{ department: Department }> = ({ department }) => {
  const styles: Record<Department, string> = {
    CSE: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10',
    ECE: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/10',
    EEE: 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/10',
    MECH: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
    CIVIL: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
  };

  const style = styles[department] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${style}`}
    >
      {department}
    </span>
  );
};

export const MarksBadge: React.FC<{ marks: number }> = ({ marks }) => {
  let color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let label = 'Distinction';

  if (marks < 40) {
    color = 'bg-rose-50 text-rose-700 border-rose-200';
    label = 'Below Avg';
  } else if (marks < 60) {
    color = 'bg-amber-50 text-amber-800 border-amber-200';
    label = 'Pass';
  } else if (marks < 75) {
    color = 'bg-blue-50 text-blue-700 border-blue-200';
    label = 'Good';
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full ${
            marks >= 75 ? 'bg-emerald-500' : marks >= 50 ? 'bg-blue-500' : 'bg-rose-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, marks))}%` }}
        />
      </div>
      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${color}`}>
        {marks}%
      </span>
    </div>
  );
};
