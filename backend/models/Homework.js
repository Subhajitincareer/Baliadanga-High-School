import mongoose from 'mongoose';

const homeworkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a homework title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    className: {
        type: String,
        required: [true, 'Please add a class'],
        enum: ['V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
    },
    section: {
        type: String,
        required: [true, 'Please add a section'],
        enum: ['A', 'B', 'C', 'Science', 'Arts', 'Commerce']
    },
    subject: {
        type: String,
        required: [true, 'Please add a subject']
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please add the teacher assigning the homework']
    },
    dueDate: {
        type: Date,
        required: [true, 'Please add a due date']
    },
    attachments: [{
        filename: String,
        url: String
    }]
}, {
    timestamps: true
});

// Index for faster queries to load student's homework
homeworkSchema.index({ className: 1, section: 1, dueDate: -1 });

export default mongoose.model('Homework', homeworkSchema);
