import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    fullMarks: {
        type: Number,
        required: true
    },
    passMarks: {
        type: Number,
        required: true
    }
});

const examSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add an exam name'], // e.g., "Annual Exam 2024"
        trim: true
    },
    session: {
        type: String,
        required: [true, 'Please add academic session'], // e.g., "2024-2025"
    },
    class: {
        type: String,
        required: [true, 'Please add class']
    },
    subjects: [subjectSchema],
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Exam', examSchema);
