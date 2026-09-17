import { ApiResponse, DatabaseStatus, Student, StudentInput } from '../types.ts';

const BASE_URL = '/api';

export async function fetchStudents(search?: string, department?: string): Promise<Student[]> {
  const params = new URLSearchParams();
  if (search && search.trim()) {
    params.set('search', search.trim());
  }
  if (department && department !== 'ALL') {
    params.set('department', department);
  }

  const url = `${BASE_URL}/students${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  const json: ApiResponse<Student[]> = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Failed to fetch students list');
  }

  return json.data || [];
}

export async function fetchStudent(id: string): Promise<Student> {
  const response = await fetch(`${BASE_URL}/students/${id}`);
  const json: ApiResponse<Student> = await response.json();

  if (!response.ok) {
    throw new Error(json.message || `Failed to fetch student with ID: ${id}`);
  }

  return json.data!;
}

export async function createStudent(data: StudentInput): Promise<Student> {
  const response = await fetch(`${BASE_URL}/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const json: ApiResponse<Student> = await response.json();

  if (!response.ok) {
    const error: any = new Error(json.message || 'Failed to create student');
    error.status = response.status;
    error.errors = json.errors;
    throw error;
  }

  return json.data!;
}

export async function updateStudent(id: string, data: StudentInput): Promise<Student> {
  const response = await fetch(`${BASE_URL}/students/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const json: ApiResponse<Student> = await response.json();

  if (!response.ok) {
    const error: any = new Error(json.message || 'Failed to update student');
    error.status = response.status;
    error.errors = json.errors;
    throw error;
  }

  return json.data!;
}

export async function deleteStudent(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/students/${id}`, {
    method: 'DELETE',
  });

  const json: ApiResponse<null> = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Failed to delete student');
  }
}

export async function fetchDatabaseStatus(): Promise<DatabaseStatus> {
  try {
    const response = await fetch(`${BASE_URL}/status`);
    const json: ApiResponse<DatabaseStatus> = await response.json();
    if (response.ok && json.data) {
      return json.data;
    }
  } catch (err) {
    console.error('Status fetch failed:', err);
  }

  return {
    connected: false,
    mode: 'in-memory-fallback',
    collection: 'students',
    message: 'Could not connect to backend server.',
  };
}
