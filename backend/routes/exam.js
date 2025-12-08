import express from 'express';
import {
    getExams,
    getExamById,
    createExam,
    updateExam,
    deleteExam
} from '../controllers/examController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getExams)
    .post(protect, authorize('admin'), createExam);

router.route('/:id')
    .get(getExamById)
    .put(protect, authorize('admin'), updateExam)
    .delete(protect, authorize('admin'), deleteExam);

export default router;
