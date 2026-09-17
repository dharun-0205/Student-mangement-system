export type Department = 'ECE' | 'CSE' | 'EEE' | 'MECH' | 'CIVIL';

export type Year = 1 | 2 | 3 | 4;

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  department: Department;
  year: Year;
  email: string;
  phone: string;
  marks: number;
  createdAt?: string;
  updatedAt?: string;
}

export type StudentInput = Omit<Student, 'id' | 'createdAt' | 'updatedAt'>;

export interface ValidationErrors {
  name?: string;
  rollNumber?: string;
  department?: string;
  year?: string;
  email?: string;
  phone?: string;
  marks?: string;
  general?: string;
}

export interface ValidationResult<T> {
  isValid: boolean;
  errors: ValidationErrors;
  data?: T;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationErrors;
}

export interface DatabaseStatus {
  connected: boolean;
  mode: 'firestore' | 'in-memory-fallback';
  projectId?: string;
  collection: string;
  message: string;
}
