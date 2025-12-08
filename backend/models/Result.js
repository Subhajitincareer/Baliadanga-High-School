import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', // Ideally we should have a Student model, or link to User
        required: true
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    // Map of subject name -> marks obtained
    marks: {
        type: Map,
        of: Number
    },
    totalObtained: {
        type: Number,
        default: 0
    },
    percentage: {
        type: Number,
        default: 0
    },
    grade: {
        type: String, // A+, A, B...
        default: ''
    },
    rank: {
        type: Number
    },
    remarks: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate results for same student & exam
resultSchema.index({ studentId: 1, examId: 1 }, { unique: true });

export default mongoose.model('Result', resultSchema);
