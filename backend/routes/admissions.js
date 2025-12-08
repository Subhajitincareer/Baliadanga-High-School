import express from 'express';
import {
    getAdmissions,
    createAdmission,
    updateAdmissionStatus,
    deleteAdmission
} from '../controllers/admissionController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize('admin'), getAdmissions)
    .post(createAdmission);

router.route('/:id')
    .patch(protect, authorize('admin'), updateAdmissionStatus)
    .delete(protect, authorize('admin'), deleteAdmission);

export default router;
