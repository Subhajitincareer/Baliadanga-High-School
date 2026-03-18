import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoURI = process.env.MONGO_URI;

async function checkData() {
    try {
        await mongoose.connect(mongoURI);
const StudentProfile = mongoose.model('StudentProfile', new mongoose.Schema({
            class: String,
            section: String,
            studentId: String
        }));

        const students = await StudentProfile.find({}).limit(10);
const classes = await StudentProfile.distinct('class');
await mongoose.disconnect();
    } catch (err) {
}
}

checkData();
