import express from 'express';
import {
    getStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff
} from '../controllers/staffController.js';

import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Staff Profile Routes (Authenticated Staff can access these)
import { getStaffByUserId, updateStaffProfile } from '../controllers/staffController.js';

router.get('/profile', getStaffByUserId);
router.put('/profile', updateStaffProfile);


// Admin Management Routes (Admin Only)
router.use(authorize('admin'));

router
    .route('/')
    .get(getStaff)
    .post(createStaff);

router
    .route('/:id')
    .get(getStaffById)
    .put(updateStaff)
    .delete(deleteStaff);

export default router;
