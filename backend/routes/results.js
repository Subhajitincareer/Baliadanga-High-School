import express from 'express';
import {
    updateMarks,
    bulkUpsertMarks,
    getExamResults,
    publishResults,
    getMyResults,
    getPublicResult,
    getReportCard
} from '../controllers/resultController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public — no auth required
router.get('/public', getPublicResult);

// Protected Routes
router.use(protect);

router.post('/marks', authorize('admin', 'teacher'), updateMarks);
router.post('/bulk-marks', authorize('admin', 'teacher'), bulkUpsertMarks);
router.get('/exam/:examId', authorize('admin', 'teacher'), getExamResults);
router.post('/publish/:examId', authorize('admin'), publishResults);
router.get('/my', getMyResults);
router.get('/report-card/:studentProfileId/:examId', authorize('admin', 'teacher'), getReportCard);

export default router;
