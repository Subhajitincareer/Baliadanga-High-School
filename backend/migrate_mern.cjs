const mongoose = require('mongoose');

// EXPLICITLY use mern_app to ensure the migration hits the data we found
const mongoURI = "mongodb+srv://subhajitincareer_db_user:JqPG6AQS4EfIwGoU@cluster0.zg4ujvb.mongodb.net/mern_app?retryWrites=true&w=majority";

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
        console.log('Connected to MERN_APP');

        const StudentProfile = mongoose.model('StudentProfile', new mongoose.Schema({}, { strict: false }));
        const Attendance = mongoose.model('Attendance', new mongoose.Schema({}, { strict: false }));

        for (const [roman, numeric] of Object.entries(classMap)) {
            const resProfiles = await StudentProfile.updateMany({ class: roman }, { $set: { class: numeric } });
            console.log(`StudentProfile: ${roman} -> ${numeric} (${resProfiles.modifiedCount} updated)`);
            
            const resAttribs = await Attendance.updateMany({ class: roman }, { $set: { class: numeric } });
            console.log(`Attendance: ${roman} -> ${numeric} (${resAttribs.modifiedCount} updated)`);
        }

        console.log('Migration Successfully Completed!');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Migration Error:', err.message);
        process.exit(1);
    }
}

migrate();
