import express from 'express';
import {
    updateMarks,
    getExamResults,
    publishResults,
    getMyResults
} from '../controllers/resultController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected Routes
router.use(protect);

router.post('/marks', authorize('admin', 'teacher'), updateMarks);
router.get('/exam/:examId', authorize('admin', 'teacher'), getExamResults);
router.post('/publish/:examId', authorize('admin'), publishResults);
router.get('/my', getMyResults);

export default router;
