import express from 'express';
import {
    getStudents,
    getStudent,
    createStudent,
    bulkImportStudents,
    deleteStudent
} from '../controllers/studentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // Protect all routes

router
    .route('/')
    .get(authorize('admin', 'staff'), getStudents)
    .post(authorize('admin'), createStudent);

router.post('/bulk', authorize('admin'), bulkImportStudents);

router
    .route('/:id')
    .get(getStudent)
    .delete(authorize('admin'), deleteStudent);

export default router;
