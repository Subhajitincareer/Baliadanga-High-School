import express from 'express';
import {
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
} from '../controllers/announcementController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getAnnouncements)
    .post(protect, authorize('admin', 'teacher', 'principal', 'vice principal'), createAnnouncement);

router.route('/:id')
    .put(protect, authorize('admin', 'teacher', 'principal'), updateAnnouncement)
    .delete(protect, authorize('admin', 'principal'), deleteAnnouncement);

export default router;
