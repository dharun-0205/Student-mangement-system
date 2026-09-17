import React from 'react';
import { GraduationCap, Plus, Database, Flame } from 'lucide-react';
import { DatabaseStatus } from '../types.ts';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenFirebaseGuide: () => void;
  dbStatus: DatabaseStatus | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onOpenFirebaseGuide,
  dbStatus,
}) => {
  const isFirestore = dbStatus?.mode === 'firestore';

  return (
    <header id="main-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                Student Management System
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Node.js • Express • Firebase Firestore • React
              </p>
            </div>
          </div>

          {/* Actions & Status */}
          <div className="flex items-center gap-2.5">
            {/* Database status button */}
            <button
              id="firebase-status-badge"
              onClick={onOpenFirebaseGuide}
              title="Click to view Firebase setup guide and configuration details"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                isFirestore
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              {isFirestore ? (
                <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              ) : (
                <Database className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              )}
              <span className="hidden sm:inline">
                {isFirestore ? 'Firestore Active' : 'Dev Database Active'}
              </span>
              <span className="sm:hidden">{isFirestore ? 'Firestore' : 'Dev DB'}</span>
            </button>

            {/* Firebase Guide button */}
            <button
              id="firebase-guide-btn"
              onClick={onOpenFirebaseGuide}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              Firebase Setup
            </button>

            {/* Add Student CTA */}
            <button
              id="add-student-btn"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
