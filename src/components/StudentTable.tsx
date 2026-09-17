import React from 'react';
import { Edit2, Trash2, Mail, Phone, Calendar } from 'lucide-react';
import { Student } from '../types.ts';
import { DepartmentBadge, MarksBadge } from './StudentBadges.tsx';

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-hidden bg-white border border-slate-200 rounded-xl shadow-xs">
      <div className="overflow-x-auto">
        <table id="students-table" className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th scope="col" className="py-3.5 px-4 font-semibold">Roll Number</th>
              <th scope="col" className="py-3.5 px-4 font-semibold">Student Name</th>
              <th scope="col" className="py-3.5 px-4 font-semibold">Department</th>
              <th scope="col" className="py-3.5 px-4 font-semibold">Year</th>
              <th scope="col" className="py-3.5 px-4 font-semibold">Contact Info</th>
              <th scope="col" className="py-3.5 px-4 font-semibold">Marks</th>
              <th scope="col" className="py-3.5 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {students.map((student) => {
              const initial = student.name.charAt(0).toUpperCase();

              return (
                <tr
                  key={student.id}
                  id={`student-row-${student.id}`}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* Roll Number */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50/60 px-2.5 py-1 rounded border border-indigo-100">
                      {student.rollNumber}
                    </span>
                  </td>

                  {/* Name & Avatar */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {initial}
                      </div>
                      <span className="font-semibold text-slate-900">{student.name}</span>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <DepartmentBadge department={student.department} />
                  </td>

                  {/* Year */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Year {student.year}
                    </span>
                  </td>

                  {/* Contact Info */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5 text-xs text-slate-600">
                      <a
                        href={`mailto:${student.email}`}
                        className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                        title={student.email}
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[170px]">{student.email}</span>
                      </a>
                      <a
                        href={`tel:${student.phone}`}
                        className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{student.phone}</span>
                      </a>
                    </div>
                  </td>

                  {/* Marks */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <MarksBadge marks={student.marks} />
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        id={`edit-student-btn-${student.id}`}
                        onClick={() => onEdit(student)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Student Details"
                        aria-label={`Edit ${student.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        id={`delete-student-btn-${student.id}`}
                        onClick={() => onDelete(student)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Student"
                        aria-label={`Delete ${student.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
