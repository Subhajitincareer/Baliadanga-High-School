import mongoose from 'mongoose';

const feeStructureSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a fee name (e.g. "Annual Session Fee")'],
        trim: true
    },
    currentClass: {
        type: String, // e.g. "V", "X" or "ALL"
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Please add fee amount']
    },
    type: {
        type: String,
        enum: ['Admission', 'Session', 'Exam', 'Development', 'Fine', 'Other'],
        default: 'Session'
    },
    frequency: {
        type: String,
        enum: ['One-time', 'Monthly', 'Annually'],
        default: 'Annually'
    },
    academicYear: {
        type: String,
        required: true,
        default: () => new Date().getFullYear().toString()
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

// Prevent duplicate fee structures for same class/name/year
feeStructureSchema.index({ name: 1, currentClass: 1, academicYear: 1 }, { unique: true });

export default mongoose.model('FeeStructure', feeStructureSchema);
