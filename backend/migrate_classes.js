import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoURI = process.env.MONGO_URI;

const classMap = {
    'V': '5',
    'VI': '6',
    'VII': '7',
    'VIII': '8',
    'IX': '9',
    'X': '10',
    'XI': '11',
    'XII': '12'
};

async function migrate() {
    try {
        await mongoose.connect(mongoURI);
// Migrate StudentProfiles
        const StudentProfile = mongoose.model('StudentProfile', new mongoose.Schema({ class: String }, { strict: false }));
        for (const [roman, numeric] of Object.entries(classMap)) {
            const res = await StudentProfile.updateMany({ class: roman }, { class: numeric });
}

        // Migrate Attendances
        const Attendance = mongoose.model('Attendance', new mongoose.Schema({ class: String }, { strict: false }));
        for (const [roman, numeric] of Object.entries(classMap)) {
            const res = await Attendance.updateMany({ class: roman }, { class: numeric });
}
await mongoose.disconnect();
    } catch (err) {
}
}

migrate();
