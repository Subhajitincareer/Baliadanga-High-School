import mongoose from 'mongoose';

const adminWhitelistSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('AdminWhitelist', adminWhitelistSchema);
