import asyncHandler from '../middlewares/asyncHandler.js';
import GalleryImage from '../models/GalleryImage.js';

// GET /api/gallery  — public
export const getGallery = asyncHandler(async (req, res) => {
  const images = await GalleryImage.find().sort({ createdAt: -1 });
  res.json({ success: true, data: images });
});

// POST /api/gallery  — admin/staff
export const createGalleryImage = asyncHandler(async (req, res) => {
  const { url, fileId, caption, category } = req.body;
  if (!url) return res.status(400).json({ success: false, message: 'url is required' });
  const image = await GalleryImage.create({ url, fileId, caption, category, createdBy: req.user._id });
  res.status(201).json({ success: true, data: image });
});

// PUT /api/gallery/:id  — admin/staff
export const updateGalleryImage = asyncHandler(async (req, res) => {
  const image = await GalleryImage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
  res.json({ success: true, data: image });
});

// DELETE /api/gallery/:id  — admin/staff
export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const image = await GalleryImage.findByIdAndDelete(req.params.id);
  if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
  res.json({ success: true, message: 'Image deleted' });
});
