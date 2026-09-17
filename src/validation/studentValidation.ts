import { Department, StudentInput, ValidationErrors, ValidationResult, Year } from '../types.ts';

export const VALID_DEPARTMENTS: readonly Department[] = ['ECE', 'CSE', 'EEE', 'MECH', 'CIVIL'] as const;
export const VALID_YEARS: readonly Year[] = [1, 2, 3, 4] as const;

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\d{10}$/;
const ROLL_NUMBER_REGEX = /^[a-zA-Z0-9\-_/]+$/;

export function validateStudent(data: unknown): ValidationResult<StudentInput> {
  const errors: ValidationErrors = {};

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: { general: 'Invalid student payload. Expected an object.' },
    };
  }

  const raw = data as Record<string, unknown>;

  // 1. Name validation
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!name) {
    errors.name = 'Student name is required.';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters long.';
  } else if (name.length > 100) {
    errors.name = 'Name cannot exceed 100 characters.';
  }

  // 2. Roll Number validation
  const rollNumber = typeof raw.rollNumber === 'string' ? raw.rollNumber.trim().toUpperCase() : '';
  if (!rollNumber) {
    errors.rollNumber = 'Roll number is required.';
  } else if (rollNumber.length < 2 || rollNumber.length > 30) {
    errors.rollNumber = 'Roll number must be between 2 and 30 characters.';
  } else if (!ROLL_NUMBER_REGEX.test(rollNumber)) {
    errors.rollNumber = 'Roll number can only contain letters, numbers, hyphens, and slashes.';
  }

  // 3. Department validation
  const department = raw.department as Department;
  if (!department) {
    errors.department = 'Department is required.';
  } else if (!VALID_DEPARTMENTS.includes(department)) {
    errors.department = `Department must be one of: ${VALID_DEPARTMENTS.join(', ')}.`;
  }

  // 4. Year validation
  const rawYear = Number(raw.year);
  let year: Year = 1;
  if (raw.year === undefined || raw.year === null || raw.year === '') {
    errors.year = 'Academic year is required.';
  } else if (!VALID_YEARS.includes(rawYear as Year)) {
    errors.year = 'Year must be 1, 2, 3, or 4.';
  } else {
    year = rawYear as Year;
  }

  // 5. Email validation
  const email = typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : '';
  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please provide a valid email address.';
  } else if (email.length > 120) {
    errors.email = 'Email address is too long.';
  }

  // 6. Phone validation (exactly 10 digits)
  const phone = typeof raw.phone === 'string' ? raw.phone.trim().replace(/\D/g, '') : '';
  if (!phone) {
    errors.phone = 'Phone number is required.';
  } else if (!PHONE_REGEX.test(phone)) {
    errors.phone = 'Phone number must be exactly 10 digits.';
  }

  // 7. Marks validation (0 - 100)
  const rawMarks = raw.marks;
  let marks = 0;
  if (rawMarks === undefined || rawMarks === null || rawMarks === '') {
    errors.marks = 'Marks are required.';
  } else {
    const parsedMarks = Number(rawMarks);
    if (isNaN(parsedMarks)) {
      errors.marks = 'Marks must be a valid number.';
    } else if (parsedMarks < 0 || parsedMarks > 100) {
      errors.marks = 'Marks must be between 0 and 100.';
    } else {
      marks = Math.round(parsedMarks * 100) / 100; // round to 2 decimals max
    }
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    data: isValid
      ? {
          name,
          rollNumber,
          department,
          year,
          email,
          phone,
          marks,
        }
      : undefined,
  };
}
