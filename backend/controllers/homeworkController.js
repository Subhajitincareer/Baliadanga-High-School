import Homework from '../models/Homework.js';
import User from '../models/User.js';

// @desc    Get all homework (optionally filter by class/section)
// @route   GET /api/homework
// @access  Private (Teacher, Admin, Student)
export const getHomeworks = async (req, res, next) => {
    try {
        let query = {};
        
        // If student, auto-filter by their class and section
        if (req.user.role === 'student') {
            const studentProfile = await User.findById(req.user.id);
            // In a real scenario we might need to get class/section from Student profile model, 
            // but for simplicity, let's assume the client passes className and section in query params 
            // OR we derive it properly. Let's just use query params for now.
        }

        if (req.query.className) query.className = req.query.className;
        if (req.query.section) query.section = req.query.section;
        if (req.query.teacherId) query.assignedBy = req.query.teacherId;

        const homeworks = await Homework.find(query)
            .populate('assignedBy', 'name email role')
            .sort({ dueDate: 1 });

        res.status(200).json({
            success: true,
            count: homeworks.length,
            data: homeworks
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Create new homework
// @route   POST /api/homework
// @access  Private (Teacher, Admin)
export const createHomework = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.assignedBy = req.user.id;

        const homework = await Homework.create(req.body);

        res.status(201).json({
            success: true,
            data: homework
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete homework
// @route   DELETE /api/homework/:id
// @access  Private (Teacher, Admin)
export const deleteHomework = async (req, res, next) => {
    try {
        const homework = await Homework.findById(req.params.id);

        if (!homework) {
            return res.status(404).json({ success: false, message: 'Homework not found' });
        }

        // Make sure user owns the homework or is admin
        if (homework.assignedBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'principal') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this homework' });
        }

        await homework.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
