import CalendarEvent from '../models/CalendarEvent.js';

// @desc    Get all calendar events
// @route   GET /api/calendar
// @access  Public
export const getEvents = async (req, res, next) => {
    try {
        const events = await CalendarEvent.find().sort({ date: 1 });

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new calendar event
// @route   POST /api/calendar
// @access  Private (Admin)
export const createEvent = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.createdBy = req.user.id; // Assuming auth middleware adds user

        const event = await CalendarEvent.create(req.body);

        res.status(201).json({
            success: true,
            data: event
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update calendar event
// @route   PUT /api/calendar/:id
// @access  Private (Admin)
export const updateEvent = async (req, res, next) => {
    try {
        let event = await CalendarEvent.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        event = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete calendar event
// @route   DELETE /api/calendar/:id
// @access  Private (Admin)
export const deleteEvent = async (req, res, next) => {
    try {
        const event = await CalendarEvent.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        await event.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
