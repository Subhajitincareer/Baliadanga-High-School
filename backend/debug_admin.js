import mongoose from 'mongoose';
import User from './models/User.js';
import AdminWhitelist from './models/AdminWhitelist.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_db');
const email = 'admin@school.com';

        // Check Whitelist
        const whitelistEntry = await AdminWhitelist.findOne({ email });
if (!whitelistEntry) {
await AdminWhitelist.create({ email });
}

        // Check User
        const user = await User.findOne({ email }).select('+password');
if (user) {
// Check password manually if needed, but let's just reset it to be sure
            user.password = 'admin123';
            user.role = 'admin';
            await user.save();

        } else {
await User.create({
                name: 'Admin User',
                email: email,
                password: 'admin123',
                role: 'admin'
            });
}

        process.exit();
    } catch (error) {
process.exit(1);
    }
};

checkAdmin();
