import Resource from '../models/Resource.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

        // Create resource in DB
        const resource = await Resource.create({
            title,
            description,
            type,
            filePath: `/uploads/${req.file.filename}`,
            fileName: req.file.originalname,
            fileSize: req.file.size
        });

        res.status(201).json({
            success: true,
            data: resource
        });
    } catch (err) {
        // If DB creation fails, delete the uploaded file to keep things clean
        if (req.file) {
            const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
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

        // Delete file from filesystem
        // We need to resolve the path relative to the backend root
        // filePath is stored as '/uploads/filename.pdf'
        // So we join __dirname (controllers) + .. + filePath
        const filePath = path.join(__dirname, '..', resource.filePath);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await resource.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
