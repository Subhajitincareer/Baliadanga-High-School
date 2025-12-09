import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentId: { // Redundant but useful for quick queries / QR display
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late', 'Holiday', 'Half-Day'],
        default: 'Present'
    },
    method: {
        type: String,
        enum: ['Manual', 'QR', 'Biometric'],
        default: 'Manual'
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    remarks: {
        type: String
    },
    class: String, // Snapshot of class/section at time of attendance
    section: String
}, {
    timestamps: true
});

// Composite index to prevent duplicate attendance for same student on same day
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
