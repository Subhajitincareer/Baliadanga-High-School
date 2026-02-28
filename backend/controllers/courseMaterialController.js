import CourseMaterial from '../models/CourseMaterial.js';
import imagekit from '../config/imageKit.js';

// @desc    Get materials for a class (optionally filtered by type)
// @route   GET /api/course-materials?grade=Class+V&type=booklist
// @access  Public
export const getMaterials = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.grade) filter.grade = req.query.grade;
        if (req.query.type)  filter.type  = req.query.type;

        const materials = await CourseMaterial.find(filter)
            .sort({ createdAt: -1 })
            .populate('uploadedBy', 'name');

        res.status(200).json({ success: true, count: materials.length, data: materials });
    } catch (err) {
        next(err);
    }
};

// @desc    Upload a new course material
// @route   POST /api/course-materials
// @access  Private (admin, principal, vice_principal, teacher)
export const createMaterial = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const { grade, type, title, description, subject, year } = req.body;

        if (!grade || !type || !title) {
            return res.status(400).json({ success: false, message: 'grade, type and title are required' });
        }

        // Upload to ImageKit
        const uploadResponse = await imagekit.upload({
            file: req.file.buffer,
            fileName: req.file.originalname,
            folder: `/course-materials/${grade.replace(/\s/g, '-').toLowerCase()}/${type}`,
        });

        const material = await CourseMaterial.create({
            grade,
            type,
            title,
            description: description || '',
            subject: subject || 'General',
            year: year || String(new Date().getFullYear()),
            filePath: uploadResponse.url,
            fileName:  uploadResponse.name,
            fileId:    uploadResponse.fileId,
            fileSize:  uploadResponse.size,
            uploadedBy: req.user._id,
        });

        res.status(201).json({ success: true, data: material });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a course material
// @route   DELETE /api/course-materials/:id
// @access  Private (admin, principal, vice_principal, teacher)
export const deleteMaterial = async (req, res, next) => {
    try {
        const material = await CourseMaterial.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ success: false, message: 'Material not found' });
        }

        // Delete from ImageKit
        if (material.fileId) {
            await imagekit.deleteFile(material.fileId);
        }

        await material.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
