import React from 'react';
import { Edit2, Trash2, Mail, Phone, Calendar } from 'lucide-react';
import { Student } from '../types.ts';
import { DepartmentBadge, MarksBadge } from './StudentBadges.tsx';

interface StudentCardListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export const StudentCardList: React.FC<StudentCardListProps> = ({
  students,
  onEdit,
  onDelete,
}) => {
  return (
    <div id="student-cards-container" className="flex flex-col gap-3">
      {students.map((student) => {
        const initial = student.name.charAt(0).toUpperCase();

        return (
          <div
            key={student.id}
            id={`student-card-${student.id}`}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-3"
          >
            {/* Header: Avatar, Name, Roll & Dept */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center shrink-0">
                  {initial}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    {student.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {student.rollNumber}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Year {student.year}
                    </span>
                  </div>
                </div>
              </div>
              <DepartmentBadge department={student.department} />
            </div>

            {/* Contact details */}
            <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600">
              <a
                href={`mailto:${student.email}`}
                className="flex items-center gap-2 hover:text-indigo-600 truncate"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{student.email}</span>
              </a>
              <a
                href={`tel:${student.phone}`}
                className="flex items-center gap-2 hover:text-indigo-600"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{student.phone}</span>
              </a>
            </div>

            {/* Marks & Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Academic Score</span>
                <MarksBadge marks={student.marks} />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  id={`card-edit-btn-${student.id}`}
                  onClick={() => onEdit(student)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 rounded-lg border border-slate-200 transition-colors"
                  aria-label={`Edit ${student.name}`}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  id={`card-delete-btn-${student.id}`}
                  onClick={() => onDelete(student)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded-lg border border-slate-200 transition-colors"
                  aria-label={`Delete ${student.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
