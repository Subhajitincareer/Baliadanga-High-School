import mongoose from 'mongoose';

const admissionSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: [true, 'Please add student name']
    },
    email: {
        type: String,
        required: [true, 'Please add email']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please add phone number']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Please add date of birth']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: [true, 'Please select gender']
    },
    address: {
        type: String,
        required: [true, 'Please add address']
    },
    guardianName: {
        type: String,
        required: [true, 'Please add guardian name']
    },
    guardianPhone: {
        type: String,
        required: [true, 'Please add guardian phone']
    },
    previousSchool: {
        type: String
    },
    class: {
        type: String,
        required: [true, 'Please select class']
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    rollNumber: {
        type: String
    },
    remarks: {
        type: String
    }
}, {
    timestamps: true
});

export default mongoose.model('Admission', admissionSchema);
