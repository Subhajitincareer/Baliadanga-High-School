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
    section: {
        type: String,
        required: [true, 'Please add a Section']
    },
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
