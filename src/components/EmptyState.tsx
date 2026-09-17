import React from 'react';
import { Users, SearchX, Plus, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  isFiltered: boolean;
  onResetFilters: () => void;
  onOpenAddModal: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isFiltered,
  onResetFilters,
  onOpenAddModal,
}) => {
  return (
    <div
      id="no-students-found-state"
      className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs my-6"
    >
      <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
        {isFiltered ? <SearchX className="w-7 h-7 text-slate-500" /> : <Users className="w-7 h-7 text-slate-500" />}
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1">
        {isFiltered ? 'No students found' : 'No students registered yet'}
      </h3>

      <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
        {isFiltered
          ? 'No student records match your current search query or department filter. Try adjusting or clearing your filters.'
          : 'Get started by adding your first student to the system. Their record will be securely stored in Firestore.'}
      </p>

      <div className="flex items-center justify-center gap-3">
        {isFiltered ? (
          <button
            id="empty-reset-filters-btn"
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Clear All Filters
          </button>
        ) : null}

        <button
          id="empty-add-student-btn"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>
    </div>
  );
};
