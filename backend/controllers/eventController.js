import asyncHandler from '../middlewares/asyncHandler.js';
import Event from '../models/Event.js';

// GET /api/events  — public
export const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().sort({ date: -1 });
  res.json({ success: true, data: events });
});

// POST /api/events  — admin/staff
export const createEvent = asyncHandler(async (req, res) => {
  const { title, date, time, location, category, description, imageUrl, imageFileId } = req.body;
  if (!title || !date) return res.status(400).json({ success: false, message: 'title and date are required' });
  const event = await Event.create({ title, date, time, location, category, description, imageUrl, imageFileId, createdBy: req.user._id });
  res.status(201).json({ success: true, data: event });
});

// PUT /api/events/:id  — admin/staff
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  res.json({ success: true, data: event });
});

// DELETE /api/events/:id  — admin/staff
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  res.json({ success: true, message: 'Event deleted' });
});
