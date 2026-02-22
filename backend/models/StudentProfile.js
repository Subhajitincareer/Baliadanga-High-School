import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    studentId: {
        type: String,
        required: [true, 'Please add a Student ID'],
        unique: true,
        trim: true
    },
    rollNumber: {
        type: String,
        required: [true, 'Please add a Roll Number']
    },
    class: {
        type: String,
        required: [true, 'Please add a Class']
    },
    // Kept in sync with `class` — used by promotionController and eligibility check
    currentClass: {
        type: String
    },
    section: {
        type: String,
        required: [true, 'Please add a Section']
    },
    session: {
        type: String, // e.g. '2024-2025'
        default: ''
    },
    // Archive of past promotions
    previousClasses: [{
        class: String,
        section: String,
        session: String,
        percentage: Number,
        grade: String,
        promotedAt: { type: Date, default: Date.now }
    }],
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    guardianName: {
        type: String,
        required: [true, 'Please add Guardian Name']
    },
    guardianPhone: {
        type: String,
        required: [true, 'Please add Guardian Phone']
    },
    address: {
        type: String
    },
    photoUrl: {
        type: String
    },
    admissionDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Alumni', 'Suspended'],
        default: 'Active'
    }
}, {
    timestamps: true
});

// Composite index to ensure unique roll number per class/section/year could be added, 
// but for now keeping it simple.

export default mongoose.model('StudentProfile', studentProfileSchema);
