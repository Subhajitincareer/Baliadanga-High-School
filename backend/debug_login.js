import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const debugLogin = async () => {
    await connectDB();

    console.log('--- DEBUGGING STAFF LOGIN ---');

    // Find the most recent staff user (role not 'admin' or 'user' strictly, but let's check all)
    // Actually, let's look for users with roles in our staff list
    const STAFF_ROLES = ['teacher', 'principal', 'vice_principal', 'coordinator', 'staff', 'admin'];

    const users = await User.find({ role: { $in: STAFF_ROLES } }).sort({ createdAt: -1 }).limit(5).select('+password');

    console.log(`Found ${users.length} recent staff/admin users.`);

    for (const user of users) {
        console.log(`\nTesting User: ${user.email} (Role: ${user.role})`);
        const passwordToTest = 'changeme123';
        const isMatch = await user.comparePassword(passwordToTest);
        console.log(`Password '${passwordToTest}' match? ${isMatch}`);

        if (!isMatch) {
            console.log('Password mismatch! Resetting password to "changeme123"...');
            user.password = 'changeme123'; // Will be hashed by pre-save hook
            await user.save();
            console.log('Password reset successfully.');
        } else {
            console.log('Password is correct.');
        }
    }

    console.log('\n--- DEBUG FINISHED ---');
    process.exit();
};

debugLogin();
