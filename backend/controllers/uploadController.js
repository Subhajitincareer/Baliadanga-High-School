import imagekit from '../config/imageKit.js';

// Check if ImageKit is properly configured
const IMAGEKIT_CONFIGURED = !!(
    process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT
);

// @desc    Upload a file to ImageKit
// @route   POST /api/upload
// @access  Private (admin/staff)
export const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        if (!IMAGEKIT_CONFIGURED) {
            return res.status(503).json({
                success: false,
                message: 'Image upload is not configured. Please add real IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT to backend/.env. You can get free credentials at https://imagekit.io'
            });
        }

        const folder = req.body.folder || '/uploads';

        const uploadResponse = await imagekit.upload({
            file: req.file.buffer,
            fileName: req.file.originalname,
            folder: folder
        });

        res.status(200).json({
            success: true,
            url: uploadResponse.url,
            filename: uploadResponse.name,
            fileId: uploadResponse.fileId
        });
    } catch (err) {
        // Return a structured error instead of crashing
        return res.status(500).json({
            success: false,
            message: err.message || 'Upload failed. Check your ImageKit credentials in backend/.env'
        });
    }
};
