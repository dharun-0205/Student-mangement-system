import { Router, Request, Response } from 'express';
import { validateStudent } from '../validation/studentValidation.ts';
import {
  createStudent,
  deleteStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  getDatabaseStatus,
} from './firebase.ts';

export const studentRouter = Router();

// GET /api/status - Get database connectivity status
studentRouter.get('/status', (req: Request, res: Response) => {
  try {
    const status = getDatabaseStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve database status',
      error: err.message,
    });
  }
});

// GET /api/students - List all students with optional search & department filter
studentRouter.get('/students', async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const department = typeof req.query.department === 'string' ? req.query.department : undefined;

    const students = await getAllStudents(search, department);
    res.json({
      success: true,
      data: students,
      count: students.length,
    });
  } catch (err: any) {
    console.error('Error fetching students:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students from database.',
      error: err.message,
    });
  }
});

// GET /api/students/:id - Get a single student by ID
studentRouter.get('/students/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Student ID is required.' });
      return;
    }

    const student = await getStudentById(id);
    if (!student) {
      res.status(404).json({
        success: false,
        message: `Student with ID "${id}" was not found.`,
      });
      return;
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (err: any) {
    console.error('Error fetching student:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student record.',
      error: err.message,
    });
  }
});

// POST /api/students - Add a new student with transaction uniqueness check
studentRouter.post('/students', async (req: Request, res: Response) => {
  try {
    // 1. Backend validation
    const validation = validateStudent(req.body);
    if (!validation.isValid || !validation.data) {
      res.status(400).json({
        success: false,
        message: 'Validation failed. Please check your inputs.',
        errors: validation.errors,
      });
      return;
    }

    // 2. Add student with atomic transaction
    const newStudent = await createStudent(validation.data);
    res.status(201).json({
      success: true,
      message: 'Student added successfully!',
      data: newStudent,
    });
  } catch (err: any) {
    console.error('Error creating student:', err);

    if (err.code === 'DUPLICATE_ROLL_NUMBER' || err.message?.includes('already registered')) {
      res.status(409).json({
        success: false,
        message: err.message || 'Roll number already exists in the system.',
        errors: { rollNumber: err.message },
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error while saving student.',
    });
  }
});

// PUT /api/students/:id - Update student by ID
studentRouter.put('/students/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Student ID is required.' });
      return;
    }

    // 1. Backend validation
    const validation = validateStudent(req.body);
    if (!validation.isValid || !validation.data) {
      res.status(400).json({
        success: false,
        message: 'Validation failed. Please check your inputs.',
        errors: validation.errors,
      });
      return;
    }

    // 2. Update with atomic transaction
    const updated = await updateStudent(id, validation.data);
    res.json({
      success: true,
      message: 'Student updated successfully!',
      data: updated,
    });
  } catch (err: any) {
    console.error('Error updating student:', err);

    if (err.code === 'NOT_FOUND') {
      res.status(404).json({
        success: false,
        message: err.message,
      });
      return;
    }

    if (err.code === 'DUPLICATE_ROLL_NUMBER' || err.message?.includes('already registered')) {
      res.status(409).json({
        success: false,
        message: err.message || 'Roll number already exists in the system.',
        errors: { rollNumber: err.message },
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error while updating student.',
    });
  }
});

// DELETE /api/students/:id - Delete student by ID
studentRouter.delete('/students/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Student ID is required.' });
      return;
    }

    const deleted = await deleteStudent(id);
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: `Student with ID "${id}" was not found or already deleted.`,
      });
      return;
    }

    res.json({
      success: true,
      message: 'Student record deleted successfully.',
    });
  } catch (err: any) {
    console.error('Error deleting student:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting student.',
      error: err.message,
    });
  }
});
