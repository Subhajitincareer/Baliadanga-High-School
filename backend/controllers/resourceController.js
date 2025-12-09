import Resource from '../models/Resource.js';
import imagekit from '../config/imageKit.js';

// Removed path/fs imports as they are not needed for memory storage uploads

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
export const getResources = async (req, res, next) => {
    try {
        const resources = await Resource.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: resources.length, data: resources });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private (Admin)
export const createResource = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const { title, description, type } = req.body;

        // Upload to ImageKit
        const uploadResponse = await imagekit.upload({
            file: req.file.buffer, // required
            fileName: req.file.originalname, // required
            folder: '/resources' // optional
        });

        // Create resource in DB
        const resource = await Resource.create({
            title,
            description,
            type,
            filePath: uploadResponse.url, // Store the ImageKit URL
            fileName: uploadResponse.name,
            fileId: uploadResponse.fileId, // Store fileId for deletion
            fileSize: uploadResponse.size
        });

        res.status(201).json({
            success: true,
            data: resource
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin)
export const deleteResource = async (req, res, next) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ success: false, message: `Resource not found with id of ${req.params.id}` });
        }

        // Delete file from ImageKit
        if (resource.fileId) {
            await imagekit.deleteFile(resource.fileId);
        }

        await resource.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
