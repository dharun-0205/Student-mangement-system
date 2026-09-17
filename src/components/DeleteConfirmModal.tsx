import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Student } from '../types.ts';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  student,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !student) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(student.id);
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      id="delete-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div
        id="delete-modal-content"
        className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden transition-all animate-in zoom-in-95 duration-150"
      >
        <div className="p-6">
          <div className="w-12 h-12 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h2 className="text-lg font-bold text-slate-900 leading-tight">
            Delete Student Record?
          </h2>

          <p className="text-sm text-slate-600 mt-2">
            Are you sure you want to delete <strong className="text-slate-900">{student.name}</strong> (
            <span className="font-mono text-indigo-700">{student.rollNumber}</span>)?
          </p>

          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            This action will permanently remove the student document and release their roll number from Firestore.
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              id="delete-cancel-btn"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              id="delete-confirm-btn"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-60 rounded-lg shadow-sm flex items-center gap-2 transition-all"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Delete Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
