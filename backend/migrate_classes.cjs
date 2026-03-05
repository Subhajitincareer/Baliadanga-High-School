const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

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
        console.log('Connected to MongoDB');

        // Migrate StudentProfiles
        const StudentProfile = mongoose.model('StudentProfile', new mongoose.Schema({ class: String }, { strict: false }));
        for (const [roman, numeric] of Object.entries(classMap)) {
            const res = await StudentProfile.updateMany({ class: roman }, { class: numeric });
            console.log(`Updated StudentProfile Class ${roman} -> ${numeric}: ${res.modifiedCount} docs`);
        }

        // Migrate Attendances
        const Attendance = mongoose.model('Attendance', new mongoose.Schema({ class: String }, { strict: false }));
        for (const [roman, numeric] of Object.entries(classMap)) {
            const res = await Attendance.updateMany({ class: roman }, { class: numeric });
            console.log(`Updated Attendance Class ${roman} -> ${numeric}: ${res.modifiedCount} docs`);
        }

        console.log('Migration complete!');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrate();
