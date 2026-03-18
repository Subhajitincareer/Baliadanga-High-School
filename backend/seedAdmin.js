import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import AdminWhitelist from './models/AdminWhitelist.js';
import connectDB from './config/db.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = 'admin@baliadanga.com';
        const adminPassword = 'adminpassword123';
// Clean up any case variants
        await User.deleteMany({ email: { $regex: new RegExp(`^${adminEmail}$`, 'i') } });
        await AdminWhitelist.deleteMany({ email: { $regex: new RegExp(`^${adminEmail}$`, 'i') } });

        // 1. Create User
        await User.create({
            name: 'Super Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'admin'
        });
// 2. Add to Whitelist
        await AdminWhitelist.create({ email: adminEmail });


process.exit();
    } catch (error) {
process.exit(1);
    }
};

seedAdmin();
