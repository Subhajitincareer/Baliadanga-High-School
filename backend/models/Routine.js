import mongoose from 'mongoose';

const periodSchema = new mongoose.Schema({
    startTime: { type: String, required: true }, // e.g., "10:00 AM"
    endTime: { type: String, required: true },   // e.g., "10:45 AM"
    subject: { type: String, required: true },
    teacher: { type: String }, // Optional for Tiffin/Break
    roomNo: { type: String }
}, { _id: false });

const dayRoutineSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    periods: [periodSchema]
}, { _id: false });

const routineSchema = new mongoose.Schema({
    className: {
        type: String,
        required: [true, 'Please add a class name'],
        trim: true
    },
    section: {
        type: String,
        required: [true, 'Please add a section'],
        trim: true,
        default: 'A'
    },
    weekSchedule: [dayRoutineSchema]
}, {
    timestamps: true
});

// Ensure unique routine for each Class + Section
routineSchema.index({ className: 1, section: 1 }, { unique: true });

export default mongoose.model('Routine', routineSchema);
