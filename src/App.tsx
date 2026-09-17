import { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader2, Plus, Users, Award, BookOpen, AlertCircle } from 'lucide-react';
import { DatabaseStatus, Student, StudentInput } from './types.ts';
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  fetchDatabaseStatus,
} from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { SearchFilterBar } from './components/SearchFilterBar.tsx';
import { StudentTable } from './components/StudentTable.tsx';
import { StudentCardList } from './components/StudentCardList.tsx';
import { StudentFormModal } from './components/StudentFormModal.tsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.tsx';
import { EmptyState } from './components/EmptyState.tsx';
import { ToastContainer, ToastMessage } from './components/Toast.tsx';
import { FirebaseSetupModal } from './components/FirebaseSetupModal.tsx';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');

  // Database status
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  const [isFirebaseGuideOpen, setIsFirebaseGuideOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load students and database status
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [studentsData, statusData] = await Promise.all([
        fetchStudents(searchQuery, selectedDepartment),
        fetchDatabaseStatus(),
      ]);

      setStudents(studentsData);
      setDbStatus(statusData);
    } catch (err: any) {
      console.error('Failed to load students:', err);
      setError(err.message || 'Failed to load students from server.');
      showToast(err.message || 'Failed to connect to backend.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedDepartment, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Add / Edit Submission
  const handleFormSubmit = async (data: StudentInput) => {
    if (editingStudent) {
      // Update
      const updated = await updateStudent(editingStudent.id, data);
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      showToast(`Student "${updated.name}" updated successfully!`, 'success');
    } else {
      // Create
      const created = await createStudent(data);
      setStudents((prev) => [created, ...prev]);
      showToast(`Student "${created.name}" added successfully!`, 'success');
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async (id: string) => {
    const targetStudent = students.find((s) => s.id === id);
    await deleteStudent(id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    showToast(`Student "${targetStudent?.name || 'Record'}" deleted successfully.`, 'info');
  };

  // Filter and stats calculations
  const totalCount = students.length;
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        student.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.trim().toLowerCase());

      const matchesDept =
        selectedDepartment === 'ALL' || student.department === selectedDepartment;

      return matchesSearch && matchesDept;
    });
  }, [students, searchQuery, selectedDepartment]);

  const avgMarks = useMemo(() => {
    if (students.length === 0) return 0;
    const sum = students.reduce((acc, curr) => acc + curr.marks, 0);
    return Math.round(sum / students.length);
  }, [students]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('ALL');
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      {/* Navigation Header */}
      <Navbar
        onOpenAddModal={() => {
          setEditingStudent(null);
          setIsFormModalOpen(true);
        }}
        onOpenFirebaseGuide={() => setIsFirebaseGuideOpen(true)}
        dbStatus={dbStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Top Summary / Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</p>
              <p className="text-xl font-bold text-slate-900 leading-tight">{totalCount} Students</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Class Average</p>
              <p className="text-xl font-bold text-slate-900 leading-tight">{avgMarks}% Overall</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Departments</p>
              <p className="text-xl font-bold text-slate-900 leading-tight">5 Departments</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          totalStudents={totalCount}
          filteredCount={filteredStudents.length}
          onResetFilters={handleResetFilters}
        />

        {/* Error notification if initial fetch failed */}
        {error && (
          <div
            id="initial-fetch-error"
            className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm flex-1">
              <p className="font-bold">Error loading students</p>
              <p className="text-xs mt-0.5 text-rose-700">{error}</p>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content View: Loading vs Table/Cards vs Empty State */}
        {isLoading ? (
          <div
            id="loading-indicator"
            className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center text-slate-500 shadow-xs"
          >
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-sm font-semibold text-slate-700">Loading student directory...</p>
            <p className="text-xs text-slate-400 mt-1">Connecting to Firestore database...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            isFiltered={totalCount > 0 || searchQuery !== '' || selectedDepartment !== 'ALL'}
            onResetFilters={handleResetFilters}
            onOpenAddModal={() => {
              setEditingStudent(null);
              setIsFormModalOpen(true);
            }}
          />
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <StudentTable
                students={filteredStudents}
                onEdit={(student) => {
                  setEditingStudent(student);
                  setIsFormModalOpen(true);
                }}
                onDelete={(student) => {
                  setDeletingStudent(student);
                  setIsDeleteModalOpen(true);
                }}
              />
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden">
              <StudentCardList
                students={filteredStudents}
                onEdit={(student) => {
                  setEditingStudent(student);
                  setIsFormModalOpen(true);
                }}
                onDelete={(student) => {
                  setDeletingStudent(student);
                  setIsDeleteModalOpen(true);
                }}
              />
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Student Modal */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleFormSubmit}
        initialStudent={editingStudent}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        student={deletingStudent}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingStudent(null);
        }}
        onConfirm={handleDeleteConfirm}
      />

      {/* Firebase Setup Guide Modal */}
      <FirebaseSetupModal
        isOpen={isFirebaseGuideOpen}
        onClose={() => setIsFirebaseGuideOpen(false)}
        status={dbStatus}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Student Management System • Full-Stack Architecture</span>
          <span className="text-slate-400">
            Node.js Express + Firebase Firestore Collection: <code className="font-mono text-slate-600">students</code>
          </span>
        </div>
      </footer>
    </div>
  );
}
