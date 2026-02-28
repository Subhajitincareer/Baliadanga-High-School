import mongoose from 'mongoose';

const courseMaterialSchema = new mongoose.Schema({
    grade: {
        type: String,
        required: [true, 'Please specify the class'],
        trim: true,
        // e.g. "Class V", "Class X"
    },
    type: {
        type: String,
        required: [true, 'Please select a material type'],
        enum: ['booklist', 'paper', 'syllabus', 'note', 'suggestion'],
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [150, 'Title cannot be more than 150 characters'],
    },
    description: {
        type: String,
        maxlength: [400, 'Description cannot be more than 400 characters'],
        default: '',
    },
    subject: {
        type: String,
        default: 'General',
    },
    year: {
        type: String,
        default: String(new Date().getFullYear()),
    },
    filePath: {
        type: String,
        required: [true, 'Please upload a file'],
    },
    fileName: {
        type: String,
        required: true,
    },
    fileId: {
        type: String,
        required: true,
    },
    fileSize: {
        type: Number,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound index for fast lookups by class + type
courseMaterialSchema.index({ grade: 1, type: 1 });

export default mongoose.model('CourseMaterial', courseMaterialSchema);
