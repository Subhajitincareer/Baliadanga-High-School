import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
    createFeeStructure,
    getFeeStructures,
    recordPayment,
    getStudentPayments,
    getStudentDues,
    getMyFeeHistory
} from '../controllers/feeController.js';

const router = express.Router();

router.route('/structure')
    .post(protect, authorize('admin'), createFeeStructure)
    .get(protect, getFeeStructures);

router.post('/pay', protect, authorize('admin', 'staff'), recordPayment);
router.get('/my-history', protect, getMyFeeHistory);   // student self-service
router.get('/student/:id', protect, getStudentPayments);
router.get('/dues/:studentId', protect, getStudentDues);

export default router;
