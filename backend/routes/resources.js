import express from 'express';
import multer from 'multer';
import path from 'path';
import { getResources, createResource, deleteResource } from '../controllers/resourceController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Set up storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generate unique filename: fieldname-timestamp.ext
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Check file type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /pdf|doc|docx/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: PDFs and Docs Only!');
    }
}

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

router.route('/')
    .get(getResources)
    .post(protect, authorize('admin'), upload.single('file'), createResource);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteResource);

export default router;
