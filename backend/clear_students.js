import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const clearStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
const User = mongoose.model('User', new mongoose.Schema({ role: String }, { strict: false }));
        const StudentProfile = mongoose.model('StudentProfile', new mongoose.Schema({}, { strict: false }));

        const studentUsers = await User.find({ role: 'student' });
const res1 = await User.deleteMany({ role: 'student' });
        const res2 = await StudentProfile.deleteMany({});
process.exit(0);
    } catch (error) {
process.exit(1);
    }
};

clearStudents();
