import { initializeApp, getApps, cert, applicationDefault, App } from 'firebase-admin/app';
import { getFirestore, Firestore, Query } from 'firebase-admin/firestore';
import type { Student, StudentInput, DatabaseStatus } from '../types.ts';

let firestoreInstance: Firestore | null = null;
let isLiveFirestore = false;
let initError: string | null = null;
let activeProjectId: string = '';

// In-memory transactional fallback store if environment variables are not yet provided
interface MemoryStudent extends Student {
  createdAt: string;
  updatedAt: string;
}

const memoryStore: Map<string, MemoryStudent> = new Map([
  {
    id: 'std_demo_101',
    name: 'Aarav Sharma',
    rollNumber: 'CSE2024-001',
    department: 'CSE' as const,
    year: 3 as const,
    email: 'aarav.sharma@example.edu',
    phone: '9876543210',
    marks: 92,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'std_demo_102',
    name: 'Diya Patel',
    rollNumber: 'ECE2024-042',
    department: 'ECE' as const,
    year: 4 as const,
    email: 'diya.patel@example.edu',
    phone: '9845123670',
    marks: 88,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'std_demo_103',
    name: 'Rohan Verma',
    rollNumber: 'MECH2024-019',
    department: 'MECH' as const,
    year: 2 as const,
    email: 'rohan.verma@example.edu',
    phone: '9123456780',
    marks: 75,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'std_demo_104',
    name: 'Sneha Reddy',
    rollNumber: 'CIVIL2024-007',
    department: 'CIVIL' as const,
    year: 1 as const,
    email: 'sneha.reddy@example.edu',
    phone: '9765432109',
    marks: 84,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'std_demo_105',
    name: 'Kavita Nair',
    rollNumber: 'EEE2024-015',
    department: 'EEE' as const,
    year: 3 as const,
    email: 'kavita.nair@example.edu',
    phone: '9988776655',
    marks: 95,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
].reduce((map, item) => map.set(item.id, item), new Map<string, MemoryStudent>()));

const memoryLocks: Map<string, string> = new Map([
  ['CSE2024-001', 'std_demo_101'],
  ['ECE2024-042', 'std_demo_102'],
  ['MECH2024-019', 'std_demo_103'],
  ['CIVIL2024-007', 'std_demo_104'],
  ['EEE2024-015', 'std_demo_105'],
]);

export function initializeFirebase(): void {
  if (firestoreInstance || isLiveFirestore) {
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firestoreInstance = getFirestore(existingApps[0]);
      isLiveFirestore = true;
      activeProjectId = projectId || 'firebase-project';
      console.log('Using existing Firebase Admin instance.');
      return;
    }

    if (serviceAccountJson) {
      const parsed = JSON.parse(serviceAccountJson);
      const app = initializeApp({
        credential: cert(parsed),
        projectId: parsed.project_id || projectId,
      });
      firestoreInstance = getFirestore(app);
      isLiveFirestore = true;
      activeProjectId = parsed.project_id || projectId || 'firebase-project';
      console.log(`Connected to Firebase Firestore with Service Account JSON [Project: ${activeProjectId}]`);
      return;
    }

    if (projectId && clientEmail && privateKey) {
      // Format private key correctly if escaped with \n
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      const app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
      firestoreInstance = getFirestore(app);
      isLiveFirestore = true;
      activeProjectId = projectId;
      console.log(`Connected to Firebase Firestore [Project: ${projectId}]`);
      return;
    }

    // If explicit service account is not provided, check if default credentials work (e.g. inside GCP environment)
    if (projectId && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const app = initializeApp({
        credential: applicationDefault(),
        projectId,
      });
      firestoreInstance = getFirestore(app);
      isLiveFirestore = true;
      activeProjectId = projectId;
      console.log(`Connected to Firebase Firestore via Application Default Credentials [Project: ${projectId}]`);
      return;
    }

    // No credentials provided yet
    initError = 'Firebase credentials not configured in environment variables.';
    console.log('Firebase environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) not found.');
    console.log('Running in-memory database with Firestore transaction simulation. Configure .env with Firebase credentials to persist to live Cloud Firestore.');
  } catch (error) {
    initError = error instanceof Error ? error.message : String(error);
    console.warn('Firebase initialization notice:', initError);
    console.log('Falling back to in-memory database with Firestore transaction semantics.');
  }
}

export function getDatabaseStatus(): DatabaseStatus {
  if (isLiveFirestore && firestoreInstance) {
    return {
      connected: true,
      mode: 'firestore',
      projectId: activeProjectId,
      collection: 'students',
      message: `Active Firestore connection to project "${activeProjectId}".`,
    };
  }

  return {
    connected: false,
    mode: 'in-memory-fallback',
    collection: 'students',
    message: initError || 'Ready for Firebase connection. Add your credentials in .env or Settings.',
  };
}

/**
 * Data Operations using Firestore (or Transactional Fallback)
 */
export async function getAllStudents(search?: string, department?: string): Promise<Student[]> {
  initializeFirebase();

  let students: Student[] = [];

  if (isLiveFirestore && firestoreInstance) {
    let query: Query = firestoreInstance.collection('students');

    if (department && department !== 'ALL') {
      query = query.where('department', '==', department);
    }

    const snapshot = await query.get();
    students = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        rollNumber: data.rollNumber,
        department: data.department,
        year: data.year,
        email: data.email,
        phone: data.phone,
        marks: data.marks,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as Student;
    });
  } else {
    students = Array.from(memoryStore.values()).map((s) => ({ ...s }));
    if (department && department !== 'ALL') {
      students = students.filter((s) => s.department === department);
    }
  }

  // Search filter (by name or roll number, case-insensitive)
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    students = students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q)
    );
  }

  // Sort by rollNumber or newest
  students.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));

  return students;
}

export async function getStudentById(id: string): Promise<Student | null> {
  initializeFirebase();

  if (isLiveFirestore && firestoreInstance) {
    const docRef = firestoreInstance.collection('students').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return null;
    }
    const data = docSnap.data()!;
    return {
      id: docSnap.id,
      name: data.name,
      rollNumber: data.rollNumber,
      department: data.department,
      year: data.year,
      email: data.email,
      phone: data.phone,
      marks: data.marks,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  const student = memoryStore.get(id);
  return student ? { ...student } : null;
}

/**
 * Add a student with Firestore transaction / unique lock for rollNumber
 */
export async function createStudent(input: StudentInput): Promise<Student> {
  initializeFirebase();

  const normalizedRoll = input.rollNumber.trim().toUpperCase();
  const now = new Date().toISOString();

  if (isLiveFirestore && firestoreInstance) {
    const db = firestoreInstance;
    const studentRef = db.collection('students').doc(); // auto-generated id
    const lockRef = db.collection('roll_numbers').doc(normalizedRoll);

    await db.runTransaction(async (transaction) => {
      const lockDoc = await transaction.get(lockRef);
      if (lockDoc.exists) {
        const error = new Error(`Roll number "${normalizedRoll}" is already registered by another student.`);
        (error as any).code = 'DUPLICATE_ROLL_NUMBER';
        throw error;
      }

      const newStudentData = {
        ...input,
        rollNumber: normalizedRoll,
        createdAt: now,
        updatedAt: now,
      };

      transaction.set(studentRef, newStudentData);
      transaction.set(lockRef, {
        studentId: studentRef.id,
        rollNumber: normalizedRoll,
        createdAt: now,
      });
    });

    return {
      id: studentRef.id,
      ...input,
      rollNumber: normalizedRoll,
      createdAt: now,
      updatedAt: now,
    };
  }

  // In-memory atomic transaction simulation
  if (memoryLocks.has(normalizedRoll)) {
    const error = new Error(`Roll number "${normalizedRoll}" is already registered by another student.`);
    (error as any).code = 'DUPLICATE_ROLL_NUMBER';
    throw error;
  }

  const autoId = 'std_' + Math.random().toString(36).substring(2, 10);
  const newStudent: MemoryStudent = {
    id: autoId,
    ...input,
    rollNumber: normalizedRoll,
    createdAt: now,
    updatedAt: now,
  };

  memoryStore.set(autoId, newStudent);
  memoryLocks.set(normalizedRoll, autoId);

  return { ...newStudent };
}

/**
 * Update a student with Firestore transaction / unique lock
 */
export async function updateStudent(id: string, input: StudentInput): Promise<Student> {
  initializeFirebase();

  const newRollNumber = input.rollNumber.trim().toUpperCase();
  const now = new Date().toISOString();

  if (isLiveFirestore && firestoreInstance) {
    const db = firestoreInstance;
    const studentRef = db.collection('students').doc(id);

    await db.runTransaction(async (transaction) => {
      const studentDoc = await transaction.get(studentRef);
      if (!studentDoc.exists) {
        const notFound = new Error(`Student with ID "${id}" was not found.`);
        (notFound as any).code = 'NOT_FOUND';
        throw notFound;
      }

      const existingData = studentDoc.data()!;
      const oldRollNumber = (existingData.rollNumber || '').toUpperCase();

      // If roll number is being changed, verify new lock
      if (oldRollNumber !== newRollNumber) {
        const newLockRef = db.collection('roll_numbers').doc(newRollNumber);
        const newLockDoc = await transaction.get(newLockRef);
        if (newLockDoc.exists && newLockDoc.data()?.studentId !== id) {
          const error = new Error(`Roll number "${newRollNumber}" is already registered by another student.`);
          (error as any).code = 'DUPLICATE_ROLL_NUMBER';
          throw error;
        }

        // Delete old lock and set new lock
        const oldLockRef = db.collection('roll_numbers').doc(oldRollNumber);
        transaction.delete(oldLockRef);
        transaction.set(newLockRef, {
          studentId: id,
          rollNumber: newRollNumber,
          updatedAt: now,
        });
      }

      const updatedFields = {
        ...input,
        rollNumber: newRollNumber,
        updatedAt: now,
      };

      transaction.update(studentRef, updatedFields);
    });

    return {
      id,
      ...input,
      rollNumber: newRollNumber,
      updatedAt: now,
    };
  }

  // In-memory atomic transaction simulation
  const existing = memoryStore.get(id);
  if (!existing) {
    const notFound = new Error(`Student with ID "${id}" was not found.`);
    (notFound as any).code = 'NOT_FOUND';
    throw notFound;
  }

  const oldRoll = existing.rollNumber.toUpperCase();
  if (oldRoll !== newRollNumber) {
    const lockOwner = memoryLocks.get(newRollNumber);
    if (lockOwner && lockOwner !== id) {
      const error = new Error(`Roll number "${newRollNumber}" is already registered by another student.`);
      (error as any).code = 'DUPLICATE_ROLL_NUMBER';
      throw error;
    }
    memoryLocks.delete(oldRoll);
    memoryLocks.set(newRollNumber, id);
  }

  const updated: MemoryStudent = {
    ...existing,
    ...input,
    rollNumber: newRollNumber,
    updatedAt: now,
  };

  memoryStore.set(id, updated);
  return { ...updated };
}

/**
 * Delete a student and release unique roll lock
 */
export async function deleteStudent(id: string): Promise<boolean> {
  initializeFirebase();

  if (isLiveFirestore && firestoreInstance) {
    const db = firestoreInstance;
    const studentRef = db.collection('students').doc(id);

    return await db.runTransaction(async (transaction) => {
      const studentDoc = await transaction.get(studentRef);
      if (!studentDoc.exists) {
        return false;
      }

      const data = studentDoc.data()!;
      const roll = (data.rollNumber || '').toUpperCase();
      if (roll) {
        const lockRef = db.collection('roll_numbers').doc(roll);
        transaction.delete(lockRef);
      }

      transaction.delete(studentRef);
      return true;
    });
  }

  const student = memoryStore.get(id);
  if (!student) {
    return false;
  }

  memoryStore.delete(id);
  memoryLocks.delete(student.rollNumber.toUpperCase());
  return true;
}
