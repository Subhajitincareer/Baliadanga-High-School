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

// All staff routes are protected and for admins only
router.use(protect);
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
