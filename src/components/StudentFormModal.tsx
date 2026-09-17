import React, { useState, useEffect } from 'react';
import { X, Loader2, User, Hash, BookOpen, Calendar, Mail, Phone, Award } from 'lucide-react';
import { Department, Student, StudentInput, ValidationErrors, Year } from '../types.ts';
import { validateStudent, VALID_DEPARTMENTS, VALID_YEARS } from '../validation/studentValidation.ts';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudentInput) => Promise<void>;
  initialStudent?: Student | null;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialStudent,
}) => {
  const isEditing = Boolean(initialStudent);

  const [formData, setFormData] = useState<StudentInput>({
    name: '',
    rollNumber: '',
    department: 'CSE',
    year: 1,
    email: '',
    phone: '',
    marks: 85,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Sync form state when modal opens or initial student changes
  useEffect(() => {
    if (initialStudent) {
      setFormData({
        name: initialStudent.name,
        rollNumber: initialStudent.rollNumber,
        department: initialStudent.department,
        year: initialStudent.year,
        email: initialStudent.email,
        phone: initialStudent.phone,
        marks: initialStudent.marks,
      });
    } else {
      setFormData({
        name: '',
        rollNumber: '',
        department: 'CSE',
        year: 1,
        email: '',
        phone: '',
        marks: 85,
      });
    }
    setErrors({});
    setServerError(null);
  }, [initialStudent, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof StudentInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear specific field error as user types
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // 1. Frontend validation
    const validation = validateStudent(formData);
    if (!validation.isValid || !validation.data) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(validation.data);
      onClose();
    } catch (err: any) {
      console.error('Submission failed:', err);
      if (err.errors) {
        setErrors(err.errors);
      }
      setServerError(err.message || 'An error occurred while saving the student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="student-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        id="student-modal-content"
        className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden transition-all my-8 animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Student Details' : 'Add New Student'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? 'Update academic profile and contact information.'
                : 'Enter student information to enroll them into Firestore.'}
            </p>
          </div>
          <button
            id="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {serverError && (
            <div
              id="server-error-banner"
              className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium"
            >
              {serverError}
            </div>
          )}

          {/* Row 1: Name & Roll Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Name */}
            <div>
              <label
                htmlFor="input-student-name"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Student Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="input-student-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 text-rose-900'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-600 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Roll Number (Unique) */}
            <div>
              <label
                htmlFor="input-student-roll"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Roll Number <span className="text-rose-500">*</span> (Unique)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  id="input-student-roll"
                  type="text"
                  required
                  value={formData.rollNumber}
                  onChange={(e) => handleChange('rollNumber', e.target.value.toUpperCase())}
                  placeholder="e.g. CSE2024-001"
                  className={`w-full pl-9 pr-3 py-2 text-sm font-mono uppercase rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.rollNumber
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 text-rose-900'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900'
                  }`}
                />
              </div>
              {errors.rollNumber && (
                <p className="text-xs text-rose-600 mt-1">{errors.rollNumber}</p>
              )}
            </div>
          </div>

          {/* Row 2: Department & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <label
                htmlFor="input-student-department"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Department <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <select
                  id="input-student-department"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value as Department)}
                  className={`w-full pl-9 pr-8 py-2 text-sm rounded-lg border bg-white appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                    errors.department
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900'
                  }`}
                >
                  {VALID_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.department && (
                <p className="text-xs text-rose-600 mt-1">{errors.department}</p>
              )}
            </div>

            {/* Academic Year */}
            <div>
              <label
                htmlFor="input-student-year"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Academic Year <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <select
                  id="input-student-year"
                  value={formData.year}
                  onChange={(e) => handleChange('year', Number(e.target.value) as Year)}
                  className={`w-full pl-9 pr-8 py-2 text-sm rounded-lg border bg-white appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                    errors.year
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900'
                  }`}
                >
                  {VALID_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      Year {yr} ({yr === 1 ? '1st' : yr === 2 ? '2nd' : yr === 3 ? '3rd' : '4th'} Year)
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.year && (
                <p className="text-xs text-rose-600 mt-1">{errors.year}</p>
              )}
            </div>
          </div>

          {/* Row 3: Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email Address */}
            <div>
              <label
                htmlFor="input-student-email"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-student-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="student@college.edu"
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 text-rose-900'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone (10 digits) */}
            <div>
              <label
                htmlFor="input-student-phone"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Phone (10 digits) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="input-student-phone"
                  type="tel"
                  maxLength={10}
                  required
                  value={formData.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    handleChange('phone', digits);
                  }}
                  placeholder="9876543210"
                  className={`w-full pl-9 pr-3 py-2 text-sm font-mono rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.phone
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 text-rose-900'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Row 4: Marks (0 - 100) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="input-student-marks"
                className="block text-xs font-semibold text-slate-700"
              >
                Marks (0 - 100) <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-bold text-indigo-600">{formData.marks}%</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Award className="w-4 h-4" />
              </div>
              <input
                id="input-student-marks"
                type="number"
                min={0}
                max={100}
                required
                value={formData.marks}
                onChange={(e) => handleChange('marks', Number(e.target.value))}
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.marks
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 text-rose-900'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900'
                }`}
              />
            </div>
            {errors.marks && (
              <p className="text-xs text-rose-600 mt-1">{errors.marks}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              id="modal-cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="modal-submit-btn"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 rounded-lg shadow-sm flex items-center gap-2 transition-all"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'Save Changes' : 'Add Student'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
