import express from 'express';
import multer from 'multer';
import path from 'path';
import { getMaterials, createMaterial, deleteMaterial } from '../controllers/courseMaterialController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Multer — memory storage (same pattern as resources.js)
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
    const filetypes = /pdf|doc|docx|ppt|pptx|xlsx|xls/;
    const extname  = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb('Error: Only PDF, DOC, DOCX, PPT, XLSX files are allowed!');
}

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
    fileFilter: (req, file, cb) => checkFileType(file, cb),
});

// GET  /api/course-materials  — public (students can fetch)
router.get('/', getMaterials);

// POST /api/course-materials  — admin, principal, vice_principal, teacher
router.post(
    '/',
    protect,
    authorize('admin', 'principal', 'vice_principal', 'teacher'),
    upload.single('file'),
    createMaterial
);

// DELETE /api/course-materials/:id
router.delete(
    '/:id',
    protect,
    authorize('admin', 'principal', 'vice_principal', 'teacher'),
    deleteMaterial
);

export default router;
