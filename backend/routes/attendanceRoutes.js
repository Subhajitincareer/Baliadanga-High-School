import express from 'express';
import { markAttendance, getClassAttendance, getStudentAttendance } from '../controllers/attendanceController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes protected

router.route('/')
    .post(authorize('admin', 'teacher'), markAttendance);

router.route('/class')
    .get(authorize('admin', 'teacher'), getClassAttendance);

router.route('/student/:id')
    .get(getStudentAttendance); // Students can view too (add authorization logic inside if needed or middleware)

export default router;
