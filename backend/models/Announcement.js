import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Please add content']
    },
    category: {
        type: String,
        enum: ['General', 'Academic', 'Event', 'Holiday', 'Emergency', 'Sports'],
        default: 'General'
    },
    targetAudience: {
        type: String,
        enum: ['All', 'Students', 'Staff', 'Parents'],
        default: 'All'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Low'
    },
    authorId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    attachments: [{
        filename: String,
        url: String,
        size: Number,
        mimetype: String
    }]
}, {
    timestamps: true
});

export default mongoose.model('Announcement', announcementSchema);
