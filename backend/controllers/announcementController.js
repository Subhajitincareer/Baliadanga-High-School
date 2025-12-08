import Announcement from '../models/Announcement.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public
export const getAnnouncements = asyncHandler(async (req, res, next) => {
    const announcements = await Announcement.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(announcements);
});

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private (Admin/Staff)
export const createAnnouncement = asyncHandler(async (req, res, next) => {
    // Add user to body
    req.body.authorId = req.user.id;
    req.body.authorName = req.user.fullName || req.user.name; // Handle potential naming diff

    const announcement = await Announcement.create(req.body);
    res.status(201).json(announcement);
});

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin/Staff)
export const updateAnnouncement = asyncHandler(async (req, res, next) => {
    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
        res.status(404);
        throw new Error('Announcement not found');
    }

    // Make sure user is announcement owner or admin
    if (announcement.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('User not authorized to update this announcement');
    }

    announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json(announcement);
});

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin)
export const deleteAnnouncement = asyncHandler(async (req, res, next) => {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
        res.status(404);
        throw new Error('Announcement not found');
    }

    // Make sure user is announcement owner or admin
    if (announcement.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('User not authorized to delete this announcement');
    }

    await announcement.deleteOne();

    res.status(200).json({ success: true, message: 'Announcement deleted' });
});
