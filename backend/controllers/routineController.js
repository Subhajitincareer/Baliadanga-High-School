import Routine from '../models/Routine.js';

// @desc    Get routine for a class and section
// @route   GET /api/routines?class=X&section=A
// @access  Public
export const getRoutine = async (req, res, next) => {
    try {
        const { className, section } = req.query;

        let query = {};
        if (className) query.className = className;
        if (section) query.section = section;

        const routines = await Routine.find(query);

        res.status(200).json({
            success: true,
            count: routines.length,
            data: routines
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create or Update Routine
// @route   POST /api/routines
// @access  Private (Admin)
// Helper to separate HH:MM
const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

// @desc    Create or Update Routine
// @route   POST /api/routines
// @access  Private (Admin)
export const createOrUpdateRoutine = async (req, res, next) => {
    try {
        const { className, section, weekSchedule } = req.body;

        // 1. Validation: Check for double-booking conflicts
        // Fetch all other routines to compare against
        const allRoutines = await Routine.find({
            $or: [
                { className: { $ne: className } }, // Different class
                { section: { $ne: section } }      // Or same class, different section
            ]
        });

        // Iterate through the NEW schedule we are trying to save
        for (const newDay of weekSchedule) {
            for (const newPeriod of newDay.periods) {
                if (!newPeriod.teacher) continue; // Skip if no teacher assigned

                const newStart = parseTime(newPeriod.startTime);
                const newEnd = parseTime(newPeriod.endTime);

                // Check against every other routine
                for (const otherRoutine of allRoutines) {
                    const otherDay = otherRoutine.weekSchedule.find(d => d.day === newDay.day);
                    if (!otherDay) continue;

                    for (const otherPeriod of otherDay.periods) {
                        if (otherPeriod.teacher === newPeriod.teacher) {
                            const otherStart = parseTime(otherPeriod.startTime);
                            const otherEnd = parseTime(otherPeriod.endTime);

                            // Check overlap: (StartA < EndB) and (EndA > StartB)
                            if (newStart < otherEnd && newEnd > otherStart) {
                                return res.status(400).json({
                                    success: false,
                                    message: `Conflict Detected: ${newPeriod.teacher} is already assigned to Class ${otherRoutine.className}-${otherRoutine.section} on ${newDay.day} (${otherPeriod.startTime} - ${otherPeriod.endTime})`
                                });
                            }
                        }
                    }
                }
            }
        }

        // 2. Save Routine if no conflicts
        // Check if exists
        let routine = await Routine.findOne({ className, section });

        if (routine) {
            // Update existing
            routine.weekSchedule = weekSchedule;
            await routine.save();
        } else {
            // Create new
            routine = await Routine.create({
                className,
                section,
                weekSchedule
            });
        }

        res.status(200).json({
            success: true,
            data: routine
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete Routine
// @route   DELETE /api/routines/:id
// @access  Private (Admin)
// @desc    Delete Routine
// @route   DELETE /api/routines/:id
// @access  Private (Admin)
export const deleteRoutine = async (req, res, next) => {
    try {
        const routine = await Routine.findById(req.params.id);

        if (!routine) {
            return res.status(404).json({ success: false, message: 'Routine not found' });
        }

        await routine.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

// @desc    Get routine for a specific teacher
// @route   GET /api/routines/teacher/:teacherName
// @access  Public
export const getTeacherRoutine = async (req, res, next) => {
    try {
        const { teacherName } = req.params;

        // Find routines where the teacher is assigned to any period (case-insensitive)
        const routines = await Routine.find({
            'weekSchedule.periods.teacher': { $regex: new RegExp(`^${teacherName}$`, 'i') }
        });

        // We can process this here or let the frontend process it.
        // Let's send the raw routines for now, but we might want to flatten it.
        // Actually, frontend logic is easier to customize for UI.

        res.status(200).json({
            success: true,
            count: routines.length,
            data: routines
        });
    } catch (err) {
        next(err);
    }
};
