import express from 'express';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/',          getEvents);
router.post('/',         protect, authorize('admin', 'principal', 'staff'), createEvent);
router.put('/:id',       protect, authorize('admin', 'principal', 'staff'), updateEvent);
router.delete('/:id',    protect, authorize('admin', 'principal', 'staff'), deleteEvent);

export default router;
