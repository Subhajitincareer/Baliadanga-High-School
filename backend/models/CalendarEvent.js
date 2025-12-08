import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['HOLIDAY', 'EXAM', 'ACTIVITY', 'MEETING', 'TERM'],
        default: 'ACTIVITY'
    },
    description: {
        type: String,
        trim: true
    },
    startDate: { // Optional start date for longer terms if needed, otherwise use 'date' as start
        type: Date
    },
    endDate: {
        type: Date // For multi-day events like Terms
    },
    startTime: {
        type: String, // Optional start time (e.g., "10:00 AM")
        trim: true
    },
    endTime: {
        type: String, // Optional end time
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Assuming you have a User model for admins
    }
}, {
    timestamps: true
});

export default mongoose.model('CalendarEvent', calendarEventSchema);
