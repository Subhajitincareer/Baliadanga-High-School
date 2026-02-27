import express from 'express';
import { getSettings, updateHeroImages, updateHeadmaster } from '../controllers/siteSettingsController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/hero-images', protect, authorize('admin', 'principal'), updateHeroImages);
router.put('/headmaster',  protect, authorize('admin', 'principal'), updateHeadmaster);

export default router;
