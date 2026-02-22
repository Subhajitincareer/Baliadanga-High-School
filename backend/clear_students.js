import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const clearStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const User = mongoose.model('User', new mongoose.Schema({ role: String }, { strict: false }));
        const StudentProfile = mongoose.model('StudentProfile', new mongoose.Schema({}, { strict: false }));

        const studentUsers = await User.find({ role: 'student' });
        
        console.log(`Found ${studentUsers.length} student users.`);

        const res1 = await User.deleteMany({ role: 'student' });
        const res2 = await StudentProfile.deleteMany({});
        
        console.log(`Deleted ${res1.deletedCount} Users and ${res2.deletedCount} StudentProfiles`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

clearStudents();
