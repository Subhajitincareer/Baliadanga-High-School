import express from 'express';
import { getGallery, createGalleryImage, updateGalleryImage, deleteGalleryImage } from '../controllers/galleryController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/',          getGallery);
router.post('/',         protect, authorize('admin', 'principal', 'staff'), createGalleryImage);
router.put('/:id',       protect, authorize('admin', 'principal', 'staff'), updateGalleryImage);
router.delete('/:id',    protect, authorize('admin', 'principal', 'staff'), deleteGalleryImage);

export default router;
