import mongoose from 'mongoose';

const feePaymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentProfile',
        required: true
    },
    feeStructure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FeeStructure', // Optional: if payment is linked to specific predefined fee
        required: false
    },
    amountPaid: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Online', 'Bank Transfer', 'UPI'],
        default: 'Cash'
    },
    transactionId: {
        type: String // For online/bank
    },
    remarks: {
        type: String // e.g. "Late fee included"
    },
    collectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Admin or Staff who collected it
    },
    academicYear: {
        type: String,
        required: true
    },
    receiptNumber: {
        type: String, // Auto-generated
        unique: true
    }
}, {
    timestamps: true
});

export default mongoose.model('FeePayment', feePaymentSchema);
