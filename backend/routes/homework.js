import express from 'express';
import {
    getHomeworks,
    createHomework,
    deleteHomework
} from '../controllers/homeworkController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All homework routes require authentication

router
    .route('/')
    .get(getHomeworks)
    .post(authorize('teacher', 'admin', 'principal', 'vice_principal'), createHomework);

router
    .route('/:id')
    .delete(authorize('teacher', 'admin', 'principal', 'vice_principal'), deleteHomework);

export default router;
