import express from 'express';
import { getRoutine, createOrUpdateRoutine, deleteRoutine, getTeacherRoutine } from '../controllers/routineController.js';

const router = express.Router();

// Public: Get routines
router.get('/', getRoutine);

// Private: Manage routines (Add Auth middleware later if needed, mostly handled by frontend check for now or global auth)
// Ideally protect this with admin middleware.
// Private: Manage routines (Add Auth middleware later if needed, mostly handled by frontend check for now or global auth)
// Ideally protect this with admin middleware.
router.post('/', createOrUpdateRoutine);
router.delete('/:id', deleteRoutine);

// Get teacher's routine
router.get('/teacher/:teacherName', getTeacherRoutine);

export default router;
