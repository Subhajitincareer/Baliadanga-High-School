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
        console.log('MongoDB Connected');

        const email = 'admin@school.com';

        // Check Whitelist
        const whitelistEntry = await AdminWhitelist.findOne({ email });
        console.log('Whitelist Entry:', whitelistEntry ? 'FOUND' : 'NOT FOUND');

        if (!whitelistEntry) {
            console.log('Creating Whitelist Entry...');
            await AdminWhitelist.create({ email });
            console.log('Whitelist Entry Created');
        }

        // Check User
        const user = await User.findOne({ email }).select('+password');
        console.log('User Entry:', user ? 'FOUND' : 'NOT FOUND');

        if (user) {
            console.log('User Role:', user.role);
            // Check password manually if needed, but let's just reset it to be sure
            user.password = 'admin123';
            user.role = 'admin';
            await user.save();
            console.log('User password reset to: admin123');
            console.log('User role validated as: admin');
        } else {
            console.log('Creating Admin User...');
            await User.create({
                name: 'Admin User',
                email: email,
                password: 'admin123',
                role: 'admin'
            });
            console.log('Admin User Created');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkAdmin();
