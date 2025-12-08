import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: [true, 'Please add an employee ID'],
        unique: true,
        trim: true
    },
    fullName: {
        type: String,
        required: [true, 'Please add a full name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    position: {
        type: String,
        required: [true, 'Please add a position'],
        enum: ['Teacher', 'Principal', 'Vice Principal', 'Coordinator', 'Admin', 'Staff'],
        default: 'Teacher'
    },
    department: {
        type: String,
        required: [true, 'Please add a department'],
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Can be linked later or created simultaneously
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Staff', staffSchema);
