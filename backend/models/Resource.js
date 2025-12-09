import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    type: {
        type: String,
        required: [true, 'Please select a type'],
        enum: ['policy', 'form', 'other'],
        default: 'other'
    },
    filePath: {
        type: String,
        required: [true, 'Please upload a file']
    },
    fileName: {
        type: String,
        required: true
    },
    fileId: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Resource', resourceSchema);
