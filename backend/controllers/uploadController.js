import imagekit from '../config/imageKit.js';

// @desc    Upload a file to ImageKit
// @route   POST /api/upload
// @access  Public (or Private depending on needs, Admission might be public)
export const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
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
        next(err);
    }
};
