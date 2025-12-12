import mongoose from 'mongoose';

const midDayMealSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    class: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    studentIds: [{
        type: String, // Storing 'studentId' strings (e.g. ST-2024-001)
        required: true
    }],
    totalCount: {
        type: Number,
        required: true,
        default: 0
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    menuItem: {
        type: String, // Optional: Record what was served (e.g., "Egg Curry")
        default: 'Standard Meal'
    }
}, {
    timestamps: true
});

// Prevent duplicate entries for the same class/section on the same day?
// Or allow updates? Let's use a unique index for upsert logic.
midDayMealSchema.index({ date: 1, class: 1, section: 1 }, { unique: true });

export default mongoose.model('MidDayMeal', midDayMealSchema);
